'use strict';

const utils = require('./utils');

module.exports.handler = async (event, context, callback) => {
    console.log('Received event: ', JSON.stringify(event, null, 2));

    if (!event) {
        callback(new Error('No event specified'));
        return;
    }

    if (!event.Records[0] || !event.Records[0].body) {
        callback(new Error('No event specified'));
        return;
    }

    const req = JSON.parse(event.Records[0].body);
    // Validate RequestType
    if (!req.RequestType || (req.RequestType !== 'Create' && req.RequestType !== 'Delete')) {
        callback(new Error('Invalid RequestType. Valid values: "Create" or "Delete"'));
        return;
    }

    // Check if all required attributes are set
    if (!req.IntegrationName || !req.AccountIds || !req.UptAccountId || !req.ExternalId || !req.RequestType) {
        callback(new Error(`Request:${JSON.stringify(req, null, 2)} is not valid. Required fields are missing`));
        return;
    }

    // Currently we only support one account at a time
    if (req.AccountIds.length !== 1) {
        callback(new Error('AccountIds must be an array of strings with length of 1'));
        return;
    }

    try {
        event.Records.array.forEach(record => {
            const reqBody = JSON.parse(req.body);

            const stsCreds = await utils.stsCreds(req.AccountIds[0]);
            const iamClient = await utils.iamClient(stsCreds, 'aws-global');
            const sqsClient = await utils.sqsClient(record.awsRegion);

            const response = {
                message: 'OK',
                accountId: reqBody.AccountIds[0],
                integrationName: reqBody.IntegrationName,
                requestMessageId: record.messageId,
                timestamp: Date.now
            };

            try {
                if (reqBody.RequestType === 'Delete') {
                    await utils.detachPoliciesFromRole(iamClient, reqBody.IntegrationName);
                    await utils.deleteIntegrationRole(iamClient, reqBody.IntegrationName);
                    console.log(`Successfully deleted integration role ${reqBody.IntegrationName} from account ${reqBody.AccountIds[0]}`);
                    await utils.sendResponse(sqsClient, record.eventSourceARN, reqBody.IntegrationName, response);
                    continue;
                }

                // Continue with "Create"
                const roleExists = await utils.integrationRoleExists(iamClient, reqBody.IntegrationName);
                // Check if we have to replace existing role
                if (reqBody.Force && roleExists) {
                    await utils.detachPoliciesFromRole(iamClient, reqBody.IntegrationName);
                    await utils.deleteIntegrationRole(iamClient, reqBody.IntegrationName);
                } else if (roleExists) {
                    const msg = `Role ${reqBody.IntegrationName} already exists`;
                    response.message = msg;
                    console.error(msg);
                    await utils.sendResponse(sqsClient, record.eventSourceARN, reqBody.IntegrationName, response);
                    continue;
                }
                await utils.createIntegrationRole(iamClient, reqBody.IntegrationName, reqBody.UptAccountId, reqBody.ExternalId);
                await utils.attachPoliciesToRole(iamClient, reqBody.IntegrationName);
                console.log(`Successfully installed integration role for ${reqBody.IntegrationName} in account ${reqBody.AccountIds[0]}`);
                await utils.sendResponse(sqsClient, record.eventSourceARN, reqBody.IntegrationName, response);
            } catch (err) {
                response.message = 'Failed to invoke lambda function';
                console.error('Failed to invoke lambda function', err);
                await utils.sendResponse(sqsClient, record.eventSourceARN, reqBody.IntegrationName, response);
            }
        });

    } catch (err) {
        callback(new Error(`Error: ${err}`));
    }
};

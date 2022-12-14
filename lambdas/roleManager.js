'use strict';

const utils = require('./utils');

module.exports.handler = async (event, context, callback) => {
    console.log('Received event: ', JSON.stringify(event, null, 2));

    if (!event) {
        callback(new Error('No event specified'));
        return;
    }

    try {
        event.Records.forEach(async(record) => {

            if (!record || !record.body) {
                throw(new Error('No event specified'));            
            }
        
            const req = JSON.parse(record.body);
            // Validate RequestType
            if (!req.RequestType || (req.RequestType !== 'Create' && req.RequestType !== 'Delete')) {
                throw(new Error('Invalid RequestType. Valid values: "Create" or "Delete"'));
            }
        
            // Check if all required attributes are set
            if (!req.IntegrationName || !req.AccountIds || !req.UptAccountId || !req.ExternalId || !req.RequestType) {
                throw(new Error(`Request:${JSON.stringify(req, null, 2)} is not valid. Required fields are missing`));
            }
        
            // Currently we only support one account at a time
            if (req.AccountIds.length !== 1) {
                throw(new Error('AccountIds must be an array of strings with length of 1'));
            }
        })
    } catch(err) {
        callback(new Error(`Error: ${err}`));
        return;
    }

    try {
        event.Records.forEach(async (record) => {
            const reqBody = JSON.parse(record.body);
            console.log('Record: ', JSON.stringify(record, null, 2));

            const stsCreds = await utils.stsCreds(reqBody.AccountIds[0]);
            console.log('Past stsCreds');
            const iamClient = await utils.iamClient(stsCreds, 'aws-global');
            console.log('Past iamCLient');
            const sqsClient = await utils.sqsClient(record.awsRegion);

            const response = {
                message: 'OK',
                accountId: reqBody.AccountIds[0],
                integrationName: reqBody.IntegrationName,
                requestMessageId: record.messageId,
                timestamp: Date.now
            };

            console.log('Before second try');
            try {
                if (reqBody.RequestType === 'Delete') {
                    await utils.detachPoliciesFromRole(iamClient, reqBody.IntegrationName);
                    await utils.deleteIntegrationRole(iamClient, reqBody.IntegrationName);
                    console.log(`Successfully deleted integration role ${reqBody.IntegrationName} from account ${reqBody.AccountIds[0]}`);
                    await utils.sendResponse(sqsClient, record.eventSourceARN, reqBody.IntegrationName, response);
                    return;
                }
                console.log('Past the check if delete');
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
                    console.log('Inside Role exists');
                    return;
                }
                console.log('Before Create Role');
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

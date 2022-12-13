'use strict';

const utils = require('./utils');

module.exports.handler = async (event, context, callback) => {
    console.log('Received event: ', JSON.stringify(event, null, 2));

    if (!event) {
        callback(new Error('No event specified'));
        return;
    }

    for (let i = 0; i < event.Records.length; i++) {

        if (!event.Records[i] || !event.Records[i].body) {
            callback(new Error('No event specified'));
            return;
        }

        const req = JSON.parse(event.Records[i].body);
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

        const stsCreds = await utils.stsCreds(req.AccountIds[i]);
        const iamClient = await utils.iamClient(stsCreds, 'aws-global');
        const sqsClient = await utils.sqsClient(event.Records[i].awsRegion);

        const response = {
            message: 'OK',
            accountId: req.AccountIds[i],
            integrationName: req.IntegrationName,
            requestMessageId: event.Records[i].messageId,
            timestamp: Date.now
        };

        try {
            if (req.RequestType === 'Delete') {
                await utils.detachPoliciesFromRole(iamClient, req.IntegrationName);
                await utils.deleteIntegrationRole(iamClient, req.IntegrationName);
                console.log(`Successfully deleted integration role ${req.IntegrationName} from account ${req.AccountIds[i]}`);
                await utils.sendResponse(sqsClient, event.Records[i].eventSourceARN, req.IntegrationName, response);
                return;
            }
            // Continue with "Create"
            const roleExists = await utils.integrationRoleExists(iamClient, req.IntegrationName);
            // Check if we have to replace existing role
            if (req.Force && roleExists) {
                await utils.detachPoliciesFromRole(iamClient, req.IntegrationName);
                await utils.deleteIntegrationRole(iamClient, req.IntegrationName);
            } else if (roleExists) {
                const msg = `Role ${req.IntegrationName} already exists`;
                response.message = msg;
                console.error(msg);
                await utils.sendResponse(sqsClient, event.Records[i].eventSourceARN, req.IntegrationName, response);
                return;
            }
            await utils.createIntegrationRole(iamClient, req.IntegrationName, req.UptAccountId, req.ExternalId);
            await utils.attachPoliciesToRole(iamClient, req.IntegrationName);
            console.log(`Successfully installed integration role for ${req.IntegrationName} in account ${req.AccountIds[i]}`);
            await utils.sendResponse(sqsClient, event.Records[i].eventSourceARN, req.IntegrationName, response);
        } catch (err) {
            response.message = 'Failed to invoke lambda function';
            console.error('Failed to invoke lambda function', err);
            await utils.sendResponse(sqsClient, event.Records[i].eventSourceARN, req.IntegrationName, response);
        }
    }
};

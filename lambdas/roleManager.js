'use strict';

const utils = require('./utils');

module.exports.handler = async (event, context, callback) => {
    console.log('Received event: ', JSON.stringify(event, null, 2));

    if (!event || !event.Records[0] || !event.Records[0].body) {
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
    req.lambdaRecievedTime = new Date();

    const iamClient = await utils.iamClient('aws-global', req.AccountIds[0]);

    try {
        if (req.RequestType === 'Delete') {
            await utils.detachPoliciesFromRole(iamClient, req.IntegrationName);
            await utils.deleteIntegrationRole(iamClient, req.IntegrationName);
            console.log(`Successfully deleted integration role ${req.IntegrationName} from account ${req.AccountIds[0]}`);
            return;
        }
        // Continue with "Create"
        const roleExists = await utils.integrationRoleExists(iamClient, req.IntegrationName);
        // Check if we have to replace existing role
        if (req.Force && roleExists) {
            await utils.detachPoliciesFromRole(iamClient, req.IntegrationName);
            await utils.deleteIntegrationRole(iamClient, req.IntegrationName);
        } else if (roleExists) {
            callback(new Error(`Role ${req.IntegrationName} already exists`));
            return;
        }
        await utils.createIntegrationRole(iamClient, req.IntegrationName, req.UptAccountId, req.ExternalId);
        await utils.attachPoliciesToRole(iamClient, req.IntegrationName);
        console.log(`Successfully installed integration role for ${req.IntegrationName} in account ${req.AccountIds[0]}`);
    } catch (err) {
        console.error('Failed to invoke lambda function', err);
    }
};

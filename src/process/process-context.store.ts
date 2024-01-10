import { DynamoDBClient, TransactWriteItem } from '@aws-sdk/client-dynamodb'

class ProcessContextStore {
    readonly PROCESS_STORE_NAME = process.env.PROCESS_STORE_NAME

    readonly client = new DynamoDBClient()

    async end() {}

    endTx(): TransactWriteItem {
        return {
            Update: {
                TableName: '',
                Key: {},
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                UpdateExpression: '',
            },
        }
    }

    async update() {}

    updateTx(): TransactWriteItem {
        return {
            Update: {
                TableName: '',
                Key: {},
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                UpdateExpression: '',
            },
        }
    }

    async associate() {}

    associateTx(): TransactWriteItem {
        return {
            Update: {
                TableName: '',
                Key: {},
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                UpdateExpression: '',
            },
        }
    }

    async unassociate() {}

    unassociateTx(): TransactWriteItem {
        return {
            Update: {
                TableName: '',
                Key: {},
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                UpdateExpression: '',
            },
        }
    }
}

const processContext = new ProcessContextStore()

export default processContext

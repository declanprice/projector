import { DynamoDBClient, TransactWriteItem } from '@aws-sdk/client-dynamodb'

class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME

    readonly client = new DynamoDBClient()

    async command(command: any) {}

    commandTx(command: any): TransactWriteItem {
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

    async scheduleCommand(command: any, timestamp: Date | string) {}

    scheduleCommandTx(command: any, timestamp: Date | string): TransactWriteItem {
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

    async event(command: any) {}

    eventTx(command: any): TransactWriteItem {
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
    async scheduleEvent(event: any, timestamp: Date | string) {}

    scheduleEventTx(event: any, timestamp: Date | string): TransactWriteItem {
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

    async unschedule(id: string) {}

    unscheduleTx(id: string): TransactWriteItem {
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

const outbox = new OutboxStore()

export default outbox

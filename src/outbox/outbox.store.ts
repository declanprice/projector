import { TransactWriteItem } from '@aws-sdk/client-dynamodb/dist-types/models/models_0'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME

    readonly client = new DynamoDBClient()

    operations: TransactWriteItem[] = []

    async command(command: any) {}
    async scheduleCommand(command: any, timestamp: Date | string) {}
    async unscheduleCommand(id: string) {}

    async event(command: any) {}
    async scheduleEvent(command: any, timestamp: Date | string) {}
    async unscheduleEvent(id: string) {}
}

const outbox = new OutboxStore()

export default outbox

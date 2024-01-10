import { TransactWriteItem } from '@aws-sdk/client-dynamodb/dist-types/models/models_0'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME

    readonly client = new DynamoDBClient()

    operations: TransactWriteItem[] = []

    async removeCommand(id: string) {}
    async command(command: any) {}
    async unScheduleCommand(id: string) {}

    async event(command: any) {}
    async scheduleEvent(command: any, timestamp: Date | string) {}
    async unScheduleEvent(id: string) {}
}

const outbox = new OutboxStore()

export default outbox

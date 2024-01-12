import { DeleteItemCommand, DynamoDBClient, PutItemCommand, TransactWriteItem } from '@aws-sdk/client-dynamodb'
import { v4 } from 'uuid'
import { OutboxBusType, OutboxItem, OutboxItemStatus } from './outbox.item'
import { marshall } from '@aws-sdk/util-dynamodb'
import { isClass } from '../util/is-class'

type OutboxSetOptions = {
    timestamp: string
}

class OutboxStore {
    readonly OUTBOX_STORE_NAME = process.env.OUTBOX_STORE_NAME

    readonly client = new DynamoDBClient()

    async command(command: any, options?: OutboxSetOptions) {
        const tx = this.commandTx(command, options)

        if (!tx.Put) throw new Error('failed to send command')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    commandTx(command: any, options?: OutboxSetOptions): TransactWriteItem {
        if (!isClass(command)) throw new Error('command must be a valid class')

        const id = v4()

        const item: OutboxItem = {
            id,
            bus: OutboxBusType.COMMAND,
            status: OutboxItemStatus.PENDING,
            timestamp: options?.timestamp ?? new Date().toISOString(),
            type: command.constructor.name,
            data: command,
        }

        return {
            Put: {
                TableName: this.OUTBOX_STORE_NAME,
                Item: marshall(item, { convertClassInstanceToMap: true }),
            },
        }
    }

    async event(event: any, options?: OutboxSetOptions) {
        const tx = this.eventTx(event, options)

        if (!tx.Put) throw new Error('failed to send event')

        await this.client.send(new PutItemCommand(tx.Put))
    }

    eventTx(event: any, options?: OutboxSetOptions): TransactWriteItem {
        if (!isClass(event)) throw new Error('event must be a valid class')

        const id = v4()

        const item: OutboxItem = {
            id,
            bus: OutboxBusType.EVENT,
            status: OutboxItemStatus.PENDING,
            timestamp: options?.timestamp ?? new Date().toISOString(),
            type: event.constructor.name,
            data: event,
        }

        return {
            Put: {
                TableName: this.OUTBOX_STORE_NAME,
                Item: marshall(item, { convertClassInstanceToMap: true }),
            },
        }
    }

    async unschedule(id: string) {
        const tx = this.unscheduleTx(id)

        if (!tx.Delete) throw new Error('failed to unschedule outbox command/event')

        await this.client.send(new DeleteItemCommand(tx.Delete))
    }

    unscheduleTx(id: string): TransactWriteItem {
        return {
            Delete: {
                TableName: '',
                Key: marshall({
                    id,
                }),
            },
        }
    }
}

const outbox = new OutboxStore()

export default outbox

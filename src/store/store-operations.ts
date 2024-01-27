import {
    ConditionalCheckFailedException,
    DeleteItemCommand,
    DynamoDBClient,
    PutItemCommand,
    TransactionCanceledException,
    TransactWriteItem,
    TransactWriteItemsCommand,
    UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient()

export const commit = async (...writeItems: TransactWriteItem[]) => {
    if (writeItems.length < 1) {
        throw new Error('commit have contain at least one operation')
    }

    if (writeItems.length === 1) {
        const item = writeItems[0]

        if (item.Put) {
            return client.send(new PutItemCommand(item.Put))
        }

        if (item.Update) {
            return client.send(new UpdateItemCommand(item.Update))
        }

        if (item.Delete) {
            return client.send(new DeleteItemCommand(item.Delete))
        }
    }

    return client.send(
        new TransactWriteItemsCommand({
            TransactItems: writeItems,
        })
    )
}

export const isConditionCheckError = (error: any): boolean => {
    if (error instanceof ConditionalCheckFailedException) {
        return true
    }

    if (error instanceof TransactionCanceledException) {
        if (error.CancellationReasons) {
            return error.CancellationReasons.some((r) => r.Code === 'ConditionalCheckFailed')
        }
    }

    return false
}

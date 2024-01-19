import {
    DynamoDBClient,
    TransactionCanceledException,
    TransactWriteItem,
    TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient()

export const transaction = async (...writeItems: TransactWriteItem[]) => {
    return client.send(
        new TransactWriteItemsCommand({
            TransactItems: writeItems,
        })
    )
}

export const isConditionCheckError = (error: any): boolean => {
    if (error instanceof TransactionCanceledException) {
        if (error.CancellationReasons) {
            return error.CancellationReasons.some((r) => r.Code === 'ConditionalCheckFailed')
        }
    }

    return false
}

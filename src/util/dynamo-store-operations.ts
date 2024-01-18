import { DynamoDBClient, TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient()

export const transaction = async (...writeItems: TransactWriteItem[]) => {
    const response = await client.send(
        new TransactWriteItemsCommand({
            TransactItems: writeItems,
        })
    )

    console.log('transaction response', response)

    return response
}

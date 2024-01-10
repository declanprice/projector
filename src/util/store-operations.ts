import { DynamoDBClient, TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient()

export const transaction = async (...writeItems: TransactWriteItem[]) => {
    await client.send(
        new TransactWriteItemsCommand({
            TransactItems: writeItems,
        })
    )
}

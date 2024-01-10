import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItem } from '@aws-sdk/client-dynamodb/dist-types/models/models_0'

class ProcessStore {
    readonly PROCESS_STORE_NAME = process.env.PROCESS_STORE_NAME

    readonly client = new DynamoDBClient()

    operations: TransactWriteItem[] = []

    end() {}
}

const processContext = new ProcessStore()

export default processContext

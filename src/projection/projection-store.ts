import { Type } from 'aws-cdk-lib/assertions/lib/private/type'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { TransactWriteItem } from '@aws-sdk/client-dynamodb/dist-types/models/models_0'

class ProjectionStore {
    readonly PROJECTION_STORE_NAME = process.env.PROJECTION_STORE_NAME

    readonly client = new DynamoDBClient()

    operations: TransactWriteItem[] = []

    async get(type: Type, id: string) {}
    async getMany(type: Type, ids: string[]) {}
    async query(type: Type) {}
    async save(instance: any) {}
    async saveMany(instances: any[]) {}
    async delete(type: Type, id: string) {}
    async deleteMany(type: Type, ids: string[]) {}
}

const projection = new ProjectionStore()

export default projection

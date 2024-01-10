import { Type } from 'aws-cdk-lib/assertions/lib/private/type'

class ProjectionStore {
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

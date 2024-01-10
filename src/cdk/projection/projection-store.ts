import { AttributeType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type ProjectionStoreProps = {} & Partial<TableProps>

export class ProjectionStore extends Table {
    constructor(scope: Construct, projection: { new (): any }, props?: ProjectionStoreProps) {
        super(scope, `${projection.name}-Store`, {
            tableName: `${projection.name}-Store`,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'id',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'type',
            },
            ...props,
        })
    }
}

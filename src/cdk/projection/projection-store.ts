import { AttributeType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { Type } from '../../util/type'
import { RemovalPolicy } from 'aws-cdk-lib'

type ProjectionStoreProps = {} & Partial<TableProps>

export class ProjectionStore extends Table {
    constructor(scope: Construct, id: string, props?: ProjectionStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'id',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'type',
            },
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        })
    }
}

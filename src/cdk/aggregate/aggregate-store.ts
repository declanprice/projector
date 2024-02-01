import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

type StateStoreProps = {} & Partial<TableProps>

export class AggregateStore extends Table {
    constructor(scope: Construct, id: string, props?: StateStoreProps) {
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
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        })
    }
}

import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type StateStoreProps = {} & Partial<TableProps>

export class AggregateStore extends Table {
    constructor(scope: Construct, id: string, props: StateStoreProps) {
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
            stream: StreamViewType.NEW_IMAGE,
            ...props,
        })
    }
}

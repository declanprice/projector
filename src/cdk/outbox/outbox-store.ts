import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type OutboxStoreProps = {} & Partial<TableProps>

export class OutboxStore extends Table {
    constructor(scope: Construct, id: string, props?: OutboxStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'id',
            },
            stream: StreamViewType.NEW_IMAGE,
            ...props,
        })

        this.addGlobalSecondaryIndex({
            indexName: 'status-index',
            partitionKey: {
                name: 'status',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'timestamp',
                type: AttributeType.STRING,
            },
        })
    }
}

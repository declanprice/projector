import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

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
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        })
    }
}

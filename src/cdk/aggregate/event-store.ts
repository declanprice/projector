import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type EventStoreProps = {} & Partial<TableProps>

export class EventStore extends Table {
    constructor(scope: Construct, id: string, props: EventStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'id',
            },
            sortKey: {
                type: AttributeType.NUMBER,
                name: 'version',
            },
            stream: StreamViewType.NEW_IMAGE,
            ...props,
        })
    }
}

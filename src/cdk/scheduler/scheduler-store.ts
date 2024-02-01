import { AttributeType, StreamViewType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

type SchedulerStoreProps = {} & Partial<TableProps>

export class SchedulerStore extends Table {
    constructor(scope: Construct, id: string, props?: SchedulerStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'id',
            },
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'scheduledAt',
            ...props,
        })
    }
}

import { AttributeType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

type SubscriptionStoreProps = {} & Partial<TableProps>

export class SubscriptionStore extends Table {
    constructor(scope: Construct, id: string, props?: SubscriptionStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'pk',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'sk',
            },
            removalPolicy: RemovalPolicy.DESTROY,
            ...props,
        })
    }
}

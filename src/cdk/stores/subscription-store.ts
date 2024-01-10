import { Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type SubscriptionStoreProps = {} & TableProps

export class SubscriptionStore extends Table {
    constructor(scope: Construct, id: string, props: SubscriptionStoreProps) {
        super(scope, id, props)
    }
}

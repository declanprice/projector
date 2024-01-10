import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'

type SubscriptionUpdateBusProps = {} & TopicProps

export class SubscriptionUpdateBus extends Topic {
    constructor(scope: Construct, id: string, props: SubscriptionUpdateBusProps) {
        super(scope, id, props)
    }
}

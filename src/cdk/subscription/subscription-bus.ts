import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'

type SubscriptionUpdateBusProps = {} & Partial<TopicProps>

export class SubscriptionBus extends Topic {
    constructor(scope: Construct, id: string, props?: SubscriptionUpdateBusProps) {
        super(scope, id, {
            topicName: id,
            ...props,
        })
    }
}

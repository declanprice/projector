import { Topic, TopicProps } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'

type CommandBusProps = {} & TopicProps

export class CommandBus extends Topic {
    constructor(scope: Construct, id: string, props: CommandBusProps) {
        super(scope, id, props)
    }
}

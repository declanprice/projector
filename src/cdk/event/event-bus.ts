import { EventBus as AWSEventBus, EventBusProps as AWSEventBusProps } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'

type EventBusProps = {} & AWSEventBusProps

export class EventBus extends AWSEventBus {
    constructor(scope: Construct, id: string, props: EventBusProps) {
        super(scope, id, props)
    }
}

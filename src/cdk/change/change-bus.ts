import { EventBus as AWSEventBus, EventBusProps as AWSEventBusProps } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'

type ChangeBusProps = {} & Partial<AWSEventBusProps>

export class ChangeBus extends AWSEventBus {
    constructor(scope: Construct, id: string, props?: ChangeBusProps) {
        super(scope, id, {
            eventBusName: id,
            ...props,
        })
    }
}

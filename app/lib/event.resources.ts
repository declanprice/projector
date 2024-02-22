import { Construct } from 'constructs'
import { AggregateStore, CommandHandler, EventBus, HandlerApi, SchedulerStore } from '../../src/cdk'
import { RegisterCustomerHandler } from '../src/command/register-customer.handler'
import { EventGroup } from '../../src/cdk/event/event-group'
import { SendWelcomeEmailEventHandler } from '../src/event/send-welcome-email-event.handler'

type EventResourcesProps = {
    eventBus: EventBus
}

export class EventResources extends Construct {
    constructor(scope: Construct, id: string, props: EventResourcesProps) {
        super(scope, id)

        new EventGroup(this, SendWelcomeEmailEventHandler, {
            eventBus: props.eventBus,
            entry: 'src/event/send-welcome-email-event.handler.ts',
        })
    }
}

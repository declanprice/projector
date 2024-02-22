import { Construct } from 'constructs'
import {
    AggregateStore,
    AggregateStorePublisher,
    EventBus,
    HandlerApi,
    OutboxStore,
    OutboxStorePublisher,
    ProjectionStore,
    SchedulerStore,
    SchedulerStorePublisher,
    SubscriptionApi,
    SubscriptionBus,
    SubscriptionStore,
} from '../../src/cdk'

export class CoreResources extends Construct {
    readonly eventBus: EventBus
    readonly subscriptionBus: SubscriptionBus
    readonly subscriptionStore: SubscriptionStore
    readonly subscriptionApi: SubscriptionApi
    readonly handlerApi: HandlerApi
    readonly aggregateStore: AggregateStore
    readonly outboxStore: OutboxStore
    readonly schedulerStore: SchedulerStore
    readonly projectionStore: ProjectionStore

    constructor(scope: Construct, id: string) {
        super(scope, id)

        this.eventBus = new EventBus(this, 'EventBus')

        this.handlerApi = new HandlerApi(this, 'RestApi')

        this.subscriptionBus = new SubscriptionBus(this, 'SubscriptionBus')
        this.subscriptionStore = new SubscriptionStore(this, 'Subscriptions')
        this.subscriptionApi = new SubscriptionApi(this, 'SubscriptionApi', {
            subscriptionStore: this.subscriptionStore,
        })

        this.aggregateStore = new AggregateStore(this, 'Aggregates')
        new AggregateStorePublisher(this, 'AggregatesPublisher', {
            eventBus: this.eventBus,
            aggregateStore: this.aggregateStore,
        })

        this.outboxStore = new OutboxStore(this, 'Outbox')
        new OutboxStorePublisher(this, 'OutboxPublisher', {
            eventBus: this.eventBus,
            outboxStore: this.outboxStore,
        })

        this.schedulerStore = new SchedulerStore(this, 'Scheduler')
        new SchedulerStorePublisher(this, 'SchedulerPublisher', {
            eventBus: this.eventBus,
            schedulerStore: this.schedulerStore,
        })

        this.projectionStore = new ProjectionStore(this, 'Projections')
    }
}

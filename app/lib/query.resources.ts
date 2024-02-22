import { Construct } from 'constructs'
import { ChangeGroup, EventBus, HandlerApi, ProjectionStore, QueryHandler } from '../../src/cdk'
import { GetCustomerByIdHandler } from '../src/query/get-customer-by-id.handler'
import { CustomerProjectionHandler } from '../src/query/customer-projection.handler'

type QueryResourcesProps = {
    handlerApi: HandlerApi
    eventBus: EventBus
    projectionStore: ProjectionStore
}

export class QueryResources extends Construct {
    constructor(scope: Construct, id: string, props: QueryResourcesProps) {
        super(scope, id)

        const { handlerApi, eventBus, projectionStore } = props

        new QueryHandler(this, GetCustomerByIdHandler, {
            handlerApi,
            projectionStores: [projectionStore],
            entry: 'src/query/get-customer-by-id.handler.ts',
        })

        new ChangeGroup(this, CustomerProjectionHandler, {
            eventBus,
            projectionStores: [projectionStore],
            entry: 'src/query/customer-projection.handler.ts',
        })

        // new SubscriptionHandler(this, CustomerSubscriptionHandler, {
        //     subscriptionStore,
        //     subscriptionApi,
        //     subscriptionBus,
        //     entry: 'src/customer-subscription.handler.ts',
        // })
    }
}

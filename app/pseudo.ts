// @Aggregate({
//     type: AggregateType.STATE_STORED,
//     snapshotPeriod: 10,
// })
// class Order {
//     @AggregateId()
//     orderId: string
//     customerId: string
//     items: any[]
//     status: string
//
//     @AggregateHandler(OrderPlacedEvent)
//     onOrderPlaced(event: OrderPlacedEvent) {
//         this.orderId = event.orderId
//         this.customerId = event.customerId
//         this.items = event.items
//         this.status = 'placed'
//     }
//
//     @AggregateHandler(OrderRejectedEvent)
//     onRejected() {
//         this.status = 'rejected'
//     }
// }

// aggregate.load(Order, '1')
// aggregate.loadMany(Order, ['1', '2', '3'])
// aggregate.apply(new Order({ orderId: '1' }), new OrderPlacedEvent())
// aggregate.archive(new Order({ orderId: '1' }), new OrderRejectedEvent())
//
// @Projection({})
// class OrderProjection {
//     @ProjectionId()
//     orderId: string
//     customerId: string
//     items: any[]
// }
//
// projection.get(OrderProjection, '1')
// projection.getMany(OrderProjection, ['1', '2', '3'])
// projection.query(OrderProjection).using('index').where('pk', 'something').where('sk', 'something')
// projection.save(new OrderProjection())
// projection.saveMany([new OrderProjection()])
// projection.delete(OrderProjection, '1')
// projection.deleteMany(OrderProjection, ['1', '2', '3'])
//
// @CommandHandler({
//     path: 'orders/place',
//     schema: object({}),
// })
// export class PlaceOrder {
//     async handle(command: any) {
//         const orderAgg = await aggregate.load(Order, '1')
//
//         aggregate.apply(new Order({ orderId: '1' }), new OrderPlacedEvent({ orderId: '1' }))
//
//         outbox.schedule(new SomethingEvent(), new Date('04/04/04 15:00:05'))
//     }
// }

// @QueryHandler({
//     path: 'orders/{id}',
//     schema: object({}),
// })
// export class GetOrderById {
//     async handle(command: any) {
//         return projection.get(OrderProjection, data.orderId)
//     }
// }
//
// @SubscriptionHandler({
//     path: 'orders.updates',
//     on: OrderUpdate,
//     schema: object({}),
//     lookupKey: 'orderId',
// })
// export class OrderUpdates {
//     async onConnect() {
//         throw new Error('user does not have permission to subscribe')
//     }
//
//     async onDisconnect() {
//         // do something
//     }
//
//     async filter(update: OrderUpdate, connection: Connection) {
//         return update.sss === connecton.filter.sss
//     }
//
//     async handle(update: OrderUpdate) {
//         return {}
//     }
// }
//
// @ScheduledEventHandler({
//     on: 'something-task',
// })
// export class CancelOrderIfNoResponse {
//     async handle() {
//         // do something on deadline
//     }
// }
//
// class OrderPlacedEvent {}
// class OrderRejectedEvent {}
// class Customer {}
//
// @EventHandler({
//     on: [OrderPlacedEvent, OrderRejectedEvent],
//     batchSize: 10,
// })
// export class EmailOnOrder {
//     async handle(event: OrderPlacedEvent | OrderRejectedEvent, data: Order | Customer) {
//         if (data instanceof OrderPlacedEvent) {
//             await this.handleOrderPlaced(event, data as Order)
//         }
//
//         if (data instanceof OrderRejectedEvent) {
//             await this.handleOrderRejected(event, data as Order)
//         }
//     }
//
//     async handleOrderPlaced(event: OrderPlacedEvent, data: Order) {
//         await projection.save(
//             new OrderProjection({
//                 orderId: data.orderId,
//                 status: 'placed',
//             })
//         )
//
//         if (!isReplay()) {
//             await subscription.update(new OrderSubscriptionUpdate(''))
//         }
//     }
//
//     async handleOrderRejected(event: OrderRejectedEvent, data: Order) {
//         const order = await projection.get(OrderProjection, data.orderId)
//
//         order.status = 'rejected'
//
//         await projection.save(order)
//     }
// }
//
// @Process({
//     batchSize: 10,
//     multi: true,
//     defaultKey: 'orderId',
// })
// export class OrderProcess {
//     @StartProcess(OrderPlacedEvent)
//     onPlaced(event: OrderPlacedEvent) {
//         const orderId = process.data.orderId
//         process.data.orderId = '123'
//         process.data.status = 'placed'
//         process.associate('123')
//         process.unassociate('321')
//         process.end()
//
//         aggregate.load()
//         projection.get()
//
//         const deadlineId = outbox.schedule(new DoSomethingEvent(), new Date('04/04/2024 15:00:00'))
//         outbox.remove(deadlineId)
//
//         outbox.commandTx(new DoSomethingCommand())

// await transaction(
//   process.endTx(),
//   outbox.commandTx(new DoSomethingCommand())
//)

//     }
//
//     @ProcessHandler(OrderAcceptedEvent)
//     onAccepted(event: OrderAcceptedEvent) {
//         process.data.status = 'accepted'
//     }
//

//
//     @EndProcess(SomethingDeadline)
//     onDeadline() {
//     }

//     @EndProcess(OrderRejectedEvent)
//     onRejected(event: OrderRejectedEvent) {
//         process.data.status = 'rejected'
//     }
// }

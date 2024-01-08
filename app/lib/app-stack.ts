import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CancelOrderIfNotAccepted, EmailOnOrder, GetOrderById, OrderUpdates, PlaceOrder } from './place-order.handler'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'AppQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });

        // tables / eventbridge / scheduler / api gateways (rest + websocket)
        new Core({})

        // api endpoints / lambda
        new CommandHandler(PlaceOrder, {
            handler: 'src/place-order.handler',
        })

        new QueryHandler(GetOrderById, {
            handler: 'src/get-order-by-id.handler',
        })

        new ChangeHandler(EmailOnOrder, {
            handler: 'src/email-on-order.handler',
        })

        new SubscriptionHandler(OrderUpdates, {
            handler: 'src/order-updates.handler',
        })

        new ScheduledTaskHandler(CancelOrderIfNotAccepted, {
            src: 'src/cancel-order-if-no-response.handler',
        })
    }
}

import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { ProcessQueue } from './process-queue'
import { EventBus } from '../event'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction, SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

type ProcessAssociationHandlerProps = {
    eventBus: EventBus
    processQueue: ProcessQueue
    entry: string
} & Partial<NodejsFunction>

export class ProcessAssociationHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (...props: any): any }, props: ProcessAssociationHandlerProps) {
        super(scope, `${handler.name}-Associations`, {
            functionName: `${handler.name}-Associations`,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            environment: {
                PROCESS_QUEUE_URL: props.processQueue.queueUrl,
            },
            handler: `index.${handler.name}.prototype.processAssociationHandler`,
            ...props,
        })

        const { eventBus, processQueue } = props

        const handlerQueue = new Queue(this, `${handler.name}-Associations-Queue`, {
            queueName: `${handler.name}-Associations-Queue`,
        })

        this.addEventSource(new SqsEventSource(handlerQueue, { batchSize: 10 }))

        new Rule(this, `${handler.name}-AssociationsRule`, {
            eventBus,
            eventPattern: {
                detailType: Match.anyOf(Match.exactString('RegisterCustomer')),
            },
            targets: [new SqsQueue(handlerQueue)],
        })

        processQueue.grantSendMessages(this)
    }
}

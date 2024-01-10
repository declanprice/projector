import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { ProcessQueue } from './process-queue'
import { EventBus } from '../event'
import { Match, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets'

type ProcessAssociationHandlerProps = {
    eventBus: EventBus
    processQueue: ProcessQueue
    entry: string
} & Partial<NodejsFunction>

export class ProcessAssociationHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (): any }, props: ProcessAssociationHandlerProps) {
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

        new Rule(this, `${handler.name}-AssociationsRule`, {
            eventBus,
            eventPattern: {
                detailType: Match.anyOf(Match.exactString('RegisterCustomer')),
            },
            targets: [new LambdaFunction(this)],
        })

        processQueue.grantSendMessages(this)
    }
}

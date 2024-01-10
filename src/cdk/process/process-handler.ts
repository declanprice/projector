import { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { Duration } from 'aws-cdk-lib'
import { ProcessQueue } from './process-queue'
import { HandleCommand } from '../../command'
import { ProcessAssociationHandler } from './process-assoication-handler'
import { EventBus } from '../event'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

type ProcessHandlerProps = {
    eventBus: EventBus
    entry: string
} & Partial<NodejsFunction>

export class ProcessHandler extends NodejsFunction {
    constructor(scope: Construct, handler: { new (): HandleCommand }, props: ProcessHandlerProps) {
        super(scope, handler.name, {
            functionName: handler.name,
            runtime: Runtime.NODEJS_20_X,
            timeout: Duration.seconds(10),
            memorySize: 512,
            handler: `index.${handler.name}.prototype.processHandler`,
            ...props,
        })

        const { eventBus, entry } = props

        const processQueue = new ProcessQueue(this, `${handler.name}-Queue`)

        this.addEventSource(new SqsEventSource(processQueue, { batchSize: 10 }))

        new ProcessAssociationHandler(this, handler, {
            eventBus,
            processQueue,
            entry,
        })
    }
}

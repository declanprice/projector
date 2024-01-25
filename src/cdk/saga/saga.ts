import { DefinitionBody, LogLevel, StateMachine, StateMachineType, Succeed } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'
import { CommandHandler } from '../command'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { RemovalPolicy } from 'aws-cdk-lib'

export type SagaHandlerProps = {
    startBy: CommandHandler
    express?: boolean
}

type SagaStep = {
    stepName: string
    invoke: CommandHandler
    compensate?: CommandHandler
}

export class Saga extends Construct {
    readonly steps: SagaStep[] = []

    constructor(
        scope: Construct,
        readonly id: string,
        readonly props: SagaHandlerProps
    ) {
        super(scope, id)
    }

    step(
        stepName: string,
        options: {
            invoke: CommandHandler
        }
    ) {
        this.steps.push({
            stepName,
            invoke: options.invoke,
        })
    }

    create() {
        const start = new LambdaInvoke(this, 'StepOneInvoke', { lambdaFunction: this.steps[0].invoke })

        const success = new Succeed(this, 'Success')

        start.next(success)

        const stateMachine = new StateMachine(this, `${this.id}-StateMachine`, {
            stateMachineName: `${this.id}`,
            stateMachineType: this.props?.express ? StateMachineType.EXPRESS : StateMachineType.STANDARD,
            logs: {
                destination: new LogGroup(this, `${this.id}-Logs`, {
                    logGroupName: `${this.id}-Logs`,
                }),
                level: LogLevel.ALL,
            },
            removalPolicy: RemovalPolicy.DESTROY,
            definitionBody: DefinitionBody.fromChainable(start),
        })

        stateMachine.grantStartSyncExecution(this.props.startBy)
        stateMachine.grantStartExecution(this.props.startBy)
    }
}

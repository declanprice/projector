import { DefinitionBody, Fail, LogLevel, StateMachine, StateMachineType, Succeed } from 'aws-cdk-lib/aws-stepfunctions'
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
        if (!this.steps.length) throw new Error('SagaHandler must have at least one valid step.')

        const successInvokes: LambdaInvoke[] = []

        const success = new Succeed(this, 'Success')

        const fail = new Fail(this, 'Fail')

        let counter = 0

        for (const step of this.steps) {
            console.log(step.stepName)

            const invoke = new LambdaInvoke(this, `${step.stepName}-Invoke`, {
                lambdaFunction: step.invoke,
            })

            successInvokes.push(invoke)

            if (counter > 0) {
                successInvokes[counter - 1].next(invoke)
            }

            counter++
        }

        successInvokes[successInvokes.length - 1].next(success)

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
            definitionBody: DefinitionBody.fromChainable(successInvokes[0]),
        })

        stateMachine.grantStartSyncExecution(this.props.startBy)
        stateMachine.grantStartExecution(this.props.startBy)
    }
}

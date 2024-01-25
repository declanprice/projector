import {
    DefinitionBody,
    Fail,
    JsonPath,
    LogLevel,
    StateMachine,
    StateMachineType,
    Succeed,
} from 'aws-cdk-lib/aws-stepfunctions'
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
} & SagaStepOptions

type SagaStepOptions = {
    invoke: CommandHandler
    waitForTask?: boolean
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

    step(stepName: string, options: SagaStepOptions) {
        this.steps.push({
            stepName,
            ...options,
        })
    }

    create() {
        if (!this.steps.length) throw new Error('SagaHandler must have at least one valid step.')

        const successInvokes: LambdaInvoke[] = []

        const failInvokes: LambdaInvoke[] = []

        const chainInvokes = () => {
            const success = new Succeed(this, 'Success')

            let counter = 0

            for (const step of this.steps) {
                const invoke = new LambdaInvoke(this, `${step.invoke.functionName}`, {
                    lambdaFunction: step.invoke,
                    resultSelector: {
                        isStateMachine: true,
                        'input.$': '$$.Execution.Input.input',
                        'taskToken.$': step?.waitForTask === true ? '$$.Task.Token' : undefined,
                    },
                })

                successInvokes.push(invoke)

                if (counter > 0) {
                    successInvokes[counter - 1].next(invoke)

                    const compensate = this.steps[counter - 1].compensate

                    if (compensate) {
                        const compensateInvoke = new LambdaInvoke(this, `${compensate.functionName}-Invoke`, {
                            lambdaFunction: compensate,
                            resultSelector: {
                                isStateMachine: true,
                                'input.$': '$$.Execution.Input.input',
                                'taskToken.$': step?.waitForTask === true ? '$$.Task.Token' : undefined,
                            },
                        })

                        failInvokes.push(compensateInvoke)

                        invoke.addCatch(compensateInvoke)
                    }
                }

                counter++
            }

            successInvokes[successInvokes.length - 1].next(success)
        }

        const chainCompensationInvokes = () => {
            const fail = new Fail(this, 'Fail')

            let counter = 0

            for (const failInvoke of failInvokes) {
                if (counter === failInvokes.length - 1) continue
                failInvokes[counter + 1].next(failInvoke)
                counter++
            }

            failInvokes[0].next(fail)
        }

        chainInvokes()

        chainCompensationInvokes()

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

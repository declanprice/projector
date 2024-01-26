import {
    DefinitionBody,
    Fail,
    IntegrationPattern,
    JsonPath,
    LogLevel,
    StateMachine,
    StateMachineType,
    Succeed,
    TaskInput,
} from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'
import { CommandHandler } from '../command'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { RemovalPolicy } from 'aws-cdk-lib'

export type SagaHandlerProps = {
    startBy: CommandHandler
    allowSendToken?: CommandHandler[]
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

        const compensateInvokes: LambdaInvoke[] = []

        const chainSuccessInvokes = () => {
            const success = new Succeed(this, 'Success')

            this.steps.forEach((step) => {
                const invoke = new LambdaInvoke(this, `${step.invoke.functionName}`, {
                    lambdaFunction: step.invoke,
                    integrationPattern:
                        step?.waitForTask === true
                            ? IntegrationPattern.WAIT_FOR_TASK_TOKEN
                            : IntegrationPattern.REQUEST_RESPONSE,
                    payload: TaskInput.fromObject({
                        isStateMachine: true,
                        'input.$': '$$.Execution.Input.input',
                        taskToken: step?.waitForTask === true ? JsonPath.taskToken : undefined,
                    }),
                    resultSelector: {
                        isStateMachine: true,
                        'input.$': '$$.Execution.Input.input',
                    },
                })

                successInvokes.push(invoke)
            })

            successInvokes.forEach((invoke, index) => {
                const nextInvoke = successInvokes[index - 1]

                if (nextInvoke) {
                    nextInvoke.next(invoke)
                }
            })

            successInvokes[successInvokes.length - 1].next(success)
        }

        const chainCompensationInvokes = () => {
            const fail = new Fail(this, 'Fail')

            this.steps.forEach((step) => {
                const compensate = step.compensate

                if (compensate) {
                    const compensateInvoke = new LambdaInvoke(this, `${compensate.functionName}-Invoke`, {
                        lambdaFunction: compensate,
                        resultSelector: {
                            isStateMachine: true,
                            'input.$': '$$.Execution.Input.input',
                        },
                    })

                    compensateInvokes.push(compensateInvoke)
                }
            })

            compensateInvokes.forEach((invoke, index) => {
                const nextInvoke = compensateInvokes[index + 1]

                if (nextInvoke) {
                    nextInvoke.next(invoke)
                }
            })

            compensateInvokes[0].next(fail)
        }

        const addCatches = () => {
            successInvokes.forEach((invoke, index) => {
                const invokes = compensateInvokes.slice(0, index)
                const firstAvailableCompensation = invokes[invokes.length - 1]
                if (firstAvailableCompensation) {
                    invoke.addCatch(firstAvailableCompensation)
                }
            })
        }

        chainSuccessInvokes()

        chainCompensationInvokes()

        addCatches()

        const stateMachine = new StateMachine(this, `${this.id}-StateMachine`, {
            stateMachineName: `${this.id}`,
            stateMachineType: this.props?.express ? StateMachineType.EXPRESS : StateMachineType.STANDARD,
            logs: {
                destination: new LogGroup(this, `${this.id}-Logs`, {
                    logGroupName: `${this.id}-Logs`,
                    removalPolicy: RemovalPolicy.DESTROY,
                }),
                level: LogLevel.ALL,
            },
            removalPolicy: RemovalPolicy.DESTROY,
            definitionBody: DefinitionBody.fromChainable(successInvokes[0]),
        })

        stateMachine.grantStartSyncExecution(this.props.startBy)
        stateMachine.grantStartExecution(this.props.startBy)

        if (this.props.allowSendToken) {
            for (const handler of this.props.allowSendToken) {
                stateMachine.grantTaskResponse(handler)
            }
        }
    }
}

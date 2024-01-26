import { DefinitionBody, Fail, IntegrationPattern, JsonPath, Succeed, TaskInput } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'
import { CommandHandler } from '../command'
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks'

type SagaStep = {
    stepName: string
} & SagaStepOptions

type SagaStepOptions = {
    invoke: CommandHandler
    waitForTask?: boolean
    compensate?: CommandHandler
}

export class SagaDefinition extends Construct {
    readonly steps: SagaStep[] = []

    constructor(
        readonly scope: Construct,
        readonly id: string
    ) {
        super(scope, id)
    }

    step(stepName: string, options: SagaStepOptions) {
        this.steps.push({
            stepName,
            ...options,
        })
    }

    create(): DefinitionBody {
        if (!this.steps.length) throw new Error('Saga definition must have at least one valid step.')

        const successInvokes: LambdaInvoke[] = []

        const compensateInvokes: LambdaInvoke[] = []

        const chainSuccessInvokes = () => {
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
                    retryOnServiceExceptions: true,
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
        }

        const chainCompensationInvokes = () => {
            this.steps.forEach((step) => {
                const compensate = step.compensate

                if (compensate) {
                    const compensateInvoke = new LambdaInvoke(this, `${compensate.functionName}-Invoke`, {
                        lambdaFunction: compensate,
                        retryOnServiceExceptions: true,
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
        }

        const addCatches = () => {
            successInvokes.forEach((invoke, index) => {
                const invokes = compensateInvokes.slice(0, index)
                const firstAvailableCompensation = invokes[invokes.length - 1]
                if (firstAvailableCompensation) {
                    invoke.addCatch(firstAvailableCompensation, {
                        resultPath: JsonPath.DISCARD,
                    })
                }
            })
        }

        chainSuccessInvokes()

        chainCompensationInvokes()

        addCatches()

        return DefinitionBody.fromChainable(successInvokes[0])
    }
}

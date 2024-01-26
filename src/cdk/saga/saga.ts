import { DefinitionBody, LogLevel, StateMachine, StateMachineProps } from 'aws-cdk-lib/aws-stepfunctions'
import { Construct } from 'constructs'
import { CommandHandler } from '../command'
import { RemovalPolicy } from 'aws-cdk-lib'
import { LogGroup } from 'aws-cdk-lib/aws-logs'

export type SagaHandlerProps = {
    startBy: CommandHandler
    allowSendToken?: CommandHandler[]
    express?: boolean
    definitionBody: DefinitionBody
} & Partial<StateMachineProps>

export class Saga extends StateMachine {
    constructor(scope: Construct, id: string, props: SagaHandlerProps) {
        super(scope, id, {
            ...props,
            stateMachineName: id,
            definitionBody: props.definitionBody,
            removalPolicy: RemovalPolicy.DESTROY,
            logs: {
                destination: new LogGroup(scope, `${id}-Logs`, {
                    logGroupName: `${id}-Logs`,
                    removalPolicy: RemovalPolicy.DESTROY,
                }),
                level: LogLevel.ALL,
            },
        })

        const { startBy, allowSendToken } = props

        this.grantStartSyncExecution(startBy)
        this.grantStartExecution(startBy)

        if (allowSendToken) {
            for (const allow of allowSendToken) {
                this.grantTaskResponse(allow)
            }
        }
    }
}

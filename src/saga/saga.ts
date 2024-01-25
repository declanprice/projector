import {
    SendTaskSuccessCommand,
    SFNClient,
    StartExecutionCommand,
    StartSyncExecutionCommand,
    SyncExecutionStatus,
} from '@aws-sdk/client-sfn'
import { createStateMachineArn } from '../util/sfn-utils'

export class Saga {
    readonly client = new SFNClient()

    constructor(readonly stateMachineName: string) {}

    async startSync(input: any): Promise<void> {
        const response = await this.client.send(
            new StartSyncExecutionCommand({
                stateMachineArn: createStateMachineArn(this.stateMachineName),
                input: JSON.stringify({
                    isStateMachine: true,
                    input,
                }),
            })
        )

        if (response.status === SyncExecutionStatus.FAILED) {
            throw new Error(response.cause)
        }
    }

    async start(input: any) {
        await this.client.send(
            new StartExecutionCommand({
                stateMachineArn: createStateMachineArn(this.stateMachineName),
                input: JSON.stringify({
                    isStateMachine: true,
                    input,
                }),
            })
        )
    }

    async successToken(token: string) {
        return this.client.send(
            new SendTaskSuccessCommand({
                taskToken: token,
                output: JSON.stringify({}),
            })
        )
    }

    async failToken(token: string) {
        return this.client.send(
            new SendTaskSuccessCommand({
                taskToken: token,
                output: JSON.stringify({}),
            })
        )
    }
}

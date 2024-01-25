import { SFNClient, StartSyncExecutionCommand, SyncExecutionStatus } from '@aws-sdk/client-sfn'
import { createStateMachineArn } from '../util/sfn-utils'

export class Saga {
    readonly client = new SFNClient()

    constructor(readonly stateMachineName: string) {}

    async startSync(input: any): Promise<any | null> {
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

        if (response.output) {
            const parsedOutput = JSON.parse(response.output)
            return parsedOutput?.Payload || null
        }

        return null
    }

    start() {}

    successToken() {}

    failToken() {}
}

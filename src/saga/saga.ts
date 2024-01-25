import { SFNClient, StartSyncExecutionCommand } from '@aws-sdk/client-sfn'
import { createStateMachineArn } from '../util/sfn-utils'

export class Saga {
    readonly client = new SFNClient()

    constructor(readonly stateMachineName: string) {}

    startSync(input: any) {
        return this.client.send(
            new StartSyncExecutionCommand({
                stateMachineArn: createStateMachineArn(this.stateMachineName),
                input: JSON.stringify({
                    isStateMachine: true,
                    input,
                }),
            })
        )
    }

    start() {}

    successToken() {}

    failToken() {}
}

export type SfnEvent = {
    isStateMachine: boolean
    input: any
    taskToken?: string
}

export const isSfnEvent = (event: any): event is SfnEvent => {
    return event?.isStateMachine === true
}

export const createStateMachineArn = (stateMachineName: string) => {
    const REGION = process.env.REGION as string
    const ACCOUNT = process.env.ACCOUNT as string
    return `arn:aws:states:${REGION}:${ACCOUNT}:stateMachine:${stateMachineName}`
}

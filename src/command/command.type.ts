export enum CommandInvocationType {
    HTTP = 'HTTP',
    SAGA = 'SAGA',
}

export type CommandMessage<Data = {}> = {
    invocationType: CommandInvocationType
    taskToken?: string
    data: Data
    params: any
}

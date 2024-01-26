export enum CommandInvocationType {
    HTTP = 'HTTP',
    SAGA = 'SAGA',
}

export type Command<Data = {}> = {
    invocationType: CommandInvocationType
    taskToken?: string
    data: Data
    timestamp: string
}

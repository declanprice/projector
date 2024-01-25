export enum CommandInvocationType {
    HTTP = 'HTTP',
    SAGA = 'SAGA',
}

export type Command<Data = {}> = {
    invocationType: CommandInvocationType
    metadata: {
        taskToken?: string
    }
    data: Data
    timestamp: string
}

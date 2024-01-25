export enum CommandInvocationType {
    HTTP = 'HTTP',
    SAGA = 'SAGA',
}

export type Command<Data = {}> = {
    invocationType: CommandInvocationType
    metadata: {
        waitForToken?: string
    }
    data: Data
    timestamp: string
}

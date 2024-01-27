export enum ChangeType {
    INSERT = 'INSERT',
    MODIFY = 'MODIFY',
    REMOVE = 'REMOVE',
}

export type ChangeMessage<Data> = {
    id: string
    change: ChangeType
    type: string
    data: Data
    version?: number
    timestamp?: string
}

export enum ChangeType {
    INSERT = 'INSERT',
    MODIFY = 'MODIFY',
    REMOVE = 'REMOVE',
}

export type ChangeEvent<Data> = {
    id: string
    change: ChangeType
    type: string
    data: Data
    version?: number
    timestamp: string
}

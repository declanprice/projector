export enum ChangeType {
    INSERT = 'INSERT',
    MODIFY = 'MODIFY',
    REMOVE = 'REMOVE',
}

export type ChangeEvent<Data> = {
    change: ChangeType
    type: string
    data: Data
    timestamp: string
}

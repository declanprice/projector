export type CommandBusMessage<Data = {}> = {
    messageId: string
    type: string
    data: Data
    timestamp: string
}

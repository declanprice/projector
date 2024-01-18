import { date, object, string } from 'valibot'

export const EventBusMessageSchema = object({
    messageId: string(),
    type: string(),
    timestamp: date(),
    data: object({}),
})

export type EventBusMessage<Data> = {
    messageId: string
    type: string
    timestamp: string
    data: Data
}

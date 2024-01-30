import { date, object, string } from 'valibot'

export const EventBusMessageSchema = object({
    messageId: string(),
    type: string(),
    data: object({}),
})

export type EventMessage<Data> = {
    messageId: string
    type: string
    data: Data
}

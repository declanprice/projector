import { EventBridgeEvent } from 'aws-lambda'

export const isEventBridgeEvent = (event: any): event is EventBridgeEvent<any, any> => {
    return 'source' in event && 'detail' in event
}

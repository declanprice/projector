import { ProcessDecoratorProps } from './process.decorator'
import { EventBridgeEvent } from 'aws-lambda'

export const processAssociationsHandler = (instance: any, props: ProcessDecoratorProps, event: EventBridgeEvent<any, any>) => {}

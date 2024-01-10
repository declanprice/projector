import { ProcessProps } from './process.decorator'

import { SQSEvent } from 'aws-lambda'

export const processAssociationsHandler = (instance: any, props: ProcessProps, event: SQSEvent) => {}

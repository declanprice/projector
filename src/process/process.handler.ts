import { ProcessProps } from './process.decorator'
import { SQSEvent } from 'aws-lambda'

export const processHandler = (instance: any, props: ProcessProps, event: SQSEvent) => {
    console.log('process handler')
}

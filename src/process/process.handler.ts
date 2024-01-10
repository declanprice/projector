import { ProcessDecoratorProps } from './process.decorator'
import { SQSEvent } from 'aws-lambda'

export const processHandler = (instance: any, props: ProcessDecoratorProps, event: SQSEvent) => {
    console.log('process handler')
}

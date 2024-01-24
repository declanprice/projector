import { isClass } from '../util/is-class'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { createTopicArn } from '../util/is-sns-event'

export class SubscriptionBus {
    private readonly SUBSCRIPTION_BUS_ARN = process.env.SUBSCRIPTION_BUS_ARN as string

    private readonly client = new SNSClient()

    constructor(private readonly topicName?: string) {}

    async emit(update: any) {
        if (!isClass(update)) throw new Error('update must be a valid class')

        try {
            const type = update.constructor.name

            const input = {
                TopicArn: this.topicName ? createTopicArn(this.topicName) : this.SUBSCRIPTION_BUS_ARN,
                MessageAttributes: {
                    type: {
                        DataType: 'String',
                        StringValue: type,
                    },
                },
                Message: JSON.stringify({
                    type: type,
                    data: update,
                }),
            }

            await this.client.send(new PublishCommand(input))
        } catch (error) {
            console.error(`[SUBSCRIPTION UPDATE EMIT FAILED] - ${JSON.stringify(error, null, 2)}]`)
        }
    }
}

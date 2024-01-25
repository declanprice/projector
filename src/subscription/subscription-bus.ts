import { isClass } from '../util/is-class'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { createTopicArn } from '../util/sns-utils'

export class SubscriptionBus {
    private readonly SUBSCRIPTION_BUS_ARN = process.env.SUBSCRIPTION_BUS_ARN as string

    private readonly client = new SNSClient()

    constructor(private readonly topicName?: string) {}

    async emit(route: string, update: any) {
        try {
            const input = {
                TopicArn: this.topicName ? createTopicArn(this.topicName) : this.SUBSCRIPTION_BUS_ARN,
                MessageAttributes: {
                    route: {
                        DataType: 'String',
                        StringValue: route,
                    },
                },
                Message: JSON.stringify({
                    route: route,
                    data: update,
                }),
            }

            await this.client.send(new PublishCommand(input))
        } catch (error) {
            console.error(`[SUBSCRIPTION UPDATE EMIT FAILED] - ${JSON.stringify(error, null, 2)}]`)
        }
    }
}

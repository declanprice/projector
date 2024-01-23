import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ScheduledItem } from '../../store/scheduler/scheduled.item'
import { SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler'

const client = new SchedulerClient()

const EVENT_BUS_ARN = process.env.EVENT_BUS_ARN as string
const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN as string

export const schedulerPublisherHandler = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
            const item = unmarshall(record.dynamodb.NewImage as any) as ScheduledItem
            console.log(`[INSERT EVENT] - ${item}`)
            await client.send(
                new CreateScheduleCommand({
                    Name: item.id,
                    GroupName: 'default',
                    ScheduleExpression: 'at(2024-01-23T16:00:00)',
                    Target: {
                        Arn: EVENT_BUS_ARN,
                        RoleArn: SCHEDULER_ROLE_ARN,
                        EventBridgeParameters: {
                            DetailType: 'EVENT',
                            Source: 'SCHEDULER',
                        },
                        Input: JSON.stringify(item.data),
                    },
                    FlexibleTimeWindow: undefined,
                })
            )
        }

        if (record.eventName === 'MODIFY' && record.dynamodb?.OldImage) {
            const item = unmarshall(record.dynamodb.NewImage as any) as ScheduledItem
            console.log(`[MODIFY EVENT] - ${item}`)
        }

        if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage) {
            const item = unmarshall(record.dynamodb.OldImage as any) as ScheduledItem
            console.log(`[REMOVE EVENT] - ${item}`)
        }
    }
}

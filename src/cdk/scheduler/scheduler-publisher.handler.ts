import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ScheduledItem } from '../../store/scheduler/scheduled.item'
import {
    SchedulerClient,
    FlexibleTimeWindowMode,
    CreateScheduleCommand,
    DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler'
import { format } from 'date-fns'
import { ResourceNotFoundException } from '@aws-sdk/client-scheduler'
import { ChangeMessage, ChangeType } from '../../event'

const client = new SchedulerClient()

const EVENT_BUS_ARN = process.env.EVENT_BUS_ARN as string
const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN as string

export const schedulerPublisherHandler = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        if (record.eventName === 'MODIFY') {
            console.log(`[IGNORING MODIFY EVENT]`)
            continue
        }

        if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
            console.log(`[INSERT EVENT]`)
            const item = unmarshall(record.dynamodb.NewImage as any) as ScheduledItem
            const scheduledAt = format(item.scheduledAt, `yyyy-MM-dd'T'HH:mm:ss`)
            const changeEvent: ChangeMessage<any> = {
                id: item.pk,
                type: item.type,
                change: record.eventName as ChangeType,
                data: item.data,
                timestamp: item.timestamp,
                version: item.version,
            }
            await client.send(
                new CreateScheduleCommand({
                    Name: item.id,
                    GroupName: 'default',
                    ScheduleExpression: `at(${scheduledAt})`,
                    Target: {
                        Arn: EVENT_BUS_ARN,
                        RoleArn: SCHEDULER_ROLE_ARN,
                        EventBridgeParameters: {
                            DetailType: 'EVENT',
                            Source: 'SCHEDULER',
                        },
                        Input: JSON.stringify(changeEvent),
                    },
                    FlexibleTimeWindow: {
                        Mode: FlexibleTimeWindowMode.OFF,
                    },
                })
            )
        }

        if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage) {
            console.log(`[REMOVE EVENT]`)
            const item = unmarshall(record.dynamodb.OldImage as any) as ScheduledItem
            try {
                await client.send(
                    new DeleteScheduleCommand({
                        Name: item.id,
                    })
                )
            } catch (error) {
                if (error instanceof ResourceNotFoundException) {
                    console.log(`[SCHEDULE NOT FOUND] - ${item.id}`)
                    continue
                }

                throw error
            }
        }
    }
}

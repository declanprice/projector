import { APIGatewayProxyEventV2, SQSEvent } from 'aws-lambda'
import { SNSMessage } from 'aws-lambda/trigger/sns'
import { CommandHandler } from './command-handler.decorator'
import { HandleCommand } from './command.handler'

const mockHandle = jest.fn().mockImplementation(async (command: any) => {
    if (command.firstName) {
        return `${command.firstName} ${command.lastName}`
    }

    return 'empty'
})

@CommandHandler({
    path: 'customers',
})
class TestHandler implements HandleCommand {
    handle = mockHandle
}

describe('CommandHandler decorator', () => {
    let httpEvent: APIGatewayProxyEventV2
    let sqsEvent: SQSEvent

    beforeEach(() => {
        jest.clearAllMocks()

        httpEvent = {
            version: '',
            routeKey: '',
            rawPath: '',
            rawQueryString: '',
            body: JSON.stringify({
                firstName: 'dec',
                lastName: 'test',
            }),
            cookies: [],
            headers: {},
            queryStringParameters: {},
            requestContext: {} as any,
            pathParameters: {},
            isBase64Encoded: false,
            stageVariables: undefined,
        }

        sqsEvent = {
            Records: [
                {
                    messageId: '',
                    receiptHandle: '',
                    attributes: {} as any,
                    messageAttributes: {},
                    md5OfBody: '',
                    eventSource: '',
                    eventSourceARN: '',
                    awsRegion: '',
                    body: JSON.stringify({
                        TopicArn: 'test',
                        Message: JSON.stringify({
                            firstName: 'dec',
                            lastName: 'test',
                        }),
                    } as SNSMessage),
                },
            ],
        }
    })

    it('should attach commandHandler to class prototype', () => {
        expect(TestHandler.prototype).toHaveProperty('commandHandler')
    })

    it('api gateway v2 event - should invoke handler with valid body', async () => {
        expect(await (TestHandler.prototype as any)['commandHandler'](httpEvent)).toEqual('dec test')
        expect(mockHandle).toHaveBeenCalledWith({
            firstName: 'dec',
            lastName: 'test',
        })
    })

    it('api gateway v2 event - should invoke handler with empty body', async () => {
        httpEvent.body = undefined
        expect(await (TestHandler.prototype as any)['commandHandler'](httpEvent)).toEqual('empty')
        expect(mockHandle).toHaveBeenCalledWith({})
    })

    it('should invoke handler async with sqs event containing a valid sns message', async () => {
        await (TestHandler.prototype as any)['commandHandler'](sqsEvent)

        expect(mockHandle).toHaveBeenCalledWith({
            firstName: 'dec',
            lastName: 'test',
        })
    })
})

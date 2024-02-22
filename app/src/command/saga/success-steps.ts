import { CommandMessage, CommandHandler, HandleCommand } from '../../../../src/command'
import { Saga } from '../../../../src/saga/saga'

@CommandHandler({
    path: '/saga/start',
})
export class StartSagaHandler implements HandleCommand {
    readonly saga = new Saga('TestSaga')

    async handle(command: CommandMessage<any>) {
        await this.saga.startSync({ data: 'test' })
    }
}

@CommandHandler({})
export class StepOneHandler implements HandleCommand {
    async handle(command: CommandMessage<any>) {
        console.log('step three handler', command)
    }
}

@CommandHandler({})
export class StepTwoHandler implements HandleCommand {
    async handle(command: CommandMessage<any>) {
        console.log('step three handler', command)
    }
}

@CommandHandler({})
export class StepThreeHandler implements HandleCommand {
    async handle(command: CommandMessage<any>) {
        console.log('step three handler', command)
    }
}

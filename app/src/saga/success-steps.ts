import { Command, CommandHandler, HandleCommand } from '../../../src/command'

@CommandHandler({})
export class StepOneHandler implements HandleCommand {
    async handle(command: Command<any>) {
        console.log('step three handler', command)
        return {
            data: 'ok',
        }
    }
}

@CommandHandler({})
export class StepTwoHandler implements HandleCommand {
    async handle(command: Command<any>) {
        console.log('step three handler', command)

        return {
            data: 'hello',
        }
    }
}

@CommandHandler({})
export class StepThreeHandler implements HandleCommand {
    async handle(command: Command<any>) {
        console.log('step three handler', command)
    }
}

import { CommandMessage, CommandHandler, HandleCommand } from '../../../src/command'

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

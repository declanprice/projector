import { CommandMessage, CommandHandler, HandleCommand } from '../../../src/command'

@CommandHandler({})
export class ErrorStepOneHandler implements HandleCommand {
    async handle(command: CommandMessage<any>) {
        console.log('error step one handlers', command)
    }
}

@CommandHandler({})
export class ErrorStepTwoHandler implements HandleCommand {
    async handle(command: CommandMessage<any>) {
        console.log('error step two handler', command)
    }
}

import { Command, CommandHandler, HandleCommand } from '../../../src/command'

@CommandHandler({})
export class ErrorStepOneHandler implements HandleCommand {
    async handle(command: Command<any>) {
        console.log('error step one handlers', command)
    }
}

@CommandHandler({})
export class ErrorStepTwoHandler implements HandleCommand {
    async handle(command: Command<any>) {
        console.log('error step two handler', command)
    }
}

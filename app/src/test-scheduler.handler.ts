import { SchedulerHandler } from '../../src/scheduler/scheduler-handler.decorator'
import { HandleSchedule } from '../../src/scheduler/scheduler.handler'
import { SchedulerMessage } from '../../src/scheduler/scheduler-message.type'
import { Customer } from './customer.aggregate'

@SchedulerHandler('test-schedule', {
    batchSize: 10,
})
export class TestSchedulerHandler implements HandleSchedule {
    async handle(message: SchedulerMessage<Customer>) {
        console.log(message)
    }
}

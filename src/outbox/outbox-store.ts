class OutboxStore {
    async removeCommand(id: string) {}
    async command(command: any) {}
    async unScheduleCommand(id: string) {}

    async event(command: any) {}
    async scheduleEvent(command: any, timestamp: Date | string) {}
    async unScheduleEvent(id: string) {}
}

const outbox = new OutboxStore()

export default outbox

export abstract class StoreItem {
    timestamp: string

    constructor(
        readonly pk: string,
        readonly sk?: string | number
    ) {
        this.timestamp = new Date().toISOString()
    }

    abstract fromItem(item: any): any
}

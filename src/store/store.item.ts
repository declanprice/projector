export abstract class StoreItem {
    timestamp: string

    constructor(
        private readonly _pk: string,
        private readonly _sk?: string | number
    ) {
        this.timestamp = new Date().toISOString()
    }

    get pk(): string {
        return this._pk
    }

    get sk(): string | number | undefined {
        return this._sk
    }

    abstract fromItem(item: any): any
}

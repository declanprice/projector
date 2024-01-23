import { ProjectionItem } from '../../src/store/projection/projection.item'

export class CustomerProjection extends ProjectionItem {
    constructor(
        readonly customerId: string,
        readonly firstName: string,
        readonly lastName: string
    ) {
        super(customerId)
    }

    fromItem(item: any): any {
        return new CustomerProjection(item.customerId, item.firstName, item.lastName)
    }
}

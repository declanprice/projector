import { Projection } from '../../src/projection'
import { ProjectionId } from '../../src/projection/projection.decorator'

@Projection()
export class CustomerProjection {
    @ProjectionId()
    customerId: string
    firstName: string
    lastName: string

    constructor(data: { customerId: string; firstName: string; lastName: string }) {
        this.customerId = data.customerId
        this.firstName = data.firstName
        this.lastName = data.lastName
    }
}

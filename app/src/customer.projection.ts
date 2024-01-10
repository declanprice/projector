import { Projection } from '../../src/projection'
import { ProjectionId } from '../../src/projection/projection.decorator'

@Projection()
export class CustomerProjection {
    @ProjectionId()
    customerId: string
    firstName: string
    lastName: string
}

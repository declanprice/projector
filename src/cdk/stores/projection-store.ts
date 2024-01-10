import { Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type ProjectionStoreProps = {} & TableProps

export class ProjectionStore extends Table {
    constructor(scope: Construct, id: string, props: ProjectionStoreProps) {
        super(scope, id, props)
    }
}

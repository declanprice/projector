import { Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type ProcessStoreProps = {} & TableProps

export class ProcessStore extends Table {
    constructor(scope: Construct, id: string, props: ProcessStoreProps) {
        super(scope, id, props)
    }
}

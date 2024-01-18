import { AttributeType, Table, TableProps } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type ProcessStoreProps = {} & Partial<TableProps>

export class ProcessStore extends Table {
    constructor(scope: Construct, id: string, props?: ProcessStoreProps) {
        super(scope, id, {
            tableName: id,
            partitionKey: {
                type: AttributeType.STRING,
                name: 'pk',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'sk',
            },
            ...props,
        })

        this.addGlobalSecondaryIndex({
            indexName: 'processId-index',
            partitionKey: {
                type: AttributeType.STRING,
                name: 'processId',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'sk',
            },
        })
    }
}

import {
    BeginsWithPredicate,
    BetweenExpressionPredicate,
    EqualityExpressionPredicate,
    ExpressionAttributes,
    GreaterThanExpressionPredicate,
    GreaterThanOrEqualToExpressionPredicate,
    LessThanExpressionPredicate,
    LessThanOrEqualToExpressionPredicate,
} from '@aws/dynamodb-expressions'
import { DynamoDBClient, QueryCommand, AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'

type SortKeyCondition =
    | EqualityExpressionPredicate
    | LessThanOrEqualToExpressionPredicate
    | LessThanExpressionPredicate
    | GreaterThanOrEqualToExpressionPredicate
    | GreaterThanExpressionPredicate
    | BetweenExpressionPredicate
    | BeginsWithPredicate

export class DynamoQueryBuilder<E> {
    constructor(
        private readonly tableName: string,
        private readonly client: DynamoDBClient
    ) {}

    private readonly query: {
        using?: string
        pk?: {
            name: string
            value: string
        }
        sk?: {
            name: string
            condition: SortKeyCondition
        }
        sort?: 'asc' | 'desc'
        limit?: number
        consistent?: boolean
        startAt?: Record<string, AttributeValue>
        expressionAttributes: ExpressionAttributes
    } = {
        expressionAttributes: new ExpressionAttributes(),
    }

    using(index: string): DynamoQueryBuilder<E> {
        this.query.using = index
        return this
    }

    consistent(consistent: boolean): DynamoQueryBuilder<E> {
        this.query.consistent = consistent
        return this
    }

    pk(name: string, value: string | number): DynamoQueryBuilder<E> {
        this.query.pk = {
            name: this.query.expressionAttributes.addName(name),
            value: this.query.expressionAttributes.addValue(value),
        }

        return this
    }

    sk(name: string, condition: SortKeyCondition): DynamoQueryBuilder<E> {
        this.query.sk = {
            name,
            condition,
        }

        return this
    }

    limit(limit: number): DynamoQueryBuilder<E> {
        this.query.limit = limit
        return this
    }

    startAt(key: Record<string, AttributeValue>): DynamoQueryBuilder<E> {
        this.query.startAt = key
        return this
    }

    sort(direction: 'asc' | 'desc'): DynamoQueryBuilder<E> {
        this.query.sort = direction
        return this
    }

    async exec(): Promise<{ data: E[]; lastEvaluatedKey: Record<string, AttributeValue> | undefined }> {
        const getSkCondition = (sk: { name: string; condition: SortKeyCondition }): string => {
            const name = this.query.expressionAttributes.addName(sk.name)

            switch (sk.condition.type) {
                case 'Between':
                    const lower = this.query.expressionAttributes.addValue(sk.condition.lowerBound)
                    const upper = this.query.expressionAttributes.addValue(sk.condition.upperBound)
                    return `${name} BETWEEN ${lower} AND ${upper}`
                case 'Equals':
                    const eqValue = this.query.expressionAttributes.addValue(sk.condition.object)
                    return `${name} = ${eqValue}`
                case 'GreaterThan':
                    const gtValue = this.query.expressionAttributes.addValue(sk.condition.object)
                    return `${name} > ${gtValue}`
                case 'GreaterThanOrEqualTo':
                    const gteValue = this.query.expressionAttributes.addValue(sk.condition.object)
                    return `${name} >= ${gteValue}`
                case 'LessThan':
                    const ltValue = this.query.expressionAttributes.addValue(sk.condition.object)
                    return `${name} < ${ltValue}`
                case 'LessThanOrEqualTo':
                    const lteValue = this.query.expressionAttributes.addValue(sk.condition.object)
                    return `${name} <= ${lteValue}`
                case 'Function':
                    const bwValue = this.query.expressionAttributes.addValue(sk.condition.expected)
                    return `begins_with(${name}, ${bwValue})`
            }
        }

        const getKeyCondition = () => {
            if (!this.query.pk) throw new Error('invalid query - (pk) must be set')

            if (this.query.sk) {
                return `${this.query.pk.name} = ${this.query.pk.value} AND ${getSkCondition(this.query.sk)}`
            }

            return `${this.query.pk.name} = ${this.query.pk.value}`
        }

        const result = await this.client.send(
            new QueryCommand({
                IndexName: this.query.using,
                TableName: this.tableName,
                KeyConditionExpression: getKeyCondition(),
                ExpressionAttributeNames: this.query.expressionAttributes.names,
                ExpressionAttributeValues: this.query.expressionAttributes.values as any,
                Limit: this.query.limit,
                ConsistentRead: this.query.consistent,
                ScanIndexForward: this.query.sort !== 'desc',
                ExclusiveStartKey: this.query.startAt,
            })
        )

        if (!result.Items) {
            return [] as any
        }

        return {
            data: result.Items.map((i) => unmarshall(i)) as E[],
            lastEvaluatedKey: result.LastEvaluatedKey,
        }
    }
}

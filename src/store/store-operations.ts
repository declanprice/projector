import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb'

export const isConditionCheckError = (error: any): boolean => {
    if (error instanceof ConditionalCheckFailedException) {
        return true
    }

    if (error instanceof TransactionCanceledException) {
        if (error.CancellationReasons) {
            return error.CancellationReasons.some((r) => r.Code === 'ConditionalCheckFailed')
        }
    }

    return false
}

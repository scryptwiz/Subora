export type SubscriptionLikelihood = 'high' | 'medium' | 'low' | 'not'

export type ParsedStatementLine = {
    id: string
    rawDescription: string
    amount: number
    currency: string
    transactionDate?: string
    subscriptionLikelihood: SubscriptionLikelihood
    rationale?: string
    merchantGuess?: string
    suggestedName?: string
    suggestedDomain?: string
    iconSlug?: string
    brandColor?: string
    inferredBillingCycle?: 'month' | 'year'
}

export type ParsePdfResponse = {
    lines: ParsedStatementLine[]
    truncated: boolean
    omittedLineCount?: number
}

export type ImportFilter = 'suggested' | 'all' | 'not'

export type ImportRowState = {
    line: ParsedStatementLine
    selected: boolean
    removed: boolean
}

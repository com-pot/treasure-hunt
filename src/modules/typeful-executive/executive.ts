type SchemaFieldSpec = {
    type: string,
    [param: string]: unknown,
}
type OnErrorFn = (errorCode: string) => void

export type ConditionType = {
    name: string,
    arguments?: {
        [name: string]: SchemaFieldSpec,
    }

    evaluate: (ctx: unknown, args: Record<string, unknown>, onError?: OnErrorFn) => boolean|Promise<Boolean>,
}

export type ConditionTypeSpec = Omit<ConditionType, 'name'>
export const defineConditionType = <T extends ConditionTypeSpec>(type: T): T => type

export type ExecutiveModule = {
    conditionTypes?: Record<string, ConditionTypeSpec>,
}
export const defineExecutiveModule = <T extends ExecutiveModule>(module: T): T => module

export const paginationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        page: { type: "number", minimum: 1 },
        perPage: { type: "number", minimum: 1 },
        totalItems: { type: "number", minimum: 1 },
        totalPages: { type: "number", minimum: 1 },
    },
    required: [
        "page",
        "perPage",
        "totalItems",
        "totalPages",
    ],
} as const

export function createPaginatedListSchema<T>(itemSchema: T) {
    return {
        ...paginationSchema,
        properties: {
            ...paginationSchema.properties,
            items: {
                type: "array",
                items: itemSchema,
            },
        },
        required: [
            ...paginationSchema.required,
            "items",
        ],
    } as const
}

export type ResultPagination = {
    page: number,
    perPage: number,
    totalItems: number,
    totalPages: number,
}

export type PaginatedList<TItem> = {
    items: TItem[],
} & ResultPagination

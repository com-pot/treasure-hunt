export default class AppError extends Error {
    constructor(message: string, public readonly status: number = 500, public readonly details?: any)
    {
        super(message)
    }
}

export const isAppError = (e: any): e is AppError =>  {
    return e instanceof AppError || typeof e === "object" && typeof e.status === "number"
}

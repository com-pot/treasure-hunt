export default class AppError extends Error {
    constructor(message: string, public readonly status: number = 500, public readonly data?: object|string)
    {
        super(message)
    }
}

// we want to check type of given argument
export const isAppError = (e: any): e is AppError =>  { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!e || typeof e !== 'object') {
        return false
    }

    return e instanceof AppError || typeof e.status === "number"
}

import Router from "@koa/router"
export type ServiceContainer = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

type AppRouting = {
    backstageRouter?: Router,
    router?: Router,
}

type StartupResult = AppRouting

export type AppModule = {
    compose?: (container: ServiceContainer, config: unknown) => Promise<void>
    startUp?: (container: ServiceContainer) => Promise<StartupResult>
} & AppRouting

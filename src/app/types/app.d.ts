
export type ServiceContainer = Record<string, any>

type StartupResult = {
    backstageRouter?: any,
    router?: any,
}
export type AppModule = {
    compose?: (container: ServiceContainer, config: any) => Promise<any>
    startUp?: (container: ServiceContainer) => Promise<StartupResult>

    router?: any,
    backstageRouter?: any,

} // TODO: define AppModule

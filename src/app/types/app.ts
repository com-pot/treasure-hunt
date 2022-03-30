import Router from "@koa/router"
import { EntityConfig, EntitySpec } from "../../modules/typeful/typeful"

export type ServiceContainer = {
    modules: Record<string, AppModule>,
    [name: string]: any,
}

type AppRouting = {
    backstageRouter?: Router,
    router?: Router,
}

type StartupResult = AppRouting

export type AppModule = {
    entities?: Record<string, EntitySpec|EntityConfig>,

    compose?: (container: ServiceContainer, config: unknown) => Promise<void>

    startUp?: (container: ServiceContainer) => Promise<StartupResult|void>

    plugins?: Record<string, unknown>,
} & AppRouting

export const defineAppModule = <T extends AppModule>(module: T): T => module

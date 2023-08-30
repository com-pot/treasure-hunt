import glob from "glob";
import path from "path";
import { AppModule } from "./types/app";
import appLogger from "./appLogger"

import { EntityConfig, TypefulModule } from "../modules/typeful/typeful";

// TODO: generalize module crawler
export const getModules = async (dir: string): Promise<Record<string, AppModule>> => {
    const files: string[] = glob.sync('./**/*.appModule.@(js|ts)', {
        cwd: dir,
        absolute: true,
    })

    const modules = await Promise.all(files.map(async (file) => {
        const name = parseModuleName(file)
        return [name, await importTypefulModule(dir, file)]
    }))

    return Object.fromEntries(modules)
}

export function parseModuleName(filePath: string): string {
    const parts = path.parse(filePath)

    return parseModuleNamespace(parts.dir) + parts.base.replace(/\.appModule\.(js|ts)$/, '')
}
function parseModuleNamespace(dir: string): string {
    const iNamespace = dir.lastIndexOf("@")
    if (iNamespace === -1) return ""

    const iNamespaceEnd = dir.indexOf("/", iNamespace) + 1
    return dir.substring(iNamespace, iNamespaceEnd)
}

async function importTypefulModule(dir: string, file: string): Promise<TypefulModule> {
    let module = await import(file)
    if (module.default && Object.keys(module).length === 1) {
        module = module.default
    }

    const moduleDir = path.dirname(file)

    return {
        ...module,
        entities: await initializeEntities(dir, moduleDir, module.entities)
    } as TypefulModule
}

const initializeEntities = async (cwd: string, moduleDir: string, entities?: Record<string, Partial<EntityConfig>>): Promise<Record<string, EntityConfig>> => {
    if (!entities) {
        entities = {}
    }

    const logger = appLogger.child({s: "bootstrap", moduleDir})

    const pattern = `${moduleDir}/model/*`
    const foundFiles = glob.sync(pattern, {cwd})

    const fileNameClassifierPattern = /(([\w-_]+)(\.(\w+))?\.(js|ts)$)/

    const initFilePromises = []
    for (const path of foundFiles) {
        const match = path.match(fileNameClassifierPattern)
        if (!match) {
            logger.warn({path}, "Misclassified file ");
            continue
        }

        const entityName = match[2]
        const type = match[4] || 'schema'

        if (!entities[entityName]) {
            entities[entityName] = {}
        }

        const entity: Partial<EntityConfig> = entities[entityName]
        if (!entity._plugins) {
            entity._plugins = {}
        }

        if (entity._plugins[type]) {
            logger.warn(`File '${path}' should be a ${type} but the entity config already has this field configured. Ignoring file.`);
            continue
        }

        initFilePromises.push(import(path).then((module) => {
            const moduleContent = module.default ?? module
            if (type === 'schema') {
                entity.schema = moduleContent
            } else {
                entity._plugins![type] = moduleContent
            }
        }))
    }

    await Promise.all(initFilePromises)

    return entities as Record<string, EntityConfig>
}

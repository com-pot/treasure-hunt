import glob from "glob";
import path from "path";
import { AppModule } from "./types/app";

import { EntityConfig, TypefulModule } from "../modules/typeful/typeful";

// TODO: generalize module crawler
export const getModules = async (dir: string): Promise<Record<string, AppModule>> => {
    const files: string[] = glob.sync('./**/*.appModule.@(js|ts)', {
        cwd: dir,
        absolute: true,
    })

    const modules = await Promise.all(files.map(async (file) => {
        const moduleDir = path.dirname(file)
        const name = path.parse(file).base.replace(/\.appModule\.(js|ts)$/, '')

        const module = await importTypefulModule(file)

        module.entities = await initializeEntities(dir, moduleDir, module.entities)

        module.entities && Object.entries(module.entities).forEach(([eName, config]) => {
            if (!config.schema) {
                console.warn("Entity " + eName + " does not have model specified");
            }
        })


        return [name, module]
    }))

    return Object.fromEntries(modules)
}
async function importTypefulModule(file: string): Promise<TypefulModule> {
    let module = await import(file)
    if (module.default && Object.keys(module).length === 1) {
        module = module.default
    }

    return {...module} as TypefulModule
}

const initializeEntities = async (cwd: string, moduleDir: string, entities?: Record<string, Partial<EntityConfig>>): Promise<Record<string, EntityConfig>> => {
    if (!entities) {
        entities = {}
    }
    const pattern = `${moduleDir}/model/*`
    const foundFiles = glob.sync(pattern, {cwd})

    const fileNameClassifierPattern = /(([\w-_]+)(\.(\w+))?\.(js|ts)$)/

    const initFilePromises = []
    for (const path of foundFiles) {
        const match = path.match(fileNameClassifierPattern)
        if (!match) {
            console.warn("Misclassified file " + path);
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
            console.warn(`File '${path}' should be a ${type} but the entity config already has this field configured. Ignoring file.`);
            continue
        }

        initFilePromises.push(import(path).then((module) => {
            if (!entity._plugins) {
                console.warn(`Failed to initialize module '${type}' on entity ${entityName}`)
                return
            }

            const moduleContent = module.default ?? module
            if (type === 'schema') {
                entity.schema = moduleContent
            } else {
                entity._plugins[type] = moduleContent
            }
        }))
    }

    await Promise.all(initFilePromises)

    const validEntityEntries = Object.entries(entities)
        .filter(([name, config]) => {
            if (!config.schema) {
                console.warn(`Entity '${name}' did not load properly, ignoring`);
                return false
            }
            return true
        }) as [string, EntityConfig][]

    return Object.fromEntries(validEntityEntries)
}

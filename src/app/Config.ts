import glob from "glob"
import path from "path"

type ConfigRootValue = Record<string, ConfigValue>
type ConfigValue = object|string|number|boolean|null

export default class Config {
    constructor(public readonly data: Record<string, ConfigRootValue>) {

    }
}

export const loadFromFiles = async(dir: string): Promise<Config> => {
    const config: Record<string, ConfigRootValue> = {}

    const files = glob.sync('*.@(js|ts|json)', {
        cwd: dir,
    })

    await Promise.all(files.map(async (file) => {
        const ext = path.extname(file)
        const name = path.basename(file, ext)

        const module = await import(path.resolve(dir, file))

        if (ext === 'json') {
            config[name] = module
            return
        }
        config[name] = module.default
    }))

    return new Config(config)
}

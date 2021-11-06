import glob from "glob"
import path from "path"

export default class Config {
    constructor(public readonly data: Record<string, object>) {

    }
}

export const loadFromFiles = async(dir: string): Promise<Config> => {
    const config: Record<string, any> = {}

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

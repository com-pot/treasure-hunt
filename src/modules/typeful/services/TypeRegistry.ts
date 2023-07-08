import {TypefulModule, TypefulType} from "../typeful"

export default class TypeRegistry {
    private readonly types: Map<string, TypefulType>

    constructor() {
        this.types = new Map()
    }

    registerTypes(module: TypefulModule, prefix?: string): this {
        Object.entries(module.types || {}).forEach(([name, type]) => {
            const fqn = prefix ? `${prefix}.name` : name

            // Sometimes types are provided as node.js modules with default exports
            if ('default' in type) type = (type as unknown as {default: TypefulType}).default

            if (this.types.has(fqn)) {
                console.warn(`Type ${fqn} is already registered, ignoring.`);
                return
            }
            this.types.set(fqn, type)
        })

        return this
    }

    get(name: string): TypefulType|undefined {
        return this.types.get(name)
    }

    listAvailableTypes() {
        return this.types.keys()
    }
}

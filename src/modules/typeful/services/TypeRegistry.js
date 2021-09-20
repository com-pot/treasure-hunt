export default class TypeRegistry {
    constructor() {
        this.types = new Map()
    }

    registerTypes(module, prefix) {
        Object.entries(module.types).forEach(([name, type]) => {
            const fqn = prefix ? `${prefix}.name` : name
            if (this.types.has(fqn)) {
                console.warn(`Type ${fqn} is already registered, ignoring.`);
                return
            }
            this.types.set(fqn, type)
        })

        return this
    }

    get(name) {
        return this.types.get(name)
    }
}

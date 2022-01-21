import { TypesModule } from "./typeful";

const module: TypesModule = {
    types: {
        bool: require('./types/bool').default,
        date: require('./types/date').default,
        json: require('./types/json').default,
        list: require('./types/list').default,
        map: require('./types/map').default,
        number: require('./types/number').default,
        relation: require('./types/relation').default,
        schema: require('./types/schema').default,
        string: require('./types/string').default,
        type: require('./types/type').default,
    },
}

export default module

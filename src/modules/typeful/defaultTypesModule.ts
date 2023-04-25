import { TypesModule } from "./typeful";

import bool from "./types/bool"
import date from "./types/date"
// @ts-ignore
import json from './types/json'
import list from './types/list'
// @ts-ignore
import map from './types/map'
import number from './types/number'
import relation from './types/relation'
import schema from './types/schema'
// @ts-ignore
import string from './types/string'
// @ts-ignore
import dataType from './types/type'

const module: TypesModule = {
    types: {
        bool,
        date,
        json,
        list,
        map,
        number,
        relation,
        schema,
        string,
        type: dataType,
    },
}

export default module

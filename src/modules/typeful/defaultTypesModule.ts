import { TypesModule } from "./typeful";

import bool from "./types/bool"
import date from "./types/date"
import json from './types/json'
import list from './types/list'
import map from './types/map'
import number from './types/number'
import relation from './types/relation'
import schema from './types/schema'
import string from './types/string'
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

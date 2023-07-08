import { TypesModule } from "./typeful";

import bool from "./types/bool"
import date from "./types/date"
import array from './types/array'
import number from './types/number'
import relation from './types/relation'
import object from './types/object'
// @ts-ignore
import string from './types/string'
// @ts-ignore
import dataType from './types/data-type'

const module: TypesModule = {
    types: {
        bool,
        date,
        array,
        number,
        relation,
        object,
        string,
        "data-type": dataType,
    },
}

export default module

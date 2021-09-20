import bool from "./types/bool.js";
import json from "./types/json.js";
import list from "./types/list.js";
import map from "./types/map.js";
import number from "./types/number.js";
import relation from "./types/relation.js";
import string from "./types/string.js";
import schema from "./types/schema.js";
import tType from "./types/type.js";

export default {
    types: {
        bool,
        json,
        list,
        map,
        number,
        relation,
        schema,
        string,
        type: tType,
    },
}

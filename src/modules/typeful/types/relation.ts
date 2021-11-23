import { TypefulType } from "../typeful";

const t: TypefulType = {
    validate() {
        return true
    },
    sanitize() {
        console.warn("relation sanitize not implemented");
    },
}


export default t

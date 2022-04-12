import { defineTypefulType } from "../typeful";

export default defineTypefulType({
    validate() {
        return true
    },
    sanitize() {
        console.warn("relation sanitize not implemented");
    },
})

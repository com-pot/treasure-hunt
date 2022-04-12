import { defineAppModule } from "../../app/types/app";
import StaticDao from "../typeful/services/dao/StaticDao";
import TypefulAccessor from "../typeful/services/TypefulAccessor";
import { ConditionType, ExecutiveModule } from "./executive";

export default defineAppModule({
    entities: {
        'condition-type': {
            primaryKey: 'name',
            persistence: 'static',
        },
    },

    async startUp(container) {
        const conditionTypes: Record<string, ConditionType> = {}

        Object.entries(container.modules).forEach(([moduleName, module]) => {
            const executiveModule = module.plugins?.executive as ExecutiveModule
            if (!executiveModule) {
                return
            }
            Object.entries(executiveModule.conditionTypes || {}).forEach(([name, spec]) => {
                const fullName = `${moduleName}.${name}`
                conditionTypes[fullName] = {...spec, name: fullName}
            })
        })

        const conditionTypesDao = (container.typefulAccessor as TypefulAccessor).getDao('typeful-executive.condition-type') as StaticDao<any>
        conditionTypesDao.overrideItems(Object.values(conditionTypes))
    },
})

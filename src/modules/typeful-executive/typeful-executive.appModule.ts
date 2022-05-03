import { defineAppModule } from "../../app/types/app";
import StaticDao from "../typeful/services/dao/StaticDao";
import TypefulAccessor from "../typeful/services/TypefulAccessor";
import { ActionTypeController, ConditionTypeController, ExecutiveModule } from "./executive";

export default defineAppModule({
    entities: {
        'condition-type': {
            primaryKey: 'name',
            persistence: 'static',

            stringify: 'name',
        },
        'action-type': {
            primaryKey: 'name',
            persistence: 'static',

            stringify: 'name',
        },
    },

    async startUp(container) {
        const conditionTypes: Record<string, ConditionTypeController> = {}
        const actionTypes: Record<string, ActionTypeController> = {}

        function registerExecutiveModule(tfa: TypefulAccessor) {
            const conditionTypesDao = tfa.getDao('typeful-executive.condition-type') as StaticDao<any>
            conditionTypesDao.overrideItems(Object.values(conditionTypes))

            const actionTypesDao = tfa.getDao('typeful-executive.action-type') as StaticDao<any>
            actionTypesDao.overrideItems(Object.values(actionTypes))
        }

        Object.entries(container.modules).forEach(([moduleName, module]) => {
            const executiveModule = module.plugins?.executive as ExecutiveModule
            if (!executiveModule) {
                return
            }
            Object.entries(executiveModule.conditionTypes || {}).forEach(([name, spec]) => {
                const fullName = `${moduleName}.${name}`
                conditionTypes[fullName] = {...spec, name: fullName}
            })
            Object.entries(executiveModule.actionTypes || {}).forEach(([name, spec]) => {
                const fullName = `${moduleName}.${name}`
                actionTypes[fullName] = {...spec, name: fullName}
            })
        })

        registerExecutiveModule(container.typefulAccessor)
    },
})

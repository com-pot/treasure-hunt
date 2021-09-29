import Router from "@koa/router"

import EntityRegistry from "./services/EntityRegistry.js"
import ControllerFactory from "./services/ControllerFactory.js"
import ensureJsonRequest from "../../middleware/ensureJsonRequest.js"



/**
* 
* @param {EntityRegistry} entityRegistry 
* @param {ControllerFactory} controllerFactory 
* @returns 
*/
export function createBackstageRouter(entityRegistry, controllerFactory) {
    const router = new Router()
    router.use(ensureJsonRequest())


    const schemas = {}
    
    entityRegistry.entities.forEach((ent) => {
        if (ent.config.publish === false) {
            return
        }

        const ctrl = controllerFactory.createController(ent.entityFqn, ent.config)
        
        const collectionEndpoint = `/${ent.module}/${ent.collectionName}`
        const entityEndpoint = `/${ent.module}/${ent.name}`
        const existingEntityEndpoint = entityEndpoint + '/:id'

        
        router.get(collectionEndpoint, async (ctx) => {
            const result = await ctrl.list(ctx.actionContext)
            ctx.set('coll-total', result.total)
            ctx.set('coll-page', result.page)
            
            ctx.body = result.items
        })
        // console.debug('registered GET ' + collectionEndpoint)
        
        if (ctrl.findOne) {
            router.get(existingEntityEndpoint, (ctx) => {
                return ctrl.findOne(ctx.actionContext, ctx.params.id)
                .then((item) => ctx.body = item)
                
            })
            // console.debug('registered GET ' + existingEntityEndpoint)
        }
        if (ctrl.create) {
            router.post(entityEndpoint, async (ctx) => {
                const result = await ctrl.create(ctx.actionContext, ctx.request.body)
                
                ctx.body = result
            })
            // console.debug('registered POST ' + entityEndpoint)
        }

        if (ctrl.update) {
            router.put(existingEntityEndpoint, async(ctx) => {
                const result = await ctrl.update(ctx.actionContext, ctx.params.id, ctx.request.body)

                ctx.body = result
            })
            // console.debug('registered PUT ' + existingEntityEndpoint)
        }

        if (ctrl.delete) {
            router.delete(existingEntityEndpoint, async(ctx) => {
                const result = await ctrl.delete(ctx.actionContext, ctx.params.id)
                if (result === true) {
                    ctx.status = 204
                    ctx.body = ''
                    return
                }
                ctx.body = result
            })
            // console.debug('registered DELETE ' + existingEntityEndpoint)
        }
        
        schemas[ent.entityFqn] = ent.config.model
    })
    
    
    router.get('/schema/:name', (ctx, next) => {
        const schema = schemas[ctx.params.name]
        if (!schema) {
            throw Object.assign(new Error('not-found'), {details: {'by:name': ctx.params.name}})
        }
        ctx.body = schema
    })
    
    return router
}

import FMW from 'find-my-way'
import { Route } from './route'
import { Service } from '../service'
import VError from 'verror'

export interface Router extends FMW.Instance<FMW.HTTPVersion.V1> {
  serviceMap: Map<string, Service>
}

export class Router extends FMW.prototype.constructor {
  constructor (routes) {
    super()
    if (!(routes instanceof Array)) throw new Error('`routes` must be an Array')
    if (routes.length === 0) throw new Error('`routes` must not be empty')
    if (!routes.every(element => element instanceof Route)) {
      const routeTypes: string = routes.reduce((routes, route) => {
        if (typeof route === 'object') routes.push(route.constructor.name)
        return routes
      }, []).join(', ')
      const e0 = new Error(`expected route elements to be Route instances, but found: ${routeTypes}`)
      const invalidRoutesE = new VError(e0, 'invalid `routes` param')
      throw new VError(invalidRoutesE, 'unable to construct new Router')
    }

    this.serviceMap = new Map()
    routes.forEach(route => {
      this.serviceMap.set(route.service.name, route.service)
      // register the routes
      this.on(route.method, route.path, () => route.service)
    })
  }
}

import { Service } from '../service'

/**
 * @internal
 */
export type RouteConstructor = new (method: string, path: string, service: Service) => Route

/**
 * @alpha
 */
export class Route {
  method: string
  path: string
  service: Service

  constructor (method, path, service) {
    this.method = method
    this.path = path
    this.service = service
  }
}

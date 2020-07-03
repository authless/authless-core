/**
 * A HTTP data harvesting framework for jobs that require authentication
 *
 * @remarks
 *
 * Provides the core abstractions and functionality.
 *
 * @packageDocumentation
 */

export { Bot } from './bots/bot'
export { BotRouter } from './bots/botrouter'
export { DomainPath } from './domainPaths/domainPath'
export { DomainPathRouter } from './domainPaths/domainPathRouter'
// export { Authless } from './authless'

export {
  IResourcePayload,
  IResourceResponse,
  ResourceConstructor,
  ResourceResponse,
  ResourcePayload
} from './resource'
export {
  Response,
  IResponse,
  IResponseResponse,
  IResponseRequest,
  IResponsePage,
  IResponseMeta
} from './response'

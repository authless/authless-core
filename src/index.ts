/**
 * A HTTP data harvesting framework for jobs that require authentication
 *
 * @remarks
 *
 * Provides the core abstractions and functionality.
 *
 * @packageDocumentation
 */

export { AnonBot } from './bots/anonBot'
export { Bot } from './bots/bot'
export { BotRouter } from './bots/botRouter'
export { DomainPath } from './domainPaths/domainPath'
export { DomainPathRouter } from './domainPaths/domainPathRouter'

export {
  IResource,
  IResourceCollection,
  Resource,
  ResourceCollection,
  ResourceConstructor,
} from './resource'
export {
  Response,
  IResponse,
  IResponseResponse,
  IResponseRequest,
  IResponsePage,
} from './response'

export {
  URLParams,
  PuppeteerParams,
  ProxyConfig,
  BrowserConfig,
  BotConfig,
  Xhr,
  RequestContainer,
  FetchParams
} from './types'

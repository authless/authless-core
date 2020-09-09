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
export { AuthlessServer } from './server/server'
export { AuthlessClient } from './client/client'

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
  ICache,
  URLParams,
  PuppeteerParams,
  ProxyConfig,
  BrowserConfig,
  BotConfig,
  Xhr,
  RequestContainer,
  FetchParams
} from './types'

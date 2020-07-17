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
export { AuthlessServer } from './server/server'
export { AuthlessClient } from './client/client'

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

export {
  ICache,
  URLParams,
  PuppeteerParams,
  BrowserConfig,
  BotConfig,
  IBot,
  IDomainPath,
  IBotRouter,
  IAuthlessCore,
  IDomainPathRouter,
  Xhr,
  URLs,
  RequestContainer,
} from './types'

import { Cookie, Headers, HttpMethod, LaunchOptions, Page, ResourceType, Viewport } from 'puppeteer'
import { PuppeteerExtraPlugin } from 'puppeteer-extra'

interface IAuthlessCore {
  name: string
  domainPathRouter: IDomainPathRouter
}

interface IBotRouter {
  botMap: {[url: string ]: IBot[]}
  botIndices: {[url: string ]: number}
  getBotForUrl(url: string)
  getBotByUsername(username: string): IBot | undefined
}

interface IBot {
  username: string
  password: string
  foundLogin: (found: Boolean) => void
  foundCaptcha: (found: Boolean) => void
  getHitCount: () => number
  getLoginHitCount: () => number
  getCaptchaHitCount: () => number
}

interface IResponseMeta {
  timestamp: number
}

interface IResponsePage {
  url: string
  title: string
  viewport: Viewport
  content: string
  cookies: Cookie[]
}

interface IResponse {
  meta: IResponseMeta
  page: IResponsePage
  xhrs: Xhr[]
}

interface IDomainPathRouter {
  domainMap: {[url: string ]: IDomainPath}
  getDomainPath: (url: string) => IDomainPath | undefined
}

interface ProxyConfig {
  address: string
  port: number
  credentials: {
    username: string
    password: string
  }
}

interface InterceptOptions {
  blockDomains?: string[]
  blockResourceTypes?: string[]
}

type PuppeteerParams = LaunchOptions & InterceptOptions & {
  viewPort?: Viewport
}

interface URLParams {
  url: string
  inputs?: string
  alphabetSelector?: string
  responseFormat: string
  referer?: string
  username?: string
}

interface BrowserConfig {
  puppeteerParams?: PuppeteerParams
  puppeteerPlugins?: PuppeteerExtraPlugin[]
  useStealthPlugin?: boolean
  useAdBlockerPlugin?: boolean
  adBlockerConfig?: {
    blockTrackers: boolean
  }
  proxy?: ProxyConfig
  urlParams?: URLParams
}

interface IDomainPath {
  domain: string
  setupPage: (page: Page, puppeteerParams: PuppeteerParams) => Promise<void>
  pageHandler: (page: Page, bot?: IBot, config?: BrowserConfig) => Promise<IResponse | null>
}

type URL = string
type URLs = URL[]

interface SecurityDetails {
  issuer: string | undefined
  validTo: number | undefined
  protocol: string | undefined
  validFrom: number | undefined
  subjectName: string | undefined
}

interface RequestContainer {
  url: URL
  headers: Headers
  isNavigationRequest: boolean
  method: HttpMethod
  resourceType: ResourceType
}

interface Xhr {
  url: string
  text: string | undefined
  status: number
  statusText: string
  headers: Headers
  securityDetails: SecurityDetails | null
  fromCache: boolean
  fromServiceWorker: boolean
  request: RequestContainer | undefined
}

export {
  URLs,
  URLParams,
  PuppeteerParams,
  BrowserConfig,
  IBot,
  IBotRouter,
  IDomainPath,
  IDomainPathRouter,
  Xhr,
  RequestContainer,
  IResponse,
  IAuthlessCore,
}

import { Cookie, Headers, HttpMethod, Page, ResourceType, Viewport } from 'puppeteer'
// import { Viewport } from 'puppeteer/DeviceDescriptors'

interface IAuthlessCore {
  name: string
  domainPathRouter: IDomainPathRouter
}

interface IBotRouter {
  botMap: {[url: string ]: IBot[]}
  botIndices: {[url: string ]: number}
  getBotForUrl(url: string)
  // getBot(): IBot | undefined
  getBotByUsername(username: string): IBot | undefined
}

interface IBot {
  username: string
  password: string
  hitCount: number
  loginCount: number
  captchaCount: number
  foundLogin: (found: Boolean) => void
  foundCaptcha: (found: Boolean) => void
  getHitCount: () => number
  getLoginHitCount: () => number
  getCaptchaHitCount: () => number
}

interface IResponseMeta {
  url: string
  viewport: Viewport
  title: string
}

interface IResponse {
  meta: IResponseMeta
  page: any
  content: any
  cookies: Cookie[]
  xhrs: Xhr[]
}

interface IDomainPathRouter {
  domainMap: {[url: string ]: IDomainPath}
  getDomainPathForUrl: (url: string) => IDomainPath | undefined
}

interface IDomainPath {
  domain: string
  // urls: string[]
  // botRouter: IBotRouter
  // isAuthenticated: (page: any) => Promise<Boolean>
  // authenticate: (page: any, bot?: IBot) => Promise<Boolean | string>
  pageHandler: (page: Page, bot?: IBot, config?: any) => Promise<IResponse | null>
}

interface IServer {
  puppeteerParams: any
  proxyParams: any
  prePagePlugs?: (page: any) => void
  resourceTypes: string[]
  authless: IAuthlessCore
  fetch: (url: string, responseType: string, params: any) => IResponse
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

interface RequestElementText {
  body: string
  request: any
  status: number
}

interface RequestElement {
  text: RequestElementText
}

interface Input {
  id: string
  text: string
}

interface HttpStateVal {
  text: string
}

interface HttpState {
  [index: string]: HttpStateVal
}

interface AppState {
  HttpState: HttpState
}

interface CodeElement {
  id: string
  text: string | RequestElementText
}

interface ResponseContainerMeta {
  account: string
  time: number
}

interface ResponseContainerPage {
  title: string
  url: URL
  viewport: Viewport | null
  content: string
  cookies: Cookie[]
}

interface ResponseContainer {
  meta: ResponseContainerMeta
  content: string
  page: ResponseContainerPage
  xhrs: Xhr[]
  main: Xhr
}

interface Identifier {
  // eslint-disable-next-line camelcase
  entity_def_id: string
}
interface Property {
  identifier: Identifier
}

// type Resource = crunchbasePerson | crunchbaseFundingRound | crunchbaseOrganization
interface Resource {
  entities: any
  properties: Property
}

export {
  IBot,
  IDomainPath,
  IResponse,
  IBotRouter,
  IAuthlessCore,
  IDomainPathRouter,
  Xhr,
  URLs,
  Input,
  Resource,
  AppState,
  CodeElement,
  HttpStateVal,
  RequestElement,
  RequestContainer,
  ResponseContainer,
}

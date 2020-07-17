/* eslint-disable max-lines */
import { Cookie, Headers, HttpMethod, LaunchOptions, Page, ResourceType, Viewport } from 'puppeteer'
import { PuppeteerExtraPlugin } from 'puppeteer-extra'

/**
 * Top level abstraction with a name and holding a {@link IDomainPathRouter}
 *
 * @beta
 */
interface IAuthlessCore {

  /**
   * Name to identify this {@link IAuthlessCore}. Useful for logging.
   */
  name: string

  /**
   * see {@link IDomainPathRouter}
   */
  domainPathRouter: IDomainPathRouter
}

/**
 * Manages a pool(zero or more) IBots {@link IBot}
 * Is responsible for rotating the bots used in a round-robin fashion.
 *
 * @beta
 */
interface IBotRouter {

  /**
   * Provides a bot which can handle a particular url
   *
   * @remarks
   * Picks a bot from the pool of {@link IBot} to return one
   * that can handle the url provided and is below the bots' allowed rate-limit
   *
   * @returns a valid bot if found, else returns undefined
   *
   */
  getBotForUrl(url: string): IBot

  /**
   * Provides a bot with a particular username
   *
   * @remarks
   * Picks a bot from the pool of {@link IBot} which has the username provided
   * that can handle the url provided.
   * This is useful when we want to check if a bot is healthy
   * in term of its usageRate, loginHitCount, captchaHitCount etc
   *
   * @param username - the username string of the bot to get
   * @returns a valid bot if found, else returns undefined
   *
   */
  getBotByUsername(username: string): IBot
}

/**
 * The configuration to instantiate a Bot.
 * Is passed to a {@link IBot}
 *
 * @beta
 */
interface BotConfig {

  /**
   * The credentials for a bot.
   * May be omitted for anonymous bots(no authentication needed)
   */
  credentials?: {
    username: string
    password: string
  }

  /**
   * The HTTP URLs the bot is to handle.
   * Must be a list of string
   */
  urls: string[]

  /**
   * The limit per minute under which a bot can be used.
   *
   * @remarks
   * If the usage is above the limit, the bot-router will not return this bots
   * till an appropriate amount of time has passed
   */
  rateLimit?: number

  /**
   * The puppeteer specific configuration for the bot. {@link BrowserConfig}
   *
   * @remarks
   * This allows bots to have their own proxy/plugin configurations.
   */
  browserConfig?: BrowserConfig
}

/**
 * Represents a user account used in authless.
 * Is usually managed with a {@link IBotRouter}
 * and contains meta information about the
 * credentials, usage-data and health-status of an account
 *
 * @beta
 */
interface IBot {

  /**
   * The username or key of the account. May be undefined for anonymous bots
   */
  username?: string

  /**
   * The password or secret of the account. May be undefined for anonymous bots
   */
  password?: string

  /**
   * The URLs to be handled by this bot
   */
  urls: string[]

  /**
   * The puppeteer/page options for the bot {@link BrowserConfig}
   */
  browserConfig?: BrowserConfig

  /**
   * Tells the bot that it was used for authentication.
   *
   * @remarks
   * The bot can use this information to calculate its usage-rate w.r.t its rate-limit.
   *
   * @beta
   */
  wasUsed: () => void

  /**
   * Tells the bot that the login page was found
   *
   * @remarks
   * The bot can use this information to calculate logout rates
   * High logout rates could mean user information is not saved
   * between page hits or the website is logging us out
   *
   * @param found - if the page hit was a login page or not
   * @returns nothing
   *
   * @beta
   */
  foundLogin: (found: Boolean) => void

  /**
   * Tells the bot we ran into a captcha
   *
   * @remarks
   * The bot can use this information to calculate detection rates
   * High detection rates could mean the account is in danger of getting
   * blacklisted or we have interactions or extensions which are triggering
   * bot-detection
   *
   * @param found - if the page hit was a captcha page or not
   * @returns nothing
   *
   * @beta
   */
  foundCaptcha: (found: Boolean) => void

  /**
   * To check if bot usage-rate is below the allowed limit
   *
   * @remarks
   * If the usage-rate is above the rate-limit
   * we have to add more time between page-fetching or add more accounts
   * else the account may be blacklisted
   *
   * @returns true if current bot is under the usage rate-limit, false otherwise
   *
   * @beta
   */
  isBelowRateLimit: () => Boolean

  /**
   * Get the login hit-rate percentage of the bot
   *
   * @returns number of times the login hit-rate percentage of the bot
   *
   * @beta
   */
  getLoginHitCount: () => number

  /**
   * Get the captcha hit-rate percentage of the bot
   *
   * @returns number of times the captcha hit-rate percentage of the bot
   *
   * @beta
   */
  getCaptchaHitCount: () => number
}

/**
 * Authless meta information about the response of a page {@link IResponse}
 * Can include the timestamp when the page was fetched
 *
 * @beta
 */
interface IResponseMeta {
  timestamp: number
}

/**
 * Meta Page information of the authless response {@link IResponse}
 * Can include the timestamp when the page was fetched
 *
 * @beta
 */
interface IResponsePage {

  /**
   * The url of the page that was fetched
   */
  url: string

  /**
   * The title of the page that was fetched
   */
  title: string

  /**
   * The viewport of the page that was fetched {@link Viewport}
   */
  viewport: Viewport

  /**
   * The html content of the page as a string
   */
  content: string

  /**
   * The cookies of the page fetched as an array of {@link Cookie}
   */
  cookies: Cookie[]
}

/**
 * The JSON response object returned by Authless
 * if the responseFormat is 'json'
 *
 * @beta
 */
interface IResponse {

  /**
   * The Authless metadata of the page fetched {@link IResponseMeta}
   */
  meta: IResponseMeta

  /**
   * The Puppeteer data of the page fetched {@link IResponsePage}
   */
  page: IResponsePage

  /**
   * The captured xhr/data requests made by the page {@link Xhr}
   */
  xhrs: Xhr[]
}

/**
 * Manages a pool of {@link IDomainPath} mapped to an url each
 *
 * @beta
 */
interface IDomainPathRouter {

  /**
   * returns a {@link IDomainPath} that matches the url, else returns undefined
   *
   * @param url - the HTTP URL which is to be fetched
   * @returns a {@link IDomainPath} if found, else returns undefined
   *
   */
  getDomainPath: (url: string) => IDomainPath | undefined
}

/**
 * Options to add a proxy to Puppeteer connections
 *
 * @beta
 */
interface ProxyConfig {

  /**
   * The IP address of the proxy
   */
  address: string

  /**
   * The port number of the proxy
   */
  port: number

  /**
   * The user credentials to connect to the proxy
   */
  credentials: {

    /**
     * The username for the proxy
     */
    username: string

    /**
     * The password for the proxy
     */
    password: string
  }
}

/**
 * Options to block requests or resourceTypes
 *
 * @remarks
 * Options to block requests from certain websites/IP-addresses
 * as well as avoid saving some resourceTypes to {@link IResponse}.{@link Xhr}
 * Blocking domains may help load times of pages
 * and blocking requests may reduce the size of the Authless response {@link IResponse}
 *
 * @beta
 */
interface InterceptOptions {

  /**
   * Domains/IP-addresses to block from loading
   *
   * @example
   * ```ts
   * blockDomains: ['social-media-buttons.com', 'large-image-host.com']
   * ```
   */
  blockDomains?: string[]

  /**
   * resourceTypes {@link ResourceType} to not save to Authless response {@link IResponse}
   *
   * @example
   * ```ts
   * blockResourceTypes: ['image', 'media', 'font']
   * ```
   */
  blockResourceTypes?: ResourceType[]
}

/**
 * Config options control puppeteer launch/request-handling options
 *
 * @remarks
 * Puppeteer launch options includes all options that of type {@link LaunchOptions}
 * Options to block domains/resourceTypes from loading {@link InterceptOptions}
 * Options to control theh viewport {@link Viewport}
 *
 * @example
 * ```ts
 * {
 *    executablePath: '/Path/To/Your/Chromium', // optional
 *    headless: false, // default true,
 *    // other options that can be passed to puppeteer(options)
 *
 *    blockDomains: ['social-media-buttons.com', 'large-image-host.com'],
 *    blockResourceTypes: ['image', 'media', 'font'],
 *    viewPort: { width: 1020, height: 800 }
 * }
 * ```
 *
 * @beta
 */
type PuppeteerParams = LaunchOptions & InterceptOptions & {

  /**
   * Optional. Control puppeteer viewport window size
   *
   * @example
   * ```ts
   * { width: 1020, height: 800 }
   * ```
   */
  viewPort?: Viewport
}

/**
 * URL parameters accepted by Authless server
 *
 * @remarks
 * URL parameters allow you to run an Authless server and send HTTP requests
 * to it with the url you want it to fetch.
 * Authless server will return an Authless response {@link IResponse} of your choice
 *
 * @example
 * ```ts
 * {
 *    url: 'www.example.net/url/to/fetch',
 *    responseFormat: 'json', // will return an object in JSON format
 * }
 * ```
 *
 * @beta
 */
interface URLParams {

  /**
   * The HTTP url to fetch
   *
   * @example
   * ```ts
   * 'www.example.net/url/to/fetch'
   * ```
   */
  url: string

  /**
   * An array values for HTML input elements.
   *
   * @remarks
   * Each input-html-selector:value-to-enter are separated by a colon(:)
   * Multiple inputs are separated by a semi-colon(;)
   *
   * @example
   * ```ts
   * // To enter 'my value1' into HTML element with selector '#input1'
   * // and '9999' into HTML element with selector '#input2'
   * // use
   * { inputs: '#input1:my value1;#input2:9999' }
   * ```
   *
   * * @alpha
   */
  inputs?: string

  /**
   * The HTML input selector to which puppeteer should enter alphabets from your {@link IDomainPath}.pageHandler function.
   *
   * @remarks
   * Since input selectors may change with each load(randomization of HTML selector string),
   * the selector may be passed here as strings and page handler can be customized to
   * enter values if it receives any selector via the alphabetSelector option
   *
   * @example
   * ```ts
   * { alphabetSelector: '.my-input-selector' }
   * ```
   *
   * @alpha
   */
  alphabetSelector?: string

  /**
   * The required response format of Authless response
   *
   * @remarks
   * Currently, only 'json' is supported
   *
   * @beta
   */
  responseFormat: 'json' | 'png'

  /**
   * The referer URL that will be added to the puppeteer request
   *
   * @remarks
   * Adding a proper referer makes your request much less likely to get flagged
   * as a bot. Try to add a reasonable referer URL
   *
   * @beta
   */
  referer?: string

  /**
   * The username whose credentials will be used for the fetch
   *
   * @remarks
   * Adding a proper referer makes your request much less likely to get flagged
   * as a bot. Try to add a reasonable referer URL
   *
   * @deprecated Can be avoided as the required bot can be got using botRouter.getBotByUsername(username)
   * and passed to the pageHandler
   */
  username?: string
}

/**
 * Config to control puppeteer launch, default plugins, proxy and page handling config
 *
 * @beta
 */
interface BrowserConfig {

  /**
   * Options to control puppeteer launch {@link PuppeteerParams}
   */
  puppeteerParams?: PuppeteerParams

  /**
   * Use the puppeteer-extra-stealth-plugin
   *
   * @remarks
   * Uses a pre-setup puppeteer-extra-stealth-plugin that gets used with the launched puppeteer instance
   */
  useStealthPlugin?: boolean

  /**
   * Use the puppeteer-extra-adblocker-plugin
   *
   * @remarks
   * Uses a pre-setup puppeteer-extra-adblocker-plugin with \{blockTrackers: all\} option by default
   */
  useAdBlockerPlugin?: boolean

  /**
   * Options for the puppeteer-extra-adblocker-plugin
   *
   * @remarks
   * Uses a pre-setup puppeteer-extra-adblocker-plugin with \{blockTrackers: all\} option by default
   * If you would like to override it, you can do so here
   *
   * @beta
   */
  adBlockerConfig?: {
    blockTrackers: boolean
  }

  /**
   * Additional plugins to puppeteer. Must be a valid initialized puppeteer plugin {@link PuppeteerParams}
   *
   * @example
   * puppeteerPlugins: [MyPuppeteerPlugin(), OtherPuppeteerPlugin()]
   */
  puppeteerPlugins?: PuppeteerExtraPlugin[]

  /**
   * Proxy configuration for puppeteer {@link ProxyConfig}
   *
   * @remarks
   * If not provided, the puppeteer will run without a proxy
   */
  proxy?: ProxyConfig

  /**
   * The URL parameters to pass to the running Authless server {@link URLParams}
   *
   * @example
   * ```ts
   * { url: 'http://url.com/to/fetch', 'responseFormat': 'json' }
   * ```
   */
  urlParams?: URLParams
}

/**
 * The interface that controls the behaviour and page-handling for a particular domain/subdomain/url
 *
 * @remarks
 * This is responsible for handling the page that is fetched.
 * If different behaviours are required for different URLs
 * (say some pages have pagination, while others require you to expand links)
 * then, you should have multiple DomainPaths and attach them to the requried URL
 * via a DomainPathHandler {@link DomainPathRouter}
 *
 * @example
 * ```ts
 * // create 2 DomainPaths
 * class PaginationDomainPath implements IDomainPath {
 *   pageHandler(page...) {
 *     // handle pagination and other page specific actions here
 *   }
 * }
 * class ExpandableDomainPath implements IDomainPath {
 *   pageHandler(page...) {
 *     // handle expanding links or page specific inputs here
 *   }
 * }
 *
 * const domainPathRouter = new DomainPathRouter({
 *   'www.example.com/pagination/': new PaginationDomainPath('pagination'),
 *   'www.example.com/links/': new ExpandableDomainPath('expanding-links')
 * })
 *
 * Now, get the right domainPath by url and use it. Refer to docs
 * ```
 *
 * @beta
 */
interface IDomainPath {

  /**
   * Name of the domain. Useful for differentiating DomainPaths while logging
   */
  domain: string

  /**
   * Form a {@link IResponse} object from the puppeteer page
   *
   * @remarks
   * Override this to add custom data/metadata to your Authless response {@link IResponse}
   *
   * @param page - the puppeteer page from which to extract the response object
   * @returns a {@link IResponse} if found, else returns undefined
   */
  getJsonResponse: (page: Page) => Promise<IResponse>

  /**
   * Over-ride default page setup
   *
   * @remarks
   * Override this to add custom page listeners on response etc.
   * This happens before we navigate to the target URL.
   * Call super.setupPage if you would like to use default response/resourceType blocking
   *
   * @param page - The puppeteer page to which we can attach listeners or change behaviour of
   * @param puppeteerParams - The {@link PuppeteerParams} object passed by the user
   */
  setupPage: (page: Page, puppeteerParams: PuppeteerParams) => Promise<void>

  /**
   * Code to handle page interactions
   *
   * @remarks
   * This is responsible for checking/doing authentication
   * and interacting with the page.
   * You can have different DomainPaths with different behaviour
   * and call the appropriate one based on the URL you wish to fetch
   * The puppeteer instance will be reused and only new pages are instantiated here
   *
   *
   * @param page - The puppeteer page to which we can attach listeners or change behaviour of
   * @param bot - Optional. The {@link IBot} to use for authentication.
   * @param config - Optional. The {@link BrowserConfig} passed by the user
   */
  pageHandler: (page: Page, bot?: IBot, config?: BrowserConfig) => Promise<IResponse | null>
}

type URL = string
type URLs = URL[]

/**
 * Security details of the ajax/asset requests made by the puppeteer page
 */
interface SecurityDetails {

  /** A string with the name of issuer of the certificate. (e.g. "Let's Encrypt Authority X3"). */
  issuer: string | undefined

  /** String with the security protocol (e.g. TLS 1.2). */
  protocol: string | undefined

  /** Timestamp stating the end of validity of the certificate. */
  validTo: number | undefined

  /** Timestamp stating the start of validity of the certificate. */
  validFrom: number | undefined

  /** Name of the subject to which the certificate was issued to (e.g. "www.example.com"). */
  subjectName: string | undefined
}

/**
 * HTTP request metadata of the ajax/asset requests made by the puppeteer page
 */
interface RequestContainer {

  /** Contains the URL of the request. */
  url: URL

  /**
   * An object with HTTP headers associated with the request.
   * All header names are lower-case.
   */
  headers: Headers

  /** Whether this request is driving frame's navigation. */
  isNavigationRequest: boolean

  /** Returns the request's method (GET, POST, etc.) */
  method: HttpMethod

  /**
   * Contains the request's resource type as it was perceived by the rendering engine.
   * (doc, xhr, image, media, eventsource etc)
   */
  resourceType: ResourceType
}

/**
 * Details of the ajax/asset requests made by the puppeteer page
 *
 * @beta
 */
interface Xhr {

  /** Contains the URL of the request. */
  url: string

  /** The contents of the response as a string. */
  text: string | undefined

  /**
   * The HTTP response code of the request.
   * ex: 200(ok), 404(not-found), 401(unauthorized), 502(internal-server-error)
   */
  status: number

  /**
   * The text for the HTTP status of the response.
   * ex: "OK", "Not Found", "Unauthorized", "Internal Server Error"
   */
  statusText: string

  /**
   * An object with HTTP headers associated with the request.
   * All header names are lower-case.
   */
  headers: Headers

  /**
   * Security or certificate related data. Refer to {@link SecurityDetails}.
   * May be undefined in case of plain HTTP requests
   */
  securityDetails: SecurityDetails | null

  /** True if the response was served from either the browser's disk cache or memory cache. */
  fromCache: boolean

  /** True if the response was served by a service worker. */
  fromServiceWorker: boolean

  /** Metadata about the request. Refer to {@link RequestContainer}. */
  request: RequestContainer | undefined
}

export {
  URLs,
  URLParams,
  PuppeteerParams,
  BrowserConfig,
  BotConfig,
  IBot,
  IBotRouter,
  IDomainPath,
  IDomainPathRouter,
  Xhr,
  RequestContainer,
  IResponse,
  IAuthlessCore,
}

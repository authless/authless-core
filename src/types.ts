/* eslint-disable max-lines */
import { Cookie, Headers, HttpMethod, LaunchOptions, ResourceType, Viewport } from 'puppeteer'
import { PuppeteerExtraPlugin } from 'puppeteer-extra'

/**
 * A Cache interface which can be passed to AuthlessClient class
 *
 * @alpha
 */
export interface ICache {

  /**
   * Add a value to cache
   *
   * @param   key - The string key of the cache. Will usually be the URL fetched
   * @param   data - The data to be saved
   *
   * @returns 'ok' if successful, else returns an Error object
   */
  put: (key: string, data: IResponse) => Promise<'ok' | Error>

  /**
   * Get a value from the cache
   *
   * @param key - The string key of the cache. Will usually be the URL fetched
   *
   * @returns
   * The data that was fetched if successful, else returns an Error object
   */
  get: (key: string) => Promise<IResponse | Error>

  /**
   * Delete a value from the cache
   *
   * @param key - The string key of the cache. Will usually be the URL fetched
   *
   * @returns
   * The data that was deleted if successful, else returns an Error object
   */
  delete: (key: string) => Promise<IResponse | Error>

  /**
   * Delete all values from the cache
   *
   * @param before - Optional. Number representing the Unix timestamp in milliseconds. All data saved before this will be deleted
   *
   * @returns
   * The number of keys that were removed
   */
  deleteAll: (before?: number) => Promise<number | Error>
}

/**
 * @alpha
 */
export type FetchParams = URLParams & {
  serverUrl: string
}

/**
 * The configuration to instantiate a Bot.
 * Is passed to a {@link Bot}
 *
 * @beta
 */
export interface BotConfig {

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
   * The limit per hour under which a bot can be used.
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
 * Authless meta information about the response of a page {@link IResponse}
 * Can include the timestamp when the page was fetched
 *
 * @beta
 */
export interface IResponseMeta {
  timestamp: number
  username: string
  fromCache?: boolean
  hitLogin?: boolean
  hitCaptcha?: boolean
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
export interface IResponse {

  /**
   * The Authless metadata of the page fetched {@link IResponseMeta}
   */
  meta: IResponseMeta

  /**
   * The Puppeteer data of the page fetched {@link IResponsePage}
   */
  page: IResponsePage

  /**
   * The main page response as a json object {@link Xhr}
   */
  main: Xhr

  /**
   * The captured xhr/data requests made by the page {@link Xhr}
   */
  xhrs: Xhr[]
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
 *
 * Puppeteer launch options includes all options that of type {@link puppeteer#LaunchOptions}
 * Options to block domains/resourceTypes from loading {@link puppeteer#InterceptOptions}
 * Options to control theh viewport {@link puppeteer#Viewport}
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
export type PuppeteerParams = LaunchOptions & InterceptOptions & {

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
export interface URLParams {

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
   * @alpha
   */
  inputs?: string

  /**
   * The HTML input selector to which puppeteer should enter alphabets from your {@link DomainPath}.pageHandler function.
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
export interface BrowserConfig {

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
   * Proxy configuration for puppeteer {@link puppeteer#ProxyConfig}
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
 *
 * @alpha
 */
export interface RequestContainer {

  /** Contains the URL of the request. */
  url: string

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
export interface Xhr {

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
   * Security or certificate related data. Refer to {@link puppeteer#SecurityDetails}.
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

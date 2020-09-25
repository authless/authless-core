import * as path from 'path'
import { BotConfig, BrowserConfig } from '../types'
import { PuppeteerExtraPlugin, addExtra } from 'puppeteer-extra'
import puppeteer, { Browser } from 'puppeteer'
import ProxyPlugin from 'puppeteer-extra-plugin-proxy'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { v4 as uuidv4 } from 'uuid'

// 1 minute = 60_000 milliseconds
// 1 hour = 60 * 60_000 milliseconds = 3_600_000
const ONE_HOUR = 3_600_000

/**
 * Represents a user account used in authless.
 *
 * @remarks
 *
 * Extend this class to create custom Bots
 * Is usually managed with a {@link BotRouter}
 * and contains meta information about the
 * credentials, usage-data and health-status of an account
 *
 * @beta
 */
export class Bot {

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
   * The number of times bot has been used
   */
  private hitCount = 0

  /**
   * The number of times bot has run into login page
   */
  private loginCount = 0

  /**
   * The number of times bot has run into captcha
   */
  private captchaCount = 0

  /**
   * The upper limit for the number of times this bot can be used
   * rateLimit of 0 means no rate limiting
   */
  private readonly rateLimit: number = 0

  /**
   * The array containing the timestamps that this bot was used at in the last one hour.
   * Allows us to check if the rate-limit has been exceeded.
   */
  private usageTimeStamps: number[]

  /**
   * Create a Bot instance.
   *
   * @param config - Of type {@link BotConfig}. browserConfig takes type {@link BrowserConfig}
   * @returns An instance of the Bot class
   *
   * @example
   * ```ts
   * const bot = new Bot({
   *  credentials: { // optional
   *    username: 'username',
   *    password: 'password'
   *  },
   *  urls: ['www.example.com'],
   *  rateLimit: 100, // optional, per hour
   *  browserConfig: {
   *    executablePath: '/path/to/your/Chromium',
   *    headless: false,
   *    useStealthPlugin: true,
   *    useAdblockerPlugin: true,
   *    blockDomains: [
   *      'some-tracker.io',
   *      'image-host.net',
   *    ],
   *    blockResourceTypes: ['image', 'media', 'stylesheet', 'font'],
   *    proxy: {
   *      address: '99.99.99.99',
   *      port: 9999,
   *      credentials: {
   *        username: 'proxyuser1',
   *        password: 'proxypass1',
   *      },
   *    }
   *  }
   * })
   * ```
   *
   * @beta
   */
  constructor (botConfig: BotConfig) {
    if(typeof botConfig.credentials !== 'undefined' && botConfig.urls.length === 0) {
      throw new Error('Bots with credentials must have atleast one URL, as the Bot will never be selected otherwise')
    }
    this.username = botConfig.credentials?.username
    this.password = botConfig.credentials?.password
    this.urls = botConfig.urls
    if(typeof botConfig.rateLimit === 'number') {
      this.rateLimit = botConfig.rateLimit ?? 0
    }
    this.browserConfig = botConfig.browserConfig
    this.usageTimeStamps = []
  }

  public async launchBrowser (defaultBrowserConfig: BrowserConfig = {}): Promise<Browser> {
    const browserConfig = { ...defaultBrowserConfig, ...this.browserConfig }

    // INIT BROWSER PLUGINS
    let defaultPlugins: PuppeteerExtraPlugin[] = []
    if (browserConfig.useStealthPlugin === true) {
      defaultPlugins.push(StealthPlugin())
    }
    // -- Has conflicts with stealth-plugin, re-enable when fixed
    // -- refer: https://github.com/berstend/puppeteer-extra/issues/90
    // if(browserConfig.useAdBlockerPlugin === true) {
    //   defaultPlugins.push(AdblockerPlugin(config?.adBlockerConfig ?? {}))
    // }
    if (browserConfig.proxy instanceof Object) {
      defaultPlugins.push(ProxyPlugin(browserConfig.proxy))
    }
    const plugins = [...defaultPlugins, ...(browserConfig.puppeteerPlugins ?? [])]
    const customPuppeteer = addExtra(puppeteer)
    plugins.forEach((plugin: PuppeteerExtraPlugin) => customPuppeteer.use(plugin))

    // DETERMINE BROWSER DATA DIRECTORY
    let chromeUserDataDir = process.env.CHROME_USER_DATA_DIR ??
      browserConfig.puppeteerParams?.userDataDir ??
      'chrome-default-user-data-dir'
    const userDataDirName = this.username ?? uuidv4()
    const userDataDir = path.join(chromeUserDataDir, userDataDirName)

    // LAUNCH BROWSER
    console.log(`LAUNCH BROWSER: ${userDataDir}`)
    const launchOptions = {
      ...browserConfig.puppeteerParams,
      ...browserConfig,
      ...{ userDataDir }
    }
    console.log(`LAUNCH OPTIONS: ${JSON.stringify(launchOptions, null, 2)}`)
    return await customPuppeteer.launch(launchOptions)
  }

  /**
   * Tells the bot that it was used for authentication. Updates {@link Bot.usageTimeStamps}
   *
   * @remarks
   * The bot can use this information to calculate its usage-rate w.r.t its rate-limit.
   *
   * @beta
   */
  public wasUsed (): void {
    const now = Date.now()
    this.usageTimeStamps.push(now)
    this.usageTimeStamps = this.usageTimeStamps.filter(ts => (now - ts) <= ONE_HOUR)
  }

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
  public foundLogin (found: Boolean): void {
    this.hitCount += 1
    if(found === true) {
      this.loginCount += 1
    }
  }

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
  public foundCaptcha (found: Boolean): void {
    this.hitCount += 1
    if(found === true) {
      this.captchaCount += 1
    }
  }

  /**
   * Returns the number of times this was used in the last hour
   *
   * @returns The number of times this bot was used in the last hour
   */
  public getUsage (): number {
    const now = Date.now()
    return this.usageTimeStamps.filter(ts => (now - ts) <= ONE_HOUR).length
  }

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
  public isBelowRateLimit (): Boolean {
    if(this.rateLimit === 0) {
      return true
    }
    return this.getUsage() < this.rateLimit
  }

  /**
   * Get the login hit-rate percentage of the bot
   *
   * @returns number of times the login hit-rate percentage of the bot
   *
   * @beta
   */
  public getLoginHitCount (): number {
    return 100 * this.loginCount / this.hitCount
  }

  /**
   * Get the captcha hit-rate percentage of the bot
   *
   * @returns number of times the captcha hit-rate percentage of the bot
   *
   * @beta
   */
  public getCaptchaHitCount (): number {
    return 100 * this.captchaCount / this.hitCount
  }
}

import { BotConfig, BrowserConfig } from '../types'

// 1 minutes = 60_000 milliseconds
const ONE_MINUTE = 60_000

/**
 * Represents a user account used in authless.
 *
 * @remarks Extend this class to create custom Bots
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
   * The array containing the timestamps that this bot was used at in the last one minute.
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
   *  rateLimit: 100, // optional, per minute
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
    this.usageTimeStamps = this.usageTimeStamps.filter(ts => (now - ts) <= ONE_MINUTE)
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
    this.wasUsed()
    if(this.usageTimeStamps.length < this.rateLimit) {
      return true
    }
    return false
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

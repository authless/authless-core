import { BotConfig, BrowserConfig, IBot } from '../types'

// 1 minutes = 60_000 milliseconds
const ONE_MINUTE = 60_000

/**
 * Implementation of the IBot interface
 *
 * @remarks Extend this class to create custom Bots
 *
 * @beta
 */
export class Bot implements IBot {
  username?: string
  password?: string
  urls: string[]
  browserConfig?: BrowserConfig
  hitCount = 0
  loginCount = 0
  captchaCount = 0
  // rateLimit of 0 means no rate limiting
  rateLimit = 0
  usageTimeStamps: number[]

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
  // eslint-disable-next-line max-params
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

  public wasUsed (): void {
    const now = Date.now()
    this.usageTimeStamps.push(now)
    this.usageTimeStamps = this.usageTimeStamps.filter(ts => (now - ts) <= ONE_MINUTE)
  }

  public foundLogin (found: Boolean): void {
    this.hitCount += 1
    if(found === true) {
      this.loginCount += 1
    }
  }

  public foundCaptcha (found: Boolean): void {
    this.hitCount += 1
    if(found === true) {
      this.captchaCount += 1
    }
  }

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

  public getLoginHitCount (): number {
    return 100 * this.loginCount / this.hitCount
  }

  public getCaptchaHitCount (): number {
    return 100 * this.captchaCount / this.hitCount
  }
}

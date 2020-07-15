import { IBot } from '../types'

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
  username: string
  password: string
  private hitCount = 0
  private loginCount = 0
  private captchaCount = 0
  // rateLimit of 0 means no rate limiting
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private rateLimit = 0
  private usageTimeStamps: number[]

  /**
   * Create a Bot instance.
   *
   * @param username - The username or key for the account
   * @param password - The password or secret for the account
   * @param rateLimit - The rate-limit(per minute) under which this bot must be used
   * @returns An instance of the Bot class
   *
   * * @example
   * ```ts
   * const bot = new Bot('username', 'password', 100)
   * ```
   *
   * @beta
   */
  constructor (username: string, password: string, rateLimit?: number) {
    this.username = username
    this.password = password
    this.usageTimeStamps = []
    if(typeof rateLimit === 'number') {
      // eslint-disable-next-line no-warning-comments
      // TODO, calculate number of times account was used per minute
      this.rateLimit = rateLimit ?? 0
    }
  }

  private setUsageTimeStamps (): void {
    const now = Date.now()
    this.usageTimeStamps.push(now)
    this.usageTimeStamps = this.usageTimeStamps.filter(ts => (now - ts) <= ONE_MINUTE)
  }

  public wasUsed (): void {
    this.setUsageTimeStamps()
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
    // update this.usageTimeStamps
    this.setUsageTimeStamps()
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

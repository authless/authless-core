/* eslint-disable no-warning-comments */
import { IBot } from '../types'

// 1 minutes = 60_000 milliseconds
const ONE_MINUTE = 60_000

export class Bot implements IBot {
  username: string
  password: string
  private hitCount = 0
  private loginCount = 0
  private captchaCount = 0
  // rateLimit of 0 means no rate limiting
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private rateLimit = 0
  usageTimeStamps: number[]

  constructor (username: string, password: string, rateLimit?: number) {
    this.username = username
    this.password = password
    this.usageTimeStamps = []
    if(typeof rateLimit === 'number') {
      // TODO, calculate number of times account was used per minute
      this.rateLimit = rateLimit ?? 0
    }
  }

  setUsageTimeStamps (): void {
    const now = Date.now()
    this.usageTimeStamps.push(now)
    this.usageTimeStamps = this.usageTimeStamps.filter(ts => (now - ts) <= ONE_MINUTE)
  }

  wasUsed (): void {
    this.setUsageTimeStamps()
  }

  foundLogin (found: Boolean): void {
    console.log(`before: loginCount: ${this.loginCount} : hitcount = ${this.hitCount}`)
    this.hitCount += 1
    if(found === true) {
      this.loginCount += 1
    }
    console.log(`after: loginCount: ${this.loginCount} : hitcount = ${this.hitCount}`)
  }

  foundCaptcha (found: Boolean): void {
    this.hitCount += 1
    if(found === true) {
      this.captchaCount += 1
    }
  }

  isBelowRateLimit (): Boolean {
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

  getHitCount (): number {
    return this.hitCount
  }

  // TODO, save with timeStamps?
  getLoginHitCount (): number {
    console.log(`starting: loginCount: ${this.loginCount} : hitcount = ${this.hitCount}`)
    console.log(`-- getLoginHitCount(): return 100 * ${this.loginCount} / ${this.hitCount} = ${100 * this.loginCount / this.hitCount}`)
    return 100 * this.loginCount / this.hitCount
  }

  // TODO, save with timeStamps?
  getCaptchaHitCount (): number {
    console.log(`-- getCaptchaHitCount(): return 100 * ${this.captchaCount} / ${this.hitCount} = ${100 * this.captchaCount / this.hitCount}`)
    return 100 * this.captchaCount / this.hitCount
  }
}
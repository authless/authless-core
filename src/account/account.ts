import { Service } from '../service'
import cloneDeep from 'lodash.clonedeep'
import debugLib from 'debug'
import path from 'path'
import pluginAWS from 'puppeteer-extra-plugin-aws'
import pluginProxy from 'puppeteer-extra-plugin-proxy'
import pluginStealth from 'puppeteer-extra-plugin-stealth'
import puppeteerExtra from 'puppeteer-extra'
import { v4 as uuid } from 'uuid'

const debug = debugLib('authless:account')

export interface AccountConfig {
  username: string
  password: string
  proxy?: {
    username: string
  }
}

export class Account {
  debug: any
  config: AccountConfig
  service!: Service
  rateLimiter: any

  constructor (config: AccountConfig) {
    this.config = config
    this.debug = debug.extend(this.config.username)
  }

  async authenticate (page): Promise<boolean> {
    return await this.service.authenticate(page, this)
  }

  async isAuthenticated (page): Promise<boolean> {
    const isAuthenticated = await this.service.isAuthenticated(page)
    /* eslint-disable-next-line @typescript-eslint/no-base-to-string */
    this.debug(`isAuthenticated? ${isAuthenticated.toString().toUpperCase()}`)
    return isAuthenticated
  }

  async launchBrowser (virginProfile = false): Promise<any> {
    // puppeteer-extra is a global object, clone it to avoid state fuckups
    const puppeteer = cloneDeep(puppeteerExtra)
    // register stealth
    puppeteer.use(pluginStealth())
    // register proxy optionally
    if (typeof this.config.proxy === 'object') {
      puppeteer.use(pluginProxy(this.config.proxy))
    }
    // register proxy AWS
    puppeteer.use(pluginAWS())

    let profileDirName = `${this.service.name}-${this.config.username}`
    if (virginProfile) profileDirName += `-${uuid() as string}`

    if (typeof process.env.CHROME_USER_DATA_DIR !== 'undefined') {
      const userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, profileDirName))
      this.debug(`launching browser with userDataDir: ${userDataDir}`)
      const browser = await puppeteer.launch({userDataDir})
      this.debug(`launched browser: ${await browser.version() as string}`)
      return browser
    }

    this.debug('launching browser with userDataDir: [DEFAULT]')
    const browser = await puppeteer.launch({})
    this.debug(`launched browser: ${await browser.version() as string}`)
    return browser
  }

  getRateLimitId (): string {
    return `${this.service.name}:${this.config.username}`
  }

  async getRateLimitStatus (): Promise<any> {
    let stats = {'remaining': 1000 * 1000, 'reset': null, 'total': 1000 * 1000}
    if (typeof this.rateLimiter !== 'undefined') {
      stats = await this.rateLimiter.get({id: this.getRateLimitId(), decrease: false})
    }
    return stats
  }

  async isThrottled (): Promise<boolean> {
    if (typeof this.rateLimiter === 'undefined') return false
    const stats = await this.getRateLimitStatus()
    /* eslint-disable-next-line no-ternary */
    const remaining = (typeof stats.remaining === 'number')
      ? stats.remaining
      : 0
    return remaining === 0
  }

  async decreaseRateLimitBy1 (): Promise<any> {
    if (typeof this.rateLimiter !== 'undefined') {
      await this.rateLimiter.get({id: this.getRateLimitId()})
    }
  }
}

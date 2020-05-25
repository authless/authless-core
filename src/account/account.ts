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
  proxy: {
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
    this.debug('isAuthenticated? %s', isAuthenticated.toString().toUpperCase())
    return isAuthenticated
  }

  async launchBrowser (virginProfile = false): Promise<any> {
    // puppeteer-extra is a global object, clone it to avoid state fuckups
    const puppeteer = cloneDeep(puppeteerExtra)
    // register stealth
    puppeteer.use(pluginStealth())
    // register proxy optionally
    if (this.config.proxy) {
      puppeteer.use(pluginProxy(this.config.proxy))
    }
    // register proxy AWS
    puppeteer.use(pluginAWS())

    let profileDirName = `${this.service.name}-${this.config.username}`
    let userDataDir
    if (virginProfile) profileDirName += `-${uuid() as string}`
    if (process.env.CHROME_USER_DATA_DIR) {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, profileDirName))
    }

    this.debug(`launching browser with userDataDir: ${userDataDir as string}`)
    const browser = await puppeteer.launch({userDataDir})
    this.debug(`launched browser: ${await browser.version() as string}`)
    return browser
  }

  getRateLimitId () {
    return `${this.service.name}:${this.config.username}`
  }

  async getRateLimitStatus () {
    let stats = {'remaining': 1000 * 1000, 'reset': null, 'total': 1000 * 1000}
    if (this.rateLimiter) {
      stats = await this.rateLimiter.get({id: this.getRateLimitId(), decrease: false})
    }
    return stats
  }

  async isThrottled () {
    if (!this.rateLimiter) return false
    const stats = await this.getRateLimitStatus()
    const remaining = (typeof stats.remaining === 'number')
      ? stats.remaining
      : 0
    return remaining === 0
  }

  async decreaseRateLimitBy1 () {
    if (this.rateLimiter) {
      await this.rateLimiter.get({id: this.getRateLimitId()})
    }
  }
}

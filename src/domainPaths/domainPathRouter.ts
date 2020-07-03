import * as path from 'path'
import { IBot, IDomainPath, IDomainPathRouter } from '../types'
import { Browser } from 'puppeteer'
import puppeteer from 'puppeteer-extra'

export class DomainPathRouter implements IDomainPathRouter {
  domainMap: {[url: string ]: IDomainPath}

  constructor (domainMap: {[url: string ]: IDomainPath}) {
    this.domainMap = {}
  }

  // eslint-disable-next-line class-methods-use-this
  getProfileDirName (serviceName: string, username: string): string {
    return `${serviceName}-${username}`
  }

  launchBrowser = async (domainPath: IDomainPath, bot?: IBot, config?: any): Promise<Browser> => {
    const { puppeteerParams, puppeteerPlugins } = config

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    puppeteerPlugins.forEach(plugin => {
      puppeteer.use(plugin)
    })

    let username = 'anon'
    if(typeof bot !== 'undefined') {
      username = bot.username
    }
    // calculate data-dir to store Chrome user data
    // eslint-disable-next-line no-invalid-this
    const dataDirName = this.getProfileDirName(domainPath.domain, username)
    // eslint-disable-next-line init-declarations
    let userDataDir: string | undefined
    if(typeof puppeteerParams.userDataDir !== 'undefined') {
      userDataDir = puppeteerParams.userDataDir
    }
    if (typeof process.env.CHROME_USER_DATA_DIR !== 'undefined') {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, dataDirName))
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    // this.logger.log(`launching browser with userDataDir: ${userDataDir || 'not-found'}`)
    const browser = await puppeteer.launch({
      ...puppeteerParams,
      userDataDir
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    // this.logger.log(`launched browser: ${await browser.version()}`)
    return browser
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - try to get service whose URL matches and is the longest(most specific)?
  getDomainPathForUrl (url: string): IDomainPath | undefined {
    console.log(`url = ${url}`)
    const matchedUrlKeys = Object.keys(this.domainMap)
      .sort((a, b) => a.length - b.length)
      .filter(domainUrl => url.includes(domainUrl))

    console.log(`matchedUrlKeys = ${JSON.stringify(matchedUrlKeys)}`)
    if(matchedUrlKeys.length > 0) {
      return this.domainMap[matchedUrlKeys[0]]
    }
  }
}

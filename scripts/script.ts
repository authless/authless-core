/* eslint-disable max-params */
// import { Authless } from '../src/index'
// import { BotRouter } from '../src/bots/botrouter'
import { IResponse as IAuthlessResponse, IBotRouter, IBot } from '../src/types'
// import { AuthlessServer } from '../src/server/server'
import { Bot } from '../src'
import { BotRouter } from '../src/bots/botrouter'
import { Browser } from 'puppeteer'
import { DomainPath } from '../src/domainPaths/domainPath'
import { DomainPathRouter } from '../src/domainPaths/domainPathRouter'
// import { Bot } from '../src/bots/bot'

// use this service and pass it to authless server
class SampleDomainPath extends DomainPath {

  // domain = 'https://www.crunchbase.com'
  domain = 'google.com'
  // urls = ['http://www.crunchbase.com']
  // urls = ['google.com']
  // botRouter: IBotRouter

  constructor (domain: string) {
    super(domain)
    this.domain = domain
  }

  // eslint-disable-next-line class-methods-use-this
  async isAuthenticated (page: any): Promise<boolean> {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  async authenticate (page: any): Promise<any> {
    // do authentication here
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  async pageHandler (browser: Browser, selectedDomainPath, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {

    const { puppeteerParams, urlParams } = config

    // const browser = await this.launchBrowser(selectedDomainPath, selectedBot, {puppeteerParams, puppeteerPlugins})
    const page = await browser.newPage()
    await this.setupPage(page, puppeteerParams)

    const url = 'google.com'
    console.log(`going to url ${url as string}`)
    const response = await page.goto(
      `https://www.${url}`,
      {referer: 'google.com'}
    )

    const pageUrl = await page.url()
    console.log(`-- pageUrl: ${pageUrl}`)

    // const isAuthenticated = await selectedDomainPath.isAuthenticated(page)
    // if(isAuthenticated === false) {
    //   await selectedDomainPath.authenticate(page, selectedBot)
    // }
    // do scraping here
    console.log('hello from pageHandler')
    return await this.getJsonResponse(page)
    // return null
  }
}

const botRouter = new BotRouter({
  'google': [new Bot('usernmae', 'password')],
  'crunchbase': [new Bot('usernmae', 'password')],
  'crunchbase-free': [new Bot('usernmae', 'password')],
})

// const cbBotRouter = new BotRouter([new Bot('cbusername', 'cbpassword')])
// const cbDomainPath = new SampleDomainPath('crunchbase.com', cbBotRouter, ['crunchbase.com'])
const domainPathRouter = new DomainPathRouter({
  'google.com': new SampleDomainPath('google-home'),
  'crunchbase.com': new SampleDomainPath('crunchbase-home'),
  'crunchbase.com/person/..': new SampleDomainPath('crunchbase-person'),
  'linkedin.com': new SampleDomainPath('linkedin-home'),
})

console.log(domainPathRouter)

const puppeteerParams = {
  executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
  headless: false,
}
const puppeteerPlugins = []
// const server = new AuthlessServer(
//   domainPathRouter,
//   {
//     executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
//     headless: false,
//   },
//   // eslint-disable-next-line array-bracket-newline
//   [
//     // stealthPlugin
//     // adBlockPlugin
//   // eslint-disable-next-line array-bracket-newline
//   ]
// )

// console.log('hello')
// server.run()
// console.log('bye')

const url = 'google.com'
const domainPath = domainPathRouter.getDomainPathForUrl(url)
const bot = botRouter.getBotForUrl(url)
if(typeof domainPath !== 'undefined') {
  domainPathRouter.launchBrowser(domainPath, bot, {puppeteerParams, puppeteerPlugins})
    .then(browser => {
      domainPath.pageHandler(browser, bot, {urlParams: {}})
        .then(res => console.log(res))
        .catch(err => console.log(err))
    })
    .catch(err => {
      console.log('failed to launch browser')
      console.log(err)
    })
}
// eslint-disable-next-line multiline-comment-style
/*
// level 1 - domainPath level
const bot = new CrunchbaseFreeBot('username', 'password')
const cbCompanyProfileDomainPath = new CruchBaseProfileDomainPath()
const response = await cbCompanyProfileDomainPath.pageHandler(page, bot)
const resource = response.toResources(response)

// level 2 - domain level
import { domainPathRouter } from '...'
const response = await domainPathRouter.pageHandler(browser, 'https://crunchbase.com/profiles/1234', bot)
const response = await domainPathRouter.apiHandler(api, 'https://api.crunchbase.com/profiles/1234', bot)

const domainPathRouter = new DomainPathRouter([domainPath, cbDomainPath, liDomainPath])

const domainsHash = {
  'crunchbase.com': cbDomainPathRouter,
  'linkedin.com': liDomainPathRouter,
  'google.com': ggDomainPathRouter,
}

const botsHash = {
  'crunchbase.com': cbBotRouter,
  'linkedin.com': liBotRouter,
  'google.com': ggBotRouter,
}

// level 3 - multi-domainPath level
const {url, referer} = expressRequest.query
const domainRouter = domainsHash[url.toDomain()]
const bot = botsHash[url.toDomain()].getBot()
domainRouter.pageHandler(url, bot, {puppeteerParams, puppeteerPlugins})

domainRouter.pageHandler(url, botRouter.getBot(url), {puppeteerParams, puppeteerPlugins})
*/

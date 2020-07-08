/* eslint-disable max-params */
// import { Authless } from '../src/index'
// import { BotRouter } from '../src/bots/botrouter'
import { AuthlessServer, BrowserConfig } from '../src/server/server'
import { Browser, Page } from 'puppeteer'
import { IResponse as IAuthlessResponse, IBot } from '../src/types'
import { Bot } from '../src'
import { BotRouter } from '../src/bots/botrouter'
import { DomainPath } from '../src/domainPaths/domainPath'
import { DomainPathRouter } from '../src/domainPaths/domainPathRouter'
import { writeFileSync } from 'fs'

// use this service and pass it to authless server
class SampleDomainPath extends DomainPath {

  domain = 'google.com'

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
  async pageHandler (page: Page, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {

    console.log(`-- config  = ${JSON.stringify(config)}`)
    const { puppeteerParams, urlParams } = config ?? {}

    // const browser = await this.launchBrowser(selectedDomainPath, selectedBot, {puppeteerParams, puppeteerPlugins})
    // const page = await browser.newPage()
    await this.setupPage(page, puppeteerParams)

    const url = urlParams?.url
    if(typeof url === 'undefined') {
      throw new Error('url cannot be empty')
    }
    console.log(`going to url ${url as string}`)
    const response = await page.goto(
      `https://www.${url}`,
      {referer: urlParams.referer}
    )

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
  'crunchbase-free': [new Bot('usernmae', 'password')],
  'crunchbase': [new Bot('usernmae', 'password')],
  'google': [new Bot('usernmae', 'password')],
})

// const cbBotRouter = new BotRouter([new Bot('cbusername', 'cbpassword')])
// const cbDomainPath = new SampleDomainPath('crunchbase.com', cbBotRouter, ['crunchbase.com'])
const domainPathRouter = new DomainPathRouter({
  'crunchbase.com/person/..': new SampleDomainPath('crunchbase-person'),
  'crunchbase.com': new SampleDomainPath('crunchbase-home'),
  'linkedin.com': new SampleDomainPath('linkedin-home'),
  'google.com': new SampleDomainPath('google-home'),
})

// console.log(domainPathRouter)

const puppeteerParams: BrowserConfig['puppeteerParams'] = {
  executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
  headless: false,
}
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
  AuthlessServer.launchBrowser(domainPath, bot, {
    puppeteerParams,
    useStealthPlugin: true,
    useAdBlockerPlugin: true,
    adBlockerConfig: {
      blockTrackers: true
    },
    proxy: {
      address: 'x.x.x.x',
      port: 9999,
      credentials: {
        username: 'user1',
        password: 'password1',
      },
    }
  })
    .then((browser: Browser) => {
      browser.newPage()
        .then((page: Page) => {
          domainPath.pageHandler(page, bot, {urlParams: {url}})
            .then(res => {
              // console.log(res)
              writeFileSync(`response.${url}.json`, JSON.stringify(res, null, 4))
              console.log('-- done')
            })
            .catch(err => console.log(err))
        })
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

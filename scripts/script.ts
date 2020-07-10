/* eslint-disable max-params */
import { Browser, Page } from 'puppeteer'
import { BrowserConfig, IResponse as IAuthlessResponse, IBot } from '../src/types'
import { AuthlessServer } from '../src/server/server'
import { Bot } from '../src'
import { BotRouter } from '../src/bots/botrouter'
import { DomainPath } from '../src/domainPaths/domainPath'
import { DomainPathRouter } from '../src/domainPaths/domainPathRouter'
import { writeFileSync } from 'fs'

// sample domainPath implementation
class SampleDomainPath extends DomainPath {

  domain = 'google.com'

  constructor (domain: string) {
    super(domain)
    this.domain = domain
  }

  // eslint-disable-next-line class-methods-use-this
  async pageHandler (page: Page, selectedBot?: IBot, config?: BrowserConfig): Promise<IAuthlessResponse | null> {

    const { puppeteerParams, urlParams } = config ?? {}

    // add response listeners to save ajax/onchange responses
    await this.setupPage(page, puppeteerParams)

    const url = urlParams?.url
    if(typeof url === 'undefined') {
      throw new Error('url cannot be empty')
    }
    console.log(`going to url ${url}`)
    await page.goto(
      `https://www.${url}`,
      {referer: urlParams?.referer}
    )

    return await this.getJsonResponse(page)
  }
}

const botRouter = new BotRouter({
  'crunchbase-free': [new Bot('usernmae', 'password')],
  'crunchbase': [new Bot('usernmae', 'password')],
  'google': [new Bot('usernmae', 'password')],
})

const domainPathRouter = new DomainPathRouter({
  'crunchbase.com/person/..': new SampleDomainPath('crunchbase-person'),
  'crunchbase.com': new SampleDomainPath('crunchbase-home'),
  'linkedin.com': new SampleDomainPath('linkedin-home'),
  'google.com': new SampleDomainPath('google-home'),
})

const puppeteerParams: BrowserConfig['puppeteerParams'] = {
  executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
  headless: false,
}
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
          domainPath.pageHandler(page, bot, {urlParams: {url, responseFormat: 'json'}})
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

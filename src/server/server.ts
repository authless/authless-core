import * as path from 'path'
import { AnonBot, Bot, BotRouter, DomainPath, DomainPathRouter } from '../index'
import { BrowserConfig, ProxyConfig, PuppeteerParams, URLParams } from '../types'
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra'
// import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import { Browser } from 'puppeteer'
import ProxyPlugin from 'puppeteer-extra-plugin-proxy'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

interface IServerConfig {
  domainPathRouter: DomainPathRouter
  botRouter: BotRouter
  puppeteerParams: PuppeteerParams
  puppeteerPlugins?: PuppeteerExtraPlugin[]
  proxy?: ProxyConfig
}

/**
 * Helper class to start your running Authless server
 *
 * @remarks
 * This class can be used to create a configurable puppeteer instance with
 * some built-in functionality and plugins
 *
 * @example
 * ```ts
 * await browser = AuthlessServer.launchBrowser(myDomainPath, myBot, {puppeteerParams, puppeteerPlugins, ..})
 * await page = browser.newPage()
 *
 * await domainPath.pageHandler(page, ..)
 * ```
 *
 * @beta
 */
export class AuthlessServer {
  logger: any
  puppeteerParams?: PuppeteerParams
  puppeteerPlugins?: PuppeteerExtraPlugin[]
  proxy?: ProxyConfig
  domainPathRouter: DomainPathRouter
  botRouter: BotRouter
  responses: any[]

  /**
   * Create a Authless server instance
   *
   * @beta
   */
  // eslint-disable-next-line max-params
  constructor (config: IServerConfig) {
    this.domainPathRouter = config.domainPathRouter
    this.botRouter = config.botRouter
    this.puppeteerParams = config.puppeteerParams
    this.puppeteerPlugins = config.puppeteerPlugins
    this.proxy = config.proxy
    this.responses = []
    this.logger = {
      log: (data) => console.log(data)
    }
  }

  static async launchBrowser (domainPath: DomainPath, bot: Bot, config?: BrowserConfig): Promise<Browser> {
    const { puppeteerParams } = config ?? {}
    let defaultPlugins: PuppeteerExtraPlugin[] = []
    if(config?.useStealthPlugin ?? true) {
      defaultPlugins.push(StealthPlugin())
    }
    // -- Has conflicts with stealth-plugin, re-enable when fixed
    // -- refer: https://github.com/berstend/puppeteer-extra/issues/90
    // if(config?.useAdBlockerPlugin ?? true) {
    //   defaultPlugins.push(AdblockerPlugin(config?.adBlockerConfig ?? {}))
    // }
    if(typeof config?.proxy !== 'undefined') {
      defaultPlugins.push(ProxyPlugin(config?.proxy))
    }
    const plugins = [...defaultPlugins, ...(config?.puppeteerPlugins ?? [])]
    plugins.forEach((plugin: PuppeteerExtraPlugin) => {
      puppeteer.use(plugin)
    })

    let username: string = bot?.username ?? 'anon'
    // calculate data-dir to store Chrome user data
    const dataDirName = `${domainPath.domain}-${username}`
    let userDataDir = puppeteerParams?.userDataDir ?? 'chrome-default-user-data-dir'
    if (typeof process.env.CHROME_USER_DATA_DIR === 'string') {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, dataDirName))
    }
    userDataDir = `${userDataDir}-${domainPath.domain}-${bot.username ?? 'anon'}`
    const browser = await puppeteer.launch({
      ...puppeteerParams,
      ...bot.browserConfig,
      userDataDir
    })
    return browser
  }

  private static ping (expressRequest: ExpressRequest, expressResponse: ExpressResponse): void {
    const name = expressRequest.query.name ?? 'anonymous user'
    if(typeof name !== 'string') {
      const error = `error: url must be provided as a query parameter string. invalid value: ${name?.toLocaleString() ?? 'undefined'}`
      console.log(error)
      expressResponse
        .status(422)
        .send(error)
        .end()
      return
    }
    expressResponse
      .status(200)
      .send(`hello ${name}`)
      .end()
  }

  private static speedtest (expressRequest: ExpressRequest, expressResponse: ExpressResponse): void {
    // start puppeteer with this.puppeteerParams
    // run speedtest
    expressResponse
      .send(JSON.stringify({'speed': '1000'}))
      .end()
  }

  private async scrape (expressRequest: ExpressRequest, expressResponse: ExpressResponse): Promise<any> {
    const urlParams = expressRequest.query
    const { url, username } = urlParams

    if (typeof url !== 'string') {
      const error = `error: url must be provided as a query parameter string. invalid value: ${url?.toLocaleString() ?? 'undefined'}`
      console.log(error)
      expressResponse
        .status(422)
        .send(error)
        .end()
      return
    }

    // try to fetch the sevice for this url
    const selectedDomainPath = this.domainPathRouter.getDomainPath(url)
    if(typeof selectedDomainPath === 'undefined') {
      expressResponse
        .status(501)
        .send('Service not found')
        .end()
      return
    }

    // get bot when username not provided explicitly
    let selectedBot = this.botRouter.getBotForUrl(url)
    // get bot when username is provided
    if(typeof username === 'string') {
      selectedBot = this.botRouter.getBotByUsername(username)
      if(selectedBot instanceof AnonBot) {
        expressResponse
          .status(501)
          .send(`No Bot found for username: ${username}`)
          .end()
        return
      }
    }

    // initialise the browser
    const browser = await AuthlessServer.launchBrowser(selectedDomainPath, selectedBot, {
      puppeteerParams: this.puppeteerParams,
      proxy: this.proxy
    })
    const page = await browser.newPage()

    try {
      if(typeof this.puppeteerParams?.viewPort !== 'undefined') {
        await page.setViewport(this.puppeteerParams?.viewPort)
      }

      let responseFormat: URLParams['responseFormat'] = 'json'
      if(urlParams?.responseFormat === 'png') {
        responseFormat = urlParams?.responseFormat
      }
      // let service handle the page
      const authlessResponse = await selectedDomainPath.pageHandler(
        page,
        selectedBot,
        {
          urlParams: { url, responseFormat },
          puppeteerParams: this.puppeteerParams
        }
      )

      if (responseFormat === 'json') {
        expressResponse
          .status(200)
          .set('Content-Type', 'application/json; charset=utf-8')
          .send({
            meta: authlessResponse.meta,
            page: authlessResponse.page,
            main: authlessResponse.main,
            xhrs: authlessResponse.xhrs,
          })
          .end()
      } else if (responseFormat === 'png') {
        expressResponse
          .status(200)
          .set('Content-Type', 'image/png')
          .end(await page.screenshot({fullPage: true}), 'binary')
      } else {
        expressResponse
          .status(501)
          .end('Can only handle responseFormat of type json or png')
      }
    } catch (err) {
      console.log(`Authless-server: scrape(): error = ${(err as Error).message}`)
      expressResponse
        .status(501)
        .send('Server Error')
        .end()
    }
    await page.close()
    await browser.close()
  }

  public run (): void {
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded())
    const PORT = process.env.PORT ?? 3000

    app.get('/ping', AuthlessServer.ping)
    app.get('/speedtest', AuthlessServer.speedtest)
    app.get('/url', async (req, res) => await this.scrape(req, res))

    // start express
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`)
    })
  }
}

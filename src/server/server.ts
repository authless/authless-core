/* eslint-disable no-invalid-this */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as path from 'path'
import { Browser, Page, Response } from 'puppeteer'
import { BrowserConfig, IBot, IBotRouter, IDomainPath, IDomainPathRouter, PuppeteerParams, URLParams } from '../types'
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import ProxyPlugin from 'puppeteer-extra-plugin-proxy'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

export class AuthlessServer {
  logger: any
  puppeteerParams?: PuppeteerParams
  puppeteerPlugins?: PuppeteerExtraPlugin[]
  domainPathRouter: IDomainPathRouter
  botRouter: IBotRouter
  responses: any[]

  // eslint-disable-next-line max-params
  constructor (domainPathRouter: IDomainPathRouter, botRouter: IBotRouter, puppeteerParams: PuppeteerParams, puppeteerPlugins?: PuppeteerExtraPlugin[]) {
    this.domainPathRouter = domainPathRouter
    this.botRouter = botRouter
    this.puppeteerParams = puppeteerParams
    this.puppeteerPlugins = puppeteerPlugins
    this.responses = []
    this.logger = {
      log: (data) => console.log(data)
    }
  }

  // eslint-disable-next-line max-params
  getJsonResponse = async (bot, page: Page): Promise<string> => {
    return JSON.stringify({
      meta: {
        url: await page.url(),
        username: bot?.username ?? 'anonymous',
      },
      content: await page.content(),
      xhrs: this.responses
    })
  }

  // eslint-disable-next-line max-params
  makeExpressResponse = async (expressResponse: ExpressResponse, page: Page, bot: IBot, urlParams: URLParams): Promise<any> => {
    const responseFormat = urlParams.responseFormat ?? 'html'
    if (responseFormat === 'json') {
      expressResponse.set('Content-Type', 'application/json; charset=utf-8')
      const jsonResponse = await this.getJsonResponse(bot, page)
      return expressResponse.status(200).send(jsonResponse)
    }

    expressResponse.set('Content-Type', 'text/html')
    if (urlParams.responseFormat === 'png') {
      return expressResponse.end(await page.screenshot({fullPage: true}), 'binary')
    }
    expressResponse.set('Content-Type', 'text/html')
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - how do we handle anonymous users(bot is undefined)
  static async launchBrowser (domainPath: IDomainPath, bot?: IBot, config?: BrowserConfig): Promise<Browser> {
    const { puppeteerParams } = config ?? {}
    let defaultPlugins: PuppeteerExtraPlugin[] = []
    if(config?.useStealthPlugin) {
      defaultPlugins.push(StealthPlugin())
    }
    if(config?.useAdBlockerPlugin) {
      defaultPlugins.push(AdblockerPlugin(config?.adBlockerConfig ?? {}))
    }
    if(typeof config?.proxy !== 'undefined') {
      defaultPlugins.push(ProxyPlugin(config?.proxy))
    }
    const plugins = [...defaultPlugins, ...(config?.puppeteerPlugins ?? [])]
    plugins.forEach((plugin: PuppeteerExtraPlugin) => {
      puppeteer.use(plugin)
    })

    let username = 'anon'
    if(typeof bot !== 'undefined') {
      username = bot.username
    }
    // calculate data-dir to store Chrome user data
    const dataDirName = `${domainPath.domain}-${username}`
    let userDataDir = puppeteerParams?.userDataDir ?? 'chrome-default-user-data-dir'
    if (process.env.CHROME_USER_DATA_DIR) {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, dataDirName))
    }
    const browser = await puppeteer.launch({
      ...puppeteerParams,
      userDataDir
    })
    return browser
  }

  ping = (expressRequest: ExpressRequest, expressResponse: ExpressResponse): void => {
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

  speedtest = (expressRequest: ExpressRequest, expressResponse: ExpressResponse): void => {
    // start puppeteer with this.puppeteerParams
    // run speedtest
    // eslint-disable-next-line no-warning-comments
    // TODO
    expressResponse
      .send(JSON.stringify({'speed': '1000'}))
      .end()
  }

  scrape = async (expressRequest: ExpressRequest, expressResponse: ExpressResponse): Promise<void> => {
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

    if (typeof username !== 'string') {
      const error = `error: username must be provided as a query parameter string. invalid value: ${username?.toLocaleString() ?? 'undefined'}`
      console.log(error)
      expressResponse
        .status(422)
        .send(error)
        .end()
      return
    }

    // try to fetch the sevice for this url
    const selectedDomainPath = this.domainPathRouter.getDomainPathForUrl(url)
    if(typeof selectedDomainPath === 'undefined') {
      throw new Error('Service not found')
    }

    // get bot when username not provided explicitly
    let selectedBot = this.botRouter.getBotForUrl(url)
    // get bot when username is provided
    if(typeof username !== 'undefined') {
      selectedBot = this.botRouter.getBotByUsername(username)
      if(typeof selectedBot === 'undefined') {
        throw new Error(`User not found for user ${username}`)
      }
    }

    // initialise the browser
    const browser = await AuthlessServer.launchBrowser(selectedDomainPath, selectedBot)
    const page = await browser.newPage()

    if(this.puppeteerParams?.viewPort) {
      await page.setViewport(this.puppeteerParams?.viewPort)
    }

    const saveResponse = async (response: Response): Promise<void> => {
      let parsedResponse: string | unknown = ''
      try {
        parsedResponse = await response.json()
        console.log(`${response.url()}: response was json`)
      } catch(e1) {
        console.log(`${response.url()}: response was not json`)
        try {
          parsedResponse = await response.text()
          console.log(`${response.url()}: response was text`)
        } catch (e2) {
          console.log(`${response.url()}: response was not json`)
        }
      }

      this.responses.push(parsedResponse)
    }
    // attach handler to save responses
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('response', saveResponse)

    let responseFormat = 'json'
    if(typeof urlParams.responseFormat === 'string') {
      responseFormat = urlParams.responseFormat
    }
    // let service handle the page
    await selectedDomainPath.pageHandler(
      page,
      selectedBot,
      {
        urlParams: { url, responseFormat }
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.off('response', saveResponse)

    await this.makeExpressResponse(expressResponse, page, selectedBot, urlParams as unknown as URLParams)
    expressResponse
      .status(200)
      .send(await page.content())
  }

  run (): void {
    // start express
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded())
    const PORT = process.env.PORT ?? 3000

    app.get('/ping', this.ping)
    app.get('/speedtest', this.speedtest)
    app.get('/url', this.scrape)

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`)
    })
  }
}

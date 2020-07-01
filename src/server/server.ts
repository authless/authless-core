/* eslint-disable no-multi-spaces */
/* eslint-disable no-warning-comments */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as express from 'express'
import * as path from 'path'
import { IBot, IDomainPath, IDomainPathRouter, IResponse } from '../types'
import puppeteer from 'puppeteer-extra'

interface UrlParams {
  url: string
  responseFormat: string
  referrer?: string
  username?: string
}

export class AuthlessServer {
  logger: any
  puppeteerParams: any
  puppeteerPlugins: any[]
  domainPathRouter: IDomainPathRouter
  responses: any[]

  constructor (domainPathRouter: IDomainPathRouter, puppeteerParams: any, puppeteerPlugins: any) {
    this.domainPathRouter = domainPathRouter
    this.puppeteerParams = puppeteerParams
    this.puppeteerPlugins = puppeteerPlugins
    this.responses = []
  }

  // TODO - simplify getJsonResponse and makeExpressResponse
  // eslint-disable-next-line max-params
  async getJsonResponse (bot, page, response, responses): Promise<void> {
    console.log('to do')
  }

  // eslint-disable-next-line max-params
  async makeExpressResponse (expressResponse, response, page, bot, urlParams): Promise<void> {
    const responseFormat = urlParams.responseFormat || 'html'
    if (responseFormat === 'json') {
      expressResponse.set('Content-Type', 'application/json; charset=utf-8')
      const jsonResponse = await this.getJsonResponse(bot, page, response, this.responses)
      return expressResponse.status(200).send(jsonResponse)
    } else if (expressResponse.query.responseFormat === 'png') {
      return expressResponse.end(await page.screenshot({fullPage: true}), 'binary')
    }
    expressResponse.set('Content-Type', 'text/html')
  }

  getProfileDirName (serviceName: string, username: string): string {
    return `${serviceName}-${username}`
  }

  // TODO - how do we handle anonymous users(bot is undefined)
  async launchBrowser (domainPath: IDomainPath, bot: IBot): Promise<any> {
    this.puppeteerPlugins.forEach(plugin => {
      puppeteer.use(plugin)
    })

    // calculate data-dir to store Chrome user data
    const dataDirName = this.getProfileDirName(domainPath.domain, bot.username)
    // eslint-disable-next-line init-declarations
    let userDataDir: string | undefined
    if(this.puppeteerParams.userDataDir) {
      userDataDir = this.puppeteerParams.userDataDir
    }
    if (process.env.CHROME_USER_DATA_DIR) {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, dataDirName))
    }
    this.logger(`launching browser with userDataDir: ${userDataDir ?? 'not-found'}`)
    const browser = await puppeteer.launch({
      ...this.puppeteerParams,
      userDataDir
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.logger(`launched browser: ${await browser.version()}`)
    return browser
  }

  ping (expressRequest, expressResponse): string {
    const name = expressRequest.params.name || 'anonymous user'
    return `hello ${name as string}`
  }

  speedtest (expressRequest, expressResponse): string {
    // start puppeteer with this.puppeteerParams
    // run speedtest
    return JSON.stringify({'speed': '1000'})
  }

  async scrape (expressRequest, expressResponse): Promise<IResponse> {
    const urlParams = expressRequest.params
    const { url, referrer, username } = urlParams

    // try to fetch the sevice for this url
    const selectedDomainPath = this.domainPathRouter.getDomainPathFromUrl(url)
    if(typeof selectedDomainPath === 'undefined') {
      throw new Error('Service not found')
    }

    // get bot when username not provided explicitly
    let selectedBot = selectedDomainPath.botRouter.getBot()
    if(typeof selectedBot === 'undefined') {
      throw new Error(`User not found for domainPath ${selectedDomainPath.domain}`)
    }
    // get bot when username is provided
    if(typeof username !== 'undefined') {
      selectedBot = selectedDomainPath.botRouter.getBotByUsername(username)
      if(typeof selectedBot === 'undefined') {
        throw new Error(`User not found for user ${username as string}`)
      }
    }

    // initiate the browser
    const browser = await this.launchBrowser(selectedDomainPath, selectedBot)
    const page = await browser.newPage()

    if(this.puppeteerParams.viewPort) {
      page.setViewPort(this.puppeteerParams.viewPort)
    }

    // move into selectedDomainPath.prePagePlugs?()
    // TODO - save only xhr responses?
    const saveResponse = async (response: any): Promise<void> => {
      this.responses.push(await response.json())
    }
    // attach handler to save responses
    page.on('response', saveResponse)

    const response = await page.goto(
      url,
      referrer
    )

    const isAuthenticated = await selectedDomainPath.isAuthenticated(page)
    if(!isAuthenticated) {
      await selectedDomainPath.authenticate(page, selectedBot)
    }
    // let service handle the page
    await selectedDomainPath.pageHandler(page, selectedBot, urlParams)

    page.off('response', saveResponse)

    await this.makeExpressResponse(expressResponse, response, page, selectedBot, urlParams)
    return expressResponse.status(200).send(await page.content())

    // return {'meta': 'example', 'content': 'some content', 'page': 'page data'}
  }

  run (): void {
    // start express
    const app = express()
    app.set('port', process.env.PORT ?? 3000)

    app.get('/ping',      this.ping)
    app.get('/speedtest', this.speedTest)
    app.get('/url',       this.scrape)
  }
}

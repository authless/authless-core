/* eslint-disable no-invalid-this */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-warning-comments */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as path from 'path'
import { Browser, Page, Response } from 'puppeteer'
import { IBot, IBotRouter, IDomainPath, IDomainPathRouter, IResponse } from '../types'
import express from 'express'
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
  botRouter: IBotRouter
  responses: any[]

  // eslint-disable-next-line max-params
  constructor (domainPathRouter: IDomainPathRouter, botRouter: IBotRouter, puppeteerParams: any, puppeteerPlugins: any) {
    this.domainPathRouter = domainPathRouter
    this.botRouter = botRouter
    this.puppeteerParams = puppeteerParams
    this.puppeteerPlugins = puppeteerPlugins
    this.responses = []
    this.logger = {
      log: (data) => console.log(data)
    }
  }

  // TODO - simplify getJsonResponse and makeExpressResponse
  // eslint-disable-next-line max-params
  getJsonResponse = async (bot, page: Page, response, responses): Promise<string> => {
    return JSON.stringify({
      meta: {
        url: await page.url(),
      },
      content: await page.content(),
      xhrs: this.responses
    })
  }

  // eslint-disable-next-line max-params
  makeExpressResponse = async (expressResponse, response, page, bot, urlParams): Promise<void> => {
    const responseFormat = urlParams.responseFormat || 'html'
    if (responseFormat === 'json') {
      expressResponse.set('Content-Type', 'application/json; charset=utf-8')
      const jsonResponse = await this.getJsonResponse(bot, page, response, this.responses)
      return expressResponse.status(200).send(jsonResponse)
    }

    expressResponse.set('Content-Type', 'text/html')
    if (expressResponse.query.responseFormat === 'png') {
      return expressResponse.end(await page.screenshot({fullPage: true}), 'binary')
    }
    expressResponse.set('Content-Type', 'text/html')
  }

  // // eslint-disable-next-line class-methods-use-this
  // getProfileDirName (serviceName: string, username: string): string {
  //   return `${serviceName}-${username}`
  // }

  // launchBrowser = async (domainPath: IDomainPath, bot?: IBot, config?: any): Promise<Browser> => {
  //   const { puppeteerParams, puppeteerPlugins } = config

  //   // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  //   puppeteerPlugins.forEach(plugin => {
  //     puppeteer.use(plugin)
  //   })

  //   let username = 'anon'
  //   if(typeof bot !== 'undefined') {
  //     username = bot.username
  //   }
  //   // calculate data-dir to store Chrome user data
  //   // eslint-disable-next-line no-invalid-this
  //   const dataDirName = this.getProfileDirName(domainPath.domain, username)
  //   // eslint-disable-next-line init-declarations
  //   let userDataDir: string | undefined
  //   if(typeof puppeteerParams.userDataDir !== 'undefined') {
  //     userDataDir = puppeteerParams.userDataDir
  //   }
  //   if (typeof process.env.CHROME_USER_DATA_DIR !== 'undefined') {
  //     userDataDir = path.resolve(
  //       path.join(process.env.CHROME_USER_DATA_DIR, dataDirName))
  //   }
  //   // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  //   // this.logger.log(`launching browser with userDataDir: ${userDataDir || 'not-found'}`)
  //   const browser = await puppeteer.launch({
  //     ...puppeteerParams,
  //     userDataDir
  //   })
  //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //   // this.logger.log(`launched browser: ${await browser.version()}`)
  //   return browser
  // }

  // TODO - how do we handle anonymous users(bot is undefined)
  static async launchBrowser (domainPath: IDomainPath, bot?: IBot, config?: any): Promise<Browser> {
    const { puppeteerParams, puppeteerPlugins } = config || {}
    puppeteerPlugins.forEach(plugin => {
      puppeteer.use(plugin)
    })

    let username = 'anon'
    if(typeof bot !== 'undefined') {
      username = bot.username
    }
    // calculate data-dir to store Chrome user data
    const dataDirName = `${domainPath.domain}-${username}`
    // eslint-disable-next-line init-declarations
    let userDataDir: string | undefined
    if(puppeteerParams.userDataDir) {
      userDataDir = puppeteerParams.userDataDir
    }
    if (process.env.CHROME_USER_DATA_DIR) {
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

  ping = (expressRequest, expressResponse): void => {
    const name = expressRequest.query.name || 'anonymous user'
    expressResponse.send(`hello ${name as string}`)
    expressResponse.end()
  }

  speedtest = (expressRequest, expressResponse): void => {
    // start puppeteer with this.puppeteerParams
    // run speedtest
    expressResponse.send(JSON.stringify({'speed': '1000'}))
    expressResponse.end()
  }

  scrape = async (expressRequest, expressResponse): Promise<IResponse> => {
    const urlParams = expressRequest.query
    console.log(`urlParams = ${JSON.stringify(urlParams)}`)
    const { url, username } = urlParams

    // try to fetch the sevice for this url
    const selectedDomainPath = this.domainPathRouter.getDomainPathForUrl(url)
    if(typeof selectedDomainPath === 'undefined') {
      throw new Error('Service not found')
    }

    // get bot when username not provided explicitly
    let selectedBot = this.botRouter.getBotForUrl(url)
    // if(typeof selectedBot === 'undefined') {
    //   throw new Error(`User not found for domainPath ${selectedDomainPath.domain}`)
    // }
    // get bot when username is provided
    if(typeof username !== 'undefined') {
      selectedBot = this.botRouter.getBotByUsername(username)
      if(typeof selectedBot === 'undefined') {
        throw new Error(`User not found for user ${username as string}`)
      }
    }

    // initiate the browser
    const browser = await AuthlessServer.launchBrowser(selectedDomainPath, selectedBot)
    const page = await browser.newPage()

    if(this.puppeteerParams.viewPort) {
      await page.setViewport(this.puppeteerParams.viewPort)
    }

    // move into selectedDomainPath.prePagePlugs?()
    // TODO - save only xhr responses?
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

    // let service handle the page
    const response = await selectedDomainPath.pageHandler(
      page,
      selectedBot,
      {
        puppeteerParams: this.puppeteerParams, puppeteerPlugins: this.puppeteerPlugins
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.off('response', saveResponse)

    await this.makeExpressResponse(expressResponse, response, page, selectedBot, urlParams)
    return expressResponse.status(200).send(await page.content())

    // return {'meta': 'example', 'content': 'some content', 'page': 'page data'}
  }

  run (): void {
    // start express
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded())
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const PORT = process.env.PORT || 3000

    app.get('/ping',      this.ping)
    app.get('/speedtest', this.speedtest)
    app.get('/url',       this.scrape)

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`)
    })
  }
}

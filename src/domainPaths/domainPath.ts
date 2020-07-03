/* eslint-disable no-invalid-this */
/* eslint-disable max-params */
import { Browser, Page as PuppeteerPage, Response as XHRResponse } from 'puppeteer'
import { IResponse as IAuthlessResponse, IBot, IDomainPath } from '../types'
import { Response as ExpressResponse } from 'express'

export class DomainPath implements IDomainPath {
  domain: string
  responses: XHRResponse[]

  constructor (domain) {
    this.domain = domain
    this.responses = []
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - simplify getJsonResponse and makeExpressResponse
  // eslint-disable-next-line max-params
  getJsonResponse = async (page: PuppeteerPage): Promise<IAuthlessResponse> => {
    return {
      meta: {
        url: page.url(),
      },
      page: 'what goes herre?',
      content: await page.content(),
      xhrs: this.responses
    }
  }

  // eslint-disable-next-line max-params
  makeAuthlessResponse = async (expressResponse: ExpressResponse, page: PuppeteerPage, bot: IBot, urlParams): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const responseFormat = urlParams.responseFormat || 'html'
    if (responseFormat === 'json') {
      expressResponse.set('Content-Type', 'application/json; charset=utf-8')
      const jsonResponse = await this.getJsonResponse(page)
      expressResponse.status(200).send(jsonResponse)
      return
    }

    expressResponse.set('Content-Type', 'text/html')
    if (responseFormat === 'png') {
      return expressResponse.end(await page.screenshot({fullPage: true}), 'binary')
    }
    expressResponse.set('Content-Type', 'text/html')
  }

  setupPage = async (page: PuppeteerPage, puppeteerParams: any): Promise<void> => {

    if(typeof puppeteerParams.viewPort !== 'undefined') {
      await page.setViewport(puppeteerParams.viewPort)
    }

    // move into selectedDomainPath.prePagePlugs?()
    // eslint-disable-next-line no-warning-comments
    // TODO - save only xhr responses?
    const saveResponse = async (response: XHRResponse): Promise<void> => {
      let parsedResponse: string | unknown = ''
      try {
        parsedResponse = await response.json()
        console.log(`${response.url()}: response was json`)
        console.log(`parsedResponse = ${JSON.stringify(parsedResponse)}`)
      } catch(e1) {
        console.log(`${response.url()}: response was not json`)
        try {
          parsedResponse = await response.text()
          console.log(`${response.url()}: response was text`)
          console.log(`parsedResponse = ${JSON.stringify(parsedResponse)}`)
        } catch (e2) {
          console.log(`${response.url()}: response was not json`)
        }
      }

      if(typeof parsedResponse !== 'undefined' && parsedResponse !== null) {
        this.responses.push(parsedResponse as XHRResponse)
      }
    }
    // attach handler to save responses
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('response', saveResponse)

  }

  // eslint-disable-next-line class-methods-use-this
  async isAuthenticated (page: any): Promise<Boolean> {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  async authenticate (page: any): Promise<string> {
    return 'to be implemented'
  }

  // eslint-disable-next-line class-methods-use-this
  async pageHandler (browser: Browser, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {
    // process the page
    return null
  }

}

/* eslint-disable no-invalid-this */
/* eslint-disable max-params */
import { IResponse as IAuthlessResponse, IBot, IDomainPath, RequestContainer, Xhr } from '../types'
import { Page as PuppeteerPage, Response as XHRResponse } from 'puppeteer'
import { Response as ExpressResponse } from 'express'

export class DomainPath implements IDomainPath {
  domain: string
  responses: Xhr[]

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
        timestamp: Date.now()
      },
      page: {
        url: page.url(),
        viewport: page.viewport(),
        content: await page.content(),
        cookies: await page.cookies(),
        title: await page.title(),
      },
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

  getRequestAsJson = async (response: XHRResponse): Promise<RequestContainer | undefined> => {
    try{
      const request = await response.request()
      const requestData = {
        headers: request.headers(),
        isNavigationRequest: request.isNavigationRequest(),
        method: request.method(),
        postData: request.postData(),
        resourceType: request.resourceType(),
        url: request.url()
      }
      return requestData
    } catch (e) {
      console.log('error: unable to extract request data from Xhr response')
    }
  }

  setupPage = async (page: PuppeteerPage, puppeteerParams: any): Promise<void> => {

    if(typeof puppeteerParams?.viewPort !== 'undefined') {
      await page.setViewport(puppeteerParams.viewPort)
    }

    // eslint-disable-next-line no-warning-comments
    // TODO - save only xhr responses?
    const saveResponse = async (response: XHRResponse): Promise<void> => {
      const securityDetails = {
        issuer: response.securityDetails()?.issuer(),
        protocol: response.securityDetails()?.protocol(),
        subjectName: response.securityDetails()?.subjectName(),
        validFrom: response.securityDetails()?.validFrom(),
        validTo: response.securityDetails()?.validTo(),
      }
      const returnObj: Xhr = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        securityDetails: securityDetails,
        fromCache: response.fromCache(),
        fromServiceWorker: response.fromServiceWorker(),
        // eslint-disable-next-line no-undefined
        text: undefined,
        // eslint-disable-next-line no-undefined
        request: undefined,
      }
      returnObj.request = await this.getRequestAsJson(response)
      try {
        returnObj.text = await response.text()
      } catch (e) {
        console.log('error: response.text() failed')
      }
      this.responses.push(returnObj)
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
  async pageHandler (page: PuppeteerPage, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {
    // process the page
    return null
  }

}

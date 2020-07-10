/* eslint-disable no-invalid-this */
/* eslint-disable max-params */
import { IResponse as IAuthlessResponse, IBot, IDomainPath, PuppeteerParams, RequestContainer, URLParams, Xhr } from '../types'
import { Page as PuppeteerPage, Response as XHRResponse } from 'puppeteer'
import { Response as ExpressResponse } from 'express'

export class DomainPath implements IDomainPath {
  domain: string
  responses: Xhr[]

  constructor (domain) {
    this.domain = domain
    this.responses = []
  }

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

  setupPage = async (page: PuppeteerPage, puppeteerParams?: PuppeteerParams): Promise<void> => {

    if(typeof puppeteerParams?.viewPort !== 'undefined') {
      await page.setViewport(puppeteerParams.viewPort)
    }

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
  async pageHandler (page: PuppeteerPage, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {
    // default implementation to process the page
    return null
  }

}

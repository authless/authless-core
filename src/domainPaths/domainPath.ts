import { IResponse as IAuthlessResponse, IBot, IDomainPath, PuppeteerParams, RequestContainer, Xhr } from '../types'
import { Page as PuppeteerPage, Response as PuppeteerResponse } from 'puppeteer'

export class DomainPath implements IDomainPath {
  domain: string
  responses: Xhr[]

  /**
   * Create a DomainPath instance.
   *
   * @param domain - The name of the domain, useful for logging
   * @returns An instance of the DomainPath class
   *
   * @example
   * ```ts
   * const dpath = new DomainPath('my-domain')
   * ```
   *
   * @beta
   */
  constructor (domain: string) {
    this.domain = domain
    this.responses = []
  }

  private async getJsonResponse (page: PuppeteerPage): Promise<IAuthlessResponse> {
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

  private static async getRequestAsJson (response: PuppeteerResponse): Promise<RequestContainer | undefined> {
    try{
      const request = response.request()
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

  private addResponseHook (page: PuppeteerPage, blockResourceTypes: string[]): void {
    console.log(`-- setting up to block resourceTypes: ${JSON.stringify(blockResourceTypes)}`)
    const saveResponse = async (response: PuppeteerResponse): Promise<void> => {

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
      returnObj.request = await DomainPath.getRequestAsJson(response)
      if(typeof returnObj.request !== 'undefined') {
        if(!blockResourceTypes.includes(returnObj.request.resourceType)) {
          try {
            returnObj.text = await response.text()
          } catch (e) {
            console.log(`error: response.text() failed for ${returnObj.request.url}`)
          }
          this.responses.push(returnObj)
        }
      }
    }
    // attach handler to save responses
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('response', saveResponse)
  }

  // eslint-disable-next-line class-methods-use-this
  private async addRequestBlockers (page: PuppeteerPage, blockedDomains: string[]): Promise<void> {
    console.log(`-- setting up to block requests from domains: ${JSON.stringify(blockedDomains)}`)
    // block any domains we dont want to load from
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if(blockedDomains.filter(urlPart => request.url().includes(urlPart)).length > 0) {
        request.abort()
          .then(() => {
            console.log(`blocked request from ${request.url()}`)
          })
          .catch((err) => {
            console.log(`error blocking request from ${request.url()}: ${JSON.stringify(err)}`)
          })
      } else {
        request.continue()
          .catch(() => {
            console.log('error calling request.continue()')
          })
      }
    })
  }

  // setup the page to avoid some domain requests and avoid saving some resourceTypes
  public async setupPage (page: PuppeteerPage, puppeteerParams: PuppeteerParams): Promise<void> {

    if(typeof puppeteerParams?.viewPort !== 'undefined') {
      await page.setViewport(puppeteerParams.viewPort)
    }

    // add hooks to save responses
    this.addResponseHook(page, puppeteerParams.blockResourceTypes ?? [])

    // add request blockers for domains to ignore
    if(typeof puppeteerParams.blockDomains !== 'undefined' &&
      puppeteerParams.blockDomains.length > 0
    ) {
      await this.addRequestBlockers(page, puppeteerParams.blockDomains)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async pageHandler (page: PuppeteerPage, selectedBot?: IBot, config?: any): Promise<IAuthlessResponse | null> {
    // default implementation to process the page
    return null
  }

}

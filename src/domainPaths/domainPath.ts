import {
  IResponse as IAuthlessResponse,
  PuppeteerParams,
  RequestContainer,
  Xhr,
} from '../types'
import {
  Page as PuppeteerPage,
  Request as PuppeteerRequest,
  Response as PuppeteerResponse,
} from 'puppeteer'
import { Bot } from '../bots/bot'

/**
 * The interface that controls the behaviour and page-handling for a particular domain/subdomain/url
 *
 * @remarks
 * This is responsible for handling the page that is fetched.
 * If different behaviours are required for different URLs
 * (say some pages have pagination, while others require you to expand links)
 * then, you should have multiple DomainPaths and attach them to the requried URL
 * via a DomainPathHandler {@link DomainPathRouter}
 * Extend this class to create custom DomainPath behaviours
 * You can add custom behaviour in the getJsonResponse(), setupPage() and pageHandler() functions
 *
 * @example
 * ```ts
 * // create 2 DomainPaths
 * class PaginationDomainPath extends DomainPath {
 *   pageHandler(page...) {
 *     // handle pagination and other page specific actions here
 *   }
 * }
 * class ExpandableDomainPath extends DomainPath {
 *   pageHandler(page...) {
 *     // handle expanding links or page specific inputs here
 *   }
 * }
 *
 * const domainPathRouter = new DomainPathRouter({
 *   'www.example.com/pagination/': new PaginationDomainPath('pagination'),
 *   'www.example.com/links/': new ExpandableDomainPath('expanding-links')
 * })
 *
 * Now, get the right domainPath by url and use it. Refer to docs
 * ```
 *
 * @beta
 *
 *
 * @beta
 */
export class DomainPath {

  /**
   * Name of the domain. Useful for differentiating DomainPaths while logging
   */
  domain: string

  /**
   * Save the array of xhr responses as needed.
   * Certain resourceTypes can be blocked
   * by passing blockResourceTypes in {@link PuppeteerParams}
   */
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private responses: Xhr[]

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

  private static async convertRequestToJson (request: PuppeteerRequest): Promise<RequestContainer | undefined> {
    try{
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

  private static async convertResponseToJson (response: PuppeteerResponse): Promise<Xhr> {

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
    returnObj.request = await DomainPath.convertRequestToJson(response.request())
    return returnObj
  }

  private addResponseHook (page: PuppeteerPage, blockResourceTypes: string[]): void {
    console.log(`-- setting up to block resourceTypes: ${JSON.stringify(blockResourceTypes)}`)
    const saveResponse = async (response: PuppeteerResponse): Promise<void> => {
      const returnObj = await DomainPath.convertResponseToJson(response)
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

  /**
   * Form a {@link IResponse} object from the puppeteer page
   *
   * @remarks
   * Override this to add custom data/metadata to your Authless response {@link IResponse}
   *
   * @param page - the puppeteer page from which to extract the response object
   * @returns a {@link IResponse} if found, else returns undefined
   */
  public async convertPageToResponse (page: PuppeteerPage): Promise<IAuthlessResponse> {
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

  /**
   * Over-ride default page setup
   *
   * @remarks
   * Override this to add custom page listeners on response etc.
   * This happens before we navigate to the target URL.
   * Call super.setupPage if you would like to use default response/resourceType blocking
   *
   * @param page - The puppeteer page to which we can attach listeners or change behaviour of
   * @param puppeteerParams - The {@link PuppeteerParams} object passed by the user
   */
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

  /**
   * Code to handle page interactions
   *
   * @remarks
   * This is responsible for checking/doing authentication
   * and interacting with the page.
   * You can have different DomainPaths with different behaviour
   * and call the appropriate one based on the URL you wish to fetch
   * The puppeteer instance will be reused and only new pages are instantiated here
   *
   *
   * @param page - The puppeteer page to which we can attach listeners or change behaviour of
   * @param bot - Optional. The {@link Bot} to use for authentication.
   * @param config - Optional. The {@link BrowserConfig} passed by the user
   */
  // eslint-disable-next-line class-methods-use-this
  public async pageHandler (page: PuppeteerPage, selectedBot?: Bot, config?: any): Promise<IAuthlessResponse | null> {
    // default implementation to process the page
    return null
  }

}

import {
  Page as PuppeteerPage,
  Response as PuppeteerResponse,
} from 'puppeteer'
import {
  PuppeteerParams,
  Xhr,
} from '../types'
import { Response as AuthlessResponse } from '../response'
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

  private addResponseHook (page: PuppeteerPage, blockResourceTypes: string[]): void {
    console.log(`-- setting up to block resourceTypes: ${JSON.stringify(blockResourceTypes)}`)
    const saveResponse = async (response: PuppeteerResponse): Promise<void> => {
      const returnObj = await AuthlessResponse.convertResponseToJson(response)
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
   * @param selectedBot - Optional. The {@link Bot} to use for authentication.
   * @param config - Optional. The {@link BrowserConfig} passed by the user
   */
  // eslint-disable-next-line class-methods-use-this
  public async pageHandler (page: PuppeteerPage, selectedBot?: Bot, config?: any): Promise<AuthlessResponse> {
    throw new Error('not implemented')
  }

}

import { IDomainPath, IDomainPathRouter } from '../types'

export class DomainPathRouter implements IDomainPathRouter {
  domainMap: {[url: string ]: IDomainPath}

  /**
   * Create a DomainPathRouter instance.
   *
   * @param domainMap - The map of url to DomainPath instance
   * @returns An instance of the DomainPathRouter class
   *
   * @example
   * ```ts
   * const dpRouter = new DomainPathRouter({
   *   'www.example.com/dogs/': new DogDomainPath('dog-handler'),
   *   'www.example.com/horses/': new HorseDomainPath('horse-handler'),
   * })
   *
   * const dp = dpRouter.getDomainPath(someUrl)
   * const response = dp.pageHandler(page, ...)
   * ```
   *
   * @beta
   */
  constructor (domainMap: {[url: string ]: IDomainPath}) {
    this.domainMap = domainMap
  }

  getDomainPath (url: string): IDomainPath | undefined {
    const matchedUrlKeys = Object.keys(this.domainMap)
      .sort((a, b) => b.length - a.length)
      .filter(domainUrl => url.includes(domainUrl))

    if(matchedUrlKeys.length > 0) {
      return this.domainMap[matchedUrlKeys[0]]
    }
  }
}

import { IDomainPath, IDomainPathRouter } from '../types'

export class DomainPathRouter implements IDomainPathRouter {
  domainMap: {[url: string ]: IDomainPath}

  constructor (domainMap: {[url: string ]: IDomainPath}) {
    this.domainMap = domainMap
  }

  getDomainPathForUrl (url: string): IDomainPath | undefined {
    const matchedUrlKeys = Object.keys(this.domainMap)
      .sort((a, b) => b.length - a.length)
      .filter(domainUrl => url.includes(domainUrl))

    if(matchedUrlKeys.length > 0) {
      return this.domainMap[matchedUrlKeys[0]]
    }
  }
}

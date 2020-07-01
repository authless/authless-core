import { IDomainPath, IDomainPathRouter } from '../types2'

export class DomainPathRouter implements IDomainPathRouter {
  domainPaths: IDomainPath[]

  constructor (services: IDomainPath[]) {
    this.domainPaths = services
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - try to get service whose URL matches and is the longest(most specific)?
  getDomainPathFromUrl (url: string): IDomainPath | undefined {
    const matchedServices = this.domainPaths
      // eslint-disable-next-line array-callback-return
      .filter(service => {
        service.urls.find(serviceUrl => url.includes(serviceUrl))
      })
    if(matchedServices.length > 0) {
      return matchedServices[0]
    }
  }
}

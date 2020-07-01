import { IBotRouter, IDomainPath } from '../types2'

export class DomainPath implements IDomainPath {
  domain: string
  botRouter: IBotRouter
  urls: string[]

  constructor (domain, botRouter, urls) {
    this.domain = domain
    this.botRouter = botRouter
    this.urls = urls
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
  async pageHandler (page: any, params: any): Promise<void> {
    // process the page
  }
}

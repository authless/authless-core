import { Route, RouteConstructor } from '../router'
import { Account } from '../account'
import { SpawnSet } from './spawnSet'

export class Service extends SpawnSet<Account> {
  serviceDomain!: string
  name!: string

  static getRoutes (service, Route: RouteConstructor): Route[] {
    return service.getMatchingUrls().map(url => {
      return new Route('GET', url, service)
    })
  }

  /* eslint-disable-next-line class-methods-use-this */
  getMatchingUrls (): string[] {
    return []
  }

  getRoutes (): Route[] {
    return this.getMatchingUrls().map(url => {
      return new Route('GET', url, this)
    })
  }

  add (account): this {
    if (!(account instanceof Account)) {
      throw new Error('Expected `account` to be instance of Account')
    }
    account.service = this
    super.add(account)
    return this
  }

  spawnAccount (): Account {
    const account = this.spawn()
    if (!(account instanceof Account)) {
      throw new Error('Expected the spawned `account` to be instance of Account. Weird!')
    }
    return account
  }

  async hasCookies (page): Promise<boolean> {
    /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */
    const cookies = await page.cookies(this.serviceDomain || '.')
    return cookies.length >= 1
  }

  async isAuthenticated (page): Promise<boolean> {
    const getCookieUrls = (): string[] => {
      return this.getMatchingUrls()
        .map(url => url.replace('*', ''))
        .map(url => [`http:/${url}`, `https:/${url}`])
        .reduce((a, b) => a.concat(b), [])
    }
    /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */
    const cookies = await page.cookies(...getCookieUrls() || '.')
    return cookies.length >= 1
  }

  /* eslint-disable-next-line class-methods-use-this, no-unused-vars */
  async authenticate (page, account): Promise<boolean> {
    throw new Error('Not implemented')
  }
}

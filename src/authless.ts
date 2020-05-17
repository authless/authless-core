import { Account } from './account'
import { Router } from './router'
import { Service } from './service'
import check from 'check-types'
import http from 'http'

export class Authless {
  router: Router

  constructor (router) {
    if (!(router instanceof Router)) throw new Error('`router` must be instance of Router')
    this.router = router
  }

  /**
   * Use the router to find the service associated with the url
   *
   * @param {String} url - the url for which the route should be found
   * @return {ServiceInterface|Error} - the service associated with the route
   */
  $getServiceFromUrl (url: string): Service {
    const convertToRouterURL = (url): string => {
      const regex = /http:\/|https:\//gum
      return url.replace(regex, '')
    }

    const route = this.router.find('GET', convertToRouterURL(url))
    if (route === null) {
      throw new Error(`Did not find route for ${url}`)
    }
    const service = route.handler(
      {} as http.IncomingMessage,
      {} as http.ServerResponse,
      {},
      {}
    ) as unknown as Service
    if (!(service instanceof Service)) throw new Error(`Expected the service to be a Service instance for route ${url}`)
    return service
  }

  $getService (serviceName: string): Service | undefined {
    if (!this.router.serviceMap.has(serviceName)) {
      throw new Error(`No registered service found for: ${serviceName}`)
    }
    return this.router.serviceMap.get(serviceName)
  }

  listAccounts (): Account[] {
    return [...this.router.serviceMap].reduce((accounts: Account[], [key, service]) => {
      accounts.push(...Array.from<Account>(service))
      return accounts
    }, [])
  }

  /**
   * Return account that can handle the requested url
   * @param url - the target url for which a matching account should be found
   * @returns {AccountInterface|Error} - the account that can handle the url
   */
  findAccountByUrl (url): Account {
    const service = this.$getServiceFromUrl(url)
    return service.spawnAccount()
  }

  /**
   * Return account by its identifier, if it exists
   * ID: serviceName:accountUsername
   * @param {String} id - the identifier for which a matching account should be found
   * @return {AccountInterface|Error} - the account that can handle the url
   */
  findAccountById (id): Account {
    const accountUsername = id.split(':').pop()
    const serviceName = id.split(':').slice(0, -1).join(':')
    const potentialService = this.$getService(serviceName)
    if (typeof potentialService === 'undefined') {
      throw new Error(`Unable to find a registered service for: ${serviceName}`)
    }
    if (typeof potentialService === 'object') {
      const service = Array.from(potentialService)
      const account = service.filter(account => account.username === accountUsername).pop()
      if (account) return account
    }
    throw new Error(`Unable to find a registered account for id: ${id}`)
  }

  /**
   * Return a browser for the specified account
   *
   * ```
   * // call with account
   * authless.useBrowserWithAccount(account, asyncFn);
   * // call with account config
   * authless.useBrowserWithAccount({account, virginProfile: true}, asyncFn);
   * ```
   */
  /* eslint-disable-next-line class-methods-use-this */
  async useBrowserWithAccount (accountObject: {account: Account, virginProfile: boolean}, asyncFn): Promise<any> {
    const getAccount = (conf): [Account, boolean] => {
      if (conf instanceof Account) return [conf, false]
      if (check.object(conf)) {
        if (!(conf.account instanceof Account)) {
          throw new Error('`accountObject.account` must be an Account instance`')
        }
        return [conf.account, accountObject.virginProfile || false]
      }
      throw new Error('`accountObject` must be an Account instance or object')
    }

    const [account, virginProfile] = getAccount(accountObject)
    const browser = await account.launchBrowser(virginProfile)
    return asyncFn(browser).
      then(result => {
      browser.close()
      return result
    }).
      catch(err => {
      try {
        browser.close()
      } catch (_) { }
      throw err
    })
  }
}

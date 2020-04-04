const { Router } = require('./router');
const { Service } = require('./service');
const { Account } = require('./account');
const check = require('check-types');

class Authless {
  constructor (router) {
    if (!(router instanceof Router)) throw new Error('`router` must be instance of Router');
    this.router = router;
  }

  /**
   * Use the router to find the service associated with the url
   *
   * @param {String} url - the url for which the route should be found
   * @return {ServiceInterface|Error} - the service associated with the route
   */
  $getServiceFromUrl (url) {
    const convertToRouterURL = url => {
      const regex = /http:\/|https:\//gum;
      return url.replace(regex, '');
    }

    const route = this.router.find('GET', convertToRouterURL(url));
    if (route === null) {
      throw new Error(`Did not find route for ${url}`);
    }
    const service = route.handler();
    if (!(service instanceof Service)) throw new Error(`Expected the service to be a Service instance for route ${url}`);
    return service
  }

  $getService (serviceName) {
    if (!this.router.serviceMap.has(serviceName)) {
      throw new Error(`No registered service found for: ${serviceName}`);
    }
    return this.router.serviceMap.get(serviceName);
  }

  listAccounts () {
    const accounts = [];
    this.router.serviceMap.forEach(service => accounts.push(...Array.from(service)));
    return accounts;
  }

  /*
   * Return account that can handle the requested url
   * @param {String} url - the target url for which a matching account should be found
   * @return {AccountInterface|Error} - the account that can handle the url
   */
  findAccountByUrl (url) {
    const service = this.$getServiceFromUrl(url);
    return service.spawnAccount();
  }

  /*
   * Return account by its identifier, if it exists
   * ID: serviceName:accountUsername
   * @param {String} id - the identifier for which a matching account should be found
   * @return {AccountInterface|Error} - the account that can handle the url
   */
  findAccountById (id) {
    const accountUsername = id.split(':').pop();
    const serviceName = id.split(':').slice(0, -1).join(':');
    const service = Array.from(this.$getService(serviceName));
    const account = service.filter(account => account.username === accountUsername).pop();
    if (account) return account;
    throw new Error(`Unable to find a registered account for id: ${id}`);
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
  async useBrowserWithAccount (accountObject, asyncFn) {
    const getAccount = (conf) => {
      if (conf instanceof Account) return [conf, false]
      if (check.object(conf)) {
        if (!(conf.account instanceof Account)) {
          throw new Error('`accountObject.account` must be an Account instance`');
        }
        return [conf.account, accountObject.virginProfile || false];
      }
      throw new Error('`accountObject` must be an Account instance or object');
    }

    const [account, virginProfile] = getAccount(accountObject);
    const browser = await account.launchBrowser(virginProfile);
    return asyncFn(browser).
      then(result => {
        browser.close();
        return result;
      }).
      catch(err => {
        try {
          browser.close();
        } catch (_) { }
        throw err;
      });
  }
}

module.exports = { Authless };

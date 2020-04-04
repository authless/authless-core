const { SpawnSet } = require('./spawnSet');
const { Account } = require('../account');
const { Route } = require('../router');
const delay = require('delay');

class Service extends SpawnSet {
  static getRoutes (service, Route) {
    if (!(Route.prototype instanceof Route)) {
      throw new Error('Expected `Route` to inherit from Route');
    }

    return service.getMatchingUrls().map(url => {
      return new Route('GET', url, service);
    })
  }

  getRoutes () {
    return this.getMatchingUrls().map(url => {
      return new Route('GET', url, this);
    })
  }

  add (account) {
    if (!(account instanceof Account)) {
      throw new Error('Expected `account` to be instance of Account');
    }
    account.service = this;
    super.add(account);
    return this;
  }

  spawnAccount () {
    const account = this.spawn();
    if (!(account instanceof Account)) {
      throw new Error('Expected the spawned `account` to be instance of Account. Weird!');
    }
    return account;
  }

  async hasCookies (page) {
    const cookies = await page.cookies(this.serviceDomain || '.');
    return cookies.length >= 1
  }

  async isAuthenticated (page) {
    const getCookieUrls = () => {
      return this.getMatchingUrls().
        map(url => url.replace('*', '')).
        map(url => [`http:/${url}`, `https:/${url}`]).
        reduce((a, b) => a.concat(b), []);
    }
    const cookies = await page.cookies(...getCookieUrls() || '.');
    return cookies.length >= 1
  }

  /* eslint-disable-next-line class-methods-use-this, no-unused-vars */
  async authenticate (page, account) {
    throw new Error('Not implemented');
  }
}

module.exports = { Service }

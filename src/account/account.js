const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const pluginProxy = require('puppeteer-extra-plugin-proxy');
const pluginAWS = require('puppeteer-extra-plugin-aws');
const cloneDeep = require('lodash.clonedeep');
const uuid = require('uuid/v4');
const path = require('path');
const debug = require('debug')('authless:account');

class Account {
  constructor (config) {
    if(!config.username) throw new Error('Account requires a username');
    if(!config.password) throw new Error('Account requires a password');
    Object.assign(this, config);
    this.debug = debug.extend(this.username);
  }

  async authenticate (page) {
    return this.service.authenticate(page, this);
  }

  async isAuthenticated (page) {
    const isAuthenticated = await this.service.isAuthenticated(page);
    this.debug('isAuthenticated? %s', isAuthenticated.toString().toUpperCase());
    return isAuthenticated;
  }

  async launchBrowser (virginProfile = false) {
    // puppeteer-extra is a global object, clone it to avoid state fuckups
    const puppeteer = cloneDeep(puppeteerExtra);
    // register stealth
    puppeteer.use(pluginStealth());
    // register proxy optionally
    if (this.proxy) {
      puppeteer.use(pluginProxy(this.proxy));
    }
    // register proxy AWS
    puppeteer.use(pluginAWS());

    let profileDirName = `${this.service.name}-${this.username}`;
    let userDataDir;
    if (virginProfile) profileDirName += `-${uuid()}`;
    if (process.env.CHROME_USER_DATA_DIR) {
      userDataDir = path.resolve(
        path.join(process.env.CHROME_USER_DATA_DIR, profileDirName));
    }

    this.debug(`launching browser with userDataDir: ${userDataDir}`);
    const browser = await puppeteer.launch({userDataDir});
    this.debug(`launched browser: ${await browser.version()}`);
    return browser;
  }

  getRateLimitId () {
    return `${this.service.name}:${this.username}`
  }

  async getRateLimitStatus () {
    let stats = {'remaining': 1000 * 1000, 'reset': null, 'total': 1000 * 1000};
    if (this.rateLimiter) {
      stats = await this.rateLimiter.get({id: this.getRateLimitId(), decrease: false});
    }
    return stats;
  }

  async isThrottled () {
    if (!this.rateLimiter) return false;
    const stats = await this.getRateLimitStatus();
    const remaining = (typeof stats.remaining === 'number')
      ? stats.remaining
      : 0;
    return remaining === 0
  }

  async decreaseRateLimitBy1 () {
    if (this.rateLimiter) {
      await this.rateLimiter.get({id: this.getRateLimitId()});
    }
  }
}

module.exports = { Account }

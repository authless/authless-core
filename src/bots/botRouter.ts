import { IAnonBot, IBot, IBotRouter } from '../types'
import { AnonBot } from './anonBot'

/**
 * Implementation of the IBotRouter interface
 *
 * @beta
 */
export class BotRouter implements IBotRouter {
  botMap: {[url: string]: IBot}

  /**
   * Create a BotRouter instance.
   *
   * @param botMap - The map of url to Bot instance
   * @returns An instance of the BotRouter class
   *
   * @example
   * ```ts
   * const botRouter = new BotRouter({
   *   'www.example.com/basic-access/': new Bot('basic-username', 'basic-password'),
   *   'www.example.com/pro-access/': new Bot('pro-username', 'pro-password'),
   * })
   * ```
   *
   * Internally, we store it as a map of \{url: Bot\}
   * by converting a structure of form
   * ```ts
   * [
   *   Bot1{urls: ['url1', 'url2', 'url3'..]},
   *   Bot2{urls: ['url4', 'url5', 'url6'..]}
   * ]
   * ```
   * to
   * ```ts
   * {
   *   'url1': Bot1,
   *   'url2': Bot1,
   *   'url3': Bot1,
   *   'url4': Bot2,
   *   'url5': Bot2,
   *   'url6': Bot2
   * }
   * ```
   * as it makes it easier to fetch by url
   *
   * @beta
   */
  constructor (bots: IBot[]) {
    if(bots.length === 0) {
      throw new Error('Error: parameter "bots: IBot[]" cannot be empty as there will be no bots to route')
    }
    this.botMap = bots.reduce((acc, bot) => {
      bot.urls.forEach(url => {
        acc[url] = bot
      })
      return acc
    }, {})
  }

  getBotForUrl (url: string): IBot | IAnonBot {
    const matchedUrlKeys = Object.keys(this.botMap)
      .sort((a, b) => a.length - b.length)
      .filter(domainUrl => url.includes(domainUrl))

    if(matchedUrlKeys.length > 0) {
      const matchedUrl = matchedUrlKeys[0]
      if(typeof matchedUrl !== 'undefined') {
        return this.botMap[matchedUrl]
      }
    }
    return new AnonBot()
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - get only if bot.isBelowRateLimit() is true
  getBotByUsername (name: string): IBot | IAnonBot {

    const matchedUrl = Object.keys(this.botMap).find(url => {
      const bot = this.botMap[url]
      return bot.username === name
    })
    if(typeof matchedUrl !== 'undefined') {
      return this.botMap[matchedUrl]
    }
    return new AnonBot()
  }
}

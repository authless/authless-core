import { AnonBot } from '../bots/anonBot'
import { Bot } from '../bots/bot'

/**
 * Manages a pool(zero or more) Bots {@link Bot}
 * Is responsible for rotating the bots used in a round-robin fashion.
 *
 * @beta
 */
export class BotRouter {

  /**
   * A map of urls to Bot instances
   */
  private readonly botMap: {[url: string]: Bot}

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
  constructor (bots: Bot[]) {
    if(bots.length === 0) {
      throw new Error('Error: parameter "bots: Bot[]" cannot be empty as there will be no bots to route')
    }
    this.botMap = bots.reduce((acc, bot) => {
      bot.urls.forEach(url => {
        acc[url] = bot
      })
      return acc
    }, {})
  }

  /**
   * Provides a bot which can handle a particular url
   *
   * @remarks
   * Picks a bot from the pool of {@link Bot} to return one
   * that can handle the url provided and is below the bots' allowed rate-limit
   *
   * @returns a valid bot if found, else returns undefined
   *
   */
  public getBotForUrl (url: string): Bot {
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

  /**
   * Provides a bot with a particular username
   *
   * @remarks
   * Picks a bot from the pool of {@link Bot} which has the username provided
   * that can handle the url provided.
   * This is useful when we want to check if a bot is healthy
   * in term of its usageRate, loginHitCount, captchaHitCount etc
   *
   * @param username - the username string of the bot to get
   * @returns a valid bot if found, else returns undefined
   *
   */
  public getBotByUsername (name: string): Bot {

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

import { IBot, IBotRouter } from '../types'

export class BotRouter implements IBotRouter {
  botMap: {[url: string]: IBot[]}
  botIndices: {[url: string]: number}

  constructor (botMap: {[url: string]: IBot[]}) {
    this.botMap = botMap
    this.botIndices = Object.keys(botMap).reduce((map, url) => {
      map[url] = 0
      return map
    }, {})
  }

  getBotForUrl (url: string): IBot | undefined {
    const matchedUrlKeys = Object.keys(this.botMap)
      .sort((a, b) => a.length - b.length)
      .filter(domainUrl => url.includes(domainUrl))

    if(matchedUrlKeys.length > 0) {
      const matchedUrl = matchedUrlKeys[0]
      const matchedBots = this.botMap[matchedUrlKeys[0]]
      const botIndex = this.botIndices[matchedUrl]
      if(botIndex < matchedBots.length) {
        this.botIndices[matchedUrl] = (this.botIndices[matchedUrl] + 1) % matchedBots.length
        return matchedBots[botIndex]
      }
    }
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - get only if bot.isBelowRateLimit() is true
  getBotByUsername (name: string): IBot | undefined {

    const matchedBots = Object.values(this.botMap)
      .find(bots => {
        return bots.findIndex(bot => bot.username === name) !== -1
      })
    if(typeof matchedBots !== 'undefined' && matchedBots.length > 0) {
      return matchedBots[0]
    }
  }
}
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

  // private incrementBotIndex (): number {
  //   const botIndex = this.botIndex
  //   this.botIndex = (this.botIndex + 1) % this.bots.length
  //   return botIndex
  // }

  getBotForUrl (url: string): IBot | undefined {
    console.log(`url = ${url}`)
    const matchedUrlKeys = Object.keys(this.botMap)
      .sort((a, b) => a.length - b.length)
      .filter(domainUrl => url.includes(domainUrl))

    console.log(`matchedUrlKeys = ${JSON.stringify(matchedUrlKeys)}`)
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

  // getBot (): IBot | undefined {
  //   if(this.botIndex < this.bots.length) {
  //     return this.bots[this.incrementBotIndex()]
  //   }
  // }

  // eslint-disable-next-line no-warning-comments
  // TODO - get only if bot.isBelowRateLimit() is true
  // getBotByUsername (name: string): IBot | undefined {
  //   return this.bots.find(bot => bot.username === name)
  // }
}

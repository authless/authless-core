import { IBot, IBotRouter } from '../types2'

export class BotRouter implements IBotRouter {
  bots: IBot[]
  botIndex = 0

  constructor (bots: IBot[]) {
    this.bots = bots
  }

  private incrementBotIndex (): number {
    const botIndex = this.botIndex
    this.botIndex = (this.botIndex + 1) % this.bots.length
    return botIndex
  }

  getBot (): IBot | undefined {
    if(this.botIndex < this.bots.length) {
      return this.bots[this.incrementBotIndex()]
    }
  }

  // eslint-disable-next-line no-warning-comments
  // TODO - get only if bot.isBelowRateLimit() is true
  getBotByUsername (name: string): IBot | undefined {
    return this.bots.find(bot => bot.username === name)
  }
}

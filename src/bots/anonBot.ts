import { Bot } from './bot'
import { BotConfig } from '../types'

export class AnonBot extends Bot {
  type = 'anonymous'

  constructor (config: BotConfig = {urls: []}) {
    // eslint-disable-next-line no-undefined
    super({...config, urls: [], credentials: undefined})
  }
}

import { Service } from '../service'

export class ServiceDefault extends Service {
  constructor () {
    super()
    this.name = 'default:default'
  }

  getMatchingUrls () {
    return ['/*']
  }
}

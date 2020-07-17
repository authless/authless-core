import { FetchParams, ICache } from '../src/types'
import { AuthlessClient } from '../src/client/client'

const urlParams: FetchParams = {
  serverUrl: 'http://localhost:8080',
  url: 'www.google.com',
  responseFormat: 'json',
}

const cache: ICache = {
  put: async (key: string, data: any) => {
    return 'ok'
  },
  get: async (key: string) => {
    return {'some-url': 'the-data'}
  },
  delete: async (key: string) => {
    return {'deleted-url': 'the-data'}
  },
  deleteAll: async () => {
    return 100
  }
}

test('AuthlessClient is instantiated correctly without cache', () => {
  const bot = new AuthlessClient()
  expect(bot).toBeDefined()
})

test('AuthlessClient is instantiated correctly with cache', () => {
  const bot = new AuthlessClient(cache)
  expect(bot).toBeDefined()
  expect(bot.cache).toBeDefined()
})

test('fetches a URL correctly', () => {
  const bot = new AuthlessClient(cache)
  bot.fetch(urlParams)
    .then(response => {
      expect(response).toBeDefined()
    })
    .catch(err => {
      console.log(err)
    })
})

// -- TODO
// test fetch
// test Cache.put
// test Cache.get
// test Cache.delete
// test Cache.deleteAll

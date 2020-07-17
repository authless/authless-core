import { FetchParams, ICache } from '../src/types'
import { AuthlessClient } from '../src/client/client'

const urlParams: FetchParams = {
  serverUrl: 'http://localhost:8080',
  url: 'www.google.com',
  responseFormat: 'json',
  alphabetSelector: '#some-selector'
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
  const client = new AuthlessClient()
  expect(client).toBeDefined()
})

test('AuthlessClient is instantiated correctly with cache', () => {
  const client = new AuthlessClient(cache)
  expect(client).toBeDefined()
  expect(client.cache).toBeDefined()
})

test('fetches a URL correctly', () => {
  const queryParams = AuthlessClient.makeParams(urlParams)
  expect(queryParams).toBe('u=www.google.com&responseFormat=json&alphabetSelector=#some-selector')
})

test('fetches a URL correctly', () => {
  const client = new AuthlessClient(cache)
  client.fetch(urlParams)
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

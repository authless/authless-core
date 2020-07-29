import { FetchParams, ICache, IResponse } from '../src/types'
import { AuthlessClient } from '../src/client/client'

const urlParams: FetchParams = {
  serverUrl: 'http://localhost:8080',
  url: 'www.google.com',
  responseFormat: 'json',
  alphabetSelector: '#some-selector'
}

const sampleResponse: IResponse = {
  meta: {
    timestamp: Date.now(),
    username: 'some-username'
  },
  page: {
    title: 'Page title',
    url: 'http://www.page-url.com',
    content: '',
    cookies: [],
    viewport: { height: 900, width: 900 },
  },
  main: {
    headers: {},
    url: 'http://www.page-url.com',
    status: 200,
    statusText: 'OK',
    text: '',
    // eslint-disable-next-line no-undefined
    request: undefined,
    fromCache: false,
    fromServiceWorker: false,
    securityDetails: null,
  },
  xhrs: []
}

const cache: ICache = {
  put: async (key: string, data: any) => {
    return 'ok'
  },
  get: async (key: string) => {
    return sampleResponse
  },
  delete: async (key: string) => {
    return sampleResponse
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
  expect(queryParams).toBe('url=www.google.com&responseFormat=json&alphabetSelector=#some-selector')
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

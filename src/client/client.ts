import { FetchParams, ICache, IResponse } from '../types'
import fetch from 'node-fetch'

/**
 * A helper wrapper to access the running Authless-Server
 * and fetch the response {@link IResponse}
 *
 * @remarks
 * Can use a cache {@link ICache} if available and passed to constructor
 *
 * @alpha
 */
export class AuthlessClient {
  cache?: ICache

  /**
   * Takes an optional Cache as a parameter which should satisfy {@link ICache}
   */
  constructor (cache?: ICache) {
    this.cache = cache
  }

  /**
   * Makes a HTTP GET query from the passed URLParams {@link URLParams}
   *
   * @param params - Object from which to generate a stringified HTTP Request query
   */
  static makeParams (params: FetchParams): string {
    let retParams = `url=${params.url}`
    retParams += ['responseFormat', 'inputs', 'alphabetSelector', 'referer', 'username'].reduce((acc, key) => {
      const param = params[key]
      if(typeof param === 'string') {
        return `${acc}&${key}=${encodeURI(param)}`
      }
      return acc
    }, '')
    return retParams
  }

  /**
   * Fetch the response from the running Authless-Server
   *
   * @remarks
   * Will return a cached value if possible dependind on the cache passed
   * to the AuthlessClient constructor
   *
   * @param params - Parameters to access the Authless-Server and scrape the target {@link FetchParams}
   *
   * @example
   * ```ts
   * const client = new AuthlessClient(cache) // cache is optional
   * const authlessResponse = client.fetch({
   *   serverUrl: 'https://your-authless-server-url.com',
   *   url: 'https://url-to-fetch.com',
   *   responseFormat: 'json',
   * })
   * extractOrSave(authlessResponse)
   * ```
   */
  async fetch (params: FetchParams): Promise<IResponse> {
    const cachedData = await this.cache?.get(params.url)
    if(typeof cachedData !== 'undefined' && !(cachedData instanceof Error)) {
      return {
        ...cachedData,
        meta: {
          ...cachedData.meta,
          fromCache: true,
        }
      }
    }
    const query = AuthlessClient.makeParams(params)
    try {
      const response = await fetch(`${params.serverUrl}?${query}`, {
        method: 'GET',
      })
      let data: any = ''
      if(params.responseFormat === 'json') {
        data = await response.json()
      } else {
        data = await response.text()
      }
      // check response status code before saving?
      await this.cache?.put(params.url, data)
      return data
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`-- error in AuthlessClient.fetch(): ${err.message}`)
      throw err
    }
  }
}

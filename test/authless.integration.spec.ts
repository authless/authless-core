import {
  Account,
  AccountConfig,
  Authless,
  Route,
  Router,
  ServiceDefault
} from '../src'
import assertThrows from 'assert-throws-async'

const configObj: AccountConfig = {
  username: 'test@example.com',
  password: 'test'
}

describe('Authless', () => {
  /* eslint-disable-next-line init-declarations */
  let testService
  /* eslint-disable-next-line init-declarations */
  let testRouter

  beforeEach(() => {
    testService = new ServiceDefault()
    testService.add(new Account(configObj))
    testRouter = new Router([
      new Route('GET', '/example.com/*', testService),
      new Route('GET', '/example.com', testService)
    ])
  })

  test('initializes', () => {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const result = new Authless(testRouter)
  })

  describe('.listAccounts', () => {
    test('returns all accounts from all services', () => {
      const secondAccount = new Account({username: '2', password: '2'})
      testService.add(secondAccount)
      const authless = new Authless(testRouter)
      const accounts = authless.listAccounts()
      expect(accounts.every(a => a instanceof Account)).toBe(true)
    })
  })

  describe('.findAccountByUrl', () => {
    describe('valid url', () => {
      test('[valid url] finds the matching account', () => {
        const authless = new Authless(testRouter)
        const account = authless.findAccountByUrl('https://example.com')
        expect(account instanceof Account).toBe(true)
      })
    })

    describe('invalid url', () => {
      it('throws an error', async () => {
        const authless = new Authless(testRouter)
        return await assertThrows(() => {
          return authless.findAccountByUrl('https://not-registered.com')
        }, Error, /Did not find route for/u)
      })
    })
  })

  describe('.findAccountById', () => {
    describe('valid url', () => {
      it('finds the matching account', () => {
        const authless = new Authless(testRouter)
        const account = authless.findAccountById('default:default:test@example.com')
        expect(account instanceof Account).toBe(true)
      })
    })

    describe('invalid url', () => {
      it('throws an error', async () => {
        const authless = new Authless(testRouter)
        return await assertThrows(() => {
          return authless.findAccountById('default:default:not@registered.com')
        }, Error, /Unable to find/u)
      })
    })
  })

  describe('.useBrowserWithAccount', () => {
    it('receives a working Browser', async () => {
      const authless = new Authless(testRouter)
      const account = authless.findAccountByUrl('https://example.com')
      const responseUrl = await authless.useBrowserWithAccount(account, async browser => {
        const page = await browser.newPage()
        await page.goto('https://fb.me', {waitUntil: 'networkidle2'})
        return page.url()
      })
      expect(responseUrl).toBe('https://www.facebook.com/')
    })

    describe('acount browser profile', () => {
      xit('receives the usual account Browser', async () => {
        const authless = new Authless(testRouter)
        const account = authless.findAccountByUrl('https://example.com')

        // set cookies
        await authless.useBrowserWithAccount(account, async browser => {
          const page = await browser.newPage()
          return page.setCookie({
            name: 'test',
            value: '123',
            url: 'https://example.com/test',
            expires: Date.now() + 10000 * 60
          })
        })
        const cookies = await authless.useBrowserWithAccount(account, async browser => {
          const page = await browser.newPage()
          return page.cookies('https://example.com/test')
        })
        expect(cookies.length).toBe(1)
      })
    })

    describe('new, unique browser profile', () => {
      it('receives a virgin Browser', async () => {
        const authless = new Authless(testRouter)
        const account = authless.findAccountByUrl('https://example.com')
        const config = {account, virginProfile: true}
        const cookies = await authless.useBrowserWithAccount(config, async browser => {
          const page = await browser.newPage()
          return page.cookies('.')
        })
        expect(cookies.length).toBe(0)
      })
    })
  })
})

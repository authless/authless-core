/* eslint-env node, mocha */
const assert = require('assert');
const assertThrows = require('assert-throws-async');
const {
  Authless,
  Router,
  Route,
  ServiceDefault,
  Account,
} = require('../src');

const configObj = {
  username: 'test@example.com',
  password: 'test'
}

describe('Authless', () => {
  let testService;
  let testRouter;
  beforeEach(() => {
    testService = new ServiceDefault();
    testService.add(new Account(configObj));
    testRouter = new Router([
      new Route('GET', '/example.com/*', testService),
      new Route('GET', '/example.com', testService)
    ]);
  });

  it('initializes', () => {
    new Authless(testRouter);
  });

  describe('.listAccounts', () => {
    it('returns all accounts from all services', () => {
      const secondAccount = new Account({username: '2', password: '2'});
      testService.add(secondAccount);
      const authless = new Authless(testRouter);
      const accounts = authless.listAccounts();
      assert.equal(accounts.every(a => a instanceof Account), true);
    });
  });

  describe('.findAccountByUrl', () => {
    context('valid url', () => {
      it('finds the matching account', () => {
        const authless = new Authless(testRouter);
        const account = authless.findAccountByUrl('https://example.com');
        assert.equal(account instanceof Account, true, 'Unexpected account');
      });
    });

    context('invalid url', () => {
      it('throws an error', async () => {
        const authless = new Authless(testRouter);
        return assertThrows(() => {
          return authless.findAccountByUrl('https://not-registered.com') },
          Error,
          /Did not find route for/
        );
      });
    });
  });

  describe('.findAccountById', () => {
    context('valid url', () => {
      it('finds the matching account', () => {
        const authless = new Authless(testRouter);
        const account = authless.findAccountById('default:default:test@example.com');
        assert.equal(account instanceof Account, true, 'Unexpected account');
      });
    });

    context('invalid url', () => {
      it('throws an error', async () => {
        const authless = new Authless(testRouter);
        return assertThrows(() => {
          return authless.findAccountById('default:default:not@registered.com') },
          Error,
          /Unable to find/
        );
      });
    });
  });

  describe('.useBrowserWithAccount', () => {
    it('receives a working Browser', async () => {
      const authless = new Authless(testRouter);
      const account = authless.findAccountByUrl('https://example.com');
      const responseUrl = await authless.useBrowserWithAccount(account, async browser => {
        const page = await browser.newPage();
        await page.goto('https://fb.me', {waitUntil: 'networkidle2'});
        return page.url();
      });
      assert.equal(responseUrl, 'https://www.facebook.com/');
    }).timeout(10000);

    context('acount browser profile', () => {
      it('receives the usual account Browser', async () => {
        const authless = new Authless(testRouter);
        const account = authless.findAccountByUrl('https://example.com');

        // set cookies
        await authless.useBrowserWithAccount(account, async browser => {
          const page = await browser.newPage();
          return page.setCookie({
            name: 'test',
            value: '123',
            url: 'https://example.com/test',
            expires: Date.now() + 1000 * 60
          });
        });
        const cookies = await authless.useBrowserWithAccount(account, async browser => {
          const page = await browser.newPage();
          return page.cookies('https://example.com/test');
        });
        assert.equal(cookies.length, 1, 'Expected 1 cookie, but found ' + cookies.length);
      }).timeout(5000);
    });

    context('new, unique browser profile', () => {
      it('receives a virgin Browser', async () => {
        const authless = new Authless(testRouter);
        const account = authless.findAccountByUrl('https://example.com');
        const config = {account, virginProfile: true};
        const cookies = await authless.useBrowserWithAccount(config, async browser => {
          const page = await browser.newPage();
          return page.cookies('.');
        });
        assert.equal(cookies.length, 0, 'Expected no cookies, but found ' + cookies.length);
      }).timeout(5000);
    });
  });
});

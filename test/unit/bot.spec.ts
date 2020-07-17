import { Bot } from '../../src/bots/bot'

const urls = ['www.example.com']
const botConfig = {
  credentials: {
    username: 'username',
    password: 'password'
  },
  urls,
  rateLimit: 100,
  browserConfig: {
    proxy: {
      address: '124.100.100.100',
      port: 9999,
      credentials: {
        username: 'proxy_username',
        password: 'proxy_password'
      }
    }
  }
}

test('Bot is instantiated correctly', () => {
  const bot = new Bot(botConfig)
  expect(bot).toBeDefined()
})

// -- login hit count
test('Login hit count is correctly calculated', () => {

  // simulating 100% login hit count
  const bot1 = new Bot(botConfig)
  bot1.foundLogin(true)
  bot1.foundLogin(true)
  bot1.foundLogin(true)
  bot1.foundLogin(true)
  bot1.foundLogin(true)
  expect(bot1.getLoginHitCount()).toBe(100)

  // simulating 40% login hit count
  const bot2 = new Bot(botConfig)
  bot2.foundLogin(true)
  bot2.foundLogin(true)
  bot2.foundLogin(false)
  bot2.foundLogin(false)
  bot2.foundLogin(false)
  expect(bot2.getLoginHitCount()).toBe(40)
})

test('Captcha hit count is correctly calculated', () => {

  // simulating 100% login hit count
  const bot1 = new Bot(botConfig)
  bot1.foundCaptcha(true)
  bot1.foundCaptcha(true)
  bot1.foundCaptcha(true)
  bot1.foundCaptcha(true)
  bot1.foundCaptcha(true)
  expect(bot1.getCaptchaHitCount()).toBe(100)

  // simulating 60% login hit count
  const bot2 = new Bot(botConfig)
  bot2.foundCaptcha(true)
  bot2.foundCaptcha(true)
  bot2.foundCaptcha(true)
  bot2.foundCaptcha(false)
  bot2.foundCaptcha(false)
  expect(bot2.getCaptchaHitCount()).toBe(60)

})

// -- TODO
test('Rate limiting works ', () => {
  const bot = new Bot(botConfig)
  expect(bot).toBeDefined()
})

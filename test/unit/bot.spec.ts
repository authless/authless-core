import { Bot } from '../../src/bots/bot'

test('Bot is instantiated correctly', () => {
  const bot = new Bot('username', 'password', 100)
  expect(bot).toBeDefined()
})

// -- login hit count
test('Login hit count is correctly calculated', () => {
  const times = Math.ceil(Math.random() * 10)

  const bot1 = new Bot('username', 'password', 100)
  // simulating 100% login hit count
  Array(times).fill(1).forEach(x => {
    bot1.foundLogin(true)
  })
  expect(bot1.getLoginHitCount()).toBe(100)

  const bot2 = new Bot('username', 'password', 100)
  // simulating alternate login hit count
  Array(times).fill(1).forEach((x, i) => {
    if(i % 2 === 0) {
      // console.log('--calling foundLogin(true)')
      bot2.foundLogin(true)
    } else {
      // console.log('--calling foundLogin(false)')
      bot2.foundLogin(false)
    }
  })
  const loginFoundTimes = Array(times).fill(1).filter((x, i) => i % 2 === 0).length
  expect(bot1.getLoginHitCount()).toBe(100 * loginFoundTimes / times)
})

test('Captcha hit count is correctly calculated', () => {
  const bot = new Bot('username', 'password', 100)
  const times = Math.ceil(Math.random() * 10)
  Array(times).fill(1).forEach(x => {
    bot.foundCaptcha(true)
  })
  expect(bot.getCaptchaHitCount()).toBe(100)
})

// -- TODO
test('Rate limiting works ', () => {
  const bot = new Bot('username', 'password', 100)
  expect(bot).toBeDefined()
})

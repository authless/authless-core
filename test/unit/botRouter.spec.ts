import { AnonBot } from '../../src/bots/anonBot'
import { Bot } from '../../src/bots/bot'
import { BotRouter } from '../../src/bots/botRouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const urls1 = ['https://example.com/domain-1', 'https://example.com/domain-2']
const urls2 = ['https://example.com/subdomain/']

const defaultBotConfig = {
  urls: [],
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

const bot1 = new Bot({
  ...defaultBotConfig,
  urls: urls1,
  credentials: { username: 'user1', password: 'pass1'}
})
const bot2 = new Bot({
  ...defaultBotConfig,
  urls: urls2,
  rateLimit: 3,
  credentials: { username: 'user2', password: 'pass2'}
})
const bot3 = new Bot({
  ...defaultBotConfig,
  urls: urls2,
  rateLimit: 10,
  credentials: { username: 'user3', password: 'pass3'}
})

const botRouter = new BotRouter([bot1, bot2, bot3])
// ------------------------- end setup ----------------------------
// ----------------------------------------------------------------

test('create botRouter with multiple bots', () => {
  const br = new BotRouter([bot1, bot2])
  expect(br).toBeDefined()
})

test('get bot when bots is not empty', () => {
  const nonEmptyBot = botRouter.getBotForUrl('https://example.com/domain-1')
  expect(nonEmptyBot).toBeInstanceOf(Bot)
  if(nonEmptyBot instanceof Bot) {
    expect(nonEmptyBot.username).toBe('user1')
  }
})

test('get bot when bots is empty', () => {
  const noBot = botRouter.getBotForUrl('https://example.com/unknown-domain')
  expect(noBot).toBeInstanceOf(AnonBot)
})

test('getBotByUsername when username is available', () => {
  const bot = botRouter.getBotByUsername('user2')
  expect(bot).toBeInstanceOf(Bot)
  if(bot instanceof Bot) {
    expect(bot.urls).toContain(urls2[0])
  }
})

test('getBotByUsername when username is not available', () => {
  const bot = botRouter.getBotByUsername('unknown-user')
  expect(bot).toBeInstanceOf(AnonBot)
})

test('bots are returned based on usage and rate limits', () => {
  // 'user2' has a rate-limit of 3. user3 has a rate-limit of 10
  // it takes 6 tries to use up 'user2' for an hour
  // after that only 'user3' should be returned for 7 tries.
  // any requests for a bot after that should return an AnonBot()

  // use up 3 of 'user2' and 3 of 'user3'
  Array(6).fill(1).forEach((x, index) => {
    expect(
      ['user2', 'user3'].includes(
        botRouter.getBotForUrl(urls2[0]).username ?? 'anon'
      )
    ).toBeTruthy()
  })
  // user2: isBelowRateLimit is false, used up
  expect(botRouter.getBotByUsername('user2').isBelowRateLimit()).toBeFalsy()
  // user3: isBelowRateLimit is true, 7 left this hour
  expect(botRouter.getBotByUsername('user3').isBelowRateLimit()).toBeTruthy()

  // use up 7 of 'user3' which should total to its rate of 10
  Array(7).fill(1).forEach((x, index) => {
    expect(botRouter.getBotForUrl(urls2[0]).username).toBe('user3')
  })
  // user2: isBelowRateLimit is false, used up
  expect(botRouter.getBotByUsername('user2').isBelowRateLimit()).toBeFalsy()
  // user3: isBelowRateLimit is false, used up
  expect(botRouter.getBotByUsername('user3').isBelowRateLimit()).toBeFalsy()

  // no more bots left with their below rate limit
  // only AnonBot() instances wil be returned
  Array(7).fill(1).forEach((x, index) => {
    expect(botRouter.getBotForUrl(urls2[0])).toBeInstanceOf(AnonBot)
  })
})

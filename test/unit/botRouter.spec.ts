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
  credentials: { username: 'user2', password: 'pass2'}
})
const bot3 = new Bot({
  ...defaultBotConfig,
  urls: urls2,
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

test('bots are cycled through', () => {
  const bot1 = botRouter.getBotForUrl('https://example.com/subdomain/')
  const bot2 = botRouter.getBotForUrl('https://example.com/subdomain/')
  const bot3 = botRouter.getBotForUrl('https://example.com/subdomain/')
  expect(bot1).toBeDefined()
  expect(bot2).toBeDefined()
  expect(bot3).toBeDefined()
  expect(bot1.username).not.toBe(bot2.username)
  expect(bot1.username).toBe(bot3.username)
})

import { AnonBot } from '../../src/bots/anonBot'
import { Bot } from '../../src/bots/bot'
import { BotRouter } from '../../src/bots/botrouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const urls1 = ['https://example.com/domain-1', 'https://example.com/domain-2']
const urls2 = ['https://example.com/subdomain/']

const bot1 = new Bot('user1', 'pass1', urls1)
const bot2 = new Bot('user2', 'pass2', urls2)

const botRouter = new BotRouter([bot1, bot2])
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

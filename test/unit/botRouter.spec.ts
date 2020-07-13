import { Bot } from '../../src/bots/bot'
import { BotRouter } from '../../src/bots/botrouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const bots1 = Array(10).fill(1).map((x, i) => {
  return new Bot(`user${i}`, `pass${i}`)
})
const bots2 = Array(8).fill(1).map((x, i) => {
  return new Bot(`altuser${i}`, `altpass${i}`)
})
const botRouter = new BotRouter({
  'https://example.com/domain-1': bots1,
  'https://example.com/domain-2': [],
  'https://example.com/subdomain/': bots2,
})
// ------------------------- end setup ----------------------------
// ----------------------------------------------------------------

test('create botRouter with multiple bots', () => {
  const br = new BotRouter({
    'https://example.com/domain-1': bots1,
    'https://example.com/domain-2': [],
    'https://example.com/subdomain/': bots2,
  })
  expect(br).toBeDefined()
})

test('get bot when bots is not empty', () => {
  const nonEmptyBot = botRouter.getBotForUrl('https://example.com/domain-1')
  expect(nonEmptyBot).toBeDefined()
})

test('get bot when bots is empty', () => {
  const noBot = botRouter.getBotForUrl('https://example.com/domain-2')
  expect(noBot).toBeUndefined()
})

test('getBotByUsername when username is available', () => {
  const bot = botRouter.getBotByUsername('altuser1')
  expect(bot).toBeDefined()
})

test('getBotByUsername when username is not available', () => {
  const bot = botRouter.getBotByUsername('invaliduser')
  expect(bot).toBeUndefined()
})

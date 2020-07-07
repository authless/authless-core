import { Bot } from '../../src/bots/bot'
import { BotRouter } from '../../src/bots/botrouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const times = Math.ceil(Math.random() * 10)
const bots1 = Array(times).fill(1).map((x, i) => {
  return new Bot(`user${i}`, `pass${i}`)
})
const bots2 = Array(times).fill(1).map((x, i) => {
  return new Bot(`altuser${i}`, `altpass${i}`)
})
const botRouter = new BotRouter({
  'url1': bots1,
  'url2': [],
  'url2/subdomain/': bots2,
})
// ------------------------- end setup ----------------------------
// ----------------------------------------------------------------

test('create botRouter with multiple bots', () => {
  const br = new BotRouter({
    'url1': bots1,
    'url2': [],
    'url2/subdomain/': bots2,
  })
  expect(br).toBeDefined()
})

test('get bot when bots is not empty', () => {
  const nonEmptyBot = botRouter.getBotForUrl('url1')
  expect(nonEmptyBot).toBeDefined()
})

test('get bot when bots is empty', () => {
  const noBot = botRouter.getBotForUrl('url2')
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

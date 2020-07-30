import { DomainPath } from '../../src/domainPaths/domainPath'
import { DomainPathRouter } from '../../src/domainPaths/domainPathRouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const dp1 = new DomainPath('first-domainpath')
const dp2 = new DomainPath('alt-domainpath')
const dp3 = new DomainPath('third-domainpath')
const dpRouter = new DomainPathRouter({
  'https://example.com': dp1,
  'https://example.com/2': dp2,
  'https://example.com/subdomain/': dp3,
})
// ----------------------------------------------------------------
// ------------------------- end setup ----------------------------

// -- TODO - should duplicate services(same urls) be allowed?
test('create domainPathRouter', () => {
  const domainName = 'my-domain'
  const domainPath = new DomainPath(domainName)
  expect(domainPath).toBeDefined()
  expect(domainPath.domain).toBe(domainName)
})

test('getDomainPath - when url is present', () => {
  const domainPath = dpRouter.getDomainPath('https://example.com')
  expect(domainPath).toBeDefined()
  expect(domainPath?.domain).toBe('first-domainpath')
})

test('getDomainPath - when url missing', () => {
  const domainPath = dpRouter.getDomainPath('https://example.net/invalid-url')
  expect(domainPath).toBeUndefined()
})

test('getDomainPath - find best url match', () => {
  const url = 'https://example.com/subdomain/resource-name/seo-text'
  const domainPath = dpRouter.getDomainPath(url)
  expect(domainPath).toBeDefined()
  expect(domainPath?.domain).toBe('third-domainpath')
})

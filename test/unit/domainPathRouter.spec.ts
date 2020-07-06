import { DomainPath } from '../../src/domainPaths/domainPath'
import { DomainPathRouter } from '../../src/domainPaths/domainPathRouter'

// ----------------------------------------------------------------
// --------------------------- setup ------------------------------
const dp1 = new DomainPath('domainpath')
const dp2 = new DomainPath('alt-domainpath')
const dp3 = new DomainPath('third-domainpath')
const dpRouter = new DomainPathRouter({
  'url1': dp1,
  'url2': dp2,
  'url2/subdomain/': dp3,
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

test('getDomainPathForUrl - when url is present', () => {
  const domainPath = dpRouter.getDomainPathForUrl('url1')
  expect(domainPath).toBeDefined()
})

test('getDomainPathForUrl - when url missing', () => {
  const domainPath = dpRouter.getDomainPathForUrl('invalid-url')
  expect(domainPath).toBeUndefined()
})

test('getDomainPathForUrl - find best url match', () => {
  const url = 'url2/subdomain/resource-name/seo-text'
  const domainPath = dpRouter.getDomainPathForUrl(url)
  expect(domainPath).toBeDefined()
  expect(domainPath?.domain).toBe('third-domainpath')
})

// -- getdomainPathByUrl - url priority ? TODO should the service with longer url be returned?

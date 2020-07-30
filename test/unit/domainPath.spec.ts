import { DomainPath } from '../../src/domainPaths/domainPath'

test('create domainPath', () => {
  const domainName = 'my-domain'
  const domainPath = new DomainPath(domainName)
  expect(domainPath).toBeDefined()
  expect(domainPath.domain).toBe(domainName)
})

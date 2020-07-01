// import { Test } from '../../src'

test('hello with correct name', () => {
  expect('Hello Jon').toBe('Hello Jon')
})

// ------ tests to do ------
// -- create ServiceRouter - TODO - should duplicate services(same urls) be allowed?
// -- getServiceByUrl - when url missing
// -- getServiceByUrl - when url present
// -- getServiceByUrl - url priority ? TODO should the service with longer url be returned?

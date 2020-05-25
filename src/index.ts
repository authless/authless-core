export { Account } from './account'
export { Service } from './service'
export { Route, Router } from './router'
export { Authless } from './authless'
export { ServiceDefault } from './services'

interface A {
  test (name: string): void
}

interface B {
  b (name: string): void
}

interface C extends A, B {
  c (name: string): void
}

class C implements A {
  constructor () {
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
  }

  cc (): this {
    return this
  }
}

const c = new C()

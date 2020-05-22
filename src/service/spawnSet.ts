/**
 * Extends {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set | Set}  and adds a `spawn` method to rotate through the elements of its Set.
 *
 * @remarks
 * Used in this library to rotate through multiple Accounts.
 *
 * @internal
 */
export class SpawnSet<T> extends Set<T> {
  _spawnCounter: number

  constructor () {
    super()
    this._spawnCounter = 0
  }

  /**
   * Rotates through the Set and returns its elements
   *
   * @returns an element from its set
   */
  spawn (): T {
    const elements = Array.from(this)
    const _elements_ = elements.length
    if (_elements_ > 0) {
      const result = elements[this._spawnCounter % _elements_]
      this._spawnCounter += 1
      return result
    }
    throw new Error('Unable to spawn an element! You must register one first.')
  }
}

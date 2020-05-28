export class SpawnSet<T> extends Set {
  _spawnCounter: number

  constructor () {
    super()
    this._spawnCounter = 0
  }

  /**
   * Rotates through the Set and returns its elements
   *
   * @returns - an item of the Set of type T
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

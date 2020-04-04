class SpawnSet extends Set {
  constructor () {
    super();
    this._spawnCounter = 0;
  }

  /**
   * Rotates through the Set and returns its elements
   *
   * @return {Object}
   */
  spawn () {
    const elements = Array.from(this);
    const _elements_ = elements.length;
    if (_elements_ > 0) {
      const result = elements[this._spawnCounter % _elements_];
      this._spawnCounter += 1;
      return result;
    }
    throw new Error('Unable to spawn an element! You must register one first.');
  }
}

module.exports = { SpawnSet };

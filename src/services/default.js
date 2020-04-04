const { Service } = require('../service');

class ServiceDefault extends Service {
  constructor () {
    super();
    this.name = 'default:default';
  }

  getMatchingUrls () {
    return ['/*'];
  }
}

module.exports = { ServiceDefault };

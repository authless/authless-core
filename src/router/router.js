const FindMyWay = require('find-my-way');
const VError = require('verror');
const { Route } = require('./route.js');

class Router extends FindMyWay {
  constructor (routes) {
    super();
    if (!(routes instanceof Array)) throw new Error('`routes` must be an Array');
    if (routes.length === 0) throw new Error('`routes` must not be empty');
    if (!routes.every(element => element instanceof Route)) {
      const e0 = new Error('expected route elements to be Route instances, but found: ' + routes.map(e => { if (e) return e.constructor.name }));
      const invalidRoutesE = new VError(e0, 'invalid `routes` param');
      throw new VError(invalidRoutesE, 'unable to construct new Router');
    }

    this.serviceMap = new Map();
    routes.forEach(route => {
      this.serviceMap.set(route.service.name, route.service);
       // register the routes
      this.on(route.method, route.path, () => route.service);
    });
  }
}

module.exports = { Router };

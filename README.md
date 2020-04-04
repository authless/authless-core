# Authless
• ![](https://github.com/authless/authless-core/workflows/Node.js%20CI/badge.svg) [![Maintainability](https://api.codeclimate.com/v1/badges/0d08b1e07557c386f3ec/maintainability)](https://codeclimate.com/github/f9mac/authless/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/0d08b1e07557c386f3ec/test_coverage)](https://codeclimate.com/github/f9mac/authless/test_coverage)

A browserless, "Chrome-as-a-service", framework for advanced authentication
management. Featuring a plugin-system through services that allow
customization for various web services.

## Install

```
yarn add authless
# - or -
npm install authless
```

## ENV

- **`CHROME_USER_DATA_DIR`**: If set user data profiles are stored in that directory, otherwise chrome default dir is used. Example: `/path/to/dir/`. Default: `undefined`

## Usage

```javascript
const {
  Authless,
  Account,
  Router,
  Route,
  Service,
  ServiceDefault
} = require('@authless/core');

// initate services
const defaultService = new DefaultService();

// add accounts to services (or do it sometime later)
defaultService.add(new Account(config));

// initiate router with services
const router = new Router([
  ...DefaultService.getRoutes(defaultService, Route),
]);

// and finally, initiate authless
const authless = new Authless(router);
```

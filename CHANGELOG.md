### [1.3.1](https://github.com/authless/authless-core/compare/v1.3.0...v1.3.1) (2020-09-24)


### Bug Fixes

* **bot:** print puppeteer launch options ([1124d18](https://github.com/authless/authless-core/commit/1124d1876c765f66508b70c41c0e642f40c7957c))
* **server:** fix headless timeout ([8bf050b](https://github.com/authless/authless-core/commit/8bf050ba0a5fa99c93e15573262bc13a304cf55f))

## [1.3.0](https://github.com/authless/authless-core/compare/v1.2.1...v1.3.0) (2020-09-23)


### Features

* **client:** remove AuthlessClient -> @authless/client ([43108ac](https://github.com/authless/authless-core/commit/43108acfde46b49adc239a09bb400b173bb4ef76))

### [1.2.1](https://github.com/authless/authless-core/compare/v1.2.0...v1.2.1) (2020-09-09)


### Bug Fixes

* **bot-router:** .getBotForUrl now respects Bot rate-limits ([1f63a1a](https://github.com/authless/authless-core/commit/1f63a1a1456938b9df729487570ac016e48c9f8d))
* **data-dir:** set data-dir per username ([9da491a](https://github.com/authless/authless-core/commit/9da491a48e88f37948a4d827cc0a43f5d40c330b))

## [1.2.0](https://github.com/authless/authless-core/compare/v1.1.0...v1.2.0) (2020-09-07)


### Features

* **bot-router:** dispatch bots based on usage ([cfec03d](https://github.com/authless/authless-core/commit/cfec03da889e0c8f762f2b2dfe5b4a3c64bbcf72))

## [1.1.0](https://github.com/authless/authless-core/compare/v1.0.2...v1.1.0) (2020-07-30)


### Features

* **client:** add basic Authless-Client with cache ([78fbce2](https://github.com/authless/authless-core/commit/78fbce2d66c975061d3c33dfbb0b904bd32bbf51))
* **docs:** replace typedocs -> ms/tsdocs ([19568f0](https://github.com/authless/authless-core/commit/19568f0ed01fdb80705d6769f48f023fef409e76))
* **interception:** option to block domains/resourceTypes ([e3ef998](https://github.com/authless/authless-core/commit/e3ef9982abb647b5b139dbff5b674bf1c498e80d))
* **new-arch:** initial files for v2 based on new architecture ([1508c20](https://github.com/authless/authless-core/commit/1508c20d249f1432085a9437901ae11009228487))
* **resource:** make sha1 take optional arg ([178e5fb](https://github.com/authless/authless-core/commit/178e5fbcc53c0517d87692296b07b06990271fed))
* **response:** add response, resource, entity interfaces ([a8bfd7f](https://github.com/authless/authless-core/commit/a8bfd7fcdc8a85b9b73558b53097b0c78c252cf0))
* **response:** slim response API ([7985769](https://github.com/authless/authless-core/commit/79857694252818c995d7ca5ee83494b7da623c18))


### Bug Fixes

* **build:** add building docs ([dd20246](https://github.com/authless/authless-core/commit/dd20246dbf6a458dcec552e8320483582e20f24e))
* **case:** fix file case when importing ([03e97da](https://github.com/authless/authless-core/commit/03e97dacf766afaf61ce0bfbfc3212a8e57c5feb))
* **client:** append query params to url ([da8a81c](https://github.com/authless/authless-core/commit/da8a81c4ebe2359fbf9cafc5838d20d93aa3182b))
* **client:** await for fetch response processing ([163224c](https://github.com/authless/authless-core/commit/163224c959927e0fe2cf57876d13a80f4785771a))
* **deps:** add ioredis deps ([ef7c13a](https://github.com/authless/authless-core/commit/ef7c13a79e17a22b06bd91bdffec338e59df0577))
* **deps:** fix browser.setMaxListeners issue with stealth plugin ([e28b9d4](https://github.com/authless/authless-core/commit/e28b9d4801eae3aa015bc76946a2982c6ba83732))
* **entrypoint:** fix entry point location ([d33eb92](https://github.com/authless/authless-core/commit/d33eb928a3ead2e7c00582eda0828822aa07569b))
* **intercept:** save all resourceTypes by default ([8ae9249](https://github.com/authless/authless-core/commit/8ae92493cfe029fbaad89e83d9d0d4805545bfd1))
* **libCheck:** skip typescript checking of liibs ([9f4aacc](https://github.com/authless/authless-core/commit/9f4aacc7fadd04ff6bc568153798685f55fd19f1))
* **node-fetch:** pass url as first parameter ([6907641](https://github.com/authless/authless-core/commit/69076419f0b038feec98d4ccda956109e7ea62f4))
* **npm-command:** use prepare instead of prepublish ([ed36a0f](https://github.com/authless/authless-core/commit/ed36a0f7765eb6e3365e7ff994df90c7f663d8eb))
* **package:** fix main/types ([e198f8b](https://github.com/authless/authless-core/commit/e198f8b565f16a432d30e6d6638acacb0327cf2a))
* **server:** close browser after every scrape call ([052bf02](https://github.com/authless/authless-core/commit/052bf0208619285bc204c6eb911f8d01d0bc4b26))
* **server:** fixes for core changes. close page after scrape ([948ebf0](https://github.com/authless/authless-core/commit/948ebf0d19cd60051ab7af50165b71f3ff46b492))
* **server:** pass puppeteerParams to pageHandler ([3bc013d](https://github.com/authless/authless-core/commit/3bc013d8027e8e222069e229b012d6a578bcd94a))
* **server:** set content-type before sending response ([4f20708](https://github.com/authless/authless-core/commit/4f2070897138b7f9f837ac7e63d94e7b925b3203))
* **server:** throw error if bot not found by username ([3cfa701](https://github.com/authless/authless-core/commit/3cfa701e00c24c667d56aed5962a2096f3cba804))
* **tests:** fix fixture and test to check timestamp ([f5bb372](https://github.com/authless/authless-core/commit/f5bb3724d43f42b29310b546cf3c97703f73e4c0))
* **tests:** query param changed from 'u' to 'url' ([191941a](https://github.com/authless/authless-core/commit/191941a355c01e60f114b5682120558275d54169))
* **tests:** remove randomization and fix tests ([a556344](https://github.com/authless/authless-core/commit/a5563442c2fd93ce42e4d823bb85be8246e6c4b7))
* **types:** use null coalescing to provide default params ([6a7d923](https://github.com/authless/authless-core/commit/6a7d9238bce84579ca8d5b71f1b22348a32d3a94))
* **urlparams:** username is not mandatory ([5f25632](https://github.com/authless/authless-core/commit/5f25632ed18713b32ec4bcba9334022e7296fbe9))

## [1.1.0](https://github.com/MichaelHirn/ts-template/compare/v1.0.0...v1.1.0) (2020-05-14)


### Features

* **readme:** add install todo list ([dfdd8d5](https://github.com/MichaelHirn/ts-template/commit/dfdd8d5afe7877518e5d47eeace1a66549369725))

## 1.0.0 (2020-05-14)


### Features

* **npm:** set repository to private ([289813f](https://github.com/MichaelHirn/ts-template/commit/289813f777e2faa85d44bfb16041e29640f947b4))
* provide minimum working code ([1c7ba0b](https://github.com/MichaelHirn/ts-template/commit/1c7ba0b1dc7e6e18cf401db0ec9648b700832439))
* **jest:** add jest testing framework ([dd72928](https://github.com/MichaelHirn/ts-template/commit/dd72928bfbcbeecf2f0a9badd29187be03e5ac04))

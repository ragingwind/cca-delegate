#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

> node module for cca (Chrome Mobile Apps) delegate to use programmatically on gulp/Grunt plug-ins and node modules

## WARNING

It's still in experimental. Currently, cca doesn't support a official way of using cca programmatically in source code. This node module will return result of execution of cca whether true or false after parsing stdio string getting came from cca execution. However the result of execution could be changed by updating of cca that mean is `cca-delegate` could has risk factors

## Install

```sh
$ npm install --save cca-delegate
```

## Methods

`cca-delegate` exports methods with `cca` commands and arguments. You can find more information from [cca](https://www.npmjs.com/package/cca) and [test](./test) at this repository. Options of common execution is based on [exec-then](http://goo.gl/lEn3L8)

- version: `cca --v`
- checkenv: `cca checkenv`,
- create: `cca MyApp com.company.my-app`
- addPlatform: `cca platform add android`
- removePlatform: `cca platform rm android`
- getPlatform: `cca platform ls`
- updatePlatform: `cca platform update android`
- getPlugins: `cca plugin ls`
- searchPlugins: `cca plugin search <keyword>`
- build: `cca build android`
- run: `cca run --debug --watch android` or `cca emulate --debug android`
  + linkto: `String`, You can change www link of cordova project that created with --link-to option
- push: `cca push --target=192.168.0.30`
- packageup: package up for android and chrome with built the project

```js
var ccad = require('cca-delegate');

ccad.version().then(function(res) {
  var version = res.params.version;
});

ccad.run({platform: 'chrome', cwd:'./platform'}).then(function(res) {
  // after job
});

ccad.push({target: '192.168.0.30'}).then(function(res) {
  // after pushing is done
})
```

## Test

We recommend that run from each test for your purpose with ENV options. You can run `test:run` command with PLATFORM and TARGET environment variable for running of application

```
npm run test:config
npm run test:platform
PLATFORM=chrome npm run test:run
TARGET=192.168.0.2 npm run test:run
npm run test:package
```

## License

MIT © [Jimmy Moon](http://github.com/ragingwind)

[npm-url]: https://npmjs.org/package/cca-delegate
[npm-image]: https://badge.fury.io/js/cca-delegate.svg
[travis-url]: https://travis-ci.org/ragingwind/cca-delegate
[travis-image]: https://travis-ci.org/ragingwind/cca-delegate.svg?branch=master
[daviddm-url]: https://david-dm.org/ragingwind/cca-delegate.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/ragingwind/cca-delegate

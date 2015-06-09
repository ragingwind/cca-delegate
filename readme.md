#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

> node module for cca (Chrome Mobile Apps) delegate to use programmatically on gulp/Grunt plug-ins and node modules

## WARNING

It's still in experimental and cca doesn't supports a official way that we can use cca in code programmatic directly. This node module is trying to parse stdio messages getting from result of cca execution. The execution result can be changed follow by any changes of cca updating that mean is `cca-delegate` can be has risk factors

## Install

```sh
$ npm install --save cca-delegate
```

## Methods

`cca-delegate` exported methods matched with `cca` commands and arguments. You can find more information from [cca](https://www.npmjs.com/package/cca) and [test](./test) in this repository. Common execution options based on [exec-then](http://goo.gl/lEn3L8)

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
- push: `cca push --target=192.168.0.30`

```js
var ccad = require('cca-delegate');

ccad.version().then(function(res) {
  var version = res.params.version;
});

ccad.run({platform: 'chrome', cwd: './platform'}).then(function(res) {
  // after job
});

ccad.push({target: '192.168.0.30'}).then(function(res) {
  // after pushing is done
})
```

## License

MIT © [Jimmy Moon](http://github.com/ragingwind)


[npm-url]: https://npmjs.org/package/cca-delegate
[npm-image]: https://badge.fury.io/js/cca-delegate.svg
[travis-url]: https://travis-ci.org/ragingwind/cca-delegate
[travis-image]: https://travis-ci.org/ragingwind/cca-delegate.svg?branch=master
[daviddm-url]: https://david-dm.org/ragingwind/cca-delegate.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/ragingwind/cca-delegate

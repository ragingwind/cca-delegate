#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-url]][daviddm-image]

> node module for cca (Chrome Mobile Apps) delegate to use programmatically on gulp/Grunt plug-ins and node modules

## WARNING

It's still in experimental and cca doesn't supports a official way that we can use in code. This node module try to parse stdio messages from result of execution of cca. The execution result can be changed follow by changes of cca updating that mean is `cca-delegate` can be has risk factors

## Install

```sh
$ npm install --save cca-delegate
```


## Methods

`cca-delegate` exported method matches with `cca` commands. You can find mode information from [cca](https://www.npmjs.com/package/cca) and test in this repository.

- options: Execution options. see [exec-then](http://goo.gl/lEn3L8) for more info.
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


```js
var ccad = require('cca-delegate');

ccad.version().then(function(res) {
  var version = res.params.version;
});
```

## License

MIT © [ragingwind](http://github.com/ragingwind)


[npm-url]: https://npmjs.org/package/cca-delegate
[npm-image]: https://badge.fury.io/js/cca-delegate.svg
[travis-url]: https://travis-ci.org/ragingwind/cca-delegate
[travis-image]: https://travis-ci.org/ragingwind/cca-delegate.svg?branch=master
[daviddm-url]: https://david-dm.org/ragingwind/cca-delegate.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/ragingwind/cca-delegate

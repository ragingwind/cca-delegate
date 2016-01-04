'use strict';

var _ = require('lodash');
var semver = require('semver');

function includes(content, str) {
  return str instanceof RegExp ? str.test(content) :
    _.includes(content, str);
}

function isPackageName(name) {
  return /^([a-zA-Z]{2,10})\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30})\.[a-zA-Z0-9-_]{0,61}/gi.test(name);
}

function isSupportedPlatform(platforms) {
  var res = false;

  if (platforms) {
    _.forEach(_.isArray(platforms) ? platforms : new Array(platforms), function (p) {
      res = /^(android|ios|chrome)$/.test(p);
      return res;
    });
  }

  return res;
}

function getValidSemVer(str) {
  return semver.valid(str.trim());
}

module.exports = {
  includes: includes,
  isPackageName: isPackageName,
  isSupportedPlatform: isSupportedPlatform,
  getValidSemVer: getValidSemVer
};

'use strict';

var spawn = require('child_process').spawn;
var q = require('q');
var nodeExec = require('exec');
var semver = require('semver');

var errorMessages = {
  'checkenv': [
    'properly'
  ],
  'create': [
    'Path already exists',
    'App id contains a reserved word'
  ],
  'platform': [
    'is not a Cordova-based project'
  ]
};

function hasError(cmd, stderr) {
  if (!stderr) return false;

  var errs = errorMessages[cmd];

  for (var i = 0; i < errs.length; ++i) {
    if (stderr.indexOf(errs[i]) !== -1) {
      return true;
    }
  }

  return false;
};

function exec (bin, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }

  nodeExec(bin, opt, function(err, out, code) {
    cb({
      stderr: err, stdout: out, exitcode: code
    });
  });
};

function isPackageName(name) {
  return /^([a-zA-Z]{2,10})\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30})\.[a-zA-Z0-9-_]{0,61}/gi.test(name);
}

function isSupportedPlatform(platform) {
  return /^android$/i.test(platform) || /^ios$/i.test(platform);
}

var ccad = {
  version: function() {
    var deferer = q.defer();
    exec(['cca', '--v'], function(std) {
      std.version = semver.valid(std.stdout.trim());
      if (!std.version) {
        std.err = new Error('cca is not installed');
      }

      deferer[!std.err ? 'resolve' : 'reject'](std);
    });
    return deferer.promise;
  },
	checkenv: function() {
    var deferer = q.defer();

    exec(['cca', 'checkenv'], function(std) {
      var res = null;
      var rx = /(Android|iOS)(.*?)*/gi;

      while ((res = rx.exec(std.stderr)) !== null) {
        if (!/properly/i.test(res[0])) {
          std.err = new Error('Platforms are not properly');
          break;
        }
      }

      deferer[!std.err ? 'resolve' : 'reject'](std);
    });

    return deferer.promise;
	},
  create: function(opt) {
    var deferer = q.defer();

    if (!opt || !opt.directory || !opt.name) {
      throw new Error('Missing arguments to create a project');
    }

    if (!isPackageName(opt.name)) {
      throw new Error('Invalid package name');
    }

    if (opt.platform && isSupportedPlatform(opt.platform)) {
      throw new Error('It is invalid platform ' + opt.platform)
    }

    var args = ['cca', 'create'];

    args.push(opt.directory);
    args.push(opt.name);
    opt.platform && args.push('--' + opt.platform);
    opt.copyFrom && args.push('--copy-from' + opt.copyFrom);
    opt.linkTo && args.push('--link-to' + opt.linkTo);

    exec(args, function(std) {
      if (hasError('create', std.stderr, 0)) {
        std.err = new Error('Project creating failed, Reason: ' + std.stderr);
      }

      deferer[!std.err ? 'resolve' : 'reject'](std);
    });

    return deferer.promise;
  },
  // @todo make args as array
  addPlatform: function(platform) {
    var deferer = q.defer();

    if (!isSupportedPlatform(platform)) {
      throw new Error('It is invalid platform ' + platform)
    }

    var args = ['cca', 'platform', 'add', platform];

    exec(args, function(std) {
      if (hasError('platform', std.stderr)) {
        std.err = new Error('Platform add failed');
      }

      deferer[!std.err ? 'resolve' : 'reject'](std);
    });

    return deferer.promise;
  },
  removePlatforms: function() {},
  getPlatforms: function() {},
  updatePlatforms: function() {},
  addPlugins: function(plugins) {},
  removePlugins: function() {},
  getPlugins: function() {},
  searchPlugins: function() {},
  build: function() {},
  run: function() {},
  push: function() {}
}

module.exports = ccad;

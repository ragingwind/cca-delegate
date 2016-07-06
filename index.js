'use strict';

const path = require('path');
const fs = require('fs');
const q = require('q');
const _ = require('lodash');
const exec = require('exec-then');
const linkto = require('cordova-linkto');
const archiver = require('archiver');
const mkdirp = require('mkdirp');
const cpy = require('cpy');
const execa = require('execa');
const $ = require('./gadget');

let execOptions = {
  verbose: false
};

function setOptions(opt) {
  execOptions = _.merge(execOptions, opt);
}

function getVersion() {
  return execa('cca', ['--v']).then(res => {
    const ret = {
      version: $.getValidSemVer(res.stdout)
    };

    if (!ret.version) {
      throw new Error('cca is not ready');
    }

    return ret;
  });
}

function checkenv() {
  return execa('cca', ['checkenv']).then(res => {
    let re = null;
    const rx = /(Android|iOS)(.*?)*/gi;
    const ret = {
      checkenv: true
    };

    while ((re = rx.exec(res.stderr)) !== null) {
      if (!$.includes(re[0], 'properly')) {
        ret.checkenv = false;
        ret.err = new Error('Platforms are not properly');
        break;
      }
    }

    return ret;
  });
}

function createProject(opt) {
  if (!opt || !opt.directory || !opt.name) {
    throw new Error('Missing arguments to create a project');
  }

  if (!$.isPackageName(opt.name)) {
    throw new Error('Invalid package name');
  }

  if (opt.platform && !$.isSupportedPlatform(opt.platform)) {
    throw new Error('It is invalid platform ' + opt.platform);
  }

  var bin = ['cca', 'create', opt.directory, opt.name];

  if (opt.platform) {
    bin.push('--' + opt.platform);
  }

  if (opt.copyFrom) {
    bin.push('--copy-from=' + opt.copyFrom);
  }

  if (opt.linkTo) {
    bin.push('--link-to=' + opt.linkTo);
  }

  return exec(bin, execOptions, function (std) {
    var ret = {
      created: true
    };
    var errs = [
      'Path already exists',
      'App id contains a reserved word'
    ];

    _.forEach(errs, function (e) {
      if ($.includes(std.stderr, e)) {
        ret.created = false;
        ret.err = new Error('Failed to create a new Project, Reason: ' + std.stderr);
        return false;
      }
    });

    return ret;
  });
}

function doPlatform(subcmd, opt, platform, proc) {
  if (typeof platform === 'function') {
    proc = platform;
    platform = '';
  } else if (!$.isSupportedPlatform(platform)) {
    throw new Error(platform + ' is not supported platform');
  }

  opt = opt ? _.merge(execOptions, opt) : {};

  return exec(['cca', 'platform', subcmd, platform], opt, function (std) {
    return proc(std);
  });
}

function addPlatform(platform, opts) {
  return doPlatform('add', opts, platform, function (std) {
    var ret = {
      added: true
    };

    if ($.includes(std.stderr, 'is not a Cordova-based project')) {
      ret.added = false;
      ret.err = new Error('Failed to add a new Platform');
    }

    return ret;
  });
}

function removePlatform(platform, opts) {
  return doPlatform('rm', opts, platform, function (std) {
    var ret = {
      removed: true
    };

    if (std.stderr) {
      ret.added = false;
      ret.err = new Error('Failed to remove the Platform');
    }

    return ret;
  });
}

function getPlatform(opts) {
  return doPlatform('ls', opts, function (std) {
    var ret = {};

    var res = /(Installed platforms:\W)(.*)/gi.exec(std.stdout);
    if (res && res[2]) {
      ret.platforms = res[2].split(', ');
    }

    return ret;
  });
}

function updatePlatform(platform, opts) {
  return doPlatform('update', opts, platform, function (std) {
    var ret = {};
    var res = /(Android project updated with cordova-android\W)(.*)/gi.exec(std.stdout);
    if (res && res[2]) {
      ret.newVersion = res[2];
    }

    return ret;
  });
}

function getPlugins() {
  return exec(['cca', 'plugin', 'ls'], execOptions, function (std) {
    var ret = {};

    if (!std.stderr) {
      var res = std.stdout.trim().split('\n');

      // Should be more than 1
      if (res.length > 1) {
        ret.plugins = [];
      }

      for (var i = 1; i < res.length; ++i) {
        var p = res[i].split(' ');
        ret.plugins.push({
          id: p[0],
          version: p[1],
          name: /("(.*?)"$)/i.exec(res[i])[0]
        });
      }
    }

    return ret;
  });
}

function build(platforms, opt) {
  var bin = ['cca', 'build'];

  if (platforms) {
    if (!_.isArray(platforms)) {
      platforms = new Array(platforms);
    }

    if (!$.isSupportedPlatform(platforms)) {
      throw new Error('Invalid platforms');
    }

    bin = bin.concat(platforms);
  }

  opt = opt ? _.merge(execOptions, opt) : {};

  return exec(bin, opt, function (std) {
    var ret = {
      build: true
    };

    var buildMessage = {
      android: 'BUILD SUCCESSFUL',
      ios: 'BUILD SUCCEEDED'
    };

    _.forEach(platforms, function (p) {
      if (buildMessage[p]) {
        if (!$.includes(std.stdout, buildMessage[p])) {
          ret.build = false;
          return false;
        }
      }
    });

    return ret;
  });
}

function run(opt) {
  opt = _.merge(execOptions, opt);

  if (!$.isSupportedPlatform(opt.platform)) {
    throw new Error('Invalid platforms');
  }

  var bin = ['cca'];

  if (opt.emulate) {
    bin.push('emulate');
  } else {
    bin.push('run');
  }

  bin.push(opt.platform);

  if (opt.release) {
    bin.push('--release');
  } else {
    bin.push('--debug');
  }

  var deferred = q.defer();
  var runBin = function () {
    exec(bin, opt, function (std) {
      var ret = {
        running: true
      };

      var runMessage = {
        android: [
          'BUILD SUCCESSFUL',
          'LAUNCH SUCCESS'
        ]
      };

      _.forEach(runMessage[opt.platform], function (m) {
        if (!$.includes(std.stdout, m)) {
          ret.running = false;
          return ret.running;
        }
      });

      return ret;
    }).then(function (res) {
      deferred.resolve(res);
    }, function (err) {
      deferred.reject(err);
    });
  };

  if (opt.linkto) {
    linkto(opt.linkto, opt.cwd || process.cwd(), function (err) {
      if (err) {
        return deferred.reject();
      }

      runBin();
    });
  } else {
    runBin();
  }

  return deferred.promise;
}

function push(opt) {
  opt = _.merge(execOptions, opt);
  // %WARN% using usb, which has a lot of issue out of box
  // So it doesn't supports until now
  if (!opt.target) {
    throw new Error('does not supports push via usb now');
  }

  var bin = ['cca', 'push'];

  if (opt.target && opt.port) {
    opt.target += ':' + opt.port;
  }

  if (opt.target) {
    bin.push('--target=' + opt.target);
  }

  // watch mode makes child process running like daemon
  // that mean is child process will not return back immediately
  // so that, we can't get stdio result until child process
  // has been running
  if (opt.watch) {
    bin.push('--watch');
  }

  var deferred = q.defer();
  var pushBin = function () {
    exec(bin, opt, function (std) {
      return {
        pushed: !std.stderr || std.stderr.length === 0
      };
    }).then(function (res) {
      deferred.resolve(res);
    }, function (res) {
      deferred.reject(res);
    });
  };

  if (opt.linkto) {
    linkto(opt.linkto, opt.cwd || process.cwd(), function (err) {
      if (err) {
        return deferred.reject();
      }
      pushBin();
    });
  } else {
    pushBin();
  }

  return deferred.promise;
}

function packageup(dest, opts) {
  if (!dest) {
    throw new Error('dest path is invalid');
  }

  opts = _.merge(execOptions, opts);
  dest = path.resolve(process.cwd(), dest);
  opts.cwd = path.resolve(process.cwd(), opts.cwd);

  // create a path for package
  mkdirp(dest);
  mkdirp(path.join(dest, 'chrome'));
  mkdirp(path.join(dest, 'android'));

  var chromeAppName = 'chromeapp' + (opts.version ? '-' + opts.version : '') + '.zip';
  var deferred = q.defer();

  function zipChromeApp(cb) {
    var archive = archiver('zip');
    var zipfile = fs.createWriteStream(path.join(dest, 'chrome', chromeAppName));

    // zip has been created then resolve a promise
    zipfile.on('close', cb);

    // create a zip for chrome apps with files under www
    archive.pipe(zipfile);
    archive.on('error', cb);
    archive.bulk([{
      expand: true,
      cwd: path.join(opts.cwd, 'www'),
      src: ['**']
    }]);
    archive.finalize();
  }

  // excute package function chains
  zipChromeApp(function () {
    cpy(['*.apk'], path.join(dest, 'android'), {
      cwd: path.join(opts.cwd, 'platforms/android/build/outputs/apk/')
    }).then(() => {
      deferred.resolve();
    }).catch(err => {
      deferred.reject(err);
    });
  });

  return deferred.promise;
}

module.exports = {
  options: setOptions,
  version: getVersion,
  checkenv: checkenv,
  create: createProject,
  addPlatform: addPlatform,
  removePlatform: removePlatform,
  getPlatform: getPlatform,
  updatePlatform: updatePlatform,
  getPlugins: getPlugins,
  build: build,
  run: run,
  push: push,
  packageup: packageup
};

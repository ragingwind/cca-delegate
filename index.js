'use strict';

var spawn = require('child_process').spawn;
var q = require('q');
var _ = require('lodash');
var $ = require('./gadget');
var exec = require('exec-then');

var execOptions = {
  verbose: false
};

function setOptions(opt) {
  execOptions = _.merge(execOptions, opt);
}

function getVersion() {
  return exec('cca --v', execOptions, function(std, de) {
    var ret = {
      version: $.getValidSemVer(std.stdout)
    };

    if (!ret.version) {
      ret.err = new Error('cca is not ready');
    }

    return ret;
  });
}

function checkenv() {
  return exec(['cca', 'checkenv'], execOptions, function(std, de) {
    var res = null;
    var rx = /(Android|iOS)(.*?)*/gi;
    var ret = {
      checkenv: true
    };

    while ((res = rx.exec(std.stderr)) !== null) {
      if (!$.includes(res[0], 'properly')) {
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
    throw new Error('It is invalid platform ' + opt.platform)
  }

  var bin = ['cca', 'create', opt.directory, opt.name];

  opt.platform && bin.push('--' + opt.platform);
  opt.copyFrom && bin.push('--copy-from=' + opt.copyFrom);
  opt.linkTo && bin.push('--link-to=' + opt.linkTo);

  return exec(bin, execOptions, function(std, de) {
    var ret = {
      created: true
    };
    var errs = [
      'Path already exists',
      'App id contains a reserved word'
    ];

    _.forEach(errs, function(e) {
      if ($.includes(std.stderr, e)) {
        ret.created = false;
        ret.err = new Error('Failed to create a new Project, Reason: ' + std.stderr);
        return false;
      }
    });

    return ret;
  });
}

function doPlatform(subcmd, platform, proc) {
  if (typeof platform === 'function') {
    proc = platform;
    platform = '';
  } else {
    if (!$.isSupportedPlatform(platform)) {
      throw new Error(platform + ' is not supported platform');
    }
  }

  return exec(['cca', 'platform', subcmd, platform], execOptions, function(std) {
    return proc(std);
  });
}

function addPlatform(platform) {
  return doPlatform('add', platform, function(std) {
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

function removePlatform(platform) {
  return doPlatform('rm', platform, function(std) {
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

function getPlatform() {
  return doPlatform('ls', function(std) {
    var ret = {};

    var res = /(Installed platforms:\W)(.*)/gi.exec(std.stdout);
    if (res && res[2]) {
      ret.platforms = res[2].split(', ');
    }

    return ret;
  });
}


function updatePlatform(platform) {
  return doPlatform('update', platform, function(std) {
    var ret = {};

    var res = /(Android project is now at version\W)(.*)/gi.exec(std.stdout);
    if (res && res[2]) {
      ret.newVersion = res[2];
    }

    return ret;
  });
}

function getPlugins() {
  return exec(['cca', 'plugin', 'ls'], execOptions, function(std) {
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
          name: /(\"(.*?)\"$)/i.exec(res[i])[0]
        });
      }
    }

    return ret;
  });
}

function searchPlugins(keyword) {
  return exec(['cca', 'plugin', 'search', keyword], execOptions, function(std) {
    var ret = {};

    if (!std.stderr) {
      var res = std.stdout.trim().split('\n');

      // Should be more than 1
      if (res.length > 1) {
        ret.plugins = [];
      }

      for (var i = 1; i < res.length; ++i) {
        var p = res[i].split(' - ');
        ret.plugins.push({
          id: p[0],
          desc: p[1]
        });
      }
    };

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

  return exec(bin, opt, function(std) {
    var ret = {
      build: true
    };

    var buildMessage = {
      'android': 'BUILD SUCCESSFUL',
      'ios': 'BUILD SUCCEEDED'
    };

    _.forEach(platforms, function(p) {
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
  if (!$.isSupportedPlatform(opt.platform)) {
    throw new Error('Invalid platforms');
  }

  // %WARN% ios running is not tested fully so
  // run method doesn't supports ios platform now
  if (!opt.platform === 'ios') {
    throw new Error('does not supports ios now');
  }

  var bin = ['cca'];

  opt.emulate ? bin.push('emulate') : bin.push('run');
  bin.push(opt.platform);
  opt.release ? bin.push('--release') : bin.push('--debug');
  opt = opt ? _.merge(execOptions, opt) : {};

  return exec(bin, opt, function(std) {
    var ret = {
      running: true
    };
    var runMessage = {
      'android': [
        'BUILD SUCCESSFUL',
        'LAUNCH SUCCESS'
      ]
    };

    _.forEach(runMessage[opt.platform], function(m) {
      if (!$.includes(std.stdout, m)) {
        return ret.running = false;
      }
    });

    return ret;
  });
}

function push(opt) {
  // %WARN% using usb, which has a lot of issue out of box
  // So it doesn't supports until now
  if (!opt.target) {
    throw new Error('does not supports push via usb now');
  }

  var bin = ['cca', 'push'];

  if (opt.target && opt.port) {
    opt.target += ':' + opt.port;
  }

  opt.target && bin.push('--target=' + opt.target);
  // watch mode makes child process running like daemon
  // that mean is child process will not return back immediately
  // so that, we can't get stdio result until child process
  // has been running
  opt.watch && bin.push('--watch');
  opt = opt ? _.merge(execOptions, opt) : {};

  return exec(bin, opt, function(std) {
    return {
      pushed: !std.stderr || std.stderr.length === 0
    }
  });
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
  searchPlugins: searchPlugins,
  build: build,
  run: run,
  push: push
};

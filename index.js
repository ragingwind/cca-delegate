'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const cordovaLinkTo = require('cordova-linkto');
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

function execCommand(args, validator) {
  return execa('cca', args).then(res => {
    const ret = validator(res);

    if (ret instanceof Error) {
      throw ret;
    }

    return ret;
  });
}

function getVersion() {
  return execCommand(['--v'], res => {
    const r = $.getValidSemVer(res.stdout);

    return r ? {version: r} : new Error('cca is not ready');
  });
}

function checkenv() {
  return execCommand(['checkenv'], res => {
    const rx = /(Android|iOS)(.*?)*/gi;
    let r = true;
    let re = null;

    while ((re = rx.exec(res.stderr)) !== null) {
      if (!$.includes(re[0], 'properly')) {
        r = false;
        break;
      }
    }

    return r ? {checkenv: r} : new Error('Platforms are not properly');
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

  const args = ['create', opt.directory, opt.name];

  if (opt.platform) {
    args.push('--' + opt.platform);
  }

  if (opt.copyFrom) {
    args.push('--copy-from=' + opt.copyFrom);
  }

  if (opt.linkTo) {
    args.push('--link-to=' + opt.linkTo);
  }

  return execCommand(args, res => {
    const errs = [
      'Path already exists',
      'App id contains a reserved word'
    ];
    const r = errs.every(e => $.notIncludes(res.stderr, e));

    return r ? {created: r} : new Error(`Failed to create a new Project, Reason: ${res.stderr}`);
  });
}

function addPlatform(opts) {
  if (!$.isSupportedPlatform(opts.platform)) {
    throw new Error(opts.platform + ' is not supported platform');
  }

  return execCommand(['platform', 'add', opts.platform], res => {
    const r = $.notIncludes(res.stderr, 'is not a Cordova-based project');

    return r ? {added: r} : new Error('Failed to add a new Platform');
  });
}

function removePlatform(opts) {
  if (!$.isSupportedPlatform(opts.platform)) {
    throw new Error(opts.platform + ' is not supported platform');
  }

  return execCommand(['platform', 'rm', opts.platform], res => {
    const r = res.stderr === null;

    return r ? {removed: r} : new Error('Failed to remove the Platform');
  });
}

function getPlatform() {
  return execCommand(['platform', 'ls'], res => {
    const re = /(Installed platforms:\W)(.*)/gi.exec(res.stdout);

    return re && re[2] ? {platforms: re[2].split(', ')} : new Error('Failed to remove the Platform');
  });
}

function updatePlatform(opts) {
  if (!$.isSupportedPlatform(opts.platform)) {
    throw new Error(opts.platform + ' is not supported platform');
  }

  return execCommand(['platform', 'update', opts.platform], res => {
    const re = /(Android project updated with cordova-android\W)(.*)/gi.exec(res.stdout);

    return re && re[2] ? {newVersion: re[2]} : new Error('Failed to update the Platform');
  });
}

function getPlugins() {
  return execCommand(['plugin', 'ls'], res => {
    let r = null;

    if (!res.stderr) {
      const plugins = res.stdout.trim().split('\n');
      r = {
        plugins: []
      };

      for (let i = 1; i < plugins.length; ++i) {
        const p = plugins[i].split(' ');
        r.plugins.push({
          id: p[0],
          version: p[1],
          name: /("(.*?)"$)/i.exec(plugins[i])[0]
        });
      }
    }

    return r;
  });
}

function build(opts) {
  let args = ['build'];
  const platforms = [];

  platforms.concat(opts.platform);

  if (platforms.length > 0) {
    if (!$.isSupportedPlatform(platforms)) {
      throw new Error('Invalid platforms');
    }

    args = args.concat(platforms);
  }

  return execCommand(args, res => {
    const msgs = {
      android: 'BUILD SUCCESSFUL',
      ios: 'BUILD SUCCEEDED'
    };
    const r = platforms.every(p => $.includes(res.stdout, msgs[p]));

    return r ? {build: r} : new Error('Build has failed');
  });
}

function run(opts) {
  if (!$.isSupportedPlatform(opts.platform)) {
    throw new Error('Invalid platforms');
  }

  const args = [];

  if (opts.emulate) {
    args.push('emulate');
  } else {
    args.push('run');
  }

  args.push(opts.platform);

  if (opts.release) {
    args.push('--release');
  } else {
    args.push('--debug');
  }

  const linkto = opts.linkto ? cordovaLinkTo : function () {
    return Promise.resolve();
  };

  return linkto(opts.linkto, opts.cwd || process.cwd()).then(() => {
    return execCommand(args, res => {
      const msgs = {
        android: [
          'BUILD SUCCESSFUL',
          'LAUNCH SUCCESS'
        ]
      };
      const r = msgs[opts.platform] ? msgs[opts.platform].every(m => $.includes(res.stdout, m)) : true;

      return r ? {running: r} : new Error('Build has been failed');
    });
  });
}

function packageup(dest, opts) {
  if (!dest) {
    throw new Error('dest path is invalid');
  }

  dest = path.resolve(process.cwd(), dest);
  opts.cwd = path.resolve(process.cwd(), opts.cwd);

  // create a path for package
  mkdirp(dest);
  mkdirp(path.join(dest, 'chrome'));
  mkdirp(path.join(dest, 'android'));

  const chromeAppName = `chromeapp${opts.version ? '-' + opts.version : ''}.zip`;

  return new Promise((resolve, reject) => {
    const archive = archiver('zip');
    const zipfile = fs.createWriteStream(path.join(dest, 'chrome', chromeAppName));

    // zip has been created then resolve a promise
    zipfile.on('close', () => {
      cpy(['*.apk'], path.join(dest, 'android'), {
        cwd: path.join(opts.cwd, 'platforms/android/build/outputs/apk/')
      }).then(resolve);
    });

    // create a zip for chrome apps with files under www
    archive.pipe(zipfile);
    archive.on('error', reject);
    archive.bulk([{
      expand: true,
      cwd: path.join(opts.cwd, 'www'),
      src: ['**']
    }]);
    archive.finalize();
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
  build: build,
  run: run,
  packageup: packageup
};

'use strict';

var spawn = require('child_process').spawn;
var q = require('q');
var nodeExec = require('exec');
var semver = require('semver');

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

var ccad = {
  cca: function() {
    var deferer = q.defer();
    exec(['cca', '--v'], function(std) {
      var v = semver.valid(std.stdout.trim());
      if (v) {
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
        if (res[0].indexOf('properly') === -1) {
          std.err = new Error('Platforms are not properly');
          break;
        }
      }

      deferer[!std.err ? 'resolve' : 'reject'](std);
    });

    return deferer.promise;
	},

}

module.exports = ccad;

const path = require('path');

const tmpDir = path.join(__dirname, 'tmp');
const appDir = path.join(__dirname, 'tmp', 'myApp');
const packDir = path.join(__dirname, 'tmp', 'package');

module.exports = {
  tmpd: function () {
    return tmpDir;
  },
  appd: function () {
    return appDir;
  },
  packd: function () {
    return packDir;
  },
  chcwd: function () {
    process.chdir(process.cwd());
  },
  chappd: function () {
    process.chdir(appDir);
  }
};

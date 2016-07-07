const path = require('path');

const tmpDir = path.join(__dirname, 'tmp');
const appDir = path.join(__dirname, 'tmp', 'myApp');

module.exports = {
  tmpd: function () {
    return tmpDir;
  },
  appd: function () {
    return appDir;
  },
  chcwd: function () {
    process.chdir(process.cwd());
  },
  chappd: function () {
    process.chdir(appDir);
  }
};

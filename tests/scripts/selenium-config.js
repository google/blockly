/* eslint-disable */

module.exports = {
  // check for more recent versions of selenium here:
  // https://selenium-release.storage.googleapis.com/index.html
  version: '3.9.1',
  baseURL: 'https://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // https://chromedriver.storage.googleapis.com/index.html
      version: '91.0.4472.19',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    firefox: {
      // check for more recent versions of chrome driver here:
      // https://chromedriver.storage.googleapis.com/index.html
      version: '0.21.0',
      arch: process.arch,
      baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
    },
  },
  requestOpts: { // see https://github.com/request/request#requestoptions-callback
    timeout: 10000
  },
};

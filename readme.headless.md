# Blockly Headless

Running Blockly headless is valuable to allow for server side code generation.

The NodeJS program `app.headless.js` loads Blockly XML from `input.xml` and outputs python code on `stdout`.

### Prerequisites
Be sure to have these installed on your system:
- NodeJS -- http://nodejs.org/
- NPM -- (Bundled with NodeJS)
- closure-library -- http://developers.google.com/blockly/hacking/closure

## Getting Started
1. run `npm install` in the blockly root directory(in the same location as the package.json).
2. run `./build.py` to update the compressed files, as `build.py` **has changed**.
3. run `node app.headless.js`

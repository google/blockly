# Blockly

Google's Blockly is a web-based, visual programming editor. Users can drag
blocks together to build programs. All code is free and open source.

The source for this module is in the [Blockly repo](http://github.com/google/blockly).

## Installation

You can install this package either via `npm` or `unpkg`.

### npm

```bash
npm install blockly
```

### unpkg

```html
<script src="https://unpkg.com/blockly/blockly.min.js"></script>
```

## Example Usage

```js
import Blockly from 'blockly';
Blockly.inject('blocklyDiv', {
    ...
})
```

## Samples

For samples on how to integrate Blockly into your project, view the list of samples at [blockly-samples](https://github.com/google/blockly-samples).

### Importing Blockly

When you import Blockly with `import * as Blockly from 'blockly';` you'll get the default modules:
Blockly core, Blockly built-in blocks, the JavaScript generator and the English lang files.

If you need more flexibility, you'll want to define your imports more carefully:

#### Blockly Core

```js
import * as Blockly from 'blockly/core';
```

#### Blockly built in blocks

```js
import * as libraryBlocks from 'blockly/blocks';
```

#### Blockly Generators

If your application needs to generate code from the Blockly blocks, you'll want to include a generator.

```js
import {pythonGenerator} from 'blockly/python';
```

to include the Python generator. You can also import `{javascriptGenerator} from 'blockly/javascript'`, `{phpGenerator} from 'blockly/php'`, `{dartGenerator} from 'blockly/dart'` and `{luaGenerator} from 'blockly/lua'`.

#### Blockly Languages

```js
import * as Fr from 'blockly/msg/fr';
Blockly.setLocale(Fr);
```

To import the French lang files. Once you've imported the specific lang module, you'll also want to set the locale in Blockly.

For a full list of supported Blockly locales, see: [https://github.com/google/blockly/tree/master/msg/js](https://github.com/google/blockly/tree/master/msg/js)

## License

Apache 2.0

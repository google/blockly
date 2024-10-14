/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

import {callbackFactory} from '../../build/src/core/contextmenu.js';
import * as xmlUtils from '../../build/src/core/utils/xml.js';
import * as Variables from '../../build/src/core/variables.js';

suite('Context Menu', function () {
  setup(function () {
    sharedTestSetup.call(this);

    // Creates a WorkspaceSVG
    const toolbox = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Callback Factory', function () {
    setup(function () {
      this.forLoopBlock = this.workspace.newBlock('controls_for');
    });

    test('callback with xml state creates block', function () {
      const xmlField = Variables.generateVariableFieldDom(
        this.forLoopBlock.getField('VAR').getVariable(),
      );
      const xmlBlock = xmlUtils.createElement('block');
      xmlBlock.setAttribute('type', 'variables_get');
      xmlBlock.appendChild(xmlField);

      const callback = callbackFactory(this.forLoopBlock, xmlBlock);
      const getVarBlock = callback();

      chai.assert.equal(getVarBlock.type, 'variables_get');
      chai.assert.equal(getVarBlock.workspace, this.forLoopBlock.workspace);
      chai.assert.equal(
        getVarBlock.getField('VAR').getVariable().getId(),
        this.forLoopBlock.getField('VAR').getVariable().getId(),
      );
    });

    test('callback with json state creates block', function () {
      const jsonState = {
        type: 'variables_get',
        fields: {VAR: this.forLoopBlock.getField('VAR').saveState(true)},
      };

      const callback = callbackFactory(this.forLoopBlock, jsonState);
      const getVarBlock = callback();

      chai.assert.equal(getVarBlock.type, 'variables_get');
      chai.assert.equal(getVarBlock.workspace, this.forLoopBlock.workspace);
      chai.assert.equal(
        getVarBlock.getField('VAR').getVariable().getId(),
        this.forLoopBlock.getField('VAR').getVariable().getId(),
      );
    });
  });
});

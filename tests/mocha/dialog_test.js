/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite.only('Dialog', function () {
  teardown(function () {
    sinon.restore();
  });

  suite('Prompt', function () {
    test('setPrompt can take in a function with additional parameters', function () {
      const spy = sinon.spy();
      Blockly.dialog.setPrompt(spy);
      const callback = () => {};

      Blockly.dialog.prompt(
        'message',
        'defaultVal',
        callback,
        'extra parameter',
      );

      chai.assert.isTrue(
        spy.calledWith('message', 'defaultVal', callback, 'extra parameter'),
      );
    });
  });

  suite('Confirm', function () {
    test('setConfirm can take in a function with additional parameters', function () {
      const spy = sinon.spy();
      Blockly.dialog.setConfirm(spy);
      const callback = () => {};

      Blockly.dialog.confirm('message', callback, 'extra parameter');

      chai.assert.isTrue(
        spy.calledWith('message', callback, 'extra parameter'),
      );
    });
  });

  suite('Alert', function () {
    test('setAlert can take in a function with additional parameters', function () {
      const spy = sinon.spy();
      Blockly.dialog.setAlert(spy);
      const callback = () => {};

      Blockly.dialog.alert('message', callback, 'extra parameter');

      chai.assert.isTrue(
        spy.calledWith('message', callback, 'extra parameter'),
      );
    });
  });
});

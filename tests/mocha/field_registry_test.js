/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldRegistry');

const {createDeprecationWarningStub} = goog.require('Blockly.test.helpers.warnings');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Field Registry', function() {
  class CustomFieldType extends Blockly.Field {
    constructor(value) {
      super(value);
    }

    static fromJson(options) {
      return new CustomFieldType(options['value']);
    }
  }

  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
    if (Blockly.registry.TEST_ONLY.typeMap['field']['field_custom_test']) {
      delete Blockly.registry.TEST_ONLY.typeMap['field']['field_custom_test'];
    }
  });

  suite('Registration', function() {
    test('Simple', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
    });
    test('fromJson as Key', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register(CustomFieldType.fromJson, '');
      }, 'Invalid name');
    });
    test('No fromJson', function() {
      const fromJson = CustomFieldType.fromJson;
      delete CustomFieldType.fromJson;
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'must have a fromJson function');
      CustomFieldType.fromJson = fromJson;
    });
    test('fromJson not a function', function() {
      const fromJson = CustomFieldType.fromJson;
      CustomFieldType.fromJson = true;
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'must have a fromJson function');
      CustomFieldType.fromJson = fromJson;
    });
  });
  suite('Retrieval', function() {
    test('Simple', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);

      const json = {
        type: 'field_custom_test',
        value: 'ok',
      };

      const field = Blockly.fieldRegistry.fromJson(json);

      chai.assert.isNotNull(field);
      chai.assert.equal(field.getValue(), 'ok');
    });
    test('Not Registered', function() {
      const json = {
        type: 'field_custom_test',
        value: 'ok',
      };

      const spy = sinon.stub(console, 'warn');
      const field = Blockly.fieldRegistry.fromJson(json);
      chai.assert.isNull(field);
      chai.assert.isTrue(spy.called);
      spy.restore();
    });
    test('Case Different', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);

      const json = {
        type: 'FIELD_CUSTOM_TEST',
        value: 'ok',
      };

      const field = Blockly.fieldRegistry.fromJson(json);
      
      chai.assert.isNotNull(field);
      chai.assert.equal(field.getValue(), 'ok');
    });
  });
});

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.fieldRegistry');

const {createDeprecationWarningStub, sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers');


suite('Field Registry', function() {
  function CustomFieldType(value) {
    CustomFieldType.superClass_.constructor.call(this, value);
  }
  Blockly.utils.object.inherits(CustomFieldType, Blockly.Field);
  CustomFieldType.fromJson = function(options) {
    return new CustomFieldType(options['value']);
  };

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
      let fromJson = CustomFieldType.fromJson;
      delete CustomFieldType.fromJson;
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'must have a fromJson function');
      CustomFieldType.fromJson = fromJson;
    });
    test('fromJson not a function', function() {
      let fromJson = CustomFieldType.fromJson;
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

      let json = {
        type: 'field_custom_test',
        value: 'ok'
      };

      let field = Blockly.fieldRegistry.fromJson(json);

      chai.assert.isNotNull(field);
      chai.assert.equal(field.getValue(), 'ok');
    });
    test('Not Registered', function() {
      let json = {
        type: 'field_custom_test',
        value: 'ok'
      };

      let spy = sinon.stub(console, 'warn');
      let field = Blockly.fieldRegistry.fromJson(json);
      chai.assert.isNull(field);
      chai.assert.isTrue(spy.called);
      spy.restore();
    });
    test('Case Different', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);

      let json = {
        type: 'FIELD_CUSTOM_TEST',
        value: 'ok'
      };

      let field = Blockly.fieldRegistry.fromJson(json);
      
      chai.assert.isNotNull(field);
      chai.assert.equal(field.getValue(), 'ok');
    });
  });
});

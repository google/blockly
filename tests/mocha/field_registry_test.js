/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tests for Blockly.fieldRegistry
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

suite('Field Registry', function() {
  function CustomFieldType(value) {
    CustomFieldType.superClass_.constructor.call(this, value);
  }
  Blockly.utils.object.inherits(CustomFieldType, Blockly.Field);
  CustomFieldType.fromJson = function(options) {
    return new CustomFieldType(options['value']);
  };

  teardown(function() {
    if (Blockly.fieldRegistry.typeMap_['field_custom_test']) {
      delete Blockly.fieldRegistry.typeMap_['field_custom_test'];
    }
  });
  suite('Registration', function() {
    test('Simple', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
    });
    test('Empty String Key', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('', CustomFieldType);
      }, 'Invalid field type');
    });
    test('Class as Key', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register(CustomFieldType, '');
      }, 'Invalid field type');
    });
    test('fromJson as Key', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register(CustomFieldType.fromJson, '');
      }, 'Invalid field type');
    });
    test('Overwrite a Key', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'already registered');
    });
    test('Null Value', function() {
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', null);
      }, 'fromJson function');
    });
    test('No fromJson', function() {
      var fromJson = CustomFieldType.fromJson;
      delete CustomFieldType.fromJson;
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'fromJson function');
      CustomFieldType.fromJson = fromJson;
    });
    test('fromJson not a function', function() {
      var fromJson = CustomFieldType.fromJson;
      CustomFieldType.fromJson = true;
      chai.assert.throws(function() {
        Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);
      }, 'fromJson function');
      CustomFieldType.fromJson = fromJson;
    });
  });
  suite('Retrieval', function() {
    test('Simple', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);

      var json = {
        type: 'field_custom_test',
        value: 'ok'
      };

      var field = Blockly.fieldRegistry.fromJson(json);
      chai.assert.isNotNull(field);
      chai.assert.equal('ok', field.getValue());
    });
    test('Not Registered', function() {
      var json = {
        type: 'field_custom_test',
        value: 'ok'
      };

      var spy = sinon.stub(console, 'warn');
      var field = Blockly.fieldRegistry.fromJson(json);
      chai.assert.isNull(field);
      chai.assert.isTrue(spy.called);
      spy.restore();
    });
    test('Case Different', function() {
      Blockly.fieldRegistry.register('field_custom_test', CustomFieldType);

      var json = {
        type: 'FIELD_CUSTOM_TEST',
        value: 'ok'
      };

      var field = Blockly.fieldRegistry.fromJson(json);
      chai.assert.isNotNull(field);
      chai.assert.equal('ok', field.getValue());
    });
  });
});

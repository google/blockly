/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


//import {TestSuite, TestCase, runTestSuites} from '@blockly/dev-tools';

// TODO: Move this into samples as part of the dev-tools package.
/**
 * Constructs a serializer test.
 * @param {string} title The title of this testcase.
 * @param {string} xml The XML to use for the round-trip test.
 * @constructor
 */
function SerializerTestCase(title, xml) {
  this.title = title;
  this.xml = xml;
}
SerializerTestCase.prototype = new testHelpers.TestCase();

/**
 * The XML we want to ensure round-trips through the serializer.
 */
SerializerTestCase.prototype.xml = '';


/**
 * Constructs a serializer test suite.
 * @param {string} title The title of this test suite.
 */
function SerializerTestSuite(title) {
  this.title = title;
}
SerializerTestSuite.prototype = new testHelpers.TestSuite();

var Serializer = new SerializerTestSuite('Serializer');

Serializer.Empty = new SerializerTestCase('Empty',
    '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
);
Serializer.testCases = [Serializer.Empty];

Serializer.Attributes = new SerializerTestSuite('Attributes');
Serializer.Attributes.Basic = new SerializerTestCase('Basic',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.IdChars = new SerializerTestCase('IdChars',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="!#$%()*+,-./:;=?@[]^_" x="42" y="42"></block>' +
    '<block type="logic_negate" id="`{|}~ABCDEFGHIJKLMNO" x="42" y="42"></block>' +
    '<block type="logic_negate" id="OPQRSTUVWXYZabcdefgh" x="42" y="42"></block>' +
    '<block type="logic_negate" id="ijklmnopqrstuvwxyz01" x="42" y="42"></block>' +
    '<block type="logic_negate" id="23456789!#$%()*+,-./" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Collapsed = new SerializerTestCase('Collapsed',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" collapsed="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Disabled = new SerializerTestCase('Disabled',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" disabled="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Deletable = new SerializerTestCase('Deletable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" deletable="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Movable = new SerializerTestCase('Movable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" movable="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Editable = new SerializerTestCase('Editable',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" editable="false" x="42" y="42"></block>' +
    '</xml>');


Serializer.Attributes.Inline = new SerializerTestSuite('Inline');
Serializer.Attributes.Inline.True = new SerializerTestCase('True',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" inline="true" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Inline.False = new SerializerTestCase('False',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" inline="false" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Inline.testCases = [
  Serializer.Attributes.Inline.True,
  Serializer.Attributes.Inline.False,
];

Serializer.Attributes.Coordinates = new SerializerTestSuite('Coordinates');
Serializer.Attributes.Coordinates.Simple = new SerializerTestCase('Simple',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="42" y="42"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.Negative = new SerializerTestCase('Negative',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="-42" y="-42"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.Zero = new SerializerTestCase('Zero',
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="logic_negate" id="id" x="0" y="0"></block>' +
    '</xml>');
Serializer.Attributes.Coordinates.testCases = [
  Serializer.Attributes.Coordinates.Simple,
  Serializer.Attributes.Coordinates.Negative,
  Serializer.Attributes.Coordinates.Zero,
];

Serializer.Attributes.testCases = [
  Serializer.Attributes.Basic,
  Serializer.Attributes.IdChars,
  Serializer.Attributes.Collapsed,
  Serializer.Attributes.Disabled,
  Serializer.Attributes.Deletable,
  Serializer.Attributes.Movable,
  Serializer.Attributes.Editable,
];
Serializer.Attributes.testSuites = [
  Serializer.Attributes.Inline,
  Serializer.Attributes.Coordinates,
];


Serializer.testSuites = [Serializer.Attributes];

var runSerializerTestSuite = (serializer, deserializer, testSuite) => {

  const createTestFunction = function(test) {
    return function() {
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(test.xml), this.workspace);
      if (serializer && deserializer) {
        // do custom serialization and deserialization.
      }
      var newXml = Blockly.Xml.workspaceToDom(this.workspace);
      chai.assert.equal(Blockly.Xml.domToText(newXml), test.xml);
    };
  };

  const createSuiteOrTestFunction = function(suiteOrTest) {
    if (suiteOrTest instanceof testHelpers.TestSuite) {
      return createSuiteOrTestFunction;
    }
    return createTestFunction(suiteOrTest);
  };

  // TODO: Fix after this method is being exported.
  // testHelpers.runTestSuites([testSuite], createTestFunction);
  var runTests = function(suite) {
    if (suite.testSuites && suite.testSuites.length) {
      suite.testSuites.forEach(runTests);
    }
    if (suite.testCases && suite.testCases.length) {
      testHelpers.runTestCases(suite.testCases, createTestFunction);
    }
  };

  suite(testSuite.title, function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
    });

    teardown(function() {
      this.workspace.dispose();
    });

    runTests(testSuite);
  });
};

runSerializerTestSuite(null, null, Serializer);

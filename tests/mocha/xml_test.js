/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

suite('XML', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
  });
  teardown(function() {
    this.workspace.dispose();
  });
  var assertSimpleField = function(fieldDom, name, text) {
    assertEquals(text, fieldDom.textContent);
    assertEquals(name, fieldDom.getAttribute('name'));
  };
  var assertNonSerializingField = function(fieldDom) {
    assertEquals(undefined, fieldDom.childNodes[0]);
  };
  var assertVariableField = function(fieldDom, name, type, id, text) {
    assertEquals(name, fieldDom.getAttribute('name'));
    assertEquals(type, fieldDom.getAttribute('variabletype'));
    assertEquals(id, fieldDom.getAttribute('id'));
    assertEquals(text, fieldDom.textContent);
  };
  suite('Serialization', function() {
    suite('Fields', function() {
      test('Angle', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_angle_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_angle",
              "name": "ANGLE",
              "angle": 90
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_angle_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'ANGLE', '90');
        delete Blockly.Blocks['field_angle_test_block'];
      });
      test('Checkbox', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_checkbox_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_checkbox",
              "name": "CHECKBOX",
              "checked": true
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_checkbox_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'CHECKBOX', 'TRUE');
        delete Blockly.Blocks['field_checkbox_test_block'];
      });
      test('Colour', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_colour_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_colour",
              "name": "COLOUR",
              "colour": '#000099'
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_colour_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'COLOUR', '#000099');
        delete Blockly.Blocks['field_colour_test_block'];
      });
      test('Date', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_date_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_date",
              "name": "DATE",
              "date": "2020-02-20"
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_date_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'DATE', '2020-02-20');
        delete Blockly.Blocks['field_date_test_block'];
      });
      test('Dropdown', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_dropdown_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_dropdown",
              "name": "DROPDOWN",
              "options": [
                [
                  "a",
                  "A"
                ],
                [
                  "b",
                  "B"
                ],
                [
                  "c",
                  "C"
                ]
              ]
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_dropdown_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'DROPDOWN', 'A');
        delete Blockly.Blocks['field_dropdown_test_block'];
      });
      test('Image', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_image_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_image",
              "name": "IMAGE",
              "src": "https://blockly-demo.appspot.com/static/tests/media/a.png",
              "width": 32,
              "height": 32,
              "alt": "A"
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_image_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block);
        assertNonSerializingField(resultFieldDom);
        delete Blockly.Blocks['field_image_test_block'];
      });
      test('Label', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_label_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_label",
              "name": "LABEL",
              "text": "default"
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_label_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block);
        assertNonSerializingField(resultFieldDom);
        delete Blockly.Blocks['field_label_test_block'];
      });
      test('Label Serializable', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_label_serializable_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_label_serializable",
              "name": "LABEL",
              "text": "default"
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_label_serializable_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        console.log(resultFieldDom);
        assertSimpleField(resultFieldDom, 'LABEL', 'default');
        delete Blockly.Blocks['field_label_serializable_test_block'];
      });
      test('Number', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_number_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_number",
              "name": "NUMBER",
              "value": 97
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_number_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'NUMBER', '97');
        delete Blockly.Blocks['field_number_test_block'];
      });
      test('Text Input', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_text_input_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_input",
              "name": "TEXT",
              "text": "default"
            }
          ],
        }]);
        var block = new Blockly.Block(this.workspace,
            'field_text_input_test_block');
        var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertSimpleField(resultFieldDom, 'TEXT', 'default');
      });
      suite('Variable Fields', function() {
        setup(function() {
          Blockly.defineBlocksWithJsonArray([{
            'type': 'field_variable_test_block',
            'message0': '%1',
            'args0': [
              {
                'type': 'field_variable',
                'name': 'VAR',
                'variable': 'item'
              }
            ]
          }]);
        });
        teardown(function() {
          delete Blockly.Blocks['field_variable_test_block'];
        });
        test('Variable Trivial', function() {
          this.workspace.createVariable('name1', '', 'id1');
          var block = new Blockly.Block(this.workspace,
              'field_variable_test_block');
          block.inputList[0].fieldRow[0].setValue('id1');
          var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
          assertVariableField(resultFieldDom, 'VAR', null, 'id1', 'name1');
        });
        test('Variable Default Case', function() {
          var cacheGenUid = Blockly.utils.genUid;
          Blockly.utils.genUid = function() {
            return '1';
          };

          try {
            this.workspace.createVariable('name1');

            Blockly.Events.disable();
            var block = new Blockly.Block(this.workspace,
                'field_variable_test_block');
            block.inputList[0].fieldRow[0].setValue('1');
            Blockly.Events.enable();

            var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
            // Expect type is null and ID is '1' since we don't specify type and ID.
            assertVariableField(resultFieldDom, 'VAR', null, '1', 'name1');
          } finally {
            Blockly.utils.genUid = cacheGenUid;
          }
        });
      });
    });
  });
  suite('Deserialization', function() {
    suite('Dynamic Category Blocks', function() {
      test('Untyped Variables', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "variables_get",
          "message0": "%1",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR",
            }
          ]
        },
        {
          "type": "variables_set",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR"
            },
            {
              "type": "input_value",
              "name": "VALUE"
            }
          ]
        },
        {
          "type": "math_change",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR",
            },
            {
              "type": "input_value",
              "name": "DELTA",
              "check": "Number"
            }
          ]
        },
        {
          "type": "math_number",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "NUM",
            "value": 0
          }],
          "output": "Number"
        }]);

        this.workspace.createVariable('name1', '', 'id1');
        var blocksArray = Blockly.Variables.flyoutCategoryBlocks(this.workspace);
        try {
          for (var i = 0, xml; xml = blocksArray[i]; i++) {
            Blockly.Xml.domToBlock(xml, this.workspace);
          }
        } finally {
          delete Blockly.Blocks['variables_get'];
          delete Blockly.Blocks['variables_set'];
          delete Blockly.Blocks['math_change'];
          delete Blockly.Blocks['math_number'];
        }
      });
      test('Typed Variables', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "variables_get",
          "message0": "%1",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR",
            }
          ]
        },
        {
          "type": "variables_set",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR"
            },
            {
              "type": "input_value",
              "name": "VALUE"
            }
          ]
        },
        {
          "type": "math_change",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_variable",
              "name": "VAR",
            },
            {
              "type": "input_value",
              "name": "DELTA",
              "check": "Number"
            }
          ]
        },
        {
          "type": "math_number",
          "message0": "%1",
          "args0": [{
            "type": "field_number",
            "name": "NUM",
            "value": 0
          }],
          "output": "Number"
        }]);

        this.workspace.createVariable('name1', 'String', 'id1');
        this.workspace.createVariable('name2', 'Number', 'id2');
        this.workspace.createVariable('name3', 'Colour', 'id3');
        var blocksArray = Blockly.VariablesDynamic
            .flyoutCategoryBlocks(this.workspace);
        try {
          for (var i = 0, xml; xml = blocksArray[i]; i++) {
            Blockly.Xml.domToBlock(xml, this.workspace);
          }
        } finally {
          delete Blockly.Blocks['variables_get'];
          delete Blockly.Blocks['variables_set'];
          delete Blockly.Blocks['math_change'];
          delete Blockly.Blocks['math_number'];
        }
      });
    });
  });
});

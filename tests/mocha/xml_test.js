/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.xml');

const {addBlockTypeToCleanup, createGenUidStubWithReturns, sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {assertVariableValues} = goog.require('Blockly.test.helpers.variables');


suite('XML', function() {
  const assertSimpleFieldDom = function(fieldDom, name, text) {
    chai.assert.equal(text, fieldDom.textContent);
    chai.assert.equal(name, fieldDom.getAttribute('name'));
  };
  const assertNonSerializingFieldDom = function(fieldDom) {
    chai.assert.isUndefined(fieldDom.childNodes[0]);
  };
  const assertNonVariableField = function(fieldDom, name, text) {
    assertSimpleFieldDom(fieldDom, name, text);
    chai.assert.isNull(fieldDom.getAttribute('id'), 'id');
    chai.assert.isNull(fieldDom.getAttribute('variabletype'), 'variabletype');
  };
  const assertVariableDomField = function(fieldDom, name, type, id, text) {
    assertSimpleFieldDom(fieldDom, name, text);
    chai.assert.equal(fieldDom.getAttribute('variabletype'), type);
    chai.assert.equal(fieldDom.getAttribute('id'), id);
  };
  const assertVariableDom = function(fieldDom, type, id, text) {
    chai.assert.equal(fieldDom.getAttribute('type'), type);
    chai.assert.equal(fieldDom.getAttribute('id'), id);
    chai.assert.equal(fieldDom.textContent, text);
  };
  setup(function() {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": "",
        "args0": [],
      },
    ]);
    this.complexXmlText = [
      '<xml xmlns="https://developers.google.com/blockly/xml">',
      '  <block type="controls_repeat_ext" inline="true" x="21" y="23">',
      '    <value name="TIMES">',
      '      <block type="math_number">',
      '        <field name="NUM">10</field>',
      '      </block>',
      '    </value>',
      '    <statement name="DO">',
      '      <block type="variables_set" inline="true">',
      '        <field name="VAR">item</field>',
      '        <value name="VALUE">',
      '          <block type="lists_create_empty"></block>',
      '        </value>',
      '        <next>',
      '          <block type="text_print" inline="false">',
      '            <value name="TEXT">',
      '              <block type="text">',
      '                <field name="TEXT">Hello</field>',
      '              </block>',
      '            </value>',
      '          </block>',
      '        </next>',
      '      </block>',
      '    </statement>',
      '  </block>',
      '</xml>'].join('\n');
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suite('textToDom', function() {
    test('Basic', function() {
      const dom = Blockly.Xml.textToDom(this.complexXmlText);
      chai.assert.equal(dom.nodeName, 'xml', 'XML tag');
      chai.assert.equal(dom.getElementsByTagName('block').length, 6, 'Block tags');
    });
  });
  suite('blockToDom', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });
    suite('Fields', function() {
      test('Angle', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_angle_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_angle",
              "name": "ANGLE",
              "angle": 90,
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_angle_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'ANGLE', '90');
      });
      test('Checkbox', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_checkbox_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_checkbox",
              "name": "CHECKBOX",
              "checked": true,
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_checkbox_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'CHECKBOX', 'TRUE');
      });
      test('Colour', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_colour_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_colour",
              "name": "COLOUR",
              "colour": '#000099',
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_colour_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'COLOUR', '#000099');
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
                  "A",
                ],
                [
                  "b",
                  "B",
                ],
                [
                  "c",
                  "C",
                ],
              ],
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_dropdown_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'DROPDOWN', 'A');
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
              "alt": "A",
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_image_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block);
        assertNonSerializingFieldDom(resultFieldDom);
      });
      test('Label', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_label_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_label",
              "name": "LABEL",
              "text": "default",
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_label_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block);
        assertNonSerializingFieldDom(resultFieldDom);
      });
      test('Label Serializable', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_label_serializable_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_label_serializable",
              "name": "LABEL",
              "text": "default",
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_label_serializable_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'LABEL', 'default');
      });
      test('Number', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_number_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_number",
              "name": "NUMBER",
              "value": 97,
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_number_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'NUMBER', '97');
      });
      test('Text Input', function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "field_text_input_test_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_input",
              "name": "TEXT",
              "text": "default",
            },
          ],
        }]);
        const block = new Blockly.Block(this.workspace,
            'field_text_input_test_block');
        const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
        assertNonVariableField(resultFieldDom, 'TEXT', 'default');
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
                'variable': 'item',
              },
            ],
          }]);
        });
        test('Variable Trivial', function() {
          this.workspace.createVariable('name1', '', 'id1');
          const block = new Blockly.Block(this.workspace,
              'field_variable_test_block');
          block.inputList[0].fieldRow[0].setValue('id1');
          const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
          assertVariableDomField(resultFieldDom, 'VAR', null, 'id1', 'name1');
        });
        test('Variable Typed', function() {
          this.workspace.createVariable('name1', 'string', 'id1');
          const block = new Blockly.Block(this.workspace,
              'field_variable_test_block');
          block.inputList[0].fieldRow[0].setValue('id1');
          const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
          assertVariableDomField(resultFieldDom, 'VAR', 'string', 'id1', 'name1');
        });
        test('Variable Default Case', function() {
          createGenUidStubWithReturns('1');
          this.workspace.createVariable('name1');

          Blockly.Events.disable();
          const block = new Blockly.Block(this.workspace,
              'field_variable_test_block');
          block.inputList[0].fieldRow[0].setValue('1');
          Blockly.Events.enable();

          const resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
          // Expect type is null and ID is '1' since we don't specify type and ID.
          assertVariableDomField(resultFieldDom, 'VAR', null, '1', 'name1');
        });
      });
    });
    suite('Comments', function() {
      suite('Headless', function() {
        setup(function() {
          this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block"/>'
          ), this.workspace);
        });
        test('Text', function() {
          this.block.setCommentText('test text');
          const xml = Blockly.Xml.blockToDom(this.block);
          const commentXml = xml.firstChild;
          chai.assert.equal(commentXml.tagName, 'comment');
          chai.assert.equal(commentXml.innerHTML, 'test text');
        });
        test('No Text', function() {
          const xml = Blockly.Xml.blockToDom(this.block);
          chai.assert.isNull(xml.firstChild);
        });
        test('Empty Text', function() {
          this.block.setCommentText('');
          const xml = Blockly.Xml.blockToDom(this.block);
          chai.assert.isNull(xml.firstChild);
        });
      });
      suite('Rendered', function() {
        setup(function() {
          // Let the parent teardown dispose of it.
          this.workspace = Blockly.inject('blocklyDiv', {comments: true});
          this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block"/>'
          ), this.workspace);
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });
        test('Text', function() {
          this.block.setCommentText('test text');
          const xml = Blockly.Xml.blockToDom(this.block);
          const commentXml = xml.firstChild;
          chai.assert.equal(commentXml.tagName, 'comment');
          chai.assert.equal(commentXml.innerHTML, 'test text');
        });
        test('No Text', function() {
          const xml = Blockly.Xml.blockToDom(this.block);
          chai.assert.isNull(xml.firstChild);
        });
        test('Empty Text', function() {
          this.block.setCommentText('');
          const xml = Blockly.Xml.blockToDom(this.block);
          chai.assert.isNull(xml.firstChild);
        });
        test('Size', function() {
          this.block.setCommentText('test text');
          this.block.getCommentIcon().setBubbleSize(100, 200);
          const xml = Blockly.Xml.blockToDom(this.block);
          const commentXml = xml.firstChild;
          chai.assert.equal(commentXml.tagName, 'comment');
          chai.assert.equal(commentXml.getAttribute('w'), 100);
          chai.assert.equal(commentXml.getAttribute('h'), 200);
        });
        test('Pinned True', function() {
          this.block.setCommentText('test text');
          this.block.getCommentIcon().setVisible(true);
          const xml = Blockly.Xml.blockToDom(this.block);
          const commentXml = xml.firstChild;
          chai.assert.equal(commentXml.tagName, 'comment');
          chai.assert.equal(commentXml.getAttribute('pinned'), 'true');
        });
        test('Pinned False', function() {
          this.block.setCommentText('test text');
          const xml = Blockly.Xml.blockToDom(this.block);
          const commentXml = xml.firstChild;
          chai.assert.equal(commentXml.tagName, 'comment');
          chai.assert.equal(commentXml.getAttribute('pinned'), 'false');
        });
      });
    });
  });
  suite('variablesToDom', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      Blockly.defineBlocksWithJsonArray([{
        'type': 'field_variable_test_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_variable',
            'name': 'VAR',
            'variable': 'item',
          },
        ],
      }]);
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });
    test('One Variable', function() {
      createGenUidStubWithReturns('1');
      this.workspace.createVariable('name1');
      const resultDom =
          Blockly.Xml.variablesToDom(this.workspace.getAllVariables());
      chai.assert.equal(resultDom.children.length, 1);
      const resultVariableDom = resultDom.children[0];
      chai.assert.equal(resultVariableDom.textContent, 'name1');
      chai.assert.isNull(resultVariableDom.getAttribute('type'));
      chai.assert.equal(resultVariableDom.getAttribute('id'), '1');
    });
    test('Two Variable one block', function() {
      this.workspace.createVariable('name1', '', 'id1');
      this.workspace.createVariable('name2', 'type2', 'id2');
      // If events are enabled during block construction, it will create a
      // default variable.
      Blockly.Events.disable();
      const block = new Blockly.Block(this.workspace, 'field_variable_test_block');
      block.inputList[0].fieldRow[0].setValue('id1');
      Blockly.Events.enable();

      const resultDom = Blockly.Xml.variablesToDom(this.workspace.getAllVariables());
      chai.assert.equal(resultDom.children.length, 2);
      assertVariableDom(resultDom.children[0], null, 'id1',
          'name1');
      assertVariableDom(resultDom.children[1], 'type2', 'id2',
          'name2');
    });
    test('No variables', function() {
      const resultDom =
          Blockly.Xml.variablesToDom(this.workspace.getAllVariables());
      chai.assert.equal(resultDom.children.length, 0);
    });
  });
  suite('domToText', function() {
    test('Round tripping', function() {
      const dom = Blockly.Xml.textToDom(this.complexXmlText);
      const text = Blockly.Xml.domToText(dom);
      chai.assert.equal(text.replace(/\s+/g, ''),
          this.complexXmlText.replace(/\s+/g, ''), 'Round trip');
    });
  });
  suite('domToPrettyText', function() {
    test('Round tripping', function() {
      const dom = Blockly.Xml.textToDom(this.complexXmlText);
      const text = Blockly.Xml.domToPrettyText(dom);
      chai.assert.equal(text.replace(/\s+/g, ''),
          this.complexXmlText.replace(/\s+/g, ''), 'Round trip');
    });
  });
  suite('domToBlock', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });
    suite('Dynamic Category Blocks', function() {
      test('Untyped Variables', function() {
        this.workspace.createVariable('name1', '', 'id1');
        const blocksArray =
            Blockly.Variables.flyoutCategoryBlocks(this.workspace);
        for (let i = 0, xml; (xml = blocksArray[i]); i++) {
          Blockly.Xml.domToBlock(xml, this.workspace);
        }
      });
      test('Typed Variables', function() {
        this.workspace.createVariable('name1', 'String', 'id1');
        this.workspace.createVariable('name2', 'Number', 'id2');
        this.workspace.createVariable('name3', 'Colour', 'id3');
        const blocksArray =
            Blockly.VariablesDynamic.flyoutCategoryBlocks(this.workspace);
        for (let i = 0, xml; (xml = blocksArray[i]); i++) {
          Blockly.Xml.domToBlock(xml, this.workspace);
        }
      });
    });
    suite('Comments', function() {
      suite('Headless', function() {
        test('Text', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment>test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.equal(block.getCommentText(), 'test text');
        });
        test('No Text', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment></comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.equal(block.getCommentText(), '');
        });
        test('Size', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment w="100" h="200">test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.deepEqual(block.commentModel.size,
              {width: 100, height: 200});
        });
        test('Pinned True', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment pinned="true">test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.isTrue(block.commentModel.pinned);
        });
        test('Pinned False', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment pinned="false">test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.isFalse(block.commentModel.pinned);
        });
        test('Pinned Undefined', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment>test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.isFalse(block.commentModel.pinned);
        });
      });
      suite('Rendered', function() {
        setup(function() {
          this.workspace = Blockly.inject('blocklyDiv', {comments: true});
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });

        test('Text', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment>test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.equal(block.getCommentText(), 'test text');
          chai.assert.isNotNull(block.getCommentIcon());
        });
        test('No Text', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment></comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.equal(block.getCommentText(), '');
          chai.assert.isNotNull(block.getCommentIcon());
        });
        test('Size', function() {
          const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block">' +
              '  <comment w="100" h="200">test text</comment>' +
              '</block>'
          ), this.workspace);
          chai.assert.deepEqual(block.commentModel.size,
              {width: 100, height: 200});
          chai.assert.isNotNull(block.getCommentIcon());
          chai.assert.deepEqual(block.getCommentIcon().getBubbleSize(),
              {width: 100, height: 200});
        });
        suite('Pinned', function() {
          test('Pinned True', function() {
            const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="empty_block">' +
                '  <comment pinned="true">test text</comment>' +
                '</block>'
            ), this.workspace);
            this.clock.runAll();
            chai.assert.isTrue(block.commentModel.pinned);
            chai.assert.isNotNull(block.getCommentIcon());
            chai.assert.isTrue(block.getCommentIcon().isVisible());
          });
          test('Pinned False', function() {
            const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="empty_block">' +
                '  <comment pinned="false">test text</comment>' +
                '</block>'
            ), this.workspace);
            this.clock.runAll();
            chai.assert.isFalse(block.commentModel.pinned);
            chai.assert.isNotNull(block.getCommentIcon());
            chai.assert.isFalse(block.getCommentIcon().isVisible());
          });
          test('Pinned Undefined', function() {
            const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="empty_block">' +
                '  <comment>test text</comment>' +
                '</block>'
            ), this.workspace);
            this.clock.runAll();
            chai.assert.isFalse(block.commentModel.pinned);
            chai.assert.isNotNull(block.getCommentIcon());
            chai.assert.isFalse(block.getCommentIcon().isVisible());
          });
        });
      });
    });
  });
  suite('domToWorkspace', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      Blockly.defineBlocksWithJsonArray([{
        'type': 'field_variable_test_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_variable',
            'name': 'VAR',
            'variable': 'item',
          },
        ],
      }]);
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });
    test('Backwards compatibility', function() {
      createGenUidStubWithReturns('1');
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="field_variable_test_block" id="block_id">' +
          '    <field name="VAR">name1</field>' +
          '  </block>' +
          '</xml>');
      Blockly.Xml.domToWorkspace(dom, this.workspace);
      chai.assert.equal(this.workspace.getAllBlocks(false).length, 1, 'Block count');
      assertVariableValues(this.workspace, 'name1', '', '1');
    });
    test('Variables at top', function() {
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <variables>' +
          '    <variable type="type1" id="id1">name1</variable>' +
          '    <variable type="type2" id="id2">name2</variable>' +
          '    <variable id="id3">name3</variable>' +
          '  </variables>' +
          '  <block type="field_variable_test_block">' +
          '    <field name="VAR" id="id3">name3</field>' +
          '  </block>' +
          '</xml>');
      Blockly.Xml.domToWorkspace(dom, this.workspace);
      chai.assert.equal(this.workspace.getAllBlocks(false).length, 1, 'Block count');
      assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      assertVariableValues(this.workspace, 'name3', '', 'id3');
    });
    test('Variables at top duplicated variables tag', function() {
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <variables>' +
          '  </variables>' +
          '  <variables>' +
          '  </variables>' +
          '</xml>');
      chai.assert.throws(function() {
        Blockly.Xml.domToWorkspace(dom, this.workspace);
      });
    });
    test('Variables at top missing type', function() {
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <variables>' +
          '    <variable id="id1">name1</variable>' +
          '  </variables>' +
          '  <block type="field_variable_test_block">' +
          '    <field name="VAR" id="id1">name3</field>' +
          '  </block>' +
          '</xml>');
      chai.assert.throws(function() {
        Blockly.Xml.domToWorkspace(dom, this.workspace);
      });
    });
    test('Variables at top mismatch block type', function() {
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <variables>' +
          '    <variable type="type1" id="id1">name1</variable>' +
          '  </variables>' +
          '  <block type="field_variable_test_block">' +
          '    <field name="VAR" id="id1">name1</field>' +
          '  </block>' +
          '</xml>');
      chai.assert.throws(function() {
        Blockly.Xml.domToWorkspace(dom, this.workspace);
      });
    });
  });
  suite('appendDomToWorkspace', function() {
    setup(function() {
      addBlockTypeToCleanup(this.sharedCleanup, 'test_block');
      Blockly.Blocks['test_block'] = {
        init: function() {
          this.jsonInit({
            message0: 'test',
          });
        },
      };
      this.workspace = new Blockly.Workspace();
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });
    test('Headless', function() {
      const dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="test_block" inline="true" x="21" y="23">' +
          '  </block>' +
          '</xml>');
      Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
      chai.assert.equal(this.workspace.getAllBlocks(false).length, 1, 'Block count');
      const newBlockIds = Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
      chai.assert.equal(this.workspace.getAllBlocks(false).length, 2, 'Block count');
      chai.assert.equal(newBlockIds.length, 1, 'Number of new block ids');
    });
  });
  suite('workspaceToDom -> domToWorkspace -> workspaceToDom', function() {
    setup(function() {
      const options = {
        comments: true,
      };
      this.renderedWorkspace = Blockly.inject('blocklyDiv', options);
      this.headlessWorkspace =
          new Blockly.Workspace(new Blockly.Options(options));
    });
    teardown(function() {
      workspaceTeardown.call(this, this.renderedWorkspace);
      workspaceTeardown.call(this, this.headlessWorkspace);
    });
    const assertRoundTrip = function(originWs, targetWs) {
      const originXml = Blockly.Xml.workspaceToDom(originWs);
      Blockly.Xml.domToWorkspace(originXml, targetWs);
      const targetXml = Blockly.Xml.workspaceToDom(targetWs);

      const expectedXmlText = Blockly.Xml.domToText(originXml);
      const actualXmlText = Blockly.Xml.domToText(targetXml);

      chai.assert.equal(actualXmlText, expectedXmlText);
    };
    suite('Rendered -> XML -> Headless -> XML', function() {
      test('Comment', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="empty_block"/>'
        ), this.renderedWorkspace);
        block.setCommentText('test text');
        block.getCommentIcon().setBubbleSize(100, 100);
        block.getCommentIcon().setVisible(true);
        assertRoundTrip(this.renderedWorkspace, this.headlessWorkspace);
      });
    });
    suite('Headless -> XML -> Rendered -> XML', function() {
      test('Comment', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="empty_block"/>'
        ), this.headlessWorkspace);
        block.setCommentText('test text');
        block.commentModel.size = new Blockly.utils.Size(100, 100);
        block.commentModel.pinned = true;

        this.clock.runAll();

        assertRoundTrip(this.headlessWorkspace, this.renderedWorkspace);
      });
    });
  });
  suite('generateVariableFieldDom', function() {
    test('Case Sensitive', function() {
      const varId = 'testId';
      const type = 'testType';
      const name = 'testName';

      const mockVariableModel = {
        type: type,
        name: name,
        getId: function() {
          return varId;
        },
      };

      const generatedXml = Blockly.Xml.domToText(
          Blockly.Variables.generateVariableFieldDom(mockVariableModel));
      const expectedXml =
          '<field xmlns="https://developers.google.com/blockly/xml"' +
          ' name="VAR"' +
          ' id="' + varId + '"' +
          ' variabletype="' + type + '"' +
          '>' + name + '</field>';
      chai.assert.equal(generatedXml, expectedXml);
    });
  });
});

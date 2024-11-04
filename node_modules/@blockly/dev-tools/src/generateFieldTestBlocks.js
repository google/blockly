/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field test helper that generates blocks with the field in
 * various configurations.
 * @author samelh@google.com (Sam El-Husseini)
 */

import * as Blockly from 'blockly/core';

/**
 * Generates a number of field testing blocks for a specific field and returns
 * the toolbox xml string.
 * @param {string} fieldName The name of the field.
 * @param {Object|Array<Object>=} options An options object containing a label
 *     and an args map that is passed to the field during initialization.  If an
 *     array is passed, multiple groups of blocks are created each with
 *     different initialization arguments.
 * @returns {string} The toolbox XML string.
 */
export function generateFieldTestBlocks(fieldName, options) {
  if (!Array.isArray(options)) {
    options = [options || {}];
  }

  let id = 0;
  let toolboxXml = '';
  const blocks = [];

  options.forEach((m) => {
    if (m.label) {
      // Add label.
      toolboxXml += `<label text="${m.label}"></label>`;
    }

    // Define a single field block.
    const singleFieldBlock = `${++id}test_${fieldName}_single`;
    blocks.push({
      type: singleFieldBlock,
      message0: '%1',
      args0: [
        {
          type: fieldName,
          name: 'FIELDNAME',
          ...m.args,
          alt: {
            type: 'field_label',
            text: `No ${fieldName}`,
          },
        },
      ],
      output: null,
      style: 'math_blocks',
    });
    toolboxXml += `<block type="${singleFieldBlock}"></block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Define a block and add the 'single field block' as a shadow.
    const parentBlock = `${++id}test_${fieldName}_parent`;
    blocks.push({
      type: `${parentBlock}`,
      message0: 'parent %1',
      args0: [
        {
          type: 'input_value',
          name: 'INPUT',
        },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'loop_blocks',
    });

    toolboxXml += `
  <block type="${id}test_${fieldName}_parent">
      <value name="INPUT">
        <shadow type="${id - 1}test_${fieldName}_single"></shadow>
      </value>
  </block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Define a block with the field on it.
    const blockWithField = `${++id}test_${fieldName}_block`;
    blocks.push({
      type: blockWithField,
      message0: 'block %1',
      args0: [
        {
          type: fieldName,
          name: 'FIELDNAME',
          ...m.args,
          alt: {
            type: 'field_label',
            text: `No ${fieldName}`,
          },
        },
      ],
      output: null,
      style: 'math_blocks',
    });
    toolboxXml += `<block type="${blockWithField}"></block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Add a block that includes the 'block with the field' as a shadow.
    toolboxXml += `
  <block type="${parentBlock}">
      <value name="INPUT">
        <shadow type="${blockWithField}"></shadow>
      </value>
  </block>`;
  });

  Blockly.defineBlocksWithJsonArray(blocks);

  return `<xml xmlns="https://developers.google.com/blockly/xml">
    ${toolboxXml}
    </xml>`;
}

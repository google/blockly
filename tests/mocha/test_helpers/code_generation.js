/* eslint-disable valid-jsdoc */
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.codeGeneration');

const {runTestSuites} = goog.require('Blockly.test.helpers.common');


/**
 * Code generation test case configuration.
 * @implements {TestCase}
 * @record
 */
class CodeGenerationTestCase {
  /**
   * Class for a code generation test case.
   */
  constructor() {
    /**
     * @type {string} The expected code.
     */
    this.expectedCode;
    /**
     * @type {boolean|undefined} Whether to use workspaceToCode instead of
     * blockToCode for test.
     */
    this.useWorkspaceToCode;
    /**
     * @type {number|undefined} The expected inner order.
     */
    this.expectedInnerOrder;
  }

  /**
   * Creates the block to use for this test case.
   * @param {!Blockly.Workspace} workspace The workspace context for this
   *    test.
   * @return {!Blockly.Block} The block to use for the test case.
   */
  createBlock(workspace) {}
}
exports.CodeGenerationTestCase = CodeGenerationTestCase;

/**
 * Code generation test suite.
 * @extends {TestSuite<CodeGenerationTestCase, CodeGenerationTestSuite>}
 * @record
 */
class CodeGenerationTestSuite {
  /**
   * Class for a code generation test suite.
   */
  constructor() {
    /**
     * @type {!Blockly.Generator} The generator to use for running test cases.
     */
    this.generator;
  }
}
exports.CodeGenerationTestSuite = CodeGenerationTestSuite;

/**
 * Returns mocha test callback for code generation based on provided
 *    generator.
 * @param {!Blockly.Generator} generator The generator to use in test.
 * @return {function(!CodeGenerationTestCase):!Function} Function that
 *    returns mocha test callback based on test case.
 * @private
 */
const createCodeGenerationTestFn_ = (generator) => {
  return (testCase) => {
    return function() {
      const block = testCase.createBlock(this.workspace);
      let code;
      let innerOrder;
      if (testCase.useWorkspaceToCode) {
        code = generator.workspaceToCode(this.workspace);
      } else {
        generator.init(this.workspace);
        code = generator.blockToCode(block);
        if (Array.isArray(code)) {
          innerOrder = code[1];
          code = code[0];
        }
      }
      const assertFunc = (typeof testCase.expectedCode === 'string') ?
          chai.assert.equal : chai.assert.match;
      assertFunc(code, testCase.expectedCode);
      if (!testCase.useWorkspaceToCode &&
          testCase.expectedInnerOrder !== undefined) {
        chai.assert.equal(innerOrder, testCase.expectedInnerOrder);
      }
    };
  };
};

/**
 * Runs blockToCode test suites.
 * @param {!Array<!CodeGenerationTestSuite>} testSuites The test suites to run.
 */
const runCodeGenerationTestSuites = (testSuites) => {
  /**
   * Creates function used to generate mocha test callback.
   * @param {!CodeGenerationTestSuite} suiteInfo The test suite information.
   * @return {function(!CodeGenerationTestCase):!Function} Function that
   *    creates mocha test callback.
   */
  const createTestFn = (suiteInfo) => {
    return createCodeGenerationTestFn_(suiteInfo.generator);
  };

  runTestSuites(testSuites, createTestFn);
};
exports.runCodeGenerationTestSuites = runCodeGenerationTestSuites;

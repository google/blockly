/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as commonHelpers from './common_test_helpers.mocha';
import * as blockTestHelpers from './block_test_helpers.mocha';
import * as fieldTestHelpers from './field_test_helpers.mocha';
import * as eventTestHelpers from './event_test_helpers.mocha';

const {TestCase, TestSuite, runTestCases, runTestSuites, captureWarnings} =
  commonHelpers;

const {
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  runCodeGenerationTestSuites,
  runSerializationTestSuite,
  SerializationTestCase,
} = blockTestHelpers;

const {
  assertFieldValue,
  FieldCreationTestCase,
  FieldValueTestCase,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
} = fieldTestHelpers;

const {assertEventFiredShallow, assertEventNotFired} = eventTestHelpers;

export {
  assertEventFiredShallow,
  assertEventNotFired,
  assertFieldValue,
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  FieldCreationTestCase,
  FieldValueTestCase,
  runCodeGenerationTestSuites,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSerializationTestSuite,
  runSetValueTests,
  runTestCases,
  runTestSuites,
  captureWarnings,
  SerializationTestCase,
  TestCase,
  TestSuite,
};

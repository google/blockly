/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

function test_toRadians() {
  var quarter = Math.PI / 2;
  assertEquals('-90', -quarter, Blockly.utils.math.toRadians(-90));
  assertEquals('0', 0, Blockly.utils.math.toRadians(0));
  assertEquals('90', quarter, Blockly.utils.math.toRadians(90));
  assertEquals('180', 2 * quarter, Blockly.utils.math.toRadians(180));
  assertEquals('270', 3 * quarter, Blockly.utils.math.toRadians(270));
  assertEquals('360', 4 * quarter, Blockly.utils.math.toRadians(360));
  assertEquals('450', 5 * quarter, Blockly.utils.math.toRadians(360 + 90));
}

function test_toDegrees() {
  var quarter = Math.PI / 2;
  assertEquals('-90', -90, Blockly.utils.math.toDegrees(-quarter));
  assertEquals('0', 0, Blockly.utils.math.toDegrees(0));
  assertEquals('90', 90, Blockly.utils.math.toDegrees(quarter));
  assertEquals('180', 180, Blockly.utils.math.toDegrees(2 * quarter));
  assertEquals('270', 270, Blockly.utils.math.toDegrees(3 * quarter));
  assertEquals('360', 360, Blockly.utils.math.toDegrees(4 * quarter));
  assertEquals('450', 360 + 90, Blockly.utils.math.toDegrees(5 * quarter));
}

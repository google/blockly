/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Order {
  ATOMIC = 0,         // 0 "" ...
  UNARY_POSTFIX = 1,  // expr++ expr-- () [] . ?.
  UNARY_PREFIX = 2,   // -expr !expr ~expr ++expr --expr
  MULTIPLICATIVE = 3, // * / % ~/
  ADDITIVE = 4,       // + -
  SHIFT = 5,          // << >>
  BITWISE_AND = 6,    // &
  BITWISE_XOR = 7,    // ^
  BITWISE_OR = 8,     // |
  RELATIONAL = 9,     // >= > <= < as is is!
  EQUALITY = 10,      // == !=
  LOGICAL_AND = 11,   // &&
  LOGICAL_OR = 12,    // ||
  IF_NULL = 13,       // ??
  CONDITIONAL = 14,   // expr ? expr : expr
  CASCADE = 15,       // ..
  ASSIGNMENT = 16,    // = *= /= ~/= %= += -= <<= >>= &= ^= |=
  NONE = 99,          // (...)
}

export declare const dartGenerator: any;

export {DartGenerator} from './generators/dart';

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Order {
  ATOMIC = 0,             // 0 "" ...
  COLLECTION = 1,         // tuples, lists, dictionaries
  STRING_CONVERSION = 1,  // `expression...`
  MEMBER = 2.1,           // . []
  FUNCTION_CALL = 2.2,    // ()
  EXPONENTIATION = 3,     // **
  UNARY_SIGN = 4,         // + -
  BITWISE_NOT = 4,        // ~
  MULTIPLICATIVE = 5,     // * / // %
  ADDITIVE = 6,           // + -
  BITWISE_SHIFT = 7,      // << >>
  BITWISE_AND = 8,        // &
  BITWISE_XOR = 9,        // ^
  BITWISE_OR = 10,        // |
  RELATIONAL = 11,        // in, not in, is, is not, >, >=, <>, !=, ==
  LOGICAL_NOT = 12,       // not
  LOGICAL_AND = 13,       // and
  LOGICAL_OR = 14,        // or
  CONDITIONAL = 15,       // if else
  LAMBDA = 16,            // lambda
  NONE = 99,              // (...)
}

export declare const pythonGenerator: any;

export {PythonGenerator} from './generators/python';

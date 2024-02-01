/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Order {
  ATOMIC = 0,             // 0 "" ...
  CLONE = 1,              // clone
  NEW = 1,                // new
  MEMBER = 2.1,           // []
  FUNCTION_CALL = 2.2,    // ()
  POWER = 3,              // **
  INCREMENT = 4,          // ++
  DECREMENT = 4,          // --
  BITWISE_NOT = 4,        // ~
  CAST = 4,               // (int) (float) (string) (array) ...
  SUPPRESS_ERROR = 4,     // @
  INSTANCEOF = 5,         // instanceof
  LOGICAL_NOT = 6,        // !
  UNARY_PLUS = 7.1,       // +
  UNARY_NEGATION = 7.2,   // -
  MULTIPLICATION = 8.1,   // *
  DIVISION = 8.2,         // /
  MODULUS = 8.3,          // %
  ADDITION = 9.1,         // +
  SUBTRACTION = 9.2,      // -
  STRING_CONCAT = 9.3,    // .
  BITWISE_SHIFT = 10,     // << >>
  RELATIONAL = 11,        // < <= > >=
  EQUALITY = 12,          // == != === !== <> <=>
  REFERENCE = 13,         // &
  BITWISE_AND = 13,       // &
  BITWISE_XOR = 14,       // ^
  BITWISE_OR = 15,        // |
  LOGICAL_AND = 16,       // &&
  LOGICAL_OR = 17,        // ||
  IF_NULL = 18,           // ??
  CONDITIONAL = 19,       // ?:
  ASSIGNMENT = 20,        // = += -= *= /= %= <<= >>= ...
  LOGICAL_AND_WEAK = 21,  // and
  LOGICAL_XOR = 22,       // xor
  LOGICAL_OR_WEAK = 23,   // or
  NONE = 99,              // (...)
}

export declare const phpGenerator: any;

export {PhpGenerator} from './generators/php';

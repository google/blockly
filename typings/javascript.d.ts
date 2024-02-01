/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Order {
  ATOMIC = 0,            // 0 "" ...
  NEW = 1.1,             // new
  MEMBER = 1.2,          // . []
  FUNCTION_CALL = 2,     // ()
  INCREMENT = 3,         // ++
  DECREMENT = 3,         // --
  BITWISE_NOT = 4.1,     // ~
  UNARY_PLUS = 4.2,      // +
  UNARY_NEGATION = 4.3,  // -
  LOGICAL_NOT = 4.4,     // !
  TYPEOF = 4.5,          // typeof
  VOID = 4.6,            // void
  DELETE = 4.7,          // delete
  AWAIT = 4.8,           // await
  EXPONENTIATION = 5.0,  // **
  MULTIPLICATION = 5.1,  // *
  DIVISION = 5.2,        // /
  MODULUS = 5.3,         // %
  SUBTRACTION = 6.1,     // -
  ADDITION = 6.2,        // +
  BITWISE_SHIFT = 7,     // << >> >>>
  RELATIONAL = 8,        // < <= > >=
  IN = 8,                // in
  INSTANCEOF = 8,        // instanceof
  EQUALITY = 9,          // == != === !==
  BITWISE_AND = 10,      // &
  BITWISE_XOR = 11,      // ^
  BITWISE_OR = 12,       // |
  LOGICAL_AND = 13,      // &&
  LOGICAL_OR = 14,       // ||
  CONDITIONAL = 15,      // ?:
  ASSIGNMENT = 16,       // = += -= **= *= /= %= <<= >>= ...
  YIELD = 17,            // yield
  COMMA = 18,            // ,
  NONE = 99,             // (...)
}

export declare const javascriptGenerator: any;

export {JavascriptGenerator} from './generators/javascript';

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Order {
  ATOMIC = 0,    // literals
  // The next level was not explicit in documentation and inferred by Ellen.
  HIGH = 1,            // Function calls, tables[]
  EXPONENTIATION = 2,  // ^
  UNARY = 3,           // not # - ~
  MULTIPLICATIVE = 4,  // * / %
  ADDITIVE = 5,        // + -
  CONCATENATION = 6,   // ..
  RELATIONAL = 7,      // < > <=  >= ~= ==
  AND = 8,             // and
  OR = 9,              // or
  NONE = 99,
}

export declare const luaGenerator: any;

export {LuaGenerator} from './generators/lua';

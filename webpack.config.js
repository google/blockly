/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './core/blockly.ts',
  module: {
    rules: [
      {
        test: /\.tsc?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'blockly_compressed.js',
    library: {
      type: 'umd',
      name: 'blockly',
    },
  },
};

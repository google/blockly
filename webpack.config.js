/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const CircularDepencencyPlugin = require('circular-dependency-plugin');

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
  plugins: [
    new CircularDepencencyPlugin({
      include: /core/,
    }),
  ],
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

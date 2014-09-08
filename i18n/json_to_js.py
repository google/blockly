#!/usr/bin/python

# Converts .json files into .js files for use within Blockly apps.
#
# Copyright 2013 Google Inc.
# https://blockly.googlecode.com/
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import codecs      # for codecs.open(..., 'utf-8')
import glob
import json        # for json.load()
import os          # for os.path()
import subprocess  # for subprocess.check_call()
from common import InputError
from common import read_json_file


# Store parsed command-line arguments in global variable.
args = None


def _create_xlf(target_lang):
    """Creates a <target_lang>.xlf file for Soy.

    Args:
        target_lang: The ISO 639 language code for the target language.
            This is used in the name of the file and in the metadata.

    Returns:
        A pointer to a file to which the metadata has been written.

    Raises:
        IOError: An error occurred while opening or writing the file.
    """
    filename = os.path.join(os.curdir, args.output_dir, target_lang + '.xlf')
    out_file = codecs.open(filename, 'w', 'utf-8')
    out_file.write("""<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file original="SoyMsgBundle"
        datatype="x-soy-msg-bundle"
        xml:space="preserve"
        source-language="{0}"
        target-language="{1}">
    <body>""".format(args.source_lang, target_lang))
    return out_file


def _close_xlf(xlf_file):
    """Closes a <target_lang>.xlf file created with create_xlf().

    This includes writing the terminating XML.

    Args:
        xlf_file: A pointer to a file created by _create_xlf().

    Raises:
        IOError: An error occurred while writing to or closing the file.
    """
    xlf_file.write("""
    </body>
  </file>
</xliff>
""")
    xlf_file.close()


def _process_file(path_to_json, target_lang, key_dict):
    """Creates an .xlf file corresponding to the specified .json input file.

    The name of the input file must be target_lang followed by '.json'.
    The name of the output file will be target_lang followed by '.js'.

    Args:
        path_to_json: Path to the directory of xx.json files.
        target_lang: A IETF language code (RFC 4646), such as 'es' or 'pt-br'.
        key_dict: Dictionary mapping Blockly keys (e.g., Maze.turnLeft) to
            Closure keys (hash numbers).

    Raises:
        IOError: An I/O error occurred with an input or output file.
        InputError: Input JSON could not be parsed.
        KeyError: Key found in input file but not in key file.
    """
    keyfile = os.path.join(path_to_json, target_lang + '.json')
    j = read_json_file(keyfile)
    out_file = _create_xlf(target_lang)
    for key in j:
        if key != '@metadata':
            try:
                identifier = key_dict[key]
            except KeyError, e:
                print('Key "%s" is in %s but not in %s' %
                      (key, keyfile, args.key_file))
                raise e
            target = j.get(key)
            out_file.write(u"""
      <trans-unit id="{0}" datatype="html">
        <target>{1}</target>
      </trans-unit>""".format(identifier, target))
    _close_xlf(out_file)


def main():
    """Parses arguments and iterates over files."""

    # Set up argument parser.
    parser = argparse.ArgumentParser(description='Convert JSON files to JS.')
    parser.add_argument('--source_lang', default='en',
                        help='ISO 639-1 source language code')
    parser.add_argument('--output_dir', default='generated',
                        help='relative directory for output files')
    parser.add_argument('--key_file', default='json' + os.path.sep + 'keys.json',
                        help='relative path to input keys file')
    parser.add_argument('--template', default='template.soy')
    parser.add_argument('--path_to_jar',
                        default='..' + os.path.sep + 'apps' + os.path.sep
                        + '_soy',
                        help='relative path from working directory to '
                        'SoyToJsSrcCompiler.jar')
    parser.add_argument('files', nargs='+', help='input files')

    # Initialize global variables.
    global args
    args = parser.parse_args()

    # Make sure output_dir ends with slash.
    if (not args.output_dir.endswith(os.path.sep)):
      args.output_dir += os.path.sep

    # Read in keys.json, mapping descriptions (e.g., Maze.turnLeft) to
    # Closure keys (long hash numbers).
    key_file = open(args.key_file)
    key_dict = json.load(key_file)
    key_file.close()

    # Process each input file.
    print('Creating .xlf files...')
    processed_langs = []
    if len(args.files) == 1:
      # Windows does not expand globs automatically.
      args.files = glob.glob(args.files[0])
    for arg_file in args.files:
      (path_to_json, filename) = os.path.split(arg_file)
      if not filename.endswith('.json'):
        raise InputError(filename, 'filenames must end with ".json"')
      target_lang = filename[:filename.index('.')]
      if not target_lang in ('qqq', 'keys'):
        processed_langs.append(target_lang)
        _process_file(path_to_json, target_lang, key_dict)

    # Output command line for Closure compiler.
    if processed_langs:
      print('Creating .js files...')
      processed_lang_list = ','.join(processed_langs)
      subprocess.check_call([
          'java',
          '-jar', os.path.join(args.path_to_jar, 'SoyToJsSrcCompiler.jar'),
          '--locales', processed_lang_list,
          '--messageFilePathFormat', args.output_dir + '{LOCALE}.xlf',
          '--outputPathFormat', args.output_dir + '{LOCALE}.js',
          '--srcs', args.template])
      if len(processed_langs) == 1:
        print('Created ' + processed_lang_list + '.js in ' + args.output_dir)
      else:
        print('Created {' + processed_lang_list + '}.js in ' + args.output_dir)

      for lang in processed_langs:
        os.remove(args.output_dir + lang + '.xlf')
      print('Removed .xlf files.')


if __name__ == '__main__':
    main()

# Copyright 2021 Google LLC
# SPDX-License-Identifier: Apache-2.0

# Available under the same license as the core Blockly library:
# https://github.com/google/blockly/blob/master/LICENSE


"""Upgrades blocks and fields to be compatible with JSO serialization.
This is a command line script that walks over all of the files in a given
directory, and adds default implementations of JSO serialization hooks if it
detects existing XML hooks.
  Typical usage examples:
  python upgrader.py         : Walks over the files in the pwd
  python upgrader.py ./dir   : Walks over all of the files in the dir directory
"""

import regex
import sys
from os import walk

Match = regex.Match


mutation_to_dom_pattern = regex.compile(
  r'(?P<pre>'            # Start a capture group named pre.
    '(?P<indent>'        # Start a capture group named indent.
      '[^\'"\n]*'        # Match against anything that is not a
                         #   quote or newline 0-many times.
    ')'                  # End indent group.
    '[\'"]?'             # Match against a quote 0-1 times.
  ')'                    # End pre group.
  'mutationToDom'        # Match against the string mutationToDom
  '(?P<suf>.*)'          # Match against any character besides newline 0-many times.
  '(?P<scope>'           # Start a capture group named scope.
    '{'                  # Match against a left brace.
    '([^{}]|(?&scope))*' # Match against any non-brace character,
                         #   or the scope group recursively 0-many times.
    '}'                  # Match against a right brace.
  ')'                    # End scope group.
  '(?P<comma>,)?'        # Match against an optional comma.
)


# Match against any character besides newline 0-many times.
# Then match a right brace, and a colon.
return_type_pattern = regex.compile('.*\):')


dom_to_mutation_pattern = regex.compile(
  r'(?P<pre>'            # Start a capture group named pre.
    '(?P<indent>'        # Start a capture group named indent.
      '[^\'"\n]*'        # Match against anything that is not a
                         #   quote or newline 0-many times.
    ')'                  # End indent group.
    '[\'"]?'             # Match against a quote 0-1 times.
  ')'                    # End pre group.
  'domToMutation'        # Match against the string domToMutation.
  '(?P<suf>.*)'          # Match against any character besides newline 0-many times.
  '(?P<scope>'           # Start a capture group named scope.
    '{'                  # Match against a left brace.
    '([^{}]|(?&scope))*' # Match against any non-brace character,
                         #   or the scope group recursively 0-many times.
    '}'                  # Match against a right brace.
  ')'                    # End scope group.
  '(?P<comma>,)?'        # Match against an optional comma.
)


# Match against any character besides a quote followed by a colon.
param_type_pattern = regex.compile(r'[^\'"]:')


# Match against any character besides \n 0-many times
# followed by the string (this:
# Then match against the *least* number of any character (ie non-greedy)
# followed by a comma.
this_pattern = regex.compile(r'.*\(this:.*?,')


# Match against any character besides \n 0-many times, followed by (
pre_parens_pattern = regex.compile(r'(.*)\(')


to_xml_patten = regex.compile(
  r'(?P<pre>'            # Start a capture group named pre.
    '(?P<indent>'        # Start a capture group named indent.
      ' *'               # Match against a space character 0-many times.
    ')'                  # End indent group.
    '.*'                 # Match against any character besides \n 0-many times.
  ')'                    # End pre group.
  'toXml'                # Match against the string toXml
  '(?P<suf>.*)'          # Match against any character besides \n 0-many times.
  '(?P<scope>'           # Start a capture group named scope.
    '{'                  # Match against a left brace.
    '([^{}]|(?&scope))*' # Match against any non-brace character,
                         #   or the scope group recursively 0-many times.
    '}'                  # Match against a right brace.
  ')'                    # End scope group.
  '(?P<semi>;)?'         # Match against an optional semicolon
)


from_xml_pattern = regex.compile(
  r'(?P<pre>'            # Start a capture group named pre.
    '(?P<indent>'        # Start a capture group named indent.
      ' *'               # Match against a space character 0-many times.
    ')'                  # End indent group.
    '.*'                 # Match against any character besides \n 0-many times.
  ')'                    # End pre group.
  'fromXml'              # Match against the string fromXml
  '(?P<suf>.*)'          # Match against any character besides \n 0-many times.
  '(?P<scope>'           # Start a capture group named scope.
    '{'                  # Match against a left brace.
    '([^{}]|(?&scope))*' # Match against any non-brace character,
                         #   o the scope group recursively 0-many times.
    '}'                  # Match against a right brace.
  ')'                    # End scope group.
  '(?P<semi>;)?'         # Match against an optional semicolon
)


def insert_block_save(contents: str, match: Match) -> str:
  """Inserts a default implementation of saveExtraState after the match.
  Args:
    contents:
      A string containing the contents of the file being modified.
    match:
      The regex match object for the mutationToDom function.
    
  Returns:
    A string containing the modified contents of the file.
  """
  index = match.end('comma') if match.end('comma') != -1 else match.end('scope')
  pre = match.group('pre')
  indent = match.group('indent')

  return_type_match = return_type_pattern.match(match.group('suf'))
  suf = (f'{return_type_match.group(0)} string ' if return_type_match != None
      else match.group('suf'))

  comma = match.group('comma') if match.group('comma') != None else ''

  return (
    f'{contents[0:index]}'
    f'\n{pre}saveExtraState{suf}{{' +
    f'\n{indent}  return Blockly.Xml.domToText(this.mutationToDom());' +
    f'\n{indent}}}{comma}' +
    f'{contents[index:len(contents)]}')


def add_block_saves(contents:str) -> str:
  """Inserts default implementations of saveExtraState.

  Inserts a default implementation of the saveExtraState hook after every
  instance of the mutationToDom hook.

  Args:
    contents:
      A string containing the contents of the file being modified.

  Returns:
    A string containing the modified contents of the file.
  """
  matches = list(regex.finditer(mutation_to_dom_pattern, contents))
  matches.reverse()
  for match in matches:
      contents = insert_block_save(contents, match)
  return contents


def insert_block_load(contents: str, match: Match) -> str:
  """Inserts a default implementation of loadExtraState after the match.

  Args:
    contents:
      A string containing the contents of the file being modified.
    match:
      The regex match object for the domToMutation function.

  Returns:
    A string containing the modified contents of the file.
  """
  index = match.end('comma') if match.end('comma') != -1 else match.end('scope')
  pre = match.group('pre')
  indent = match.group('indent')

  suf = match.group('suf')
  has_param_types = param_type_pattern.search(suf) != None
  this_match = this_pattern.match(suf)
  pre_parens_match = pre_parens_pattern.match(suf)
  pre_parens = pre_parens_match.group(1) if pre_parens_match != None else ''
  if has_param_types:
    if this_match != None:
      suf = f'{this_match.group(0)} state: string) '
    else:
      suf = f'{pre_parens}(state: string) '
  else:
    suf = f'{pre_parens}(state) '

  comma = match.group('comma') if match.group('comma') != None else ''

  return (
    f'{contents[0:index]}'
    f'\n{pre}loadExtraState{suf}{{'
    f'\n{indent}  this.domToMutation(Blockly.Xml.textToDom(state));'
    f'\n{indent}}}{comma}'
    f'{contents[index:len(contents)]}')


def add_block_loads(contents:str) -> str:
  """Inserts default implementations of loadExtraState.

  Inserts a default implementation of the loadExtraState hook after every
  instance of the domToMutation hook.

  Args:
    contents:
      A string containing the contents of the file being modified.

  Returns:
    A string containing the modified contents of the file.
  """
  matches = list(regex.finditer(dom_to_mutation_pattern, contents))
  matches.reverse()
  for match in matches:
    contents = insert_block_load(contents, match)
  return contents


def insert_field_save(contents:str, match: Match) -> str:
  """Inserts a default implementation of saveState after the match.

  Args:
    contents:
      A string containing the contents of the file being modified.
    match:
      The regex match object for the toXml function.

  Returns:
    A string containing the modified contents of the file.
  """
  index = match.end('semi') if match.end('semi') != -1 else match.end('scope')
  pre = match.group('pre')
  indent = match.group('indent')

  suf = match.group('suf')
  return_type_match = return_type_pattern.match(suf)
  pre_parens_match = pre_parens_pattern.match(suf)
  pre_parens = pre_parens_match.group(1) if pre_parens_match != None else ''
  suf = (f'{pre_parens}(): string ' if return_type_match != None
      else f'{pre_parens}() ')

  comma = match.group('semi') if match.group('semi') != None else ''

  return (
    f'{contents[0:index]}'
    f'\n{pre}saveState{suf}{{'
    f'\n{indent}  var elem = Blockly.utils.xml.createElement("field");'
    f'\n{indent}  elem.setAttribute("name", this.name || \'\');'
    f'\n{indent}  return Blockly.Xml.domToText(this.toXml(elem));'
    f'\n{indent}}}{comma}'
    f'{contents[index:len(contents)]}')


def add_field_saves(contents:str) -> str:
  """Inserts default implementations of saveState.

  Inserts a default implementation of the state hook after every instance of
  the toXml hook.

  Args:
    contents:
      A string containing the contents of the file being modified.

  Returns:
    A string containing the modified contents of the file.
  """
  matches = list(regex.finditer(to_xml_patten, contents))
  matches.reverse()
  for match in matches:
      contents = insert_field_save(contents, match)
  return contents


def insert_field_load(contents: str, match: Match) -> str:
  """Inserts a default implementation of loadState after the match.

  Args:
    contents:
      A string containing the contents of the file being modified.
    match:
      The regex match object for the fromXml function.

  Returns:
    A string containing the modified contents of the file.
  """
  index = match.end('semi') if match.end('semi') != -1 else match.end('scope')
  pre = match.group('pre')
  indent = match.group('indent')

  suf = match.group('suf')
  has_param_types = param_type_pattern.search(suf) != None
  pre_parens_match = pre_parens_pattern.match(suf)
  pre_parens = pre_parens_match.group(1) if pre_parens_match != None else ''
  suf = (f'{pre_parens}(state: string) ' if has_param_types
      else f'{pre_parens}(state) ')

  comma = match.group('semi') if match.group('semi') != None else ''

  return (
    f'{contents[0:index]}'
    f'\n{pre}loadState{suf}{{'
    f'\n{indent}  this.fromXml(Blockly.Xml.textToDom(state));'
    f'\n{indent}}}{comma}'
    f'{contents[index:len(contents)]}')


def add_field_loads(contents: str) -> str:
  """Inserts default implementations of loadState.

  Inserts a default implementation of the state hook after every instance of
  the fromXml hook.

  Args:
    contents:
      A string containing the contents of the file being modified.

  Returns:
    A string containing the modified contents of the file.
  """
  matches = list(regex.finditer(from_xml_pattern, contents))
  matches.reverse()
  for match in matches:
    contents = insert_field_load(contents, match)
  return contents


path = sys.argv[1] if len(sys.argv) > 1 else './'

files = []
for (dir_path, dir_names, file_names) in walk(path):
  files.extend([f'{dir_path}/{name}' for name in file_names])

for file_name in files:
  with open(file_name, 'r+') as f:
    originalContents = f.read()
    contents = originalContents
    contents = add_block_saves(contents)
    contents = add_block_loads(contents)
    contents = add_field_saves(contents)
    contents = add_field_loads(contents)
    if contents != originalContents:
      print(f'Upgrading {file_name}')
      f.seek(0, 0)
      f.write(contents)

print('Done upgrading files.')
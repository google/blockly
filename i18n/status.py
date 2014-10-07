#!/usr/bin/python

# Gives the translation status of the specified apps and languages.
#
# Copyright 2013 Google Inc.
# https://developers.google.com/blockly/
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

"""Produce a table showing the translation status of each app by language.

@author Ellen Spertus (ellen.spertus@gmail.com)
"""

import argparse
import os
from common import read_json_file

# Bogus language name representing all messages defined.
TOTAL = 'qqq'

# List of key prefixes, which are app names, except for 'Apps', which
# has common messages.  It is included here for convenience.
APPS = ['Apps', 'Code', 'Graph', 'Maze', 'Plane', 'Puzzle', 'Turtle']


def get_prefix(s):
  """Gets the portion of a string before the first period.

  Args:
      s: A string.

  Returns:
      The portion of the string before the first period, or the entire
      string if it does not contain a period.
  """
  return s.split('.')[0]


def get_prefix_count(prefix, arr):
  """Counts how many strings in the array start with the prefix.

  Args:
      prefix: The prefix string.
      arr: An array of strings.
  Returns:
      The number of strings in arr starting with prefix.
  """
  # This code was chosen for its elegance not its efficiency.
  return len([elt for elt in arr if elt.startswith(prefix)])


def output_as_html(messages, apps, verbose):
  """Outputs the given prefix counts and percentages as HTML.

  Specifically, a sortable HTML table is produced, where the app names
  are column headers, and one language is output per row.  Entries
  are color-coded based on the percent completeness.

  Args:
      messages: A dictionary of dictionaries, where the outer keys are language
          codes used by translatewiki (generally, ISO 639 language codes) or
          the string TOTAL, used to indicate the total set of messages.  The
          inner dictionary makes message keys to values in that language.
      apps: Apps to consider.
      verbose: Whether to list missing keys.
  """
  def generate_language_url(lang):
    return 'https://translatewiki.net/wiki/Special:SupportedLanguages#' + lang

  def generate_number_as_percent(num, total, tag):
    percent = num * 100 / total
    if percent == 100:
      color = 'green'
    elif percent >= 90:
      color = 'orange'
    elif percent >= 60:
      color = 'black'
    else:
      color = 'gray'
    s = '<font color={0}>{1} ({2}%)</font>'.format(color, num, percent)
    if verbose and percent < 100:
      return '<a href="#{0}">{1}'.format(tag, s)
    else:
      return s

  print('<head><title>Blockly app translation status</title></head><body>')
  print("<SCRIPT LANGUAGE='JavaScript1.2' SRC='https://neil.fraser.name/"
        "software/tablesort/tablesort-min.js'></SCRIPT>")
  print('<table cellspacing=5><thead><tr>')
  print('<th class=nocase>Language</th><th class=num>' +
        '</th><th class=num>'.join(apps) + '</th></tr></thead><tbody>')
  for lang in messages:
    if lang != TOTAL:
      print('<tr><td><a href="{1}">{0}</a></td>'.format(
          lang, generate_language_url(lang)))
      for app in apps:
        print '<td>'
        print(generate_number_as_percent(
            get_prefix_count(app, messages[lang]),
            get_prefix_count(app, messages[TOTAL]),
            (lang + app)))
        print '</td>'
      print('</tr>')
  print('</tbody><tfoot><tr><td>ALL</td><td>')
  print('</td><td>'.join([str(get_prefix_count(app, TOTAL)) for app in apps]))
  print('</td></tr></tfoot></table>')

  if verbose:
    for lang in messages:
      if lang != TOTAL:
        for app in apps:
          if (get_prefix_count(app, messages[lang]) <
              get_prefix_count(app, messages[TOTAL])):
            print('<div id={0}{1}><strong>{1} (<a href="{2}">{0}</a>)'.
                  format(lang, app, generate_language_url(lang)))
            print('</strong> missing: ')
            print(', '.join(
                [key for key in messages[TOTAL] if
                 key.startswith(app) and key not in messages[lang]]))
            print('<br><br></div>')
  print('</body>')


def output_as_text(messages, apps, verbose):
  """Outputs the given prefix counts and percentages as text.

  Args:
      messages: A dictionary of dictionaries, where the outer keys are language
          codes used by translatewiki (generally, ISO 639 language codes) or
          the string TOTAL, used to indicate the total set of messages.  The
          inner dictionary makes message keys to values in that language.
      apps: Apps to consider.
      verbose: Whether to list missing keys.
  """
  def generate_number_as_percent(num, total):
    return '{0} ({1}%)'.format(num, num * 100 / total)
  MAX_WIDTH = len('999 (100%)') + 1
  FIELD_STRING = '{0: <' + str(MAX_WIDTH) + '}'
  print(FIELD_STRING.format('Language') + ''.join(
      [FIELD_STRING.format(app) for app in apps]))
  print(('-' * (MAX_WIDTH - 1) + ' ') * (len(apps) + 1))
  for lang in messages:
    if lang != TOTAL:
      print(FIELD_STRING.format(lang) +
            ''.join([FIELD_STRING.format(generate_number_as_percent(
                get_prefix_count(app, messages[lang]),
                get_prefix_count(app, messages[TOTAL])))
                     for app in apps]))
  print(FIELD_STRING.format(TOTAL) +
        ''.join(
            [FIELD_STRING.format(get_prefix_count(app, messages[TOTAL]))
             for app in apps]))
  if verbose:
    for lang in messages:
      if lang != TOTAL:
        for app in apps:
          missing = [key for key in messages[TOTAL]
                     if key.startswith(app) and key not in messages[lang]]
          print('{0} {1}: Missing: {2}'.format(
              app.upper(), lang, (', '.join(missing) if missing else 'none')))


def output_as_csv(messages, apps):
  """Outputs the given prefix counts and percentages as CSV.

  Args:
      messages: A dictionary of dictionaries, where the outer keys are language
          codes used by translatewiki (generally, ISO 639 language codes) or
          the string TOTAL, used to indicate the total set of messages.  The
          inner dictionary makes message keys to values in that language.
      apps: Apps to consider.
  """
  # Header row.
  print('Language, ' + ', ,'.join(apps))

  # Total row.
  # Put at top, rather than bottom, so it can be frozen.
  print('TOTAL, ' + ', '.join(
      [str(get_prefix_count(app, messages[TOTAL])) + ', '
       for app in apps]))

  # One line per language.
  for lang in messages:
    if lang != TOTAL:
      print(lang + ', ' + ', '.join(
          [str(get_prefix_count(app, messages[lang]))
           + ', '
           + str((get_prefix_count(app, messages[lang]) * 1.0 /
                  get_prefix_count(app, messages[TOTAL])))
           for app in apps]))


def main():
  """Processes input files and outputs results in specified format.
  """
  # Argument parsing.
  parser = argparse.ArgumentParser(
      description='Display translation status by app and language.')
  parser.add_argument('--key_file', default='json' + os.path.sep + 'keys.json',
                      help='file with complete list of keys.')
  parser.add_argument('--output', default='text',
                      choices=['text', 'html', 'csv'],
                      help='output format')
  parser.add_argument('--verbose', action='store_true', default=False,
                      help='whether to indicate which messages were translated '
                      '(only used in text and html output modes)')
  parser.add_argument('--app', default=None, choices=APPS,
                      help='if set, only consider the specified app (prefix).')
  parser.add_argument('lang_files', nargs='+',
                      help='names of JSON files to examine')
  args = parser.parse_args()
  apps = [args.app] if args.app else APPS


  # Read in JSON files.
  messages = {}  # A dictionary of dictionaries.
  messages[TOTAL] = read_json_file(args.key_file)
  for lang_file in args.lang_files:
    prefix = get_prefix(os.path.split(lang_file)[1])
    # Skip non-language files.
    if prefix not in ['qqq', 'keys']:
      messages[prefix] = read_json_file(lang_file)

  # Output results.
  if args.output == 'text':
    output_as_text(messages, apps, args.verbose)
  elif args.output == 'html':
    output_as_html(messages, apps, args.verbose)
  elif args.output == 'csv':
    output_as_csv(messages, apps)
  else:
    print('No output?!')


if __name__ == '__main__':
  main()

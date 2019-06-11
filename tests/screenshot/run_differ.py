#!/usr/bin/python2.7
#
# Copyright 2019 Google Inc.
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

# Usage:
# run_differ.py with no parameters runs all screenshot tests with blocks in rtl
# and not collapsed.
# --name <test_name> runs all tests that contain the given name. If not given,
#   runs all tests specified in test_cases.json.
# --collapsed runs all tests with the blocks collapsed. If not given, blocks are
#  expanded.
# --insertionMarker runs all tests with the blocks set as insertion markers. If
#   not given then will default to normal blocks.
#

import os, errno, platform, shutil, sys

NAME_ARG = "--name"
COLLAPSE_ARG = "--collapsed"
RTL_ARG = "--rtl"
INSERTION_ARG = "--insertionMarker"

# Generates the screenshots according to the given parameters, diffs the
# screenshots and then displays them.
def main():
  cleanup()
  filter_text = find_filter_text()
  is_rtl = check_arg(RTL_ARG)
  should_collapse = check_arg(COLLAPSE_ARG)
  is_insertion_marker = check_arg(INSERTION_ARG)
  gen_screenshots(filter_text, should_collapse, is_insertion_marker, is_rtl)
  diff_screenshots(filter_text)
  display_screenshots()

# Cleans up any files left over from running the script previously.
def cleanup():
  remove_dir("tests/screenshot/outputs/new")
  remove_dir("tests/screenshot/outputs/diff")
  remove_file("tests/screenshot/outputs/test_output.js")
  remove_file("tests/screenshot/outputs/test_output.json")

# If the --name is given find the name of the test case.
def find_filter_text():
  args = sys.argv
  for i in range(len(args)):
    if args[i] == NAME_ARG:
      if i + 1 < len(args):
        return args[i+1]
      else:
        print("Must supply a name after name arg")
        sys.exit()
  return ""

# Check if an argument exists or not. Returns empty string if the argument does
# not exist.
def check_arg(arg):
  if arg in sys.argv:
    return arg
  else:
    return ''

# Generates a set of old and new screenshots according to the given parameters.
def gen_screenshots(filter_text, should_collapse, is_insertion_marker, is_rtl):
  if filter_text != "":
    filter_text = NAME_ARG + " " + filter_text
  os.system("node tests/screenshot/gen_screenshots.js " + filter_text + " " + should_collapse + " " + is_insertion_marker + " " + is_rtl)

# Diffs the old and new screenshots that were created in gen_screenshots.
def diff_screenshots(filter_text):
  if filter_text != "":
    os.system("./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --ui tdd --reporter ./tests/screenshot/diff-reporter.js" + " --fgrep " + filter_text)
  else:
    os.system("./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --ui tdd --reporter ./tests/screenshot/diff-reporter.js")

# Displays the old screenshots, new screenshots, and the diff of them.
def display_screenshots():
  if (platform.system() == "Linux"):
    os.system("xdg-open tests/screenshot/diff_viewer.html")
  elif (platform.system() == 'Darwin'):
    os.system("open tests/screenshot/diff_viewer.html")

def remove_file(filename):
  try:
    os.remove(filename)
  except (OSError) as e:
    if e.errno != errno.ENOENT:
      raise

def remove_dir(dir_name):
  try:
    shutil.rmtree(dir_name)
  except (OSError) as e:
    if e.errno != errno.ENOENT:
      raise

if __name__ == "__main__":
  main()

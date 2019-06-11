#!/usr/bin/python2.7
# Compresses the core Blockly files into a single JavaScript file.
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
# --name <test_name> runs all tests that contain the given name.
# --collapsed runs all tests with the blocks collapsed
# --insertionMarker runs all tests with the blocks set as insertion markers.
#

import os, errno, platform, shutil, sys

NAME_ARG = "--name"
COLLAPSE_ARG = "--collapsed"
RTL_ARG = "--rtl"
INSERTION_ARG = "--insertionMarker"

def main():
  cleanup()
  filter_text = find_filter_text()
  is_rtl = change_to_rtl()
  collapse = should_collapse()
  isInsertionMarker = check_insertion_marker()
  gen_screenshots(filter_text, collapse, isInsertionMarker)
  diff_screenshots(filter_text)
  display_screenshots()
  cleanup_rtl(is_rtl)

def cleanup():
  remove_dir("tests/screenshot/outputs/new")
  remove_dir("tests/screenshot/outputs/diff")
  remove_file("tests/screenshot/outputs/test_output.js")
  remove_file("tests/screenshot/outputs/test_output.json")

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

def change_to_rtl():
  args = sys.argv
  if RTL_ARG in args:
    os.system("sed -i -e 's/rtl: false/rtl: true/g' tests/screenshot/playground_new.html")
    os.system("sed -i -e 's/rtl: false/rtl: true/g' tests/screenshot/playground_old.html")
    return True
  return False

def should_collapse():
  if COLLAPSE_ARG in sys.argv:
    return COLLAPSE_ARG
  else:
    return ''

def check_insertion_marker():
  if INSERTION_ARG in sys.argv:
    return INSERTION_ARG
  else:
    return ''

def gen_screenshots(filter_text, collapse, isInsertionMarker):
  if filter_text != "":
    filter_text = NAME_ARG + " " + filter_text
  os.system("node tests/screenshot/gen_screenshots.js " + filter_text + " " + collapse + " " + isInsertionMarker)

def diff_screenshots(filter_text):
  if filter_text != "":
    os.system("./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --ui tdd --reporter ./tests/screenshot/diff-reporter.js" + " --fgrep " + filter_text)
  else:
    os.system("./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --ui tdd --reporter ./tests/screenshot/diff-reporter.js")

def display_screenshots():
  if (platform.system() == "Linux"):
    os.system("xdg-open tests/screenshot/diff_viewer.html")
  elif (platform.system() == 'Darwin'):
    os.system("open tests/screenshot/diff_viewer.html")

def cleanup_rtl(is_rtl):
  if is_rtl:
    os.system("sed -i -e 's/rtl: true/rtl: false/g' tests/screenshot/playground_new.html")
    os.system("sed -i -e 's/rtl: true/rtl: false/g' tests/screenshot/playground_old.html")
    remove_file("tests/screenshot/playground_new.html-e")
    remove_file("tests/screenshot/playground_old.html-e")

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

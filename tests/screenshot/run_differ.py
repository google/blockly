#!/usr/bin/python2.7
#
# Copyright 2019 Google LLC
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
# --inlineInputs runs all tests with the blocks set to have inline inputs. If
#   not given then the blocks will be in their default state.
# --externalInputs runs all tests with the with all blocks set to have external
#   inputs. If not given then the blocks will be in their default state.
#

import os, errno, platform, shutil, sys

NAME_ARG = "--name"
COLLAPSE_ARG = "--collapsed"
RTL_ARG = "--rtl"
INSERTION_ARG = "--insertionMarker"
INLINE_INPUTS_ARG = "--inlineInputs"
EXTERNAL_INPUTS_ARG = "--externalInputs"

ARG_VALS = [COLLAPSE_ARG, RTL_ARG, INSERTION_ARG, INLINE_INPUTS_ARG, EXTERNAL_INPUTS_ARG]

# Generates the screenshots according to the given parameters, diffs the
# screenshots and then displays them.
def main():
  cleanup()
  check_arguments()
  filter_text = find_argument_value(NAME_ARG)
  argument_string = create_arg_string()
  gen_screenshots(filter_text, argument_string)
  diff_screenshots(filter_text)
  display_screenshots()

# Cleans up any files left over from running the script previously.
def cleanup():
  remove_dir("tests/screenshot/outputs/new")
  remove_dir("tests/screenshot/outputs/diff")
  remove_file("tests/screenshot/outputs/test_output.js")
  remove_file("tests/screenshot/outputs/test_output.json")

# If the --name is given find the name of the test case.
def find_argument_value(argument_name):
  args = sys.argv
  for i in range(len(args)):
    if args[i] == argument_name:
      if i + 1 < len(args):
        return args[i+1]
      else:
        print ("Must supply a name after name arg")
        sys.exit()
  return ""

# Prints an error and exits if the arguments given aren't allowed.
def check_arguments():
  if (INLINE_INPUTS_ARG in sys.argv) and (EXTERNAL_INPUTS_ARG in sys.argv):
    print ("Can not have both --inlineInputs and --externalInputs")
    sys.exit()

# Create a string with all arguments.
def create_arg_string():
  arg_string = ""
  for arg in sys.argv:
    arg_string = arg_string + " " + arg
  return arg_string

# Generates a set of old and new screenshots according to the given parameters.
def gen_screenshots(filter_text, argument_string):
  os.system("node tests/screenshot/gen_screenshots.js " + argument_string)

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

# Removes a file and catches the error if the file does not exist.
def remove_file(filename):
  try:
    os.remove(filename)
  except (OSError) as e:
    if e.errno != errno.ENOENT:
      raise

# Removes a directory and catches the error if the directory does not exist.
def remove_dir(dir_name):
  try:
    shutil.rmtree(dir_name)
  except (OSError) as e:
    if e.errno != errno.ENOENT:
      raise

if __name__ == "__main__":
  main()

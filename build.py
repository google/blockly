#!/usr/bin/python2.7
# Compresses the core Blockly files into a single JavaScript file.
#
# Copyright 2012 Google Inc.
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

# Usage: build.py <0 or more of core, generators, langfiles>
# build.py with no parameters builds all files.
# core builds blockly_compressed, blockly_uncompressed, and blocks_compressed.
# generators builds every <language>_compressed.js.
# langfiles builds every msg/js/<LANG>.js file.

# This script generates two versions of Blockly's core files:
#   blockly_compressed.js
#   blockly_uncompressed.js
# The compressed file is a concatenation of all of Blockly's core files which
# have been run through Google's Closure Compiler.  This is done using the
# online API (which takes a few seconds and requires an Internet connection).
# The uncompressed file is a script that loads in each of Blockly's core files
# one by one.  This takes much longer for a browser to load, but is useful
# when debugging code since line numbers are meaningful and variables haven't
# been renamed.  The uncompressed file also allows for a faster development
# cycle since there is no need to rebuild or recompile, just reload.
#
# This script also generates:
#   blocks_compressed.js: The compressed Blockly language blocks.
#   javascript_compressed.js: The compressed JavaScript generator.
#   python_compressed.js: The compressed Python generator.
#   php_compressed.js: The compressed PHP generator.
#   lua_compressed.js: The compressed Lua generator.
#   dart_compressed.js: The compressed Dart generator.
#   msg/js/<LANG>.js for every language <LANG> defined in msg/js/<LANG>.json.

import sys

import errno, glob, json, os, re, subprocess, threading, codecs, argparse
from cStringIO import StringIO

if sys.version_info[0] == 2:
  import httplib
  from urllib import urlencode
else:
  import http.client as httplib
  from urllib.parse import urlencode
  from importlib import reload

# Read package.json and extract the current Blockly version.
blocklyVersion = json.loads(open('package.json', 'r').read())['version']

def import_path(fullpath):
  """Import a file with full path specification.
  Allows one to import from any directory, something __import__ does not do.

  Args:
      fullpath:  Path and filename of import.

  Returns:
      An imported module.
  """
  path, filename = os.path.split(fullpath)
  filename, ext = os.path.splitext(filename)
  sys.path.append(path)
  module = __import__(filename)
  reload(module)  # Might be out of date.
  del sys.path[-1]
  return module


HEADER = ("// Do not edit this file; automatically generated by build.py.\n"
          "'use strict';\n")


class Gen_uncompressed(threading.Thread):
  """Generate a JavaScript file that loads Blockly's raw files.
  Runs in a separate thread.
  """
  def __init__(self, search_paths, target_filename):
    threading.Thread.__init__(self)
    self.search_paths = search_paths
    self.target_filename = target_filename

  def run(self):
    f = open(self.target_filename, 'w')
    f.write(HEADER)
    f.write("""
this.IS_NODE_JS = !!(typeof module !== 'undefined' && module.exports);

this.BLOCKLY_DIR = (function(root) {
  if (!root.IS_NODE_JS) {
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = new RegExp('(.+)[\/]blockly_(.*)uncompressed\.js$');
    for (var i = 0, script; script = scripts[i]; i++) {
      var match = re.exec(script.src);
      if (match) {
        return match[1];
      }
    }
    alert('Could not detect Blockly\\'s directory name.');
  }
  return '';
})(this);

this.BLOCKLY_BOOT = function(root) {
  var dir = '';
  if (root.IS_NODE_JS) {
    dir = 'blockly';
  } else {
    dir = this.BLOCKLY_DIR.match(/[^\\/]+$/)[0];
  }
  // Execute after Closure has loaded.
""")
    add_dependency = []
    base_path = calcdeps.FindClosureBasePath(self.search_paths)
    for dep in calcdeps.BuildDependenciesFromFiles(self.search_paths):
      add_dependency.append(calcdeps.GetDepsLine(dep, base_path))
    add_dependency.sort()  # Deterministic build.
    add_dependency = '\n'.join(add_dependency)
    # Find the Blockly directory name and replace it with a JS variable.
    # This allows blockly_uncompressed.js to be compiled on one computer and be
    # used on another, even if the directory name differs.
    m = re.search('[\\/]([^\\/]+)[\\/]core[\\/]blockly.js', add_dependency)
    add_dependency = re.sub('([\\/])' + re.escape(m.group(1)) +
        '([\\/](core)[\\/])', '\\1../../" + dir + "\\2', add_dependency)
    f.write(add_dependency + '\n')

    provides = []
    # Exclude field_date.js as it still has a dependency on the closure library
    # see issue #2890. 
    for dep in calcdeps.BuildDependenciesFromFiles(self.search_paths):
      if not dep.filename.startswith('closure') and not dep.filename.startswith('core/field_date.js'):
        provides.extend(dep.provides)
    provides.sort()  # Deterministic build.
    f.write('\n')
    f.write('// Load Blockly.\n')
    for provide in provides:
      f.write("goog.require('%s');\n" % provide)

    f.write("""
delete root.BLOCKLY_DIR;
delete root.BLOCKLY_BOOT;
delete root.IS_NODE_JS;
};

if (this.IS_NODE_JS) {
  this.BLOCKLY_BOOT(this);
  module.exports = Blockly;
} else {
  // Delete any existing Closure (e.g. Soy's nogoog_shim).
  document.write('<script>var goog = undefined;</script>');
  // Load fresh Closure Library.
  document.write('<script src="' + this.BLOCKLY_DIR +
      '/closure/goog/base.js"></script>');
  document.write('<script>this.BLOCKLY_BOOT(this);</script>');
}
""")
    f.close()
    print("SUCCESS: " + self.target_filename)


class Gen_compressed(threading.Thread):
  """Generate a JavaScript file that contains all of Blockly's core and all
  required parts of Closure, compiled together.
  Uses the Closure Compiler's online API.
  Runs in a separate thread.
  """
  def __init__(self, search_paths, bundles, use_default):
    threading.Thread.__init__(self)
    self.search_paths = search_paths
    self.bundles = bundles
    self.use_default = use_default

  def run(self):
    if (self.bundles.core or self.use_default):
      self.gen_core()

    if (self.bundles.core or self.use_default):
      self.gen_blocks()

    if (self.bundles.generators or self.use_default):
      self.gen_generator("javascript")
      self.gen_generator("python")
      self.gen_generator("php")
      self.gen_generator("lua")
      self.gen_generator("dart")

  def gen_core(self):
    target_filename = "blockly_compressed.js"
    # Define the parameters for the POST request.
    params = [
        ("compilation_level", "SIMPLE_OPTIMIZATIONS"),
        ("use_closure_library", "false"),
        ("output_format", "json"),
        ("output_info", "compiled_code"),
        ("output_info", "warnings"),
        ("output_info", "errors"),
        ("output_info", "statistics"),
        ("warning_level", "DEFAULT"),
      ]

    # Read in all the source files.
    filenames = calcdeps.CalculateDependencies(self.search_paths,
        [os.path.join("core", "blockly.js")])
    filenames.sort()  # Deterministic build.
    for filename in filenames:
      # Filter out the Closure files (the compiler will add them).
      if filename.startswith("closure"):
        continue
      f = codecs.open(filename, encoding="utf-8")
      code = "".join(f.readlines()).encode("utf-8")
      # Inject the Blockly version.
      if filename == "core/blockly.js":
        code = code.replace("Blockly.VERSION = 'uncompiled';", "Blockly.VERSION = '" + blocklyVersion + "';")
      params.append(("js_code", code))
      f.close()

    self.do_compile(params, target_filename, filenames, "")

  def gen_blocks(self):
    target_filename = "blocks_compressed.js"
    # Define the parameters for the POST request.
    params = [
        ("compilation_level", "SIMPLE_OPTIMIZATIONS"),
        ("output_format", "json"),
        ("output_info", "compiled_code"),
        ("output_info", "warnings"),
        ("output_info", "errors"),
        ("output_info", "statistics"),
        ("warning_level", "DEFAULT"),
      ]

    # Read in all the source files.
    # Add Blockly.Blocks to be compatible with the compiler.
    params.append(("js_code", "goog.provide('Blockly');goog.provide('Blockly.Blocks');"))
    filenames = glob.glob(os.path.join("blocks", "*.js"))
    filenames.sort()  # Deterministic build.
    for filename in filenames:
      f = codecs.open(filename, encoding="utf-8")
      params.append(("js_code", "".join(f.readlines()).encode("utf-8")))
      f.close()

    # Remove Blockly.Blocks to be compatible with Blockly.
    remove = "var Blockly={Blocks:{}};"
    self.do_compile(params, target_filename, filenames, remove)

  def gen_generator(self, language):
    target_filename = language + "_compressed.js"
    # Define the parameters for the POST request.
    params = [
        ("compilation_level", "SIMPLE_OPTIMIZATIONS"),
        ("output_format", "json"),
        ("output_info", "compiled_code"),
        ("output_info", "warnings"),
        ("output_info", "errors"),
        ("output_info", "statistics"),
        ("warning_level", "DEFAULT"),
      ]

    # Read in all the source files.
    # Add Blockly.Generator and Blockly.utils.string to be compatible
    # with the compiler.
    params.append(("js_code", "goog.provide('Blockly.Generator');goog.provide('Blockly.utils.string');"))
    filenames = glob.glob(
        os.path.join("generators", language, "*.js"))
    filenames.sort()  # Deterministic build.
    filenames.insert(0, os.path.join("generators", language + ".js"))
    for filename in filenames:
      f = codecs.open(filename, encoding="utf-8")
      params.append(("js_code", "".join(f.readlines()).encode("utf-8")))
      f.close()
    filenames.insert(0, "[goog.provide]")

    # Remove Blockly.Generator and Blockly.utils.string to be compatible
    # with Blockly.
    remove = "var Blockly={Generator:{},utils:{}};Blockly.utils.string={};"
    self.do_compile(params, target_filename, filenames, remove)

  def do_compile(self, params, target_filename, filenames, remove):
    # Send the request to Google.
    headers = {"Content-type": "application/x-www-form-urlencoded"}
    conn = httplib.HTTPSConnection("closure-compiler.appspot.com")
    conn.request("POST", "/compile", urlencode(params), headers)
    response = conn.getresponse()

    # Decode is necessary for Python 3.4 compatibility
    json_str = response.read().decode("utf-8")
    conn.close()

    # Parse the JSON response.
    try:
      json_data = json.loads(json_str)
    except ValueError:
      print("ERROR: Could not parse JSON for %s.  Raw data:" % target_filename)
      print(json_str)
      return

    def file_lookup(name):
      if not name.startswith("Input_"):
        return "???"
      n = int(name[6:]) - 1
      return filenames[n]

    if "serverErrors" in json_data:
      errors = json_data["serverErrors"]
      for error in errors:
        print("SERVER ERROR: %s" % target_filename)
        print(error["error"])
    elif "errors" in json_data:
      errors = json_data["errors"]
      for error in errors:
        print("FATAL ERROR")
        print(error["error"])
        if error["file"]:
          print("%s at line %d:" % (
              file_lookup(error["file"]), error["lineno"]))
          print(error["line"])
          print((" " * error["charno"]) + "^")
        sys.exit(1)
    else:
      if "warnings" in json_data:
        warnings = json_data["warnings"]
        for warning in warnings:
          print("WARNING")
          print(warning["warning"])
          if warning["file"]:
            print("%s at line %d:" % (
                file_lookup(warning["file"]), warning["lineno"]))
            print(warning["line"])
            print((" " * warning["charno"]) + "^")
        print()

      if not "compiledCode" in json_data:
        print("FATAL ERROR: Compiler did not return compiledCode.")
        sys.exit(1)

      code = HEADER + "\n" + json_data["compiledCode"]
      code = code.replace(remove, "")
      code = self.trim_licence(code)

      stats = json_data["statistics"]
      original_b = stats["originalSize"]
      compressed_b = stats["compressedSize"]
      if original_b > 0 and compressed_b > 0:
        f = open(target_filename, "w")
        f.write(code)
        f.close()

        original_kb = int(original_b / 1024 + 0.5)
        compressed_kb = int(compressed_b / 1024 + 0.5)
        ratio = int(float(compressed_b) / float(original_b) * 100 + 0.5)
        print("SUCCESS: " + target_filename)
        print("Size changed from %d KB to %d KB (%d%%)." % (
            original_kb, compressed_kb, ratio))
      else:
        print("UNKNOWN ERROR")

  def trim_licence(self, code):
    """Strip out Google's and MIT's Apache licences.

    JS Compiler preserves dozens of Apache licences in the Blockly code.
    Remove these if they belong to Google or MIT.
    MIT's permission to do this is logged in Blockly issue 2412.

    Args:
      code: Large blob of compiled source code.

    Returns:
      Code with Google's and MIT's Apache licences trimmed.
    """
    apache2 = re.compile("""/\\*

 [\\w: ]+

 (Copyright \\d+ (Google Inc.|Massachusetts Institute of Technology))
 (https://developers.google.com/blockly/|All rights reserved.)

 Licensed under the Apache License, Version 2.0 \\(the "License"\\);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
\\*/""")
    return re.sub(apache2, "", code)


class Gen_langfiles(threading.Thread):
  """Generate JavaScript file for each natural language supported.

  Runs in a separate thread.
  """

  def __init__(self, force_gen):
    threading.Thread.__init__(self)
    self.force_gen = force_gen

  def _rebuild(self, srcs, dests):
    # Determine whether any of the files in srcs is newer than any in dests.
    try:
      return (max(os.path.getmtime(src) for src in srcs) >
              min(os.path.getmtime(dest) for dest in dests))
    except OSError as e:
      # Was a file not found?
      if e.errno == errno.ENOENT:
        # If it was a source file, we can't proceed.
        if e.filename in srcs:
          print("Source file missing: " + e.filename)
          sys.exit(1)
        else:
          # If a destination file was missing, rebuild.
          return True
      else:
        print("Error checking file creation times: " + str(e))

  def run(self):
    # The files msg/json/{en,qqq,synonyms}.json depend on msg/messages.js.
    if (self.force_gen or
        self._rebuild([os.path.join("msg", "messages.js")],
                      [os.path.join("msg", "json", f) for f in
                      ["en.json", "qqq.json", "synonyms.json"]])):
      try:
        subprocess.check_call([
            "python",
            os.path.join("i18n", "js_to_json.py"),
            "--input_file", "msg/messages.js",
            "--output_dir", "msg/json/",
            "--quiet"])
      except (subprocess.CalledProcessError, OSError) as e:
        # Documentation for subprocess.check_call says that CalledProcessError
        # will be raised on failure, but I found that OSError is also possible.
        print("Error running i18n/js_to_json.py: ", e)
        sys.exit(1)

    # Checking whether it is necessary to rebuild the js files would be a lot of
    # work since we would have to compare each <lang>.json file with each
    # <lang>.js file.  Rebuilding is easy and cheap, so just go ahead and do it.
    try:
      # Use create_messages.py to create .js files from .json files.
      cmd = [
          "python",
          os.path.join("i18n", "create_messages.py"),
          "--source_lang_file", os.path.join("msg", "json", "en.json"),
          "--source_synonym_file", os.path.join("msg", "json", "synonyms.json"),
          "--source_constants_file", os.path.join("msg", "json", "constants.json"),
          "--key_file", os.path.join("msg", "json", "keys.json"),
          "--output_dir", os.path.join("msg", "js"),
          "--quiet"]
      json_files = glob.glob(os.path.join("msg", "json", "*.json"))
      json_files = [file for file in json_files if not
                    (file.endswith(("keys.json", "synonyms.json", "qqq.json", "constants.json")))]
      cmd.extend(json_files)
      subprocess.check_call(cmd)
    except (subprocess.CalledProcessError, OSError) as e:
      print("Error running i18n/create_messages.py: ", e)
      sys.exit(1)

    # Output list of .js files created.
    for f in json_files:
      # This assumes the path to the current directory does not contain "json".
      f = f.replace("json", "js")
      if os.path.isfile(f):
        print("SUCCESS: " + f)
      else:
        print("FAILED to create " + f)

# Class to hold arguments if user passes in old argument style.
class Arguments:
  def __init__(self):
    self.core = False
    self.generators = False
    self.langfiles = False

# Setup the argument parser.
def setup_parser():
  parser = argparse.ArgumentParser(description="Decide which files to build.")
  parser.add_argument('-core', action="store_true", default=False, help="Build core")
  parser.add_argument('-generators', action="store_true", default=False, help="Build the generators")
  parser.add_argument('-langfiles', action="store_true", default=False, help="Build all the language files")
  return parser

# Gets the command line arguments.
# If the user passes in the old style or arguments we create the arguments object
# otherwise the argument object is created from the ArgumentParser.
def get_args():
  parser = setup_parser()
  try:
    args = parser.parse_args()
  except SystemExit:
    args = Arguments()
    args.core = 'core' in sys.argv
    args.generators = 'generators' in sys.argv
    args.langfiles = 'langfiles' in sys.argv
    if 'accessible' in sys.argv:
      print("The Blockly accessibility demo has moved to https://github.com/google/blockly-experimental")
  return args

if __name__ == "__main__":
  args = get_args()
  use_default = not args.core and not args.generators and not args.langfiles
  calcdeps = import_path(os.path.join("closure", "bin", "calcdeps.py"))
  full_search_paths = calcdeps.ExpandDirectories(["core", "closure"])
  full_search_paths = sorted(full_search_paths)  # Deterministic build.

  # Uncompressed and compressed are run in parallel threads.
  # Uncompressed is limited by processor speed.
  if (args.core or use_default):
    Gen_uncompressed(full_search_paths, 'blockly_uncompressed.js').start()

  # Compressed is limited by network and server speed.
  Gen_compressed(full_search_paths, args, use_default).start()

  # This is run locally in a separate thread
  # defaultlangfiles checks for changes in the msg files, while manually asking
  # to build langfiles will force the messages to be rebuilt
  if (args.langfiles or use_default):
    Gen_langfiles(args.langfiles).start()

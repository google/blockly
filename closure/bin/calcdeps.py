#!/usr/bin/env python
#
# Copyright 2006 The Closure Library Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


"""Calculates JavaScript dependencies without requiring Google's build system.

It iterates over a number of search paths and builds a dependency tree.  With
the inputs provided, it walks the dependency tree and outputs all the files
required for compilation.
"""


import logging
import os
import re
import sys


_BASE_REGEX_STRING = '^\s*goog\.%s\(\s*[\'"](.+)[\'"]\s*\)'
req_regex = re.compile(_BASE_REGEX_STRING % 'require')
prov_regex = re.compile(_BASE_REGEX_STRING % 'provide')
ns_regex = re.compile('^ns:((\w+\.)*(\w+))$')


def IsValidFile(ref):
  """Returns true if the provided reference is a file and exists."""
  return os.path.isfile(ref)


def IsJsFile(ref):
  """Returns true if the provided reference is a JavaScript file."""
  return ref.endswith('.js')


def IsNamespace(ref):
  """Returns true if the provided reference is a namespace."""
  return re.match(ns_regex, ref) is not None


def IsDirectory(ref):
  """Returns true if the provided reference is a directory."""
  return os.path.isdir(ref)


def ExpandDirectories(refs):
  """Expands any directory references into inputs.

  Description:
    Looks for any directories in the provided references.  Found directories
    are recursively searched for .js files, which are then added to the result
    list.

  Args:
    refs: a list of references such as files, directories, and namespaces

  Returns:
    A list of references with directories removed and replaced by any
    .js files that are found in them. Also, the paths will be normalized.
  """
  result = []
  for ref in refs:
    if IsDirectory(ref):
      # Disable 'Unused variable' for subdirs
      # pylint: disable=unused-variable
      for (directory, subdirs, filenames) in os.walk(ref):
        for filename in filenames:
          if IsJsFile(filename):
            result.append(os.path.join(directory, filename))
    else:
      result.append(ref)
  return map(os.path.normpath, result)


class DependencyInfo(object):
  """Represents a dependency that is used to build and walk a tree."""

  def __init__(self, filename):
    self.filename = filename
    self.provides = []
    self.requires = []

  def __str__(self):
    return '%s Provides: %s Requires: %s' % (self.filename,
                                             repr(self.provides),
                                             repr(self.requires))


def BuildDependenciesFromFiles(files):
  """Build a list of dependencies from a list of files.

  Description:
    Takes a list of files, extracts their provides and requires, and builds
    out a list of dependency objects.

  Args:
    files: a list of files to be parsed for goog.provides and goog.requires.

  Returns:
    A list of dependency objects, one for each file in the files argument.
  """
  result = []
  filenames = set()
  for filename in files:
    if filename in filenames:
      continue

    # Python 3 requires the file encoding to be specified
    if (sys.version_info[0] < 3):
      file_handle = open(filename, 'r')
    else:
      file_handle = open(filename, 'r', encoding='utf8')

    try:
      dep = CreateDependencyInfo(filename, file_handle)
      result.append(dep)
    finally:
      file_handle.close()

    filenames.add(filename)

  return result


def CreateDependencyInfo(filename, source):
  """Create dependency info.

  Args:
    filename: Filename for source.
    source: File-like object containing source.

  Returns:
    A DependencyInfo object with provides and requires filled.
  """
  dep = DependencyInfo(filename)
  for line in source:
    if re.match(req_regex, line):
      dep.requires.append(re.search(req_regex, line).group(1))
    if re.match(prov_regex, line):
      dep.provides.append(re.search(prov_regex, line).group(1))
  return dep


def BuildDependencyHashFromDependencies(deps):
  """Builds a hash for searching dependencies by the namespaces they provide.

  Description:
    Dependency objects can provide multiple namespaces.  This method enumerates
    the provides of each dependency and adds them to a hash that can be used
    to easily resolve a given dependency by a namespace it provides.

  Args:
    deps: a list of dependency objects used to build the hash.

  Raises:
    Exception: If a multiple files try to provide the same namepace.

  Returns:
    A hash table { namespace: dependency } that can be used to resolve a
    dependency by a namespace it provides.
  """
  dep_hash = {}
  for dep in deps:
    for provide in dep.provides:
      if provide in dep_hash:
        raise Exception('Duplicate provide (%s) in (%s, %s)' % (
            provide,
            dep_hash[provide].filename,
            dep.filename))
      dep_hash[provide] = dep
  return dep_hash


def CalculateDependencies(paths, inputs):
  """Calculates the dependencies for given inputs.

  Description:
    This method takes a list of paths (files, directories) and builds a
    searchable data structure based on the namespaces that each .js file
    provides.  It then parses through each input, resolving dependencies
    against this data structure.  The final output is a list of files,
    including the inputs, that represent all of the code that is needed to
    compile the given inputs.

  Args:
    paths: the references (files, directories) that are used to build the
      dependency hash.
    inputs: the inputs (files, directories, namespaces) that have dependencies
      that need to be calculated.

  Raises:
    Exception: if a provided input is invalid.

  Returns:
    A list of all files, including inputs, that are needed to compile the given
    inputs.
  """
  deps = BuildDependenciesFromFiles(paths + inputs)
  search_hash = BuildDependencyHashFromDependencies(deps)
  result_list = []
  seen_list = []
  for input_file in inputs:
    if IsNamespace(input_file):
      namespace = re.search(ns_regex, input_file).group(1)
      if namespace not in search_hash:
        raise Exception('Invalid namespace (%s)' % namespace)
      input_file = search_hash[namespace].filename
    if not IsValidFile(input_file) or not IsJsFile(input_file):
      raise Exception('Invalid file (%s)' % input_file)
    seen_list.append(input_file)
    file_handle = open(input_file, 'r')
    try:
      for line in file_handle:
        if re.match(req_regex, line):
          require = re.search(req_regex, line).group(1)
          ResolveDependencies(require, search_hash, result_list, seen_list)
    finally:
      file_handle.close()
    result_list.append(input_file)

  return result_list


def FindClosureBasePath(paths):
  """Given a list of file paths, return Closure base.js path, if any.

  Args:
    paths: A list of paths.

  Returns:
    The path to Closure's base.js file including filename, if found.
  """

  for path in paths:
    pathname, filename = os.path.split(path)

    if filename == 'base.js':
      f = open(path)

      is_base = False

      # Sanity check that this is the Closure base file.  Check that this
      # is where goog is defined.  This is determined by the @provideGoog
      # flag.
      for line in f:
        if '@provideGoog' in line:
          is_base = True
          break

      f.close()

      if is_base:
        return path

def ResolveDependencies(require, search_hash, result_list, seen_list):
  """Takes a given requirement and resolves all of the dependencies for it.

  Description:
    A given requirement may require other dependencies.  This method
    recursively resolves all dependencies for the given requirement.

  Raises:
    Exception: when require does not exist in the search_hash.

  Args:
    require: the namespace to resolve dependencies for.
    search_hash: the data structure used for resolving dependencies.
    result_list: a list of filenames that have been calculated as dependencies.
      This variable is the output for this function.
    seen_list: a list of filenames that have been 'seen'.  This is required
      for the dependency->dependent ordering.
  """
  if require not in search_hash:
    raise Exception('Missing provider for (%s)' % require)

  dep = search_hash[require]
  if not dep.filename in seen_list:
    seen_list.append(dep.filename)
    for sub_require in dep.requires:
      ResolveDependencies(sub_require, search_hash, result_list, seen_list)
    result_list.append(dep.filename)


def GetDepsLine(dep, base_path):
  """Returns a JS string for a dependency statement in the deps.js file.

  Args:
    dep: The dependency that we're printing.
    base_path: The path to Closure's base.js including filename.
  """
  return 'goog.addDependency("%s", %s, %s);' % (
      GetRelpath(dep.filename, base_path), dep.provides, dep.requires)


def GetRelpath(path, start):
  """Return a relative path to |path| from |start|."""
  # NOTE: Python 2.6 provides os.path.relpath, which has almost the same
  # functionality as this function. Since we want to support 2.4, we have
  # to implement it manually. :(
  path_list = os.path.abspath(os.path.normpath(path)).split(os.sep)
  start_list = os.path.abspath(
      os.path.normpath(os.path.dirname(start))).split(os.sep)

  common_prefix_count = 0
  for i in range(0, min(len(path_list), len(start_list))):
    if path_list[i] != start_list[i]:
      break
    common_prefix_count += 1

  # Always use forward slashes, because this will get expanded to a url,
  # not a file path.
  return '/'.join(['..'] * (len(start_list) - common_prefix_count) +
                  path_list[common_prefix_count:])

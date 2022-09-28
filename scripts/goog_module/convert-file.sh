#!/bin/bash

# This file makes extensive use of perl for the purpose of extracting and
# replacing string (regex) patterns in a way that is both GNU and macOS
# compatible.
#
# Common perl flags used (also described at https://perldoc.perl.org/perlrun):
#   -e : Used to execute perl programs on the command line
#   -p : Assumes an input loop around script. Prints every processed line.
#   -n : Assumes an input loop around script. Does not print every line.
#   -i : Used for in-place editing. Used in commands for find/replace.
#   -l[octnum] : Assigns the output record separator "$/" as an octal number. If
#        octnum is not present, sets output record separator to the current
#        value of the input record separator "$\".
#
# Common perl commands found:
# 1.  perl -pi -e 's/regex/replacement/modifiers'
#   This command does an in-place search-and-replace. The global ("/g") modifier
#   causes it to replace all occurrences, rather than only the first match.
# 2.  perl -ne 'print m/regex/modifiers'
#   This command returns a string containing the regex match (designated by the
#   capture group "()" in the regex). This will return the first match, unless
#   the global modifier is specified, in which case, it will return all matches.
#   If this command is used without a capture group it returns true or false (in
#   the form a truthy or falsy value).
# 3.  perl -nle 'print $& while m{regex}modifiers'
#   Similar to (2), but returns regex matches separated by newlines.
#   The "m{regex}modifiers" is equivalent to "m/regex/modifiers" syntax.
#
# Additional information on regex:
# This script makes use of some advanced regex syntax such as "capture groups"
# and "lookaround assertions".
# Additionally, characters are escaped from regex with a backslash "\".
# Single quotes need to be escaped in both regex and the string, resulting in
# '\'' being used to represent a single quote character.
# For a reference to syntax of regular expressions in Perl, see:
# https://perldoc.perl.org/perlre

#######################################
# Logging functions.
#######################################
COLOR_NONE="\033[0m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
ORANGE="\033[0;33m"
RED="\033[0;31m"
success() {
  echo -e  "${GREEN}[SUCCESS]:${COLOR_NONE} $*" >&2
}
inf() {
  echo -e  "${BLUE}[INFO]:${COLOR_NONE} $*" >&2
}
warn() {
  echo -e  "${ORANGE}[WARN]:${COLOR_NONE} $*" >&2
}
err() {
  echo -e  "${RED}[ERROR]:${COLOR_NONE} $*" >&2
}
reenter_instructions() {
  echo -e  "${ORANGE}$*${COLOR_NONE}" >&2
}

#######################################
# Checks whether the provided filepath exists.
# Arguments:
#   The filepath to check for existence.
#   Optional: Whether to log an error.
#######################################
verify-filepath() {
  local filepath="$1"
  local no_log="$2"
  if [[ ! -f "${filepath}" ]]; then
    if [[ -z "${no_log}" || "${no_log}" == 'true' ]]; then
      err "File ${filepath} does not exist"
    fi
    return 1
  fi
}

#######################################
# Creates a commit with a message based on the specified step and file.
# Arguments:
#   Which conversion step this message is for.
#   The filepath of the file being converted.
#######################################
commit-step() {
  local step="$1"
  local filepath="$2"
  if [[ -z "${step}" ]]; then
    err "Missing argument (1-4)"
    return 1
  fi
  if [[ -z "${filepath}" ]]; then
    err "Missing argument filepath"
    return 1
  fi
  verify-filepath "${filepath}"
  if [[ $? -eq 1 ]]; then return 1; fi

  local message=''
  case $1 in
    1)
      message="Migrate ${filepath} to ES6 const/let"
      ;;
    2)
      message="Migrate ${filepath} to goog.module"
      ;;
    3)
      message="Migrate ${filepath} named requires"
      ;;
    4)
      message="clang-format ${filepath}"
      ;;
    *)
      err 'INVALID ARGUMENT'
      return 1
      ;;
  esac
  git add .
  if [[ -z $(git status --porcelain) ]]; then
    success "Nothing to commit"
    return 0
  fi
  git commit -m "${message}"
  success "created commit with message: \"${message}\""
}

#######################################
# Extracts a list of properties that are accessed on the specified module name.
# Excludes any matches
# Arguments:
#   The module name to find properties accessed for.
#   The modules required by the specified module as a single string.
#   The filepath to extract requires from.
#   Optional: The top-level module.
# Outputs:
#   Writes list of properties to stdout as items separated by spaces.
#######################################
getPropertiesAccessed() {
  local module_name="$1"
  local requires="$2"
  local filepath="$3"
  local top_module_name="$4"
  # Get any strings that follow "$module_name.", excluding matches for
  # "$module_name.prototype" and remove list item duplicates (sort -u).
  local properties_accessed=$(perl -nle 'print $& while m{(?<='"${module_name}"'\.)(?!prototype)\w+}g' "${filepath}" | sort -u)

  # Get a list of any requires that are a child of $module_name.
  # Ex: Blockly.utils.dom is a child of Blockly.utils, this would return "dom"
  local requires_overlap=$(echo "${requires}" | perl -nle 'print $& while m{(?<='"${module_name}"'\.)\w+}g')
  # Detect if there was any overlap.
  if [[ -n "${requires_overlap}" ]]; then
    while read -r requires_overlap_prop; do
      # Removes any instances of $requires_overlap_prop. Includes regex
      # lookarounds so that it does not simply match string contains.
      # Ex: if $requires_overlap is "Svg", then it would update the list
      # "isTargetInput mouseToSvg noEvent Svg" to
      # "isTargetInput mouseToSvg noEvent " (note that mouseToSvg is unchanged).
      properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/(?<!\w)'"${requires_overlap_prop}"'(?!\w)//g')
    done <<<"${requires_overlap}"
  fi

  # Fix formatting (remove extra whitespace) and delimit the list with spaces.
  properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/\s+/ /g' | xargs)

  echo "${properties_accessed}"
}

#######################################
# Extracts a list of requires defined in the file in the form of a single string
# of items separated by newlines.
# Arguments:
#   The filepath to extract requires from.
# Outputs:
#   Writes list of requires to stdout as items separated by newlines.
#######################################
getRequires() {
  local filepath="$1"
  # Extracts all strings that start with goog.require(' or goog.requireType('
  # up until the ending single quote.
  # Ex: "goog.require('Blockly.utils')" would extract "Blockly.utils"
  local requires=$(perl -nle 'print $& while m{(?:(?<=^goog.require\('\'')|(?<=^goog.requireType\('\''))[^'\'']+}g' "${filepath}")
  echo "${requires}"
}

#######################################
# Runs step 2 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step2 () {
  local filepath="$1"

  inf "Updating goog.provide declaration..."
  perl -pi -e 's/^goog\.provide(\([^\)]+\)\;)/goog\.module\1\ngoog.module.declareLegacyNamespace\(\)\;/' "${filepath}"

  inf "Extracting module name..."
  local module_name=$(perl -ne 'print m/(?<=^goog\.module\('\'')([^'\'']+)/' "${filepath}")
  if [[ -z "${module_name}" ]]; then
    err "Could not extract module name"
    return 1
  fi
  inf "Extracted module name \"${module_name}\""

  if [[ $(grep "${module_name} = " "${filepath}") ]]; then
    local class_name=$(echo "${module_name}" | perl -ne 'print m/(\w+)$/')
    inf "Found class \"${class_name}\" in file."
    inf "Updating class declaration..."
    perl -pi -e 's/^('"${module_name}"') =/const '"${class_name}"' =/g' "${filepath}"

    inf "Updating local references to class..."
    perl -pi -e 's/'"${module_name}"'(?!['\''\w])/'"${class_name}"'/g' "${filepath}"

    inf "Appending class export to end of file..."
    echo "" >> "${filepath}"
    echo "exports = ${class_name};" >> "${filepath}"

    npm run build:deps

    success "Completed automated conversion to goog.module. Please manually review before committing."
    return 0
  fi

  # No top level class.
  inf 'Updating top-level property declarations...'
  perl -pi -e 's/^'"${module_name}"'\.([^ ]+) =/const \1 =/g' "${filepath}"

  # Extract specific properties accessed so that properties from requires that
  # are children of the module aren't changed.
  # Ex: The module Blockly.utils shouldn't update Blockly.utils.dom (since it is
  # a require from another module.
  local requires=$(getRequires "${filepath}")
  local properties_accessed=$(getPropertiesAccessed "${module_name}" "${requires}" "${filepath}")
  inf "Updating local references to module..."
  for property in $(echo "${properties_accessed}"); do
    inf "Updating references of ${module_name}.${property} to ${property}..."
    perl -pi -e 's/'"${module_name}"'\.'"${property}"'(?!\w)/'"${property}"'/g' "${filepath}"
  done

  npm run build:deps
  success "Completed automation for step 2. Please manually review and add exports for non-private top-level functions."
}

#######################################
# Runs step 3 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step3() {
  inf "Extracting module name..."
  local module_name=$(perl -ne 'print m/(?<=^goog\.module\('\'')([^'\'']+)/' "${filepath}")
  if [[ -z "${module_name}" ]]; then
    err "Could not extract module name"
    return 1
  fi
  inf "Extracted module name \"${module_name}\""

  local requires=$(getRequires "${filepath}")

  # Process each require
  echo "${requires}" | while read -r require; do
    inf "Processing require \"${require}\""
    local usages=$(perl -nle 'print $& while m{'"${require}"'(?!'\'')}g' "${filepath}" | wc -l)

    if [[ "${usages}" -eq "0" ]]; then
      warn "Unused require \"${require}\""
      continue
    fi

    local require_name=$(echo "${require}" | perl -pe 's/(\w+\.)+(\w+)/\2/g')
    inf "Updating require declaration for ${require}..."
    perl -pi -e 's/^(goog\.(require|requireType)\('\'"${require}"\''\);)/const '"${require_name}"' = \1/' "${filepath}"

    # Parse property access of module
    local direct_access_count=$(perl -nle 'print $& while m{'"${require}"'[^\.'\'']}g' "${filepath}" | wc -l)
    local properties_accessed=$(getPropertiesAccessed "${require}" "${requires}" "${filepath}")

    # Remove $module_name in case it is a child of $require.
    # Ex: Blockly.utils.dom would be a child of Blockly, module_overlap would be
    # "utils"
    local module_overlap=$(echo "${module_name}" | perl -nle 'print $& while m{(?<='"${require}"'\.)\w+}g')
    if [[ -n "${module_overlap}" ]]; then
      properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/'"${module_overlap}"'//g')
      # Trim any extra whitespace created.
      properties_accessed=$(echo "${properties_accessed}" | xargs)
    fi

    if [[ -n "${properties_accessed}" ]]; then
      local comma_properties=$(echo "${properties_accessed}" | perl -pe 's/\s+/, /g' | perl -pe 's/, $//')
      inf "Detected references of ${require}: ${comma_properties}"

      for require_prop in $(echo "${properties_accessed}"); do
        inf "Updating references of ${require}.${require_prop} to ${require_name}.${require_prop}..."
        perl -pi -e 's/'"${require}"'\.'"${require_prop}"'(?!\w)/'"${require_name}"'\.'"${require_prop}"'/g' "${filepath}"
      done
    fi

    inf "Updating direct references of ${require} to ${require_name}..."
    perl -pi -e 's/'"${require}"'(?!['\''\w\.])/'"${require_name}"'/g' "${filepath}"
  done

  local missing_requires=$(perl -nle'print $& while m{(?<!'\'')Blockly(\.\w+)+}g' "${filepath}")
  missing_requires=$(echo "${missing_requires}" | tr ' ' '\n' | sort -u)
  if [[ -n "${missing_requires}" ]]; then
    # Search for the string goog.require('Blockly') or goog.requireType('Blockly')
    local has_blockly_require=$(perl -ne 'print m/goog\.(?:require|requireType)\('\''Blockly'\''\)/' "${filepath}")
    if [[ -n "${has_blockly_require}" ]]; then
      warn 'Blockly detected as a require.'
      warn "Potentially missing requires for:\n${missing_requires}\nPlease manually review."
    else
      err "Missing requires for:\n${missing_requires}\nPlease manually fix."
    fi
  fi

  success "Completed automation for step 3. Please manually review and reorder requires."
}

#######################################
# Runs step 4 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step4() {
  inf "Running clang-format"
  npx clang-format -i "${filepath}"
}

#######################################
# Runs the specified step.
# Arguments:
#   Which step to run.
#   The filepath of the file being converted.
#######################################
run-step() {
  local step="$1"
  local filepath="$2"
  if [[ -z "${step}" ]]; then
    err "Missing argument (1-4)"
    return 1
  fi
  if [[ -z "${filepath}" ]]; then
    err "Missing argument filepath"
    return 1
  fi
  verify-filepath "${filepath}"
  if [[ $? -eq 1 ]]; then return 1; fi

  case "${step}" in
    2)
      step2 "${filepath}"
      ;;
    3)
      step3 "${filepath}"
      ;;
    4)
      step4 "${filepath}"
      ;;
    *)
      err "INVALID ARGUMENT ${step}"
      return 1
      ;;
  esac
}

#######################################
# Prints usage information.
#######################################
help() {
  echo "Conversion steps:"
  echo " 1. Use IDE to convert var to let/const"
  echo " 2. Rewrite the goog.provide statement as goog.module and explicitly enumerate exports"
  echo " 3. Rewrite goog.requires statements and add missing requires (often skipped for simple files)"
  echo " 4. Run clang-format on the whole file"
  echo ""
  echo "Usage: $0 [-h] [-c <step> <filepath>|-s <step> <filepath>]"
  echo "  -h                    Display help and exit"
  echo "  -c <step> <filepath>  Create a commit for the specified step [1-4]"
  echo "  -s <step> <filepath>  Run the specified step [2-4]"
}

#######################################
# Main entry point.
#######################################
main() {
  if [ "$1" = "" ]; then
    help
  else
    local filepath=""
    # Support filepath as first argument.
    verify-filepath "$1" "false"
    if [[ $? -eq 0 ]]; then
      filepath="$1"
      shift
    fi

    local command="$1"
    shift
    case $command in
      -c) commit-step "$@" "${filepath}" ;;
      -s) run-step "$@" "${filepath}" ;;
      *) err "INVALID ARGUMENT ${command}";;
    esac
  fi
}

main "$@"

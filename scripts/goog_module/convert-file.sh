#!/bin/bash

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
# Runs step 2 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step2 () {
  local filepath="$1"

  inf "Updating goog.provide declaration..."
  perl -pi -e 's/^goog\.provide(\([^\)]+\)\;)/goog\.module\1\ngoog.module.declareLegacyNamespace\(\)\;/g' "${filepath}"

  inf "Extracting module name..."
  local module_name=$(perl -nle'print $& while m{(?<=^goog\.module\('\'')([^'\'')]+)}g' "${filepath}")
  if [[ -z "${module_name}" ]]; then
    err "Could not extract module name"
    return 1
  fi
  inf "Extracted module name \"${module_name}\""

  if [[ $(grep "${module_name} = " "${filepath}") ]]; then
    local class_name=$(echo "${module_name}" | perl -nle'print $& while m{(\w+)$}g')
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
  inf "Updating local references to module..."
  perl -pi -e 's/'"${module_name}"'\.([^ ]+)/\1/g' "${filepath}"

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
  local module_name=$(perl -nle'print $& while m{(?<=^goog\.module\('\'')([^'\'')]+)}g' "${filepath}")
  if [[ -z "${module_name}" ]]; then
    err "Could not extract module name"
    return 1
  fi
  inf "Extracted module name \"${module_name}\""

  local requires=$(perl -nle'print $& while m{(?:(?<=^goog.require\('\'')|(?<=^goog.requireType\('\''))[^'\'']+}g' "${filepath}")

  # Process each require
  echo "${requires}" | while read -r require; do
    inf "Processing require \"${require}\""
    local usages=$(perl -nle'print $& while m{'"${require}"'(?!'\'')}g' "${filepath}" | wc -l)

    if [[ "${usages}" -eq "0" ]]; then
      warn "Unused require \"${require}\""
      continue
    fi

    local direct_access_count=$(perl -nle'print $& while m{'"${require}"'[^\.'\'']}g' "${filepath}" | wc -l)
    local properties_accessed=$(perl -nle'print $& while m{(?<='"${require}"'\.)(?!prototype)\w+}g' "${filepath}" | tr ' ' '\n' | sort -u)
    # Detect requires overlap
    # (ex: Blockly.utils require and Blockly.utils.dom also in requires)
    local requires_overlap=$(echo "${requires}" | perl -nle'print $& while m{(?<='"${require}"'\.)\w+}g')
    if [[ -n "${requires_overlap}" ]]; then
      while read -r requires_overlap_prop; do
        properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/'"${requires_overlap_prop}"'//g')
      done <<<"${requires_overlap}"
    fi
    # Detect module name overlap
    # (ex: Blockly require and Blockly.ContextMenuItems module being converted)
    local module_overlap=$(echo "${module_name}" | perl -nle'print $& while m{(?<='"${require}"'\.)\w+}g')
    if [[ -n "${module_overlap}" ]]; then
      properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/'"${module_overlap}"'//g')
    fi
    properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/\s+/ /g' | xargs)

    if [[ "${direct_access_count}" -eq "0" && -n "${properties_accessed}" ]]; then
      local deconstructed_comma=$(echo "${properties_accessed}" | perl -pe 's/\s+/, /g' | perl -pe 's/, $//')
      inf "Deconstructing ${require} into \"{${deconstructed_comma}}\"..."
      perl -pi -e 's/^(goog\.(require|requireType)\('\'"${require}"\''\);)/const \{'"${deconstructed_comma}"'\} = \1/' "${filepath}"

      for require_prop in echo "${properties_accessed}"; do
        inf "Updating references of ${require}.${require_prop} to ${require_prop}..."
        perl -pi -e 's/'"${require}"'\.'"${require_prop}"'([^'\''\w])/'"${require_prop}"'\1/g' "${filepath}"
      done
      continue
    fi

    local require_name=$(echo "${require}" | perl -pe 's/(\w+\.)+(\w+)/\2/g')
    inf "Updating require declaration for ${require}..."
    perl -pi -e 's/^(goog\.(require|requireType)\('\'"${require}"\''\);)/const '"${require_name}"' = \1/' "${filepath}"

    inf "Updating references of ${require} to ${require_name}..."
    perl -pi -e 's/'"${require}"'([^'\''\w])/'"${require_name}"'\1/g' "${filepath}"
  done

  local missing_requires=$(perl -nle'print $& while m{(?<!'\'')Blockly(\.\w+)+}g' "${filepath}")
  missing_requires=$(echo "${missing_requires}" | tr ' ' '\n' | sort -u)
  if [[ -n "${missing_requires}" ]]; then
    err "Missing requires for:\n${missing_requires}\nPlease manually fix."
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
help {
  echo "Conversion steps:"
  echo " 1. Use IDE to convert var to let/const"
  echo " 2. Rewrite the goog.provide statement as goog.module and explicitly enumerate exports"
  echo " 3. Rewrite goog.requires statements and add missing requires (often skipped for simple files)"
  echo " 4. Run clang-format on the whole file"
  echo ""
  echo "Usage: $0 [-h] [-c <step> <filepath>|-s <step> <filepath>]"
  echo "  -h                    Display help and exit"
  echo "  -c <step> <filepath>  Create a commit for the specified step [2-4]"
  echo "  -s <step> <filepath>  Run the specified step [1-4]"
}

#######################################
# Main entry point.
#######################################
main {
  if [ "$1" = "" ]; then
  help
else
  local filepath=""
  # Support filepath as first argument.
  verify-filepath "${filepath}" "false"
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

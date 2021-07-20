#!/bin/bash

#######################################
# Logging functions
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
#######################################
verify-filepath() {
  if [[ ! -f "$1" ]]; then
    err "File $1 does not exist"
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
  if [ -z "${step}" ]; then
    err "Missing argument (1-4)"
    return 1
  fi
  if [ -z "${filepath}" ]; then
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
  if [ -z "${filepath}" ]; then
    err "Missing argument filepath"
    return 1
  fi

  inf "Verifying single goog.provide declarations..."
  local provide_count=$(grep -o 'goog.provide' ${filepath} | wc -l)
  if [[ "${provide_count}" -gt "1" ]]; then
    err "Cannot convert file with multiple provides. Please split the file first."
    return 1
  elif [[ "${provide_count}" -eq "0" ]]; then
    err "Cannot convert file without a provide."
    return 1
  fi

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
    inf 'Updating class properties...'
    perl -pi -e 's/^'"${module_name}"'((\.\w+)+) =/'"${class_name}"'\1 =/g' "${filepath}"

    inf "Updating local references to class..."
    perl -pi -e 's/'"${module_name}"'([^'\''])/'"${class_name}"'\1/g' "${filepath}"

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
  success "Completed automation for step 3. Please manually review and add exports for non-private top-level functions."

}
#######################################
# Runs step 3 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step3() {
  local filepath="$1"
  if [ -z "${filepath}" ]; then
    err "Missing argument filepath"
    return 1
  fi

  local requires=$(perl -nle'print $& while m{^goog.require(|Type)\('\''(.*)'\''\)}g' "${filepath}" | perl -pe 's/goog.require(|Type)\('\''(.*)'\''\)/\2/g')

  # Process each require
  echo "${requires}" | while read -r require ; do
    inf "Processing require \"${require}\""
    local usages=$(perl -nle'print $& while m{'"${require}"'(?!'\'')}g' "${filepath}" | wc -l)

    if [[ "${usages}" -eq "0" ]]; then
      warn "Unused require \"${require}\""
      continue
    fi

    local direct_access_count=$(perl -nle'print $& while m{'"${require}"'[^\.'\'']}g' "${filepath}" | wc -l)
    local properties_accessed=$(perl -nle'print $& while m{(?<='"${require}"'\.)(?!prototype)\w+}g' "${filepath}" | tr ' ' '\n' | sort -u)
    # Detect overlap (ex: Blockly.utils and Blockly.utils.dom)
    local overlap=$(echo "${requires}"| perl -nle'print $& while m{(?<='"${require}"'\.)\w+}g')
    if [[ ! -z "${overlap}" ]]; then
      while read -r overlap_prop ; do
        properties_accessed=$(echo "$properties_accessed" | perl -pe 's/'"${overlap_prop}"'//g')
      done <<<"${overlap}"
      properties_accessed=$(echo "${properties_accessed}" | perl -pe 's/\s+/ /g' | xargs)
    fi

    if [[ "${direct_access_count}" -eq "0" && ! -z "${properties_accessed}" ]]; then
      local deconstructed_comma=$(echo "${properties_accessed}" | perl -pe 's/\s+/, /g' | perl -pe 's/, $//')
      inf "Deconstructing ${require} into \"{${deconstructed_comma}}\""

      inf "Updating require declaration for ${require}..."
      perl -pi -e 's/^(goog\.(require|requireType)\('\'"${require}"\''\);)/const \{'"${deconstructed_comma}"'\} = \1/' "${filepath}"

      echo "${properties_accessed}" | while read -r require_prop ; do
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
  if [[ ! -z "${missing_require_lines}" ]]; then
    err $missing_require_lines
    err "Missing requires for: ${missing_requires} Please manually fix."
  fi

  inf "Add missing nullability modifiers..."
  perl -pi -e 's/@(param|return) \{([A-Z])/@\1 \{?\2/g' "${filepath}"

  success "Completed automation for step 3. Please manually review and reorder requires."
}
#######################################
# Runs step 4 of the automated conversion.
# Arguments:
#   The filepath of the file being converted.
#######################################
step4() {
  local filepath="$1"
  if [ -z ${filepath} ]; then
    err "filepath is unset"
    return 1
  fi
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
  if [ -z "${step}" ]; then
    err "Missing argument (1-4)"
    return 1
  fi
  if [ -z "${filepath}" ]; then
    err "Missing argument filepath"
    return 1
  fi
  verify-filepath "${filepath}"
  if [[ $? -eq 1 ]]; then return 1; fi

  case "${step}" in
    2)
      step2 ${filepath}
      ;;
    3)
      step3 ${filepath}
      ;;
    4)
      step4 ${filepath}
      ;;
    *)
      err 'INVALID ARGUMENT'
      return 1
      ;;
  esac
}
#######################################
# Prints usage information.
#######################################
function help {
  echo "Conversion steps:"
  echo " 1. Use IDE to convert var to let/const"
  echo " 2. Rewrite the goog.provide statement as goog.module and explicitly enumerate exports"
  echo " 3. Rewrite goog.requires statements and add missing requires (often skipped for simple files)"
  echo " 4. Run clang-format on the whole file"
  echo ""
  echo "Usage: $0 [-h|-c <number>|-s <number>|-f] <filepath>"
  echo "  -h                      Display help"
  echo "  -c <step> <filepath>    Create a commit for the specified step [2-4]"
  echo "  -s <step> <filepath>    Run the specified step [1-4]"
}

if [ "$1" = "" ]; then
  help
else
  command="$1"
  shift
  case $command in
    -h)         help $@;;
    -c)         commit-step $@;;
    -s)         run-step $@;;
    *)          help;;
  esac
fi

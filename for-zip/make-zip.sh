#!/bin/sh

# Copy all current files to a temporary directory.
rm -rf /var/tmp/blockly-zip/blockly
mkdir -p /var/tmp/blockly-zip/blockly
cp -r /usr/local/google/home/spertus/src-mirror/blockly/* /var/tmp/blockly-zip/blockly

# Rebuild the index with the latest language files.
cp /usr/local/google/home/spertus/src-mirror/blockly/for-zip/index-template.soy /var/tmp/blockly-zip/blockly/apps/index/template.soy
cd /var/tmp/blockly-zip/blockly/apps
../i18n/json_to_js.py --output_dir=index/generated --template common.soy,index/template.soy json/*.json

# Copy in the files just for this distribution
cp /usr/local/google/home/spertus/src-mirror/blockly/for-zip/{index.html,README.txt} /var/tmp/blockly/

# Remove unneeded files and directories.
rm -rf /var/tmp/blockly-zip/blockly/appengine
rm -rf /var/tmp/blockly-zip/blockly/apps/{blockfactory,graph,json,plane}
rm -rf /var/tmp/blockly-zip/blockly/apps/{common,template}.soy
rm -rf /var/tmp/blockly-zip/blockly/apps/*/template.soy
rm -rf /var/tmp/blockly-zip/blockly/apps/index/{blockfactory,graph,plane}.png
rm -rf /var/tmp/blockly-zip/blockly/apps/maze/sources
rm -rf /var/tmp/blockly-zip/blockly/apps/turtle/contest
rm -rf /var/tmp/blockly-zip/blockly/{blocks,core,demos,for-zip,generators,i18n,tests}
rm -rf /var/tmp/blockly-zip/blockly/{build.py,codereview.settings,README.md}
rm /var/tmp/blockly-zip/blockly/blockly.zip

# Zip it up.
cd /var/tmp
rm /usr/local/google/home/spertus/src-mirror/blockly/blockly.zip
zip -r /usr/local/google/home/spertus/src-mirror/blockly/blockly.zip blockly-zip -x "**/.svn**"






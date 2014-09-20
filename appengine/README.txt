
  Running an App Engine server

This directory contains the files needed to setup the optional Blockly server.
Although Blockly itself is 100% client-side, the server enables cloud storage
and sharing.  Store your programs in Datastore and get a unique URL that allows
you to load the program on any computer.

To run your own App Engine instance you'll need to create this directory
structure:

blockly/
 |- app.yaml
 |- index.yaml
 |- index_redirect.py
 |- README.txt
 |- storage.js
 |- storage.py
 |- closure-library-read-only/  (Optional)
 `- static/
     |- apps/
     |- blocks/
     |- core/
     |- demos/
     |- generators/
     |- media/
     |- msg/
     |- tests/
     |- blockly_compressed.js
     |- blockly_uncompressed.js  (Optional)
     |- blocks_compressed.js
     |- dart_compressed.js
     |- javascript_compressed.js
     `- python_compressed.js

Instructions for fetching Closure may be found here:
  https://github.com/google/blockly/wiki/Closure

Finally, upload this directory structure to your App Engine account,
wait a minute, then go to http://YOURNAME.appspot.com/

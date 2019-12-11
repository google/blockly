This Blockly demo uses Closure Templates to create a multilingual application.
Any changes to the template.soy file require a recompile.  Here is the command
to generate a quick English version for debugging:

java -jar soy/SoyToJsSrcCompiler.jar --outputPathFormat generated/en.js --srcs template.soy

To generate a full set of language translations, first extract all the strings
from template.soy using this command:

java -jar soy/SoyMsgExtractor.jar --outputFile xlf/extracted_msgs.xlf  template.soy

This generates xlf/extracted_msgs.xlf, which may then be used by any
XLIFF-compatible translation console to generate a set of files with the
translated strings.  These should be placed in the xlf directory.

Finally, generate all the language versions with this command:

java -jar soy/SoyToJsSrcCompiler.jar --locales ar,be-tarask,br,ca,da,de,el,en,es,fa,fr,he,hrx,hu,ia,is,it,ja,ko,ms,nb,nl,pl,pms,pt-br,ro,ru,sc,sv,th,tr,uk,vi,zh-hans,zh-hant --messageFilePathFormat xlf/translated_msgs_{LOCALE}.xlf --outputPathFormat "generated/{LOCALE}.js" template.soy

This is the process that Google uses for maintaining Blockly Games in 50+
languages.  The XLIFF format is simple enough that it is trivial to write a
Python script to reformat it into some other format (such as JSON) for
compatibility with other translation consoles.

For more information, see message translation for Closure Templates:
https://developers.google.com/closure/templates/docs/translation

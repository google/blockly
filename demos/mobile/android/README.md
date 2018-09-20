# Blockly in an Android WebView

This code demonstrates how to get Blockly running in an Android app by
embedding it in a WebView.

### BlocklyWebViewFragment

Most of the work is done within the fragment class `BlocklyWebViewFragment`.
This fragment instantiates the WebView, loads the HTML
(`assets/blockly/webview.html`, copied from `demos/mobile/html/index.html`),
and provides a few helper methods.

### Copying web assets with gradle

This android project copies the necessary files from the main Blockly
repository (i.e., parent directory). In `app/build.gradle`, note the
`copyBlocklyHtmlFile` and `copyBlocklyMoreFiles` tasks.

In your own project, the HTML and related files can be placed directly in the
`assets/blockly` directory without the copy step. However, using the copy tasks
simplifies the synchronization with an iOS app using the same files.

### Loading Block Definitions and Generator functions

The `webview.html` loads the block definitions and generator functions directly
into the page, without support or coordination with the Android classes. This
assumes the app will always utilize the same blocks. This does not mean all
blocks are visible to the user all the time; that is controlled by the toolbox
and workspace files. This should accommodate almost all applications.

This does mean loading your own block definitions and generators will involve
editing the HTML, adding you own `<script>` tag, and possibly removing
the `blocks_compressed.js` if you do not use any standard blocks.

### Connecting a Developer Console

While the console output of the WebView will be visible in the Android log
(i.e., `logcat`), some times a more intrusive approach is required to isolate
a problem. For instructions on connecting the WebView to Chrome's Developer
Tools, see this article:

    https://developers.google.com/web/tools/chrome-devtools/remote-debugging/

The WebView must be visible in the connect device or emulator before the
WebView will included in the list of available pages to connect to.
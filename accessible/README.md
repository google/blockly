Accessible Blockly
==================

Google's Blockly is a web-based, visual programming editor that is accessible
to blind users.

The code in this directory renders a version of the Blockly toolbox and
workspace that is fully keyboard-navigable, and compatible with most screen
readers. It is optimized for NVDA on Firefox.

In the future, Accessible Blockly may be modified to suit accessibility needs
other than visual impairments. Note that deaf users are expected to continue
using Blockly over Accessible Blockly.


Using Accessible Blockly in Your Web App
----------------------------------------
The demo at blockly/demos/accessible covers the absolute minimum required to
import Accessible Blockly into your web app. You will need to import the files
in the same order as in the demo: utils.service.js will need to be the first
Angular file imported.

When the DOMContentLoaded event fires, call ng.platform.browser.bootstrap() on
the main component to be loaded. This will usually be blocklyApp.AppComponent,
but if you have another component that wraps it, use that one instead.


Customizing the Sidebar and Audio
---------------------------------
The Accessible Blockly workspace comes with a customizable sidebar.

To customize the sidebar, you will need to declare an ACCESSIBLE_GLOBALS object
in the global scope that looks like this:

    var ACCESSIBLE_GLOBALS = {
      mediaPathPrefix: null,
      customSidebarButtons: []
    };

The value of mediaPathPrefix should be the location of the accessible/media
folder.

The value of 'customSidebarButtons' should be a list of objects, each
representing buttons on the sidebar. Each of these objects should have the
following keys:
  - 'text' (the text to display on the button)
  - 'action' (the function that gets run when the button is clicked)
  - 'id' (optional; the id of the button)


Limitations
-----------
- We do not support having multiple Accessible Blockly apps in a single webpage.
- Accessible Blockly does not support the use of shadow blocks.

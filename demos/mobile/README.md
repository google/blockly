# Blockly on Mobile Devices

This directory contains three examples of running the Blockly library on mobile
devices. The `html/` directory is a example of configuring a webpage for touch
devices, with a Blockly workspace that fills the screen.

The `mobile/html/` is also the basis for the Android and iOS demos. Each native
app copies this demo into the app's local resources, and required Blockly
library files, and hosts them in an embedded WebView.

Thus, developers can quickly iterate within the `mobile/html/` directory, and
see changes in both the Android and iOS native apps.

## Running the Mobile HTML Demo

Before running the mobile HTML demo, you need to create some symbolic links
in your local file system. Run the `mobile/html/ln_resources.sh` file from
the `mobile/html/` directory.  This mimicks the relative locations of the
Blockly files seen when loading the page in a native app's embedded WebView.

After doing this, opening `mobile/html/index.html` should open normally,
filling the page with one large Blockly workspace.

## The Android App

### Build and Run

Open the `demos/mobile/android/` directory in Android Studio. The project
files in the directory should be ready to build and run the demo in an emulator
or connected device.

### Android Copy Tasks

If you edit the `mobile/html/` demo to include new files, you will need to
update the native app project files to also copy those files.

In the Android project, two Gradle tasks are responsible for the copies.
In `mobile/android/app/build.gradle`, the tasks `copyBlocklyHtmlFile` and
`copyBlocklyMoreFiles` configure the copy actions.

## The iOS App

### Build and Run

Open the `demos/mobile/iOS/` directory in XCode. The project files in the
directory should be ready to build and run the demo in a simulator or connected
device.

### iOS Copy Script

The XCode project call out to `mobile/ios/cp_resources.sh` to copy the required
HTML and related files. If you've edited the `mobile/html/` demo to require new
files, update this script to copy these files, too.

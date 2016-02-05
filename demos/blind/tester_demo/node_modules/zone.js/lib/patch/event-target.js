'use strict';

var utils = require('../utils');

function apply() {
  // patched properties depend on addEventListener, so this needs to come first
  if (global.EventTarget) {
    utils.patchEventTargetMethods(global.EventTarget.prototype);

  // Note: EventTarget is not available in all browsers,
  // if it's not available, we instead patch the APIs in the IDL that inherit from EventTarget
  } else {
    var apis = [
      'ApplicationCache',
      'EventSource',
      'FileReader',
      'InputMethodContext',
      'MediaController',
      'MessagePort',
      'Node',
      'Performance',
      'SVGElementInstance',
      'SharedWorker',
      'TextTrack',
      'TextTrackCue',
      'TextTrackList',
      'WebKitNamedFlow',
      'Worker',
      'WorkerGlobalScope',
      'XMLHttpRequest',
      'XMLHttpRequestEventTarget',
      'XMLHttpRequestUpload'
    ];

    apis.forEach(function(api) {
      var proto = global[api] && global[api].prototype;

      // Some browsers e.g. Android 4.3's don't actually implement
      // the EventTarget methods for all of these e.g. FileReader.
      // In this case, there is nothing to patch.
      if (proto && proto.addEventListener) {
        utils.patchEventTargetMethods(proto);
      }
    });

    // Patch the methods on `window` instead of `Window.prototype`
    // `Window` is not accessible on Android 4.3
    if (typeof(window) !== 'undefined') {
      utils.patchEventTargetMethods(window);
    }
  }
}

module.exports = {
  apply: apply
};

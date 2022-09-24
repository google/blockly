/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 * @fileoverview Ajax calls to the GoFmt Server python program.
 */
'use strict';

/** Create a name space for the application. */
var GoFmtServer = {};

/**
 * Reads JSON data from the server and forwards formatted JavaScript object.
 * @param {!string} url Location for the JSON data.
 * @param {!function} jsonDataCb Callback with JSON object or null for error.
 */
GoFmtServer.getJson = function(url, callback) {
  GoFmtServer.sendRequest(url, 'GET', 'application/json', null, callback);
};

/**
 * Sends JSON data to the GoFmtServer.
 * @param {!string} url Requestor URL.
 * @param {!string} json JSON string.
 * @param {!function} callback Request callback function.
 */
GoFmtServer.postJson = function(url, json, callback) {
  GoFmtServer.sendRequest(url, 'POST', 'application/octet-stream', json, callback);
};

/**
 * Sends a request to the Ardubloockly Server that returns a JSON response.
 * @param {!string} url Requestor URL.
 * @param {!string} method HTTP method.
 * @param {!string} contentType HTTP content type.
 * @param {string} jsonObjSend JavaScript object to be parsed into JSON to send.
 * @param {!function} cb Request callback function, takes a single input for a
 *     parsed JSON object.
 */
GoFmtServer.sendRequest = function(
  url, method, contentType, jsonObjSend, cb) {
  var request = GoFmtServer.createRequest();

  // The data received is JSON, so it needs to be converted into the right
  // format to be displayed in the page.
  var onReady = function() {
    if (request.readyState == 4) {
      if (request.status == 200) {
        var jsonObjReceived = null;
        try {
          jsonObjReceived = JSON.parse(request.responseText);
        } catch (e) {
          console.error('Incorrectly formatted JSON data from ' + url);
          throw e;
        }
        cb(jsonObjReceived);
      } else {
        // return a null element which will be dealt with in the front end
        cb(null);
      }
    }
  };

  try {
    request.open(method, url, false);
    request.setRequestHeader('Content-type', contentType);
    request.onreadystatechange = onReady;
    request.send(jsonObjSend);
  } catch (e) {
    // Nullify callback to indicate error
    cb(null);
    throw e;
  }
};

/** @return {XMLHttpRequest} An XML HTTP Request multi-browser compatible. */
GoFmtServer.createRequest = function() {
  var request = null;
  try {
    // Firefox, Chrome, IE7+, Opera, Safari
    request = new XMLHttpRequest();
  } catch (e) {
    // IE6 and earlier
    try {
      request = new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        request = new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        throw 'Your browser does not support AJAX. You will not be able to' +
        'use all of GoFmt features.';
        request = null;
      }
    }
  }
  return request;
};


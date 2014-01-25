/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * @fileoverview Common utility functionality for Google Drive Realtime API,
 * including authorization and file loading. This functionality should serve
 * mostly as a well-documented example, though is usable in its own right.
 *
 * You can find this code as part of the Google Drive Realtime API Quickstart at
 * https://developers.google.com/drive/realtime/realtime-quickstart and also as
 * part of the Google Drive Realtime Playground code at
 * https://github.com/googledrive/realtime-playground/blob/master/js/realtime-client-utils.js
 */

/**
 * Realtime client utilities namespace.
 */
var rtclient = rtclient || {};

/**
 * OAuth 2.0 scope for installing Drive Apps.
 * @const
 */
rtclient.INSTALL_SCOPE = 'https://www.googleapis.com/auth/drive.install';

/**
 * OAuth 2.0 scope for opening and creating files.
 * @const
 */
rtclient.FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/**
 * OAuth 2.0 scope for accessing the user's ID.
 * @const
 */
rtclient.OPENID_SCOPE = 'openid';

/**
 * MIME type for newly created Realtime files.
 * @const
 */
rtclient.REALTIME_MIMETYPE = 'application/vnd.google-apps.drive-sdk';

/**
 * Parses the hash parameters to this page and returns them as an object.
 * @return {!Object} Parameter object.
 */
rtclient.getParams = function() {
  var params = {};
  var hashFragment = window.location.hash;
  if (hashFragment) {
    // split up the query string and store in an object
    var paramStrs = hashFragment.slice(1).split('&');
    for (var i = 0; i < paramStrs.length; i++) {
      var paramStr = paramStrs[i].split('=');
      params[paramStr[0]] = unescape(paramStr[1]);
    }
  }
  // Opening from Drive will encode the state in a query search parameter
  var searchFragment = window.location.search;
  if (searchFragment) {
    // split up the query string and store in an object
    var paramStrs2 = searchFragment.slice(1).split("&");
    for (var j = 0; j < paramStrs2.length; j++) {
      var paramStr2 = paramStrs2[j].split("=");
      params[paramStr2[0]] = unescape(paramStr2[1]);
    }
  }
  console.log(params);
  return params;
};

/**
 * Instance of the query parameters.
 */
rtclient.params = rtclient.getParams();

/**
 * Fetches an option from options or a default value, logging an error if
 *     neither is available.
 * @param {!Object} options Containing options.
 * @param {string} key Option key.
 * @param {*} defaultValue Default option value (optional).
 * @return {*} Option value.
 */
rtclient.getOption = function(options, key, defaultValue) {
  if (options.hasOwnProperty(key)) {
    return options[key];
  }
  console.error(key + ' should be present in the options.');
  return defaultValue;
};

/**
 * Creates a new Authorizer from the options.
 * @constructor
 * @param {!Object} options For authorizer. Two keys are required as mandatory,
 *     these are:
 *
 *    1. "clientId", the Client ID from the console
 */
rtclient.Authorizer = function(options) {
  this.clientId = rtclient.getOption(options, 'clientId');
  // Get the user ID if it's available in the state query parameter.
  this.userId = rtclient.params['userId'];
  this.authButton = document.getElementById(rtclient.getOption(options,
      'authButtonElementId'));
};

/**
 * Start the authorization process.
 * @param {Function} onAuthComplete To call once authorization has completed.
 */
rtclient.Authorizer.prototype.start = function(onAuthComplete) {
  var _this = this;
  gapi.load('auth:client,drive-realtime,drive-share', function() {
    _this.authorize(onAuthComplete);
  });
};

/**
 * Reauthorize the client with no callback (used for authorization failure).
 * @param {Function} onAuthComplete To call once authorization has completed.
 */
rtclient.Authorizer.prototype.authorize = function(onAuthComplete) {
  var clientId = this.clientId;
  var userId = this.userId;
  var _this = this;
  var handleAuthResult = function(authResult) {
    if (authResult && !authResult.error) {
      _this.authButton.disabled = true;
      _this.fetchUserId(onAuthComplete);
    } else {
      _this.authButton.disabled = false;
      _this.authButton.onclick = authorizeWithPopup;
    }
  };
  var authorizeWithPopup = function() {
    gapi.auth.authorize({
      client_id: clientId,
      scope: [
        rtclient.INSTALL_SCOPE,
        rtclient.FILE_SCOPE,
        rtclient.OPENID_SCOPE
      ],
      user_id: userId,
      immediate: false
    }, handleAuthResult);
    console.log(clientId);
  };
  // Try with no popups first.
  gapi.auth.authorize({
    client_id: clientId,
    scope: [
      rtclient.INSTALL_SCOPE,
      rtclient.FILE_SCOPE,
      rtclient.OPENID_SCOPE
    ],
    user_id: userId,
    immediate: true
  }, handleAuthResult);
};

/**
 * Fetch the user ID using the UserInfo API and save it locally.
 * @param {Function} callback The callback to call after user ID has been
 *     fetched.
 */
rtclient.Authorizer.prototype.fetchUserId = function(callback) {
  var _this = this;
  gapi.client.load('oauth2', 'v2', function() {
    gapi.client.oauth2.userinfo.get().execute(function(resp) {
      if (resp.id) {
        _this.userId = resp.id;
      }
      if (callback) {
        callback();
      }
    });
  });
};

/**
 * Creates a new Realtime file.
 * @param {string} title Title of the newly created file.
 * @param {string} mimeType The MIME type of the new file.
 * @param {Function} callback The callback to call after creation.
 */
rtclient.createRealtimeFile = function(title, mimeType, callback) {
  gapi.client.load('drive', 'v2', function() {
    gapi.client.drive.files.insert({
      'resource': {
        mimeType: mimeType,
        title: title
      }
    }).execute(callback);
  });
};

/**
 * Fetches the metadata for a Realtime file.
 * @param {string} fileId The file to load metadata for.
 * @param {Function} callback The callback to be called on completion,
 *     with signature:
 *
 *    function onGetFileMetadata(file) {}
 *
 * where the file parameter is a Google Drive API file resource instance.
 */
rtclient.getFileMetadata = function(fileId, callback) {
  gapi.client.load('drive', 'v2', function() {
    gapi.client.drive.files.get({
      'fileId' : fileId
    }).execute(callback);
  });
};

/**
 * Parses the state parameter passed from the Drive user interface after
 *     Open With operations.
 * @param {string} stateParam The state query parameter as a JSON string.
 * @return {Object} The state query parameter as an object or null if
 *     parsing failed.
 */
rtclient.parseState = function(stateParam) {
  try {
    var stateObj = JSON.parse(stateParam);
    return stateObj;
  } catch (e) {
    return null;
  }
};

/**
 * Handles authorizing, parsing query parameters, loading and creating Realtime
 *     documents.
 * @constructor
 * @param {!Object} options Options for loader. Four keys are required as
 *     mandatory, these are:
 *
 *    1. "clientId", the Client ID from the console
 *    2. "initializeModel", the callback to call when the file is loaded.
 *    3. "onFileLoaded", the callback to call when the model is first created.
 *
 * and one key is optional:
 *
 *    1. "defaultTitle", the title of newly created Realtime files.
 */
rtclient.RealtimeLoader = function(options) {
  // Initialize configuration variables.
  this.onFileLoaded = rtclient.getOption(options, 'onFileLoaded');
  this.newFileMimeType = rtclient.getOption(options, 'newFileMimeType',
      rtclient.REALTIME_MIMETYPE);
  this.initializeModel = rtclient.getOption(options, 'initializeModel');
  this.registerTypes = rtclient.getOption(options, 'registerTypes',
      function() {});
  this.afterAuth = rtclient.getOption(options, 'afterAuth', function() {});
  // This tells us if need to we automatically create a file after auth.
  this.autoCreate = rtclient.getOption(options, 'autoCreate', false);
  this.defaultTitle = rtclient.getOption(options, 'defaultTitle',
      'New Realtime File');
  this.afterCreate = rtclient.getOption(options, 'afterCreate', function() {});
  this.authorizer = new rtclient.Authorizer(options);
};

/**
 * Redirects the browser back to the current page with an appropriate file ID.
 * @param {Array.<string>} fileIds The IDs of the files to open.
 * @param {string} userId The ID of the user.
 */
rtclient.RealtimeLoader.prototype.redirectTo = function(fileIds, userId) {
  var params = [];
  if (fileIds) {
    params.push('fileIds=' + fileIds.join(','));
  }
  if (userId) {
    params.push('userId=' + userId);
  }
  // Naive URL construction.
  var newUrl = params.length == 0
      ? window.location.pathname
      : (window.location.pathname + '#' + params.join('&'));
  // Using HTML URL re-write if available.
  if (window.history && window.history.replaceState) {
    window.history.replaceState('Google Drive Realtime API Playground',
        'Google Drive Realtime API Playground', newUrl);
  } else {
    window.location.href = newUrl;
  }
  // We are still here that means the page didn't reload.
  rtclient.params = rtclient.getParams();
  for (var index in fileIds) {
    gapi.drive.realtime.load(fileIds[index], this.onFileLoaded,
        this.initializeModel, this.handleErrors);
  }
};

/**
 * Starts the loader by authorizing.
 */
rtclient.RealtimeLoader.prototype.start = function() {
  // Bind to local context to make them suitable for callbacks.
  var _this = this;
  this.authorizer.start(function() {
    if (_this.registerTypes) {
      _this.registerTypes();
    }
    if (_this.afterAuth) {
      _this.afterAuth();
    }
    _this.load();
  });
};

/**
 * Handles errors thrown by the Realtime API.
 * @param {!Error} e Error.
 */
rtclient.RealtimeLoader.prototype.handleErrors = function(e) {
  if (e.type == gapi.drive.realtime.ErrorType.TOKEN_REFRESH_REQUIRED) {
    this.authorizer.authorize();
  } else if (e.type == gapi.drive.realtime.ErrorType.CLIENT_ERROR) {
    alert('An Error happened: ' + e.message);
    window.location.href = '/';
  } else if (e.type == gapi.drive.realtime.ErrorType.NOT_FOUND) {
    alert('The file was not found. It does not exist or you do not have ' +
        'read access to the file.');
    window.location.href = '/';
  }
};

/**
 * Loads or creates a Realtime file depending on the fileId and state query
 * parameters.
 */
rtclient.RealtimeLoader.prototype.load = function() {
  var fileIds = rtclient.params['fileIds'];
  if (fileIds) {
    fileIds = fileIds.split(',');
  }
  var userId = this.authorizer.userId;
  var state = rtclient.params['state'];
  // Creating the error callback.
  var authorizer = this.authorizer;
  // We have file IDs in the query parameters, so we will use them to load a
  // file.
  if (fileIds) {
    for (var index in fileIds) {
      gapi.drive.realtime.load(fileIds[index], this.onFileLoaded,
          this.initializeModel, this.handleErrors);
    }
    return;
  }
  // We have a state parameter being redirected from the Drive UI.
  // We will parse it and redirect to the fileId contained.
  else if (state) {
    var stateObj = rtclient.parseState(state);
    // If opening a file from Drive.
    if (stateObj.action == 'open') {
      fileIds = stateObj.ids;
      userId = stateObj.userId;
      this.redirectTo(fileIds, userId);
      return;
    }
  }
  if (this.autoCreate) {
    this.createNewFileAndRedirect();
  }
};

/**
 * Creates a new file and redirects to the URL to load it.
 */
rtclient.RealtimeLoader.prototype.createNewFileAndRedirect = function() {
  // No fileId or state have been passed. We create a new Realtime file and
  // redirect to it.
  var _this = this;
  rtclient.createRealtimeFile(this.defaultTitle, this.newFileMimeType,
      function(file) {
        if (file.id) {
          if (_this.afterCreate) {
            _this.afterCreate(file.id);
          }
          _this.redirectTo([file.id], _this.authorizer.userId);
        } else {
          // File failed to be created, log why and do not attempt to redirect.
          console.error('Error creating file.');
          console.error(file);
        }
      });
};

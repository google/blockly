/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Service for playing audio files.
 * @author sll@google.com (Sean Lip)
 */

goog.provide('blocklyApp.AudioService');

goog.require('blocklyApp.NotificationsService');


blocklyApp.AudioService = ng.core.Class({
  constructor: [
    blocklyApp.NotificationsService, function(notificationsService) {
      this.notificationsService = notificationsService;

      // We do not play any audio unless a media path prefix is specified.
      this.canPlayAudio = false;

      if (ACCESSIBLE_GLOBALS.hasOwnProperty('mediaPathPrefix')) {
        this.canPlayAudio = true;
        var mediaPathPrefix = ACCESSIBLE_GLOBALS['mediaPathPrefix'];
        this.AUDIO_PATHS_ = {
          'connect': mediaPathPrefix + 'click.mp3',
          'delete': mediaPathPrefix + 'delete.mp3',
          'oops': mediaPathPrefix + 'oops.mp3'
        };
      }

      this.cachedAudioFiles_ = {};
      // Store callback references here so that they can be removed if a new
      // call to this.play_() comes in.
      this.onEndedCallbacks_ = {
        'connect': [],
        'delete': [],
        'oops': []
      };
    }
  ],
  play_: function(audioId, onEndedCallback) {
    if (this.canPlayAudio) {
      if (!this.cachedAudioFiles_.hasOwnProperty(audioId)) {
        this.cachedAudioFiles_[audioId] = new Audio(this.AUDIO_PATHS_[audioId]);
      }

      if (onEndedCallback) {
        this.onEndedCallbacks_[audioId].push(onEndedCallback);
        this.cachedAudioFiles_[audioId].addEventListener(
            'ended', onEndedCallback);
      } else {
        var that = this;
        this.onEndedCallbacks_[audioId].forEach(function(callback) {
          that.cachedAudioFiles_[audioId].removeEventListener(
              'ended', callback);
        });
        this.onEndedCallbacks_[audioId].length = 0;
      }

      this.cachedAudioFiles_[audioId].play();
    }
  },
  playConnectSound: function() {
    this.play_('connect');
  },
  playDeleteSound: function() {
    this.play_('delete');
  },
  playOopsSound: function(optionalStatusMessage) {
    if (optionalStatusMessage) {
      var that = this;
      this.play_('oops', function() {
        that.notificationsService.speak(optionalStatusMessage);
      });
    } else {
      this.play_('oops');
    }
  }
});

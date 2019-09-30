/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object in charge of loading, storing, and playing audio for a
 *     workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceAudio');

goog.require('Blockly.utils');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.userAgent');


/**
 * Class for loading, storing, and playing audio for a workspace.
 * @param {Blockly.WorkspaceSvg} parentWorkspace The parent of the workspace
 *     this audio object belongs to, or null.
 * @constructor
 */
Blockly.WorkspaceAudio = function(parentWorkspace) {

  /**
   * The parent of the workspace this object belongs to, or null.  May be
   * checked for sounds that this object can't find.
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.parentWorkspace_ = parentWorkspace;

  /**
   * Database of pre-loaded sounds.
   * @private
   * @const
   */
  this.SOUNDS_ = Object.create(null);
};

/**
 * Time that the last sound was played.
 * @type {Date}
 * @private
 */
Blockly.WorkspaceAudio.prototype.lastSound_ = null;

/**
 * Dispose of this audio manager.
 * @package
 */
Blockly.WorkspaceAudio.prototype.dispose = function() {
  this.parentWorkspace_ = null;
  this.SOUNDS_ = null;
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 */
Blockly.WorkspaceAudio.prototype.load = function(filenames, name) {
  if (!filenames.length) {
    return;
  }
  try {
    var audioTest = new Blockly.utils.global['Audio']();
  } catch (e) {
    // No browser support for Audio.
    // IE can throw an error even if the Audio object exists.
    return;
  }
  var sound;
  for (var i = 0; i < filenames.length; i++) {
    var filename = filenames[i];
    var ext = filename.match(/\.(\w+)$/);
    if (ext && audioTest.canPlayType('audio/' + ext[1])) {
      // Found an audio format we can play.
      sound = new Blockly.utils.global['Audio'](filename);
      break;
    }
  }
  if (sound && sound.play) {
    this.SOUNDS_[name] = sound;
  }
};

/**
 * Preload all the audio files so that they play quickly when asked for.
 * @package
 */
Blockly.WorkspaceAudio.prototype.preload = function() {
  for (var name in this.SOUNDS_) {
    var sound = this.SOUNDS_[name];
    sound.volume = 0.01;
    var playPromise = sound.play();
    // Edge does not return a promise, so we need to check.
    if (playPromise !== undefined) {
      // If we don't wait for the play request to complete before calling pause()
      // we will get an exception: (DOMException: The play() request was interrupted)
      // See more: https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
      playPromise.then(sound.pause).catch(function() {
        // Play without user interaction was prevented.
      });
    } else {
      sound.pause();
    }
    
    // iOS can only process one sound at a time.  Trying to load more than one
    // corrupts the earlier ones.  Just load one and leave the others uncached.
    if (Blockly.utils.userAgent.IPAD || Blockly.utils.userAgent.IPHONE) {
      break;
    }
  }
};

/**
 * Play a named sound at specified volume.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param {number=} opt_volume Volume of sound (0-1).
 */
Blockly.WorkspaceAudio.prototype.play = function(name, opt_volume) {
  var sound = this.SOUNDS_[name];
  if (sound) {
    // Don't play one sound on top of another.
    var now = new Date;
    if (this.lastSound_ != null &&
        now - this.lastSound_ < Blockly.SOUND_LIMIT) {
      return;
    }
    this.lastSound_ = now;
    var mySound;
    if (Blockly.utils.userAgent.IPAD || Blockly.utils.userAgent.ANDROID) {
      // Creating a new audio node causes lag in Android and iPad.  Android
      // refetches the file from the server, iPad uses a singleton audio
      // node which must be deleted and recreated for each new audio tag.
      mySound = sound;
    } else {
      mySound = sound.cloneNode();
    }
    mySound.volume = (opt_volume === undefined ? 1 : opt_volume);
    mySound.play();
  } else if (this.parentWorkspace_) {
    // Maybe a workspace on a lower level knows about this sound.
    this.parentWorkspace_.getAudioManager().play(name, opt_volume);
  }
};

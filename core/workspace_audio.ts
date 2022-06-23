/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object in charge of loading, storing, and playing audio for a
 *     workspace.
 */


/**
 * Object in charge of loading, storing, and playing audio for a
 *     workspace.
 * @class
 */
goog.declareModuleId('Blockly.WorkspaceAudio');

import * as userAgent from './utils/useragent.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from './workspace_svg.js';


/**
 * Prevent a sound from playing if another sound preceded it within this many
 * milliseconds.
 */
const SOUND_LIMIT = 100;

/**
 * Class for loading, storing, and playing audio for a workspace.
 * @alias Blockly.WorkspaceAudio
 */
export class WorkspaceAudio {
  private SOUNDS_: AnyDuringMigration;

  /** Time that the last sound was played. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type 'Date'.
  private lastSound_: Date = null as AnyDuringMigration;

  /**
   * @param parentWorkspace The parent of the workspace this audio object
   *     belongs to, or null.
   */
  constructor(private parentWorkspace: WorkspaceSvg) {
    /** Database of pre-loaded sounds. */
    this.SOUNDS_ = Object.create(null);
  }

  /** Dispose of this audio manager. */
  dispose() {
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'WorkspaceSvg'.
    this.parentWorkspace = null as AnyDuringMigration;
    this.SOUNDS_ = null;
  }

  /**
   * Load an audio file.  Cache it, ready for instantaneous playing.
   * @param filenames List of file types in decreasing order of preference (i.e.
   *     increasing size).  E.g. ['media/go.mp3', 'media/go.wav'] Filenames
   *     include path from Blockly's root.  File extensions matter.
   * @param name Name of sound.
   */
  load(filenames: string[], name: string) {
    if (!filenames.length) {
      return;
    }
    let audioTest;
    try {
      audioTest = new globalThis['Audio']();
    } catch (e) {
      // No browser support for Audio.
      // IE can throw an error even if the Audio object exists.
      return;
    }
    let sound;
    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      const ext = filename.match(/\.(\w+)$/);
      if (ext && audioTest.canPlayType('audio/' + ext[1])) {
        // Found an audio format we can play.
        sound = new globalThis['Audio'](filename);
        break;
      }
    }
    if (sound && sound.play) {
      this.SOUNDS_[name] = sound;
    }
  }

  /** Preload all the audio files so that they play quickly when asked for. */
  preload() {
    for (const name in this.SOUNDS_) {
      const sound = this.SOUNDS_[name];
      sound.volume = 0.01;
      const playPromise = sound.play();
      // Edge does not return a promise, so we need to check.
      if (playPromise !== undefined) {
        // If we don't wait for the play request to complete before calling
        // pause() we will get an exception: (DOMException: The play() request
        // was interrupted) See more:
        // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
        playPromise.then(sound.pause)
            .catch(
                // Play without user interaction was prevented.
                function() {});
      } else {
        sound.pause();
      }

      // iOS can only process one sound at a time.  Trying to load more than one
      // corrupts the earlier ones.  Just load one and leave the others
      // uncached.
      if (userAgent.IPAD || userAgent.IPHONE) {
        break;
      }
    }
  }

  /**
   * Play a named sound at specified volume.  If volume is not specified,
   * use full volume (1).
   * @param name Name of sound.
   * @param opt_volume Volume of sound (0-1).
   */
  play(name: string, opt_volume?: number) {
    const sound = this.SOUNDS_[name];
    if (sound) {
      // Don't play one sound on top of another.
      const now = new Date();
      if (this.lastSound_ !== null &&
          now.getTime() - this.lastSound_.getTime() < SOUND_LIMIT) {
        return;
      }
      this.lastSound_ = now;
      let mySound;
      if (userAgent.IPAD || userAgent.ANDROID) {
        // Creating a new audio node causes lag in Android and iPad.  Android
        // refetches the file from the server, iPad uses a singleton audio
        // node which must be deleted and recreated for each new audio tag.
        mySound = sound;
      } else {
        mySound = sound.cloneNode();
      }
      mySound.volume = opt_volume === undefined ? 1 : opt_volume;
      mySound.play();
    } else if (this.parentWorkspace) {
      // Maybe a workspace on a lower level knows about this sound.
      this.parentWorkspace.getAudioManager().play(name, opt_volume);
    }
  }
}

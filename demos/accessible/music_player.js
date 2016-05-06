/**
 * Blockly Demos: Accessible Blockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Utility functions and classes for a music game for
 *               screen-reader users.
 * @author sll@google.com (Sean Lip)
 */

var CONSTANTS = {
  // Change this value to change the tempo.
  MILLISECS_PER_BEAT: 2000.0,
  LINE_BASS: 'bass',
  LINE_MELODY: 'melody'
};


// MUSIC LINE OBJECT

var MusicLine = function() {
  this.chords_ = [];
  this.currentBeat_ = 0.0;
};

MusicLine.prototype.getChords = function() {
  return this.chords_;
};

MusicLine.prototype.getDurationInMsecs = function() {
  return this.currentBeat_ * CONSTANTS.MILLISECS_PER_BEAT;
};

MusicLine.prototype.addChord = function(midiPitches, durationInBeats) {
  this.chords_.push({
    midiPitches: midiPitches,
    durationInBeats: durationInBeats,
    delayInBeats: this.currentBeat_
  });

  this.currentBeat_ += durationInBeats;
};

MusicLine.prototype.addRest = function(durationInBeats) {
  this.currentBeat_ += durationInBeats;
};

// This method assumes that the lines are arranged in ascending order of
// delayInBeats.
MusicLine.prototype.isEqual = function(other) {
  if (this.chords_.length !== other.chords_.length) {
    return false;
  }

  for (var i = 0; i < this.chords_.length; i++) {
    if (this.chords_[i].durationInBeats != other.chords_[i].durationInBeats ||
        this.chords_[i].delayInBeats != other.chords_[i].delayInBeats) {
      return false;
    }

    var thisChordPitches = this.chords_[i].midiPitches.concat().sort();
    var otherChordPitches = other.chords_[i].midiPitches.concat().sort();
    if (thisChordPitches.length != otherChordPitches.length) {
      return false;
    }

    var mismatchedChord = thisChordPitches.some(function(pitch, index) {
      return pitch != otherChordPitches[index];
    });
    if (mismatchedChord) {
      return false;
    }
  }

  return true;
};

MusicLine.prototype.setFromChordsAndDurations = function(chordsAndDurations) {
  this.chords_ = [];
  this.currentBeat_ = 0.0;

  var that = this;
  chordsAndDurations.forEach(function(chordAndDuration) {
    if (chordAndDuration[0] === null) {
      that.addRest(chordAndDuration[1]);
    } else {
      that.addChord(chordAndDuration[0], chordAndDuration[1]);
    }
  });
};


// MUSIC PLAYER OBJECT (SINGLETON)

var MusicPlayer = function() {
  // Initialize the MIDI player.
  MIDI.loadPlugin({
    soundfontUrl: '../../../MIDI.js/examples/soundfont/',
    instrument: 'acoustic_grand_piano',
    callback: function() {}
  });

  this.lines_ = {};
  this.activeTimeouts_ = [];

  this.reset();
};

MusicPlayer.prototype.reset = function() {
  MIDI.Player.stop();
  this.activeTimeouts_.forEach(function(timeout) {
    clearTimeout(timeout);
  });

  for (key in this.lines_) {
    delete this.lines_[key];
  }
  this.lines_[CONSTANTS.LINE_BASS] = new MusicLine();
  this.lines_[CONSTANTS.LINE_MELODY] = new MusicLine();

  this.activeTimeouts_ = [];
};

MusicPlayer.prototype.playNote_ = function(midiPitches, durationInBeats) {
  var MIDI_CHANNEL = 0;
  var MIDI_VELOCITY = 127;

  MIDI.chordOn(MIDI_CHANNEL, midiPitches, MIDI_VELOCITY, 0);
  MIDI.chordOff(MIDI_CHANNEL, midiPitches, durationInBeats);
};

MusicPlayer.prototype.playLines_ = function(
    linesToPlay, onFinishBassLineCallback) {
  var that = this;
  linesToPlay.forEach(function(lineName) {
    that.lines_[lineName].getChords().forEach(function(chord) {
      that.activeTimeouts_.push(setTimeout(function() {
        that.playNote_(chord.midiPitches, chord.durationInBeats);
      }, chord.delayInBeats * CONSTANTS.MILLISECS_PER_BEAT));
    });
  });

  that.activeTimeouts_.push(setTimeout(
    onFinishBassLineCallback,
    that.lines_[CONSTANTS.LINE_BASS].getDurationInMsecs()));
};

MusicPlayer.prototype.setMelody = function(melody) {
  this.lines_[CONSTANTS.LINE_MELODY].setFromChordsAndDurations(melody);
};

MusicPlayer.prototype.doesBassLineEqual = function(otherLine) {
  return this.lines_[CONSTANTS.LINE_BASS].isEqual(otherLine);
};

MusicPlayer.prototype.addBassChord = function(midiPitches, durationInBeats) {
  this.lines_[CONSTANTS.LINE_BASS].addChord(midiPitches, durationInBeats);
};

MusicPlayer.prototype.playBassLine = function(onFinishBassLineCallback) {
  this.playLines_([CONSTANTS.LINE_BASS], onFinishBassLineCallback);
};

MusicPlayer.prototype.playAllLines = function(onFinishBassLineCallback) {
  this.playLines_(
    [CONSTANTS.LINE_BASS, CONSTANTS.LINE_MELODY], onFinishBassLineCallback);
};

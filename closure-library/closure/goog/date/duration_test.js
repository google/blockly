// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.LOCALE = 'en_US';
goog.provide('goog.date.durationTest');
goog.setTestOnly('goog.date.durationTest');

goog.require('goog.date.duration');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_bn'); // Bengali
goog.require('goog.i18n.DateTimeSymbols_en');
goog.require('goog.i18n.DateTimeSymbols_fa'); // Persian
goog.require('goog.testing.jsunit');

var MINUTE_MS = 60000;
var HOUR_MS = 60 * MINUTE_MS;
var DAY_MS = 24 * HOUR_MS;

var duration = goog.date.duration.format;

function testFormatDurationZeroMinutes() {
  assertEquals('0 minutes', duration(0));
  assertEquals('0 minutes', duration(MINUTE_MS - 1));
}

function testFormatDurationMinutes() {
  assertEquals('1 minute', duration(MINUTE_MS));
  assertEquals('1 minute', duration(MINUTE_MS + 1));
  assertEquals('5 minutes', duration(5 * MINUTE_MS));
  assertEquals('45 minutes', duration(45 * MINUTE_MS));
}

function testFormatDurationHours() {
  assertEquals('1 hour', duration(HOUR_MS));
  assertEquals('1 hour', duration(HOUR_MS + 1));
  assertEquals('1 hour 1 minute', duration(HOUR_MS + MINUTE_MS));
  assertEquals('1 hour 45 minutes', duration(HOUR_MS + 45 * MINUTE_MS));

  assertEquals('5 hours', duration(5 * HOUR_MS));
  assertEquals('5 hours', duration(5 * HOUR_MS + 1));
  assertEquals('5 hours 1 minute', duration(5 * HOUR_MS + MINUTE_MS));
  assertEquals('5 hours 45 minutes', duration(5 * HOUR_MS + 45 * MINUTE_MS));

  assertEquals('11 hours', duration(11 * HOUR_MS));
  assertEquals('11 hours', duration(11 * HOUR_MS + 1));
  assertEquals('11 hours 1 minute', duration(11 * HOUR_MS + MINUTE_MS));
  assertEquals('11 hours 45 minutes',
      duration(11 * HOUR_MS + 45 * MINUTE_MS));
}

function testFormatDurationDays() {
  assertEquals('1 day', duration(DAY_MS));
  assertEquals('1 day', duration(DAY_MS + 1));
  assertEquals('1 day 1 minute', duration(DAY_MS + MINUTE_MS));
  assertEquals('1 day 45 minutes', duration(DAY_MS + 45 * MINUTE_MS));
  assertEquals('1 day 1 hour', duration(DAY_MS + HOUR_MS));
  assertEquals('1 day 11 hours', duration(DAY_MS + 11 * HOUR_MS));
  assertEquals('1 day 1 hour 1 minute',
      duration(DAY_MS + HOUR_MS + MINUTE_MS));
  assertEquals('1 day 1 hour 45 minutes',
      duration(DAY_MS + HOUR_MS + 45 * MINUTE_MS));
  assertEquals('1 day 11 hours 1 minute',
      duration(DAY_MS + 11 * HOUR_MS + MINUTE_MS));
  assertEquals('1 day 11 hours 45 minutes',
      duration(DAY_MS + 11 * HOUR_MS + 45 * MINUTE_MS));

  assertEquals('11 days', duration(11 * DAY_MS));
  assertEquals('11 days', duration(11 * DAY_MS + 1));
  assertEquals('11 days 1 minute', duration(11 * DAY_MS + MINUTE_MS));
  assertEquals('11 days 45 minutes', duration(11 * DAY_MS + 45 * MINUTE_MS));
  assertEquals('11 days 1 hour', duration(11 * DAY_MS + HOUR_MS));
  assertEquals('11 days 11 hours', duration(11 * DAY_MS + 11 * HOUR_MS));
  assertEquals('11 days 1 hour 1 minute',
      duration(11 * DAY_MS + HOUR_MS + MINUTE_MS));
  assertEquals('11 days 1 hour 45 minutes',
      duration(11 * DAY_MS + HOUR_MS + 45 * MINUTE_MS));
  assertEquals('11 days 11 hours 1 minute',
      duration(11 * DAY_MS + 11 * HOUR_MS + MINUTE_MS));
  assertEquals('11 days 11 hours 45 minutes',
      duration(11 * DAY_MS + 11 * HOUR_MS + 45 * MINUTE_MS));
}

function testFormatDurationPersianDigits() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fa;

  // ۱ minute
  assertEquals(localizeNumber(1) + ' minute', duration(MINUTE_MS));
  // ۲ minutes
  assertEquals(localizeNumber(2) + ' minutes', duration(2 * MINUTE_MS));
  // ۱۰ hours
  assertEquals(localizeNumber(10) + ' hours', duration(10 * HOUR_MS));
  // ۲۳ days
  assertEquals(localizeNumber(23) + ' days', duration(23 * DAY_MS));

  // Restore to English, to make sure we don't mess up other tests
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
}

function testFormatDurationBengaliDigits() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bn;

  // ১ minute
  assertEquals(localizeNumber(1) + ' minute', duration(MINUTE_MS));
  // ২ minutes
  assertEquals(localizeNumber(2) + ' minutes', duration(2 * MINUTE_MS));
  // ১০ hours
  assertEquals(localizeNumber(10) + ' hours', duration(10 * HOUR_MS));
  // ২৩ days
  assertEquals(localizeNumber(23) + ' days', duration(23 * DAY_MS));

  // Restore to English, to make sure we don't mess up other tests
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
}

function localizeNumber(value) {
  // Quick conversion to national digits, to increase readability of the
  // tests above.
  return goog.i18n.DateTimeFormat.localizeNumbers(value);
}

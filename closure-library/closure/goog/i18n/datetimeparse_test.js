// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.i18n.DateTimeParseTest');
goog.setTestOnly('goog.i18n.DateTimeParseTest');

goog.require('goog.date.Date');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_en');
goog.require('goog.i18n.DateTimeSymbols_fa');
goog.require('goog.i18n.DateTimeSymbols_fr');
goog.require('goog.i18n.DateTimeSymbols_pl');
goog.require('goog.i18n.DateTimeSymbols_zh');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;

var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
  expectedFailures.handleTearDown();
}

// Helper equivalent of assertEquals for dates, with day of month optional
function assertDateEquals(expectYear, expectMonth, expectDate, date) {
  assertEquals(expectYear, date.getFullYear());
  assertEquals(expectMonth, date.getMonth());
  if (expectDate) assertEquals(expectDate, date.getDate());
}

// Helper equivalent of assertEquals for times, with seconds and milliseconds
function assertTimeEquals(expectHour, expectMin, expectSec, expectMilli, date) {
  assertEquals(expectHour, date.getHours());
  assertEquals(expectMin, date.getMinutes());
  if (expectSec) assertEquals(expectSec, date.getSeconds());
  if (expectMilli) assertEquals(expectMilli, date.getTime() % 1000);
}

// Helper function, doing parse and assert on dates
function assertParsedDateEquals(
    expectYear, expectMonth, expectDate, parser, stringToParse, date) {
  assertTrue(parser.parse(stringToParse, date) > 0);
  assertDateEquals(expectYear, expectMonth, expectDate, date);
}

// Helper function, doing parse and assert on times
function assertParsedTimeEquals(
    expectHour, expectMin, expectSec, expectMilli, parser, stringToParse,
    date) {
  assertTrue(parser.parse(stringToParse, date) > 0);
  assertTimeEquals(expectHour, expectMin, expectSec, expectMilli, date);
}

function testNegativeYear() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('MM/dd, yyyy');
  assertParsedDateEquals(1999, 11 - 1, 22, parser, '11/22, 1999', date);
  assertParsedDateEquals(-1999, 11 - 1, 22, parser, '11/22, -1999', date);
}

function testEra() {
  // Bug 2350397
  if (goog.userAgent.WEBKIT) {
    // Bug 2350397 Test seems to be very flaky on Chrome. Disabling it
    return;
  }

  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('MM/dd, yyyyG');
  assertParsedDateEquals(-1998, 11 - 1, 22, parser, '11/22, 1999BC', date);
  assertParsedDateEquals(0, 11 - 1, 22, parser, '11/22, 1BC', date);
  assertParsedDateEquals(1999, 11 - 1, 22, parser, '11/22, 1999AD', date);
}

function testFractionalSeconds() {
  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('hh:mm:ss.SSS');

  assertParsedTimeEquals(11, 12, 13, 956, parser, '11:12:13.956', date);
  assertParsedTimeEquals(11, 12, 13, 950, parser, '11:12:13.95', date);
  assertParsedTimeEquals(11, 12, 13, 900, parser, '11:12:13.9', date);
}

function testAmbiguousYear() {
  // assume this year is 2006, year 27 to 99 will be interpret as 1927 to 1999
  // year 00 to 25 will be 2000 to 2025. Year 26 can be either 1926 or 2026
  // depend on the time being parsed and the time when this program runs.
  // For example, if the program is run at 2006/03/03 12:12:12, the following
  // code should work.
  // assertTrue(parser.parse('01/01/26 00:00:00:001', date) > 0);
  // assertTrue(date.getFullYear() == 2026 - 1900);
  // assertTrue(parser.parse('12/30/26 23:59:59:999', date) > 0);
  // assertTrue(date.getFullYear() == 1926 - 1900);

  // Since this test can run in any time, some logic needed here.

  var futureDate = new Date();
  futureDate.setFullYear(
      futureDate.getFullYear() + 100 -
      goog.i18n.DateTimeParse.ambiguousYearCenturyStart);
  var ambiguousYear = futureDate.getFullYear() % 100;

  var parser = new goog.i18n.DateTimeParse('MM/dd/yy HH:mm:ss:SSS');
  var date = new Date();

  var str = '01/01/' + ambiguousYear + ' 00:00:00:001';
  assertTrue(parser.parse(str, date) > 0);
  assertEquals(futureDate.getFullYear(), date.getFullYear());

  str = '12/31/' + ambiguousYear + ' 23:59:59:999';
  assertTrue(parser.parse(str, date) > 0);
  assertEquals(futureDate.getFullYear(), date.getFullYear() + 100);

  // Test the ability to move the disambiguation century
  goog.i18n.DateTimeParse.ambiguousYearCenturyStart = 60;

  futureDate = new Date();
  futureDate.setFullYear(
      futureDate.getFullYear() + 100 -
      goog.i18n.DateTimeParse.ambiguousYearCenturyStart);
  ambiguousYear = futureDate.getFullYear() % 100;

  var str = '01/01/' + ambiguousYear + ' 00:00:00:001';
  assertTrue(parser.parse(str, date) > 0);
  assertEquals(futureDate.getFullYear(), date.getFullYear());


  str = '12/31/' + ambiguousYear + ' 23:59:59:999';
  assertTrue(parser.parse(str, date) > 0);
  assertEquals(futureDate.getFullYear(), date.getFullYear() + 100);

  // Reset parameter for other test cases
  goog.i18n.DateTimeParse.ambiguousYearCenturyStart = 80;
}

function testLeapYear() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('MMdd, yyyy');

  assertParsedDateEquals(2001, 3 - 1, 1, parser, '0229, 2001', date);
  assertParsedDateEquals(2000, 2 - 1, 29, parser, '0229, 2000', date);
}

function testAbutField() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('hhmm');
  assertParsedTimeEquals(11, 22, undefined, undefined, parser, '1122', date);
  assertParsedTimeEquals(1, 22, undefined, undefined, parser, '122', date);

  var parser2 = new goog.i18n.DateTimeParse('hhmmss');
  assertParsedTimeEquals(11, 22, 33, undefined, parser2, '112233', date);
  assertParsedTimeEquals(1, 22, 33, undefined, parser2, '12233', date);

  var parser3 = new goog.i18n.DateTimeParse('yyyyMMdd');
  assertParsedDateEquals(1999, 12 - 1, 2, parser3, '19991202', date);
  assertParsedDateEquals(999, 12 - 1, 2, parser3, '9991202', date);
  assertParsedDateEquals(99, 12 - 1, 2, parser3, '991202', date);
  assertParsedDateEquals(9, 12 - 1, 2, parser3, '91202', date);
}

function testYearParsing() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('yyMMdd');
  assertParsedDateEquals(1999, 12 - 1, 2, parser, '991202', date);

  var parser2 = new goog.i18n.DateTimeParse('yyyyMMdd');
  assertParsedDateEquals(2005, 12 - 1, 2, parser2, '20051202', date);
}

function testGoogDateParsing() {
  var date = new goog.date.Date();

  var parser = new goog.i18n.DateTimeParse('yyMMdd');
  assertParsedDateEquals(1999, 12 - 1, 2, parser, '991202', date);
}

function testHourParsing_hh() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('hhmm');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '0022', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser, '1122', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '1222', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser, '2322', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '2422', date);

  var parser2 = new goog.i18n.DateTimeParse('hhmma');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '0022am', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser2, '1122am', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '1222am', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322am', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '0022pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '1122pm', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322pm', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422pm', date);
}

function testHourParsing_KK() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('KKmm');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '0022', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser, '1122', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser, '1222', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser, '2322', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '2422', date);

  var parser2 = new goog.i18n.DateTimeParse('KKmma');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '0022am', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser2, '1122am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222am', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322am', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '0022pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '1122pm', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322pm', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422pm', date);
}

function testHourParsing_kk() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('kkmm');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '0022', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser, '1122', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser, '1222', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser, '2322', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '2422', date);

  var parser2 = new goog.i18n.DateTimeParse('kkmma');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '0022am', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser2, '1122am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222am', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322am', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '0022pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '1122pm', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322pm', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422pm', date);
}

function testHourParsing_HH() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('HHmm');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '0022', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser, '1122', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser, '1222', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser, '2322', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser, '2422', date);

  var parser2 = new goog.i18n.DateTimeParse('HHmma');
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '0022am', date);
  assertParsedTimeEquals(11, 22, undefined, undefined, parser2, '1122am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222am', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322am', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422am', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '0022pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '1122pm', date);
  assertParsedTimeEquals(12, 22, undefined, undefined, parser2, '1222pm', date);
  assertParsedTimeEquals(23, 22, undefined, undefined, parser2, '2322pm', date);
  assertParsedTimeEquals(0, 22, undefined, undefined, parser2, '2422pm', date);
}

function testEnglishDate() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('yyyy MMM dd hh:mm');

  // Fails in Safari4/Chrome Winxp because of infrastructure issues, temporarily
  // disabled. See b/4274778.
  expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);
  try {
    assertParsedDateEquals(2006, 7 - 1, 10, parser, '2006 Jul 10 15:44', date);
    assertTimeEquals(15, 44, undefined, undefined, date);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testChineseDate() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh;

  // Javascript month start from 0, July is 7 - 1
  var date = new Date(2006, 7 - 1, 24, 12, 12, 12, 0);
  var formatter =
      new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.FULL_DATE);
  var dateStr = formatter.format(date);
  var parser =
      new goog.i18n.DateTimeParse(goog.i18n.DateTimeFormat.Format.FULL_DATE);

  assertParsedDateEquals(2006, 7 - 1, 24, parser, dateStr, date);

  parser =
      new goog.i18n.DateTimeParse(goog.i18n.DateTimeFormat.Format.LONG_DATE);
  assertParsedDateEquals(
      2006, 7 - 1, 24, parser, '2006\u5E747\u670824\u65E5', date);

  parser =
      new goog.i18n.DateTimeParse(goog.i18n.DateTimeFormat.Format.FULL_TIME);
  assertTrue(parser.parse('GMT-07:00 \u4E0B\u534803:26:28', date) > 0);

  // Fails in Safari4/Chrome Winxp because of infrastructure issues, temporarily
  // disabled. See b/4274778.
  expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);
  try {
    assertEquals(
        22, (24 + date.getHours() + date.getTimezoneOffset() / 60) % 24);
    assertEquals(26, date.getMinutes());
    assertEquals(28, date.getSeconds());
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

// For languages with goog.i18n.DateTimeSymbols.ZERODIGIT defined, the int
// digits are localized by the locale in datetimeformat.js. This test case is
// for parsing dates with such native digits.
function testDatesWithNativeDigits() {
  // Language Arabic is one example with
  // goog.i18n.DateTimeSymbols.ZERODIGIT defined.
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fa;

  // Javascript month starts from 0, July is 7 - 1
  var date = new Date(2006, 7 - 1, 24, 12, 12, 12, 0);
  var formatter =
      new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.FULL_DATE);
  dateStr = formatter.format(date);
  var parser =
      new goog.i18n.DateTimeParse(goog.i18n.DateTimeFormat.Format.FULL_DATE);

  assertParsedDateEquals(2006, 7 - 1, 24, parser, dateStr, date);

  date = new Date(2006, 7 - 1, 24);
  formatter =
      new goog.i18n.DateTimeFormat(goog.i18n.DateTimeFormat.Format.SHORT_DATE);
  dateStr = formatter.format(date);
  parser =
      new goog.i18n.DateTimeParse(goog.i18n.DateTimeFormat.Format.SHORT_DATE);

  assertParsedDateEquals(2006, 7 - 1, 24, parser, dateStr, date);

  date = new Date();

  parser = new goog.i18n.DateTimeParse('y/MM/dd H:mm:ss٫SS');
  assertParsedDateEquals(2006, 6, 27, parser, '۲۰۰۶/۰۷/۲۷ ۱۳:۱۰:۱۰٫۲۵', date);
}

function testTimeZone() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('MM/dd/yyyy, hh:mm:ss zzz');
  assertTrue(parser.parse('07/21/2003, 11:22:33 GMT-0700', date) > 0);
  var hourGmtMinus07 = date.getHours();

  assertTrue(parser.parse('07/21/2003, 11:22:33 GMT-0600', date) > 0);
  var hourGmtMinus06 = date.getHours();
  assertEquals(1, (hourGmtMinus07 + 24 - hourGmtMinus06) % 24);

  assertTrue(parser.parse('07/21/2003, 11:22:33 GMT-0800', date) > 0);
  var hourGmtMinus08 = date.getHours();
  assertEquals(1, (hourGmtMinus08 + 24 - hourGmtMinus07) % 24);

  assertTrue(parser.parse('07/21/2003, 23:22:33 GMT-0800', date) > 0);
  assertEquals((date.getHours() + 24 - hourGmtMinus07) % 24, 13);

  assertTrue(parser.parse('07/21/2003, 11:22:33 GMT+0800', date) > 0);
  var hourGmt08 = date.getHours();
  assertEquals(16, (hourGmtMinus08 + 24 - hourGmt08) % 24);

  assertTrue(parser.parse('07/21/2003, 11:22:33 GMT0800', date) > 0);
  assertEquals(hourGmt08, date.getHours());

  // 'foo' is not a timezone
  assertFalse(parser.parse('07/21/2003, 11:22:33 foo', date) > 0);
}

function testWeekDay() {
  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('EEEE, MM/dd/yyyy');

  assertTrue(parser.parse('Wednesday, 08/16/2006', date) > 0);
  assertDateEquals(2006, 8 - 1, 16, date);
  assertTrue(parser.parse('Tuesday, 08/16/2006', date) == 0);
  assertTrue(parser.parse('Thursday, 08/16/2006', date) == 0);
  assertTrue(parser.parse('Wed, 08/16/2006', date) > 0);
  assertTrue(parser.parse('Wasdfed, 08/16/2006', date) == 0);

  date.setDate(25);
  parser = new goog.i18n.DateTimeParse('EEEE, MM/yyyy');
  assertTrue(parser.parse('Wed, 09/2006', date) > 0);
  assertEquals(27, date.getDate());

  date.setDate(30);
  assertTrue(parser.parse('Wed, 09/2006', date) > 0);
  assertEquals(27, date.getDate());
  date.setDate(30);
  assertTrue(parser.parse('Mon, 09/2006', date) > 0);
  assertEquals(25, date.getDate());
}

function testStrictParse() {
  var date = new Date();

  var parser = new goog.i18n.DateTimeParse('yyyy/MM/dd');
  assertTrue(parser.strictParse('2000/13/10', date) == 0);
  assertTrue(parser.strictParse('2000/13/40', date) == 0);
  assertTrue(parser.strictParse('2000/11/10', date) > 0);
  assertDateEquals(2000, 11 - 1, 10, date);

  parser = new goog.i18n.DateTimeParse('yy/MM/dd');
  assertTrue(parser.strictParse('00/11/10', date) > 0);
  assertTrue(parser.strictParse('99/11/10', date) > 0);
  assertTrue(parser.strictParse('00/13/10', date) == 0);
  assertTrue(parser.strictParse('00/11/32', date) == 0);
  assertTrue(parser.strictParse('1900/11/2', date) > 0);

  parser = new goog.i18n.DateTimeParse('hh:mm');
  assertTrue(parser.strictParse('15:44', date) > 0);
  assertTrue(parser.strictParse('25:44', date) == 0);
  assertTrue(parser.strictParse('15:64', date) == 0);

  // leap year
  parser = new goog.i18n.DateTimeParse('yy/MM/dd');
  assertTrue(parser.strictParse('00/02/29', date) > 0);
  assertTrue(parser.strictParse('01/02/29', date) == 0);
}

function testPartialParses() {
  var date = new Date(0);
  var parser = new goog.i18n.DateTimeParse('h:mma');
  assertTrue(parser.parse('5:', date) > 0);
  assertEquals(5, date.getHours());
  assertEquals(0, date.getMinutes());

  date = new Date(0);
  assertTrue(parser.parse('5:44pm', date) > 0);
  assertEquals(17, date.getHours());
  assertEquals(44, date.getMinutes());

  date = new Date(0);
  assertTrue(parser.parse('5:44ym', date) > 0);
  assertEquals(5, date.getHours());
  assertEquals(44, date.getMinutes());

  parser = new goog.i18n.DateTimeParse('mm:ss');
  date = new Date(0);
  assertTrue(parser.parse('15:', date) > 0);
  assertEquals(15, date.getMinutes());
  assertEquals(0, date.getSeconds());
}

function testEnglishQuarter() {
  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('QQQQ yyyy');

  // Fails in Safari4/Chrome Winxp because of infrastructure issues, temporarily
  // disabled. See b/4274778.
  expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);
  try {
    assertParsedDateEquals(2009, 0, 1, parser, '1st quarter 2009', date);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testEnglishShortQuarter() {
  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('yyyyQQ');

  // Fails in Safari4/Chrome Winxp because of infrastructure issues, temporarily
  // disabled. See b/4274778.
  expectedFailures.expectFailureFor(goog.userAgent.WEBKIT);
  try {
    assertParsedDateEquals(2006, 4 - 1, 1, parser, '2006Q2', date);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testFrenchShortQuarter() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr;

  var date = new Date();
  var parser = new goog.i18n.DateTimeParse('yyyyQQ');
  assertParsedDateEquals(2009, 7 - 1, 1, parser, '2009T3', date);
}

function testDateTime() {
  var dateOrg = new Date(2006, 7 - 1, 24, 17, 21, 42, 0);

  var formatter = new goog.i18n.DateTimeFormat(
      goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME);
  dateStr = formatter.format(dateOrg);

  var parser = new goog.i18n.DateTimeParse(
      goog.i18n.DateTimeFormat.Format.MEDIUM_DATETIME);
  var dateParsed = new Date();

  assertParsedDateEquals(
      dateOrg.getFullYear(), dateOrg.getMonth(), dateOrg.getDate(), parser,
      dateStr, dateParsed);
  assertTimeEquals(
      dateOrg.getHours(), dateOrg.getMinutes(), dateOrg.getSeconds(), undefined,
      dateParsed);
}


/** @bug 10075434 */
function testParseDateWithOverflow() {
  // We force the initial day of month to 30 so that it will always cause an
  // overflow in February, no matter if it is a leap year or not.
  var dateOrg = new Date(2006, 7 - 1, 30, 17, 21, 42, 0);
  var dateParsed;  // this will receive the result of the parsing

  var parserMonthYear = new goog.i18n.DateTimeParse('MMMM yyyy');

  // The API can be a bit confusing, as this date is both input and output.
  // Benefit: fields that don't come from parsing are preserved.
  // In the typical use case, dateParsed = new Date()
  // and when you parse "February 3" the year is implied as "this year"
  // This works as intended.
  // But because of this we will initialize dateParsed from dateOrg
  // before every test (because the previous test changes it).

  dateParsed = new Date(dateOrg.getTime());
  // if preserved February 30 overflows, so we get the closest February day, 28
  assertParsedDateEquals(
      2013, 2 - 1, 28, parserMonthYear, 'February 2013', dateParsed);

  // Same as above, but the last February date is 29 (leap year)
  dateParsed = new Date(dateOrg.getTime());
  assertParsedDateEquals(
      2012, 2 - 1, 29, parserMonthYear, 'February 2012', dateParsed);

  // Same as above, but no overflow (Match has 31 days, the parsed 30 is OK)
  dateParsed = new Date(dateOrg.getTime());
  assertParsedDateEquals(
      2013, 3 - 1, 30, parserMonthYear, 'March 2013', dateParsed);

  // The pattern does not expect the day of month, so 12 is interpreted
  // as year, 12. May be weird, but this is the original behavior.
  // The overflow for leap year applies, same as above.
  dateParsed = new Date(dateOrg.getTime());
  assertParsedDateEquals(
      12, 2 - 1, 29, parserMonthYear, 'February 12, 2013', dateParsed);

  // We make sure that the fix did not break parsing with day of month present
  var parserMonthDayYear = new goog.i18n.DateTimeParse('MMMM d, yyyy');

  dateParsed = new Date(dateOrg.getTime());
  assertParsedDateEquals(
      2012, 2 - 1, 12, parserMonthDayYear, 'February 12, 2012', dateParsed);

  // The current behavior when parsing 'February 31, 2012' is to
  // return 'March 2, 2012'
  // Expected or not, we make sure the fix does not break this.
  assertParsedDateEquals(
      2012, 3 - 1, 2, parserMonthDayYear, 'February 31, 2012', dateParsed);
}


/** @bug 9901750 */
function testStandaloneMonthPattern() {
  goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pl;
  var date1 = new goog.date.Date(2006, 7 - 1);
  var date2 = new goog.date.Date();
  var formatter = new goog.i18n.DateTimeFormat('LLLL yyyy');
  var parser = new goog.i18n.DateTimeParse('LLLL yyyy');
  var dateStr = formatter.format(date1);
  assertParsedDateEquals(
      date1.getFullYear(), date1.getMonth(), undefined, parser, dateStr, date2);

  // Sanity tests to make sure MMM... (and LLL...) formats still work for
  // different locales.
  var symbols = [goog.i18n.DateTimeSymbols_en, goog.i18n.DateTimeSymbols_pl];

  for (var i = 0; i < symbols.length; i++) {
    goog.i18n.DateTimeSymbols = symbols[i];
    var tests = {
      'MMMM yyyy': goog.i18n.DateTimeSymbols.MONTHS,
      'LLLL yyyy': goog.i18n.DateTimeSymbols.STANDALONEMONTHS,
      'MMM yyyy': goog.i18n.DateTimeSymbols.SHORTMONTHS,
      'LLL yyyy': goog.i18n.DateTimeSymbols.STANDALONESHORTMONTHS
    };

    for (var format in tests) {
      var parser = new goog.i18n.DateTimeParse(format);
      var months = tests[format];
      for (var m = 0; m < months.length; m++) {
        var dateStr = months[m] + ' 2006';
        var date = new goog.date.Date();
        assertParsedDateEquals(2006, m, undefined, parser, dateStr, date);
      }
    }
  }
}

function testConstructorSymbols() {
  var y = 2015, m = 8, d = 28;
  var dateFr = new Date(y, m, d);
  var dateZh = new Date(y, m, d);

  var parserFr = new goog.i18n.DateTimeParse(
      goog.i18n.DateTimeFormat.Format.FULL_DATE, goog.i18n.DateTimeSymbols_fr);

  var parserZh = new goog.i18n.DateTimeParse(
      goog.i18n.DateTimeFormat.Format.FULL_DATE, goog.i18n.DateTimeSymbols_zh);

  var fmtFr = new goog.i18n.DateTimeFormat(
      goog.i18n.DateTimeFormat.Format.FULL_DATE, goog.i18n.DateTimeSymbols_fr);

  var fmtZh = new goog.i18n.DateTimeFormat(
      goog.i18n.DateTimeFormat.Format.FULL_DATE, goog.i18n.DateTimeSymbols_zh);

  var dateStrFr = fmtFr.format(dateFr);
  var dateStrZh = fmtZh.format(dateZh);

  assertParsedDateEquals(y, m, d, parserFr, dateStrFr, dateFr);
  assertParsedDateEquals(y, m, d, parserZh, dateStrZh, dateZh);
}

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

goog.provide('goog.date.DateRangeTest');
goog.setTestOnly('goog.date.DateRangeTest');

goog.require('goog.date.Date');
goog.require('goog.date.DateRange');
goog.require('goog.date.Interval');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.testing.jsunit');

var gd = goog.date.Date;
var gdr = goog.date.DateRange;
var gdi = goog.date.Interval;

function testDateRange() {
  var date1 = new gd(2000, 0, 1);
  var date2 = new gd(2000, 1, 1);

  var range = new gdr(date1, date2);
  assertTrue('startDate matches', date1.equals(range.getStartDate()));
  assertTrue('endDate matches', date2.equals(range.getEndDate()));
}

function testDateRangeEquals() {
  var date1 = new gd(2000, 0, 1);
  var date2 = new gd(2000, 1, 1);

  var range1 = new gdr(date1, date2);
  var range2 = new gdr(date1, date2);
  assertTrue('equals', gdr.equals(range1, range2));
}

function testDateRangeNotEquals() {
  var date1 = new gd(2000, 0, 1);
  var date2 = new gd(2000, 1, 1);

  var range1 = new gdr(date1, date2);
  var range2 = new gdr(date2, date1);
  assertFalse('not equals', gdr.equals(range1, range2));
}

function testOffsetInDays() {
  var d = new gd(2000, 0, 1);
  var f = gdr.offsetInDays_;

  assertTrue('same day', d.equals(f(d, 0)));
  assertTrue('next day', new gd(2000, 0, 2).equals(f(d, 1)));
  assertTrue('last day', new gd(1999, 11, 31).equals(f(d, -1)));
}

function testCurrentOrLastMonday() {
  var mon = new gd(2008, 9, 13);
  var tue = new gd(2008, 9, 14);
  var wed = new gd(2008, 9, 15);
  var thu = new gd(2008, 9, 16);
  var fri = new gd(2008, 9, 17);
  var sat = new gd(2008, 9, 18);
  var sun = new gd(2008, 9, 19);
  var f = gdr.currentOrLastMonday_;

  assertTrue('mon', mon.equals(f(mon)));
  assertTrue('tue', mon.equals(f(tue)));
  assertTrue('wed', mon.equals(f(wed)));
  assertTrue('thu', mon.equals(f(thu)));
  assertTrue('fri', mon.equals(f(fri)));
  assertTrue('sat', mon.equals(f(sat)));
  assertTrue('sun', mon.equals(f(sun)));
}

function testOffsetInMonths() {
  var d = new gd(2008, 9, 13);
  var f = gdr.offsetInMonths_;

  assertTrue('this month', new gd(2008, 9, 1).equals(f(d, 0)));
  assertTrue('last month', new gd(2008, 8, 1).equals(f(d, -1)));
  assertTrue('next month', new gd(2008, 10, 1).equals(f(d, 1)));
  assertTrue('next year', new gd(2009, 9, 1).equals(f(d, 12)));
  assertTrue('last year', new gd(2007, 9, 1).equals(f(d, -12)));
}

function testYesterday() {
  var d = new gd(2008, 9, 13);
  var s = new gd(2008, 9, 12);
  var e = new gd(2008, 9, 12);
  assertStartEnd('yesterday', s, e, gdr.yesterday(d));
}

function testToday() {
  var d = new gd(2008, 9, 13);
  assertStartEnd('today', d, d, gdr.today(d));
}

function testLast7Days() {
  var d = new gd(2008, 9, 13);
  var s = new gd(2008, 9, 6);
  var e = new gd(2008, 9, 12);
  assertStartEnd('last7Days', s, e, gdr.last7Days(d));
  assertStartEnd('last7Days by key', s, e,
      gdr.standardDateRange(gdr.StandardDateRangeKeys.LAST_7_DAYS, d));
}

function testThisMonth() {
  var d = new gd(2008, 9, 13);
  var s = new gd(2008, 9, 1);
  var e = new gd(2008, 9, 31);
  assertStartEnd('thisMonth', s, e, gdr.thisMonth(d));
  assertStartEnd('thisMonth by key', s, e,
      gdr.standardDateRange(gdr.StandardDateRangeKeys.THIS_MONTH, d));
}

function testLastMonth() {
  var d = new gd(2008, 9, 13);
  var s = new gd(2008, 8, 1);
  var e = new gd(2008, 8, 30);
  assertStartEnd('lastMonth', s, e, gdr.lastMonth(d));
  assertStartEnd('lastMonth by key', s, e,
      gdr.standardDateRange(gdr.StandardDateRangeKeys.LAST_MONTH, d));
}

function testThisWeek() {
  var startDates = [
    new gd(2011, 2, 28),
    new gd(2011, 2, 29),
    new gd(2011, 2, 30),
    new gd(2011, 2, 31),
    new gd(2011, 3, 1),
    new gd(2011, 2, 26),
    new gd(2011, 2, 27)
  ];

  var endDates = [
    new gd(2011, 3, 3),
    new gd(2011, 3, 4),
    new gd(2011, 3, 5),
    new gd(2011, 3, 6),
    new gd(2011, 3, 7),
    new gd(2011, 3, 1),
    new gd(2011, 3, 2)
  ];

  // 0 - is Monday, 6 is Sunday.
  for (var i = 0; i < 7; i++) {
    var date = new gd(2011, 3, 1);
    date.setFirstDayOfWeek(i);
    assertStartEnd('thisWeek, ' + i, startDates[i], endDates[i],
        gdr.thisWeek(date));
  }

  assertStartEnd('thisWeek by key ',
      startDates[goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK],
      endDates[goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK],
      gdr.standardDateRange(gdr.StandardDateRangeKeys.THIS_WEEK,
          new gd(2011, 3, 1)));
}

function testLastWeek() {
  var startDates = [
    new gd(2011, 2, 21),
    new gd(2011, 2, 22),
    new gd(2011, 2, 23),
    new gd(2011, 2, 24),
    new gd(2011, 2, 25),
    new gd(2011, 2, 19),
    new gd(2011, 2, 20)
  ];

  var endDates = [
    new gd(2011, 2, 27),
    new gd(2011, 2, 28),
    new gd(2011, 2, 29),
    new gd(2011, 2, 30),
    new gd(2011, 2, 31),
    new gd(2011, 2, 25),
    new gd(2011, 2, 26)
  ];

  // 0 - is Monday, 6 is Sunday.
  for (var i = 0; i < 7; i++) {
    var date = new gd(2011, 3, 1);
    date.setFirstDayOfWeek(i);
    assertStartEnd('lastWeek, ' + i, startDates[i], endDates[i],
        gdr.lastWeek(date));
  }

  assertStartEnd('lastWeek by key',
      startDates[goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK],
      endDates[goog.i18n.DateTimeSymbols.FIRSTDAYOFWEEK],
      gdr.standardDateRange(gdr.StandardDateRangeKeys.LAST_WEEK,
          new gd(2011, 3, 1)));
}

function testLastBusinessWeek() {
  var d = new gd(2008, 9, 13);
  var s = new gd(2008, 9, 6);
  var e = new gd(2008, 9, 10);
  assertStartEnd('lastBusinessWeek', s, e, gdr.lastBusinessWeek(d));
  assertStartEnd('lastBusinessWeek by key', s, e,
      gdr.standardDateRange(gdr.StandardDateRangeKeys.LAST_BUSINESS_WEEK, d));
}

function testAllTime() {
  var s = new gd(0000, 0, 1);
  var e = new gd(9999, 11, 31);
  assertStartEnd('allTime', s, e, gdr.allTime());
  assertStartEnd('allTime by key', s, e,
      gdr.standardDateRange(gdr.StandardDateRangeKeys.ALL_TIME));
}

function testIterator() {
  var s = new gd(2008, 9, 1);
  var e = new gd(2008, 9, 10);
  var i = new gdr(s, e).iterator();
  assertTrue('day 0', new gd(2008, 9, 1).equals(i.next()));
  assertTrue('day 1', new gd(2008, 9, 2).equals(i.next()));
  assertTrue('day 2', new gd(2008, 9, 3).equals(i.next()));
  assertTrue('day 3', new gd(2008, 9, 4).equals(i.next()));
  assertTrue('day 4', new gd(2008, 9, 5).equals(i.next()));
  assertTrue('day 5', new gd(2008, 9, 6).equals(i.next()));
  assertTrue('day 6', new gd(2008, 9, 7).equals(i.next()));
  assertTrue('day 7', new gd(2008, 9, 8).equals(i.next()));
  assertTrue('day 8', new gd(2008, 9, 9).equals(i.next()));
  assertTrue('day 9', new gd(2008, 9, 10).equals(i.next()));
  assertThrows('day 10', goog.bind(i.next, i));
}

function testContains() {
  var r = new gdr(new gd(2008, 9, 10), new gd(2008, 9, 12));
  assertFalse('min date', r.contains(goog.date.DateRange.MINIMUM_DATE));
  assertFalse('9/10/2007', r.contains(new gd(2007, 9, 10)));
  assertFalse('9/9/2008', r.contains(new gd(2008, 9, 9)));
  assertTrue('9/10/2008', r.contains(new gd(2008, 9, 10)));
  assertTrue('9/11/2008', r.contains(new gd(2008, 9, 11)));
  assertTrue('9/12/2008', r.contains(new gd(2008, 9, 12)));
  assertFalse('9/13/2008', r.contains(new gd(2008, 9, 13)));
  assertFalse('max date', r.contains(goog.date.DateRange.MAXIMUM_DATE));
}

function assertStartEnd(name, start, end, actual) {
  assertTrue(
      name + ' start should be ' + start + ' but was ' + actual.getStartDate(),
      start.equals(actual.getStartDate()));
  assertTrue(
      name + ' end should be ' + end + ' but was ' + actual.getEndDate(),
      end.equals(actual.getEndDate()));
}

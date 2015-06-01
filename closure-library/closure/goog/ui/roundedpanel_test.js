// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.RoundedPanelTest');
goog.setTestOnly('goog.ui.RoundedPanelTest');

goog.require('goog.testing.jsunit');
goog.require('goog.ui.CssRoundedPanel');
goog.require('goog.ui.GraphicsRoundedPanel');
goog.require('goog.ui.RoundedPanel');
goog.require('goog.userAgent');


/**
 * Tests goog.ui.RoundedPanel.create(), ensuring that the proper instance is
 * created based on user-agent
 */
function testRoundedPanelCreate() {
  var rcp = goog.ui.RoundedPanel.create(15,
                                        5,
                                        '#cccccc',
                                        '#cccccc',
                                        goog.ui.RoundedPanel.Corner.ALL);

  if (goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9a')) {
    assertTrue('For Firefox 3.0+ (uses Gecko 1.9+), an instance of ' +
        'goog.ui.CssRoundedPanel should be returned.',
        rcp instanceof goog.ui.CssRoundedPanel);
  } else if (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('500')) {
    assertTrue('For Safari 3.0+, an instance of goog.ui.CssRoundedPanel ' +
        'should be returned.', rcp instanceof goog.ui.CssRoundedPanel);
  } else if (goog.userAgent.GECKO ||
             goog.userAgent.IE ||
             goog.userAgent.OPERA ||
             goog.userAgent.WEBKIT) {
    assertTrue('For Gecko 1.8- (ex. Firefox 2.0-, Camino 1.5-, etc.), ' +
        'IE, Opera, and Safari 2.0-, an instance of ' +
        'goog.ui.GraphicsRoundedPanel should be returned.',
        rcp instanceof goog.ui.GraphicsRoundedPanel);
  } else {
    assertNull('For non-supported user-agents, null is returned.', rcp);
  }
}

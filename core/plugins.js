/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Plugin System.
 *    Allowing advanced customisations of Blockly to be added and removed dynamically in a
 *    standardised manner.
 * @author jollytoad@gmail.com (Mark Gibson)
 */
'use strict';

goog.provide('Blockly.Plugins');

// TODO: define PluginSpec with Closure types

/**
 * The set of all registered plugins, keyed by a unique plugin id.
 * @type {!Object<string, !PluginSpec>}
 * @private
 */
Blockly.Plugins.registry_ = {};

/**
 * The set of all registered plugin lifecycle listeners.
 * @type {!Array<function(string, !PluginSpec)>}
 * @private
 */
Blockly.Plugins.listeners_ = [];

/**
 * A cache of all hooks registered by plugins indexed by hook name.
 * @type {Object<string, any>}
 * @private
 */
Blockly.Plugins.hooksCache_ = null;

/**
 * Enumeration of plugin lifecycle stages
 * @type {{UNREGISTERED: string, REGISTERED: string}}
 */
Blockly.Plugins.Lifecycle = {
  REGISTERED: 'REGISTERED',
  UNREGISTERED: 'UNREGISTERED'
};

/**
 * Register a Blockly Plugin
 * @param {string} id Unique identifier for the plugin to allow later reference/removal
 * @param {!function(Blockly):object} factory Generate a PluginSpec for Blockly
 */
Blockly.Plugins.register = function(id, factory) {
  var pluginSpec = factory(Blockly);

  if (!Blockly.Plugins.registry_[id]) {
    Blockly.Plugins.registry_[id] = pluginSpec;

    console.debug('Register Plugin:', id, pluginSpec);

    // Invalidate the hooks cache
    Blockly.Plugins.hooksCache_ = null;

    Blockly.Plugins.addAspects_(id, pluginSpec.aspects);

    if (pluginSpec.init instanceof Function) {
      pluginSpec.init();
    }

    Blockly.Plugins.callLifecycleListeners_(Blockly.Plugins.Lifecycle.REGISTERED, pluginSpec);
  }
};

/**
 * Unregister a Blockly Plugin
 * @param {!string} id The unique id of the Plugin
 */
Blockly.Plugins.unregister = function(id) {
  var pluginSpec = Blockly.Plugins.registry_[id];
  if (pluginSpec) {
    delete Blockly.Plugins.registry_[id];

    // Invalidate the hooks cache
    Blockly.Plugins.hooksCache_ = null;

    Blockly.Plugins.removeAspects_(id, pluginSpec.aspects);

    if (pluginSpec.dispose instanceof Function) {
      pluginSpec.dispose();
    }

    Blockly.Plugins.callLifecycleListeners_(Blockly.Plugins.Lifecycle.UNREGISTERED, pluginSpec);
  }
};

Blockly.Plugins.registerLifecycleListener = function(listener) {
  if (Blockly.Plugins.listeners_.indexOf(listener) === -1) {
    Blockly.Plugins.listeners_.push(listener);
  }
};

Blockly.Plugins.unregisterLifecycleListener = function(listener) {
  var i = Blockly.Plugins.listeners_.indexOf(listener);
  if (i !== -1) {
    Blockly.Plugins.listeners_.splice(i, 1);
  }
};

/**
 * Call all lifecycle listeners
 * @param {string} lifecycle The plugin lifecycle stage
 * @param {Object} pluginSpec The PluginSpec
 * @private
 */
Blockly.Plugins.callLifecycleListeners_ = function(lifecycle, pluginSpec) {
  Blockly.Plugins.listeners_.forEach(function(listener) {
    listener(lifecycle, pluginSpec);
  });
};

Blockly.Plugins.getHooks = function(name) {
  if (Blockly.Plugins.hooksCache_ === null) {
    Blockly.Plugins.hooksCache_ = Blockly.Plugins.buildHooksCache_(Blockly.Plugins.registry_);
  }
  return Blockly.Plugins.hooksCache_[name] || [];
};

Blockly.Plugins.buildHooksCache_ = function(registry) {
  var cache = {};

  for (var id in registry) {
    if (registry.hasOwnProperty(id)) {
      var pluginSpec = registry[id];
      var hooks = pluginSpec.hooks;
      if (hooks) {
        for (var name in hooks) {
          if (hooks.hasOwnProperty(name)) {
            cache[name] = cache[name] || [];
            cache[name].push(hooks[name]);
          }
        }
      }
    }
  }

  return cache;
};

Blockly.Plugins.addAspects_ = function(id, aspects) {
  (aspects || []).forEach(function(aspect) {
    Blockly.Plugins.addAspect_(id, aspect);
  });
};

Blockly.Plugins.removeAspects_ = function(id, aspects) {
  (aspects || []).forEach(function(aspect) {
    Blockly.Plugins.removeAspect_(id, aspect);
  });
};

Blockly.Plugins.addAspect_ = function(id, aspect) {
  var pointcut = Blockly.Plugins.getPointcut_(aspect);
  var object = pointcut[0];
  var key = pointcut[1];
  var target = object[key];

  if (!(target instanceof Function)) {
    console.error('Invalid pointcut at \'' + key + '\' in ', object);
    return;
  }

  if (!target._advices) {
    var original = target;

    target = function() {
      var this_ = this;

      var params = target._advices.reduce(function(paramsIn, advice) {
        if (advice.before) {
          var paramsOut = advice.before.apply(this_, paramsIn);
          return paramsOut || paramsIn;
        }
      }, arguments);

      // TODO: Handle 'around' advice
      var returned = target._original.apply(this_, params);

      return target._advices.reduce(function(returnIn, advice) {
        if (advice.after) {
          var returnOut = advice.after.call(this_, returnIn);
          return returnOut !== undefined ? returnOut : returnIn;
        }
      }, returned);
    };

    target._advices = [];
    target._ids = [];
    target._original = original;

    object[key] = target;
  }

  if (target._ids.indexOf(id) === -1) {
    target._advices.push(aspect.advice);
    target._ids.push(id);
  }
};

Blockly.Plugins.removeAspect_ = function(id, aspect) {
  var pointcut = Blockly.Plugins.getPointcut_(aspect);
  var object = pointcut[0];
  var key = pointcut[1];
  var target = object[key];

  if (target && target._advices && target._ids) {
    var i = target._ids.indexOf(id);
    if (i !== -1) {
      target._advices.splice(i, 1);
      target._ids.splice(i, 1);
    }

    if (target._original && target._advices.length === 0) {
      // restore original function
      object[key] = target._original;
    }
  }
};

Blockly.Plugins.getPointcut_ = function(aspect) {
  if (typeof aspect.pointcut === 'string') {
    console.warn('String format pointcuts not yet implemented:', aspect.pointcut);
    return [{}, null];
  } else if (Array.isArray(aspect.pointcut) && aspect.pointcut.length === 2) {
    return aspect.pointcut;
  } else {
    console.error('Invalid pointcut definition in aspect:', aspect);
    return [{}, null];
  }
};

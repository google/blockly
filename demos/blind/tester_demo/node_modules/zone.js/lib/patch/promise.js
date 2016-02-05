'use strict';

var utils = require('../utils');

/*
 * Patches a function that returns a Promise-like instance.
 *
 * This function must be used when either:
 * - Native Promises are not available,
 * - The function returns a Promise-like object.
 *
 * This is required because zones rely on a Promise monkey patch that could not be applied when
 * Promise is not natively available or when the returned object is not an instance of Promise.
 *
 * Note that calling `bindPromiseFn` on a function that returns a native Promise will also work
 * with minimal overhead.
 *
 * ```
 * var boundFunction = bindPromiseFn(FunctionReturningAPromise);
 *
 * boundFunction.then(successHandler, errorHandler);
 * ```
 */
var bindPromiseFn;

if (global.Promise) {
  bindPromiseFn = function (delegate) {
    return function() {
      var delegatePromise = delegate.apply(this, arguments);

      // if the delegate returned an instance of Promise, forward it.
      if (delegatePromise instanceof Promise) {
        return delegatePromise;
      }

      // Otherwise wrap the Promise-like in a global Promise
      return new Promise(function(resolve, reject) {
        delegatePromise.then(resolve, reject);
      });
    };
  };
} else {
  bindPromiseFn = function (delegate) {
    return function () {
      return _patchThenable(delegate.apply(this, arguments));
    };
  };
}


function _patchPromiseFnsOnObject(objectPath, fnNames) {
  var obj = global;

  var exists = objectPath.every(function (segment) {
    obj = obj[segment];
    return obj;
  });

  if (!exists) {
    return;
  }

  fnNames.forEach(function (name) {
    var fn = obj[name];
    if (fn) {
      obj[name] = bindPromiseFn(fn);
    }
  });
}

function _patchThenable(thenable) {
  var then = thenable.then;
  thenable.then = function () {
    var args = utils.bindArguments(arguments);
    var nextThenable = then.apply(thenable, args);
    return _patchThenable(nextThenable);
  };

  var ocatch = thenable.catch;
  thenable.catch = function () {
    var args = utils.bindArguments(arguments);
    var nextThenable = ocatch.apply(thenable, args);
    return _patchThenable(nextThenable);
  };

  return thenable;
}


function apply() {
  // Patch .then() and .catch() on native Promises to execute callbacks in the zone where
  // those functions are called.
  if (global.Promise) {
    utils.patchPrototype(Promise.prototype, [
      'then',
      'catch'
    ]);

    // Patch browser APIs that return a Promise
    var patchFns = [
      // fetch
      [[], ['fetch']],
      [['Response', 'prototype'], ['arrayBuffer', 'blob', 'json', 'text']]
    ];

    patchFns.forEach(function(objPathAndFns) {
      _patchPromiseFnsOnObject(objPathAndFns[0], objPathAndFns[1]);
    });
  }
}

module.exports = {
  apply: apply,
  bindPromiseFn: bindPromiseFn
};

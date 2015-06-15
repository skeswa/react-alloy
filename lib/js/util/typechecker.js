'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var isArray = function isArray(x) {
    if (!x) return false;else return x.constructor === Array;
};

exports.isArray = isArray;
var isFunction = function isFunction(x) {
    if (!x) return false;else return typeof x === 'function';
};

exports.isFunction = isFunction;
var isString = function isString(x) {
    return typeof x == 'string' || x instanceof String;
};

exports.isString = isString;
var isEmpty = function isEmpty(x) {
    return !x || 0 === x.length;
};
exports.isEmpty = isEmpty;
'use strict';

var HashMap$WonderCommonlib = require("./HashMap.bs.js");

function set(map, key, value) {
  var newMap = HashMap$WonderCommonlib.copy(map);
  newMap[key] = value;
  return newMap;
}

function deleteVal(map, key) {
  var newMap = HashMap$WonderCommonlib.copy(map);
  newMap[key] = undefined;
  return newMap;
}

var createEmpty = HashMap$WonderCommonlib.createEmpty;

var get = HashMap$WonderCommonlib.get;

var getNullable = HashMap$WonderCommonlib.getNullable;

var has = HashMap$WonderCommonlib.has;

exports.createEmpty = createEmpty;
exports.set = set;
exports.get = get;
exports.getNullable = getNullable;
exports.has = has;
exports.deleteVal = deleteVal;
/* No side effect */

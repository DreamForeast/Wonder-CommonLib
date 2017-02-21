import { Collection } from "./Collection";
import { JudgeUtils } from "./utils/JudgeUtils";
import { $BREAK, $REMOVE } from "./global/Const";
import { Log } from "./Log";
import { ExtendUtils } from "./utils/ExtendUtils";
var Hash = (function () {
    function Hash(children) {
        if (children === void 0) { children = {}; }
        this._children = null;
        this._children = children;
    }
    Hash.create = function (children) {
        if (children === void 0) { children = {}; }
        var obj = new this(children);
        return obj;
    };
    Hash.prototype.getChildren = function () {
        return this._children;
    };
    Hash.prototype.getCount = function () {
        var result = 0, children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result++;
            }
        }
        return result;
    };
    Hash.prototype.getKeys = function () {
        var result = Collection.create(), children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result.addChild(key);
            }
        }
        return result;
    };
    Hash.prototype.getValues = function () {
        var result = Collection.create(), children = this._children, key = null;
        for (key in children) {
            if (children.hasOwnProperty(key)) {
                result.addChild(children[key]);
            }
        }
        return result;
    };
    Hash.prototype.getChild = function (key) {
        return this._children[key];
    };
    Hash.prototype.setValue = function (key, value) {
        this._children[key] = value;
        return this;
    };
    Hash.prototype.addChild = function (key, value) {
        this._children[key] = value;
        return this;
    };
    Hash.prototype.addChildren = function (arg) {
        var i = null, children = null;
        if (arg instanceof Hash) {
            children = arg.getChildren();
        }
        else {
            children = arg;
        }
        for (i in children) {
            if (children.hasOwnProperty(i)) {
                this.addChild(i, children[i]);
            }
        }
        return this;
    };
    Hash.prototype.appendChild = function (key, value) {
        if (this._children[key] instanceof Collection) {
            var c = (this._children[key]);
            c.addChild(value);
        }
        else {
            this._children[key] = (Collection.create().addChild(value));
        }
        return this;
    };
    Hash.prototype.setChildren = function (children) {
        this._children = children;
    };
    Hash.prototype.removeChild = function (arg) {
        var result = [];
        if (JudgeUtils.isString(arg)) {
            var key = arg;
            result.push(this._children[key]);
            this._children[key] = void 0;
            delete this._children[key];
        }
        else if (JudgeUtils.isFunction(arg)) {
            var func_1 = arg, self_1 = this;
            this.forEach(function (val, key) {
                if (func_1(val, key)) {
                    result.push(self_1._children[key]);
                    self_1._children[key] = void 0;
                    delete self_1._children[key];
                }
            });
        }
        return Collection.create(result);
    };
    Hash.prototype.removeAllChildren = function () {
        this._children = {};
    };
    Hash.prototype.hasChild = function (key) {
        return this._children[key] !== void 0;
    };
    Hash.prototype.hasChildWithFunc = function (func) {
        var result = false;
        this.forEach(function (val, key) {
            if (func(val, key)) {
                result = true;
                return $BREAK;
            }
        });
        return result;
    };
    Hash.prototype.forEach = function (func, context) {
        var children = this._children;
        for (var i in children) {
            if (children.hasOwnProperty(i)) {
                if (func.call(context, children[i], i) === $BREAK) {
                    break;
                }
            }
        }
        return this;
    };
    Hash.prototype.filter = function (func) {
        var result = {}, children = this._children, value = null;
        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                value = children[key];
                if (func.call(children, value, key)) {
                    result[key] = value;
                }
            }
        }
        return Hash.create(result);
    };
    Hash.prototype.findOne = function (func) {
        var result = [], self = this, scope = this._children;
        this.forEach(function (val, key) {
            if (!func.call(scope, val, key)) {
                return;
            }
            result = [key, self.getChild(key)];
            return $BREAK;
        });
        return result;
    };
    Hash.prototype.map = function (func) {
        var resultMap = {};
        this.forEach(function (val, key) {
            var result = func(val, key);
            if (result !== $REMOVE) {
                Log.error(!JudgeUtils.isArray(result) || result.length !== 2, Log.info.FUNC_MUST_BE("iterator", "[key, value]"));
                resultMap[result[0]] = result[1];
            }
        });
        return Hash.create(resultMap);
    };
    Hash.prototype.toCollection = function () {
        var result = Collection.create();
        this.forEach(function (val, key) {
            if (val instanceof Collection) {
                result.addChildren(val);
            }
            else {
                result.addChild(val);
            }
        });
        return result;
    };
    Hash.prototype.toArray = function () {
        var result = [];
        this.forEach(function (val, key) {
            if (val instanceof Collection) {
                result = result.concat(val.getChildren());
            }
            else {
                result.push(val);
            }
        });
        return result;
    };
    Hash.prototype.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var target = null, isDeep = null;
        if (args.length === 0) {
            isDeep = false;
            target = Hash.create();
        }
        else if (args.length === 1) {
            if (JudgeUtils.isBoolean(args[0])) {
                target = Hash.create();
                isDeep = args[0];
            }
            else {
                target = args[0];
                isDeep = false;
            }
        }
        else {
            target = args[0];
            isDeep = args[1];
        }
        if (isDeep === true) {
            target.setChildren(ExtendUtils.extendDeep(this._children));
        }
        else {
            target.setChildren(ExtendUtils.extend({}, this._children));
        }
        return target;
    };
    return Hash;
}());
export { Hash };
//# sourceMappingURL=Hash.js.map
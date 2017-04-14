"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var List_1 = require("./List");
var JudgeUtils_1 = require("./utils/JudgeUtils");
var ExtendUtils_1 = require("./utils/ExtendUtils");
var Collection_1 = require("./Collection");
var Const_1 = require("./global/Const");
var Stack = (function (_super) {
    __extends(Stack, _super);
    function Stack(children) {
        if (children === void 0) { children = []; }
        var _this = _super.call(this) || this;
        _this.children = children;
        return _this;
    }
    Stack.create = function (children) {
        if (children === void 0) { children = []; }
        var obj = new this(children);
        return obj;
    };
    Object.defineProperty(Stack.prototype, "top", {
        get: function () {
            return this.children[this.children.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    Stack.prototype.push = function (element) {
        this.children.push(element);
    };
    Stack.prototype.pop = function () {
        return this.children.pop();
    };
    Stack.prototype.clear = function () {
        this.removeAllChildren();
    };
    Stack.prototype.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var target = null, isDeep = null;
        if (args.length === 0) {
            isDeep = false;
            target = Stack.create();
        }
        else if (args.length === 1) {
            if (JudgeUtils_1.JudgeUtils.isBoolean(args[0])) {
                target = Stack.create();
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
            target.setChildren(ExtendUtils_1.ExtendUtils.extendDeep(this.children));
        }
        else {
            target.setChildren(ExtendUtils_1.ExtendUtils.extend([], this.children));
        }
        return target;
    };
    Stack.prototype.filter = function (func) {
        var children = this.children, result = [], value = null;
        for (var i = 0, len = children.length; i < len; i++) {
            value = children[i];
            if (func.call(children, value, i)) {
                result.push(value);
            }
        }
        return Collection_1.Collection.create(result);
    };
    Stack.prototype.findOne = function (func) {
        var scope = this.children, result = null;
        this.forEach(function (value, index) {
            if (!func.call(scope, value, index)) {
                return;
            }
            result = value;
            return Const_1.$BREAK;
        });
        return result;
    };
    Stack.prototype.reverse = function () {
        return Collection_1.Collection.create(this.copyChildren().reverse());
    };
    Stack.prototype.removeChild = function (arg) {
        return Collection_1.Collection.create(this.removeChildHelper(arg));
    };
    Stack.prototype.sort = function (func, isSortSelf) {
        if (isSortSelf === void 0) { isSortSelf = false; }
        if (isSortSelf) {
            this.children.sort(func);
            return this;
        }
        return Collection_1.Collection.create(this.copyChildren().sort(func));
    };
    Stack.prototype.map = function (func) {
        var resultArr = [];
        this.forEach(function (e, index) {
            var result = func(e, index);
            if (result !== Const_1.$REMOVE) {
                resultArr.push(result);
            }
        });
        return Collection_1.Collection.create(resultArr);
    };
    Stack.prototype.removeRepeatItems = function () {
        var noRepeatList = Collection_1.Collection.create();
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                return;
            }
            noRepeatList.addChild(item);
        });
        return noRepeatList;
    };
    Stack.prototype.hasRepeatItems = function () {
        var noRepeatList = Collection_1.Collection.create(), hasRepeat = false;
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                hasRepeat = true;
                return Const_1.$BREAK;
            }
            noRepeatList.addChild(item);
        });
        return hasRepeat;
    };
    return Stack;
}(List_1.List));
exports.Stack = Stack;
//# sourceMappingURL=Stack.js.map
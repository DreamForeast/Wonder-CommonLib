function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
var JudgeUtils = (function () {
    function JudgeUtils() {
    }
    JudgeUtils.isArray = function (arr) {
        var length = arr && arr.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    JudgeUtils.isArrayExactly = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
    JudgeUtils.isNumber = function (num) {
        return typeof num == "number";
    };
    JudgeUtils.isNumberExactly = function (num) {
        return Object.prototype.toString.call(num) === "[object Number]";
    };
    JudgeUtils.isString = function (str) {
        return typeof str == "string";
    };
    JudgeUtils.isStringExactly = function (str) {
        return Object.prototype.toString.call(str) === "[object String]";
    };
    JudgeUtils.isBoolean = function (bool) {
        return bool === true || bool === false || toString.call(bool) === '[boolect Boolean]';
    };
    JudgeUtils.isDom = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };
    JudgeUtils.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };
    /**
     * 判断是否为对象字面量（{}）
     */
    JudgeUtils.isDirectObject = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    };
    /**
     * 检查宿主对象是否可调用
     *
     * 任何对象，如果其语义在ECMAScript规范中被定义过，那么它被称为原生对象；
     环境所提供的，而在ECMAScript规范中没有被描述的对象，我们称之为宿主对象。

     该方法用于特性检测，判断对象是否可用。用法如下：

     MyEngine addEvent():
     if (Tool.judge.isHostMethod(dom, "addEventListener")) {    //判断dom是否具有addEventListener方法
        dom.addEventListener(sEventType, fnHandler, false);
        }
     */
    JudgeUtils.isHostMethod = function (object, property) {
        var type = typeof object[property];
        return type === "function" ||
            (type === "object" && !!object[property]) ||
            type === "unknown";
    };
    JudgeUtils.isNodeJs = function () {
        return ((typeof global != "undefined" && global.module) || (typeof module != "undefined")) && typeof module.exports != "undefined";
    };
    //overwrite it in the end of this file
    JudgeUtils.isFunction = function (func) {
        return true;
    };
    return JudgeUtils;
}());
// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
// IE 11 (#1621), and in Safari 8 (#1929).
if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    JudgeUtils.isFunction = function (func) {
        return typeof func == 'function';
    };
}
else {
    JudgeUtils.isFunction = function (func) {
        return Object.prototype.toString.call(func) === "[object Function]";
    };
}

var $BREAK = {
    "break": true
};
var $REMOVE = void 0;

var List = (function () {
    function List() {
        this.children = null;
    }
    List.prototype.getCount = function () {
        return this.children.length;
    };
    List.prototype.hasChild = function (child) {
        var c = null, children = this.children;
        for (var i = 0, len = children.length; i < len; i++) {
            c = children[i];
            if (child.uid && c.uid && child.uid == c.uid) {
                return true;
            }
            else if (child === c) {
                return true;
            }
        }
        return false;
    };
    List.prototype.hasChildWithFunc = function (func) {
        for (var i = 0, len = this.children.length; i < len; i++) {
            if (func(this.children[i], i)) {
                return true;
            }
        }
        return false;
    };
    List.prototype.getChildren = function () {
        return this.children;
    };
    List.prototype.getChild = function (index) {
        return this.children[index];
    };
    List.prototype.addChild = function (child) {
        this.children.push(child);
        return this;
    };
    List.prototype.addChildren = function (arg) {
        if (JudgeUtils.isArray(arg)) {
            var children = arg;
            this.children = this.children.concat(children);
        }
        else if (arg instanceof List) {
            var children = arg;
            this.children = this.children.concat(children.getChildren());
        }
        else {
            var child = arg;
            this.addChild(child);
        }
        return this;
    };
    //todo test
    List.prototype.setChildren = function (children) {
        this.children = children;
        return this;
    };
    List.prototype.unShiftChild = function (child) {
        this.children.unshift(child);
    };
    List.prototype.removeAllChildren = function () {
        this.children = [];
        return this;
    };
    List.prototype.forEach = function (func, context) {
        this._forEach(this.children, func, context);
        return this;
    };
    //public removeChildAt (index) {
    //    Log.error(index < 0, "序号必须大于等于0");
    //
    //    this.children.splice(index, 1);
    //}
    //
    List.prototype.toArray = function () {
        return this.children;
    };
    List.prototype.copyChildren = function () {
        return this.children.slice(0);
    };
    List.prototype.removeChildHelper = function (arg) {
        var result = null;
        if (JudgeUtils.isFunction(arg)) {
            var func = arg;
            result = this._removeChild(this.children, func);
        }
        else if (arg.uid) {
            result = this._removeChild(this.children, function (e) {
                if (!e.uid) {
                    return false;
                }
                return e.uid === arg.uid;
            });
        }
        else {
            result = this._removeChild(this.children, function (e) {
                return e === arg;
            });
        }
        return result;
    };
    List.prototype._forEach = function (arr, func, context) {
        var scope = context, i = 0, len = arr.length;
        for (i = 0; i < len; i++) {
            if (func.call(scope, arr[i], i) === $BREAK) {
                break;
            }
        }
    };
    List.prototype._removeChild = function (arr, func) {
        var self = this, removedElementArr = [], remainElementArr = [];
        this._forEach(arr, function (e, index) {
            if (!!func.call(self, e)) {
                removedElementArr.push(e);
            }
            else {
                remainElementArr.push(e);
            }
        });
        this.children = remainElementArr;
        return removedElementArr;
    };
    return List;
}());

var ExtendUtils = (function () {
    function ExtendUtils() {
    }
    /**
     * 深拷贝
     *
     * 示例：
     * 如果拷贝对象为数组，能够成功拷贝（不拷贝Array原型链上的成员）
     * expect(extend.extendDeep([1, { x: 1, y: 1 }, "a", { x: 2 }, [2]])).toEqual([1, { x: 1, y: 1 }, "a", { x: 2 }, [2]]);
     *
     * 如果拷贝对象为对象，能够成功拷贝（能拷贝原型链上的成员）
     * var result = null;
     function A() {
            };
     A.prototype.a = 1;

     function B() {
            };
     B.prototype = new A();
     B.prototype.b = { x: 1, y: 1 };
     B.prototype.c = [{ x: 1 }, [2]];

     var t = new B();

     result = extend.extendDeep(t);

     expect(result).toEqual(
     {
         a: 1,
         b: { x: 1, y: 1 },
         c: [{ x: 1 }, [2]]
     });
     * @param parent
     * @param child
     * @returns
     */
    ExtendUtils.extendDeep = function (parent, child, filter) {
        if (filter === void 0) { filter = function (val, i) { return true; }; }
        var i = null, len = 0, toStr = Object.prototype.toString, sArr = "[object Array]", sOb = "[object Object]", type = "", _child = null;
        //数组的话，不获得Array原型上的成员。
        if (toStr.call(parent) === sArr) {
            _child = child || [];
            for (i = 0, len = parent.length; i < len; i++) {
                var member = parent[i];
                if (!filter(member, i)) {
                    continue;
                }
                if (member.clone) {
                    _child[i] = member.clone();
                    continue;
                }
                type = toStr.call(member);
                if (type === sArr || type === sOb) {
                    _child[i] = type === sArr ? [] : {};
                    ExtendUtils.extendDeep(member, _child[i]);
                }
                else {
                    _child[i] = member;
                }
            }
        }
        else if (toStr.call(parent) === sOb) {
            _child = child || {};
            for (i in parent) {
                var member = parent[i];
                if (!filter(member, i)) {
                    continue;
                }
                if (member.clone) {
                    _child[i] = member.clone();
                    continue;
                }
                type = toStr.call(member);
                if (type === sArr || type === sOb) {
                    _child[i] = type === sArr ? [] : {};
                    ExtendUtils.extendDeep(member, _child[i]);
                }
                else {
                    _child[i] = member;
                }
            }
        }
        else {
            _child = parent;
        }
        return _child;
    };
    /**
     * 浅拷贝
     */
    ExtendUtils.extend = function (destination, source) {
        var property = "";
        for (property in source) {
            destination[property] = source[property];
        }
        return destination;
    };
    ExtendUtils.copyPublicAttri = function (source) {
        var property = null, destination = {};
        this.extendDeep(source, destination, function (item, property) {
            return property.slice(0, 1) !== "_"
                && !JudgeUtils.isFunction(item);
        });
        return destination;
    };
    return ExtendUtils;
}());

var Collection = (function (_super) {
    __extends(Collection, _super);
    function Collection(children) {
        if (children === void 0) { children = []; }
        var _this = _super.call(this) || this;
        _this.children = children;
        return _this;
    }
    Collection.create = function (children) {
        if (children === void 0) { children = []; }
        var obj = new this(children);
        return obj;
    };
    Collection.prototype.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var target = null, isDeep = null;
        if (args.length === 0) {
            isDeep = false;
            target = Collection.create();
        }
        else if (args.length === 1) {
            if (JudgeUtils.isBoolean(args[0])) {
                target = Collection.create();
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
            target.setChildren(ExtendUtils.extendDeep(this.children));
        }
        else {
            target.setChildren(ExtendUtils.extend([], this.children));
        }
        return target;
    };
    Collection.prototype.filter = function (func) {
        var children = this.children, result = [], value = null;
        for (var i = 0, len = children.length; i < len; i++) {
            value = children[i];
            if (func.call(children, value, i)) {
                result.push(value);
            }
        }
        return Collection.create(result);
    };
    Collection.prototype.findOne = function (func) {
        var scope = this.children, result = null;
        this.forEach(function (value, index) {
            if (!func.call(scope, value, index)) {
                return;
            }
            result = value;
            return $BREAK;
        });
        return result;
    };
    Collection.prototype.reverse = function () {
        return Collection.create(this.copyChildren().reverse());
    };
    Collection.prototype.removeChild = function (arg) {
        return Collection.create(this.removeChildHelper(arg));
    };
    Collection.prototype.sort = function (func, isSortSelf) {
        if (isSortSelf === void 0) { isSortSelf = false; }
        if (isSortSelf) {
            this.children.sort(func);
            return this;
        }
        return Collection.create(this.copyChildren().sort(func));
    };
    Collection.prototype.map = function (func) {
        var resultArr = [];
        this.forEach(function (e, index) {
            var result = func(e, index);
            if (result !== $REMOVE) {
                resultArr.push(result);
            }
            //e && e[handlerName] && e[handlerName].apply(context || e, valueArr);
        });
        return Collection.create(resultArr);
    };
    Collection.prototype.removeRepeatItems = function () {
        var noRepeatList = Collection.create();
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                return;
            }
            noRepeatList.addChild(item);
        });
        return noRepeatList;
    };
    Collection.prototype.hasRepeatItems = function () {
        var noRepeatList = Collection.create(), hasRepeat = false;
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                hasRepeat = true;
                return $BREAK;
            }
            noRepeatList.addChild(item);
        });
        return hasRepeat;
    };
    return Collection;
}(List));

var root;
if (JudgeUtils.isNodeJs() && typeof global != "undefined") {
    root = global;
}
else {
    root = window;
}

var Log = (function () {
    function Log() {
    }
    /**
     * Output Debug message.
     * @function
     * @param {String} message
     */
    Log.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (!this._exec("log", messages)) {
            root.alert(messages.join(","));
        }
        this._exec("trace", messages);
    };
    /**
     * 断言失败时，会提示错误信息，但程序会继续执行下去
     * 使用断言捕捉不应该发生的非法情况。不要混淆非法情况与错误情况之间的区别，后者是必然存在的并且是一定要作出处理的。
     *
     * 1）对非预期错误使用断言
     断言中的布尔表达式的反面一定要描述一个非预期错误，下面所述的在一定情况下为非预期错误的一些例子：
     （1）空指针。
     （2）输入或者输出参数的值不在预期范围内。
     （3）数组的越界。
     非预期错误对应的就是预期错误，我们通常使用错误处理代码来处理预期错误，而使用断言处理非预期错误。在代码执行过程中，有些错误永远不应该发生，这样的错误是非预期错误。断言可以被看成是一种可执行的注释，你不能依赖它来让代码正常工作（《Code Complete 2》）。例如：
     int nRes = f(); // nRes 由 f 函数控制， f 函数保证返回值一定在 -100 ~ 100
     Assert(-100 <= nRes && nRes <= 100); // 断言，一个可执行的注释
     由于 f 函数保证了返回值处于 -100 ~ 100，那么如果出现了 nRes 不在这个范围的值时，就表明一个非预期错误的出现。后面会讲到“隔栏”，那时会对断言有更加深刻的理解。
     2）不要把需要执行的代码放入断言中
     断言用于软件的开发和维护，而通常不在发行版本中包含断言。
     需要执行的代码放入断言中是不正确的，因为在发行版本中，这些代码通常不会被执行，例如：
     Assert(f()); // f 函数通常在发行版本中不会被执行
     而使用如下方法则比较安全：
     res = f();
     Assert(res); // 安全
     3）对来源于内部系统的可靠的数据使用断言，而不要对外部不可靠的数据使用断言，对于外部不可靠数据，应该使用错误处理代码。
     再次强调，把断言看成可执行的注释。
     * @param cond 如果cond返回false，则断言失败，显示message
     * @param message
     */
    Log.assert = function (cond) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        if (cond) {
            if (!this._exec("assert", arguments, 1)) {
                this.log.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };
    Log.error = function (cond) {
        var message = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            message[_i - 1] = arguments[_i];
        }
        if (cond) {
            /*!
            console.error will not interrupt, it will throw error and continue exec the left statements

            but here need interrupt! so not use it here.
             */
            //if (!this._exec("error", arguments, 1)) {
            throw new Error(Array.prototype.slice.call(arguments, 1).join("\n"));
        }
    };
    Log.warn = function () {
        var message = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            message[_i] = arguments[_i];
        }
        var result = this._exec("warn", arguments);
        if (!result) {
            this.log.apply(this, arguments);
        }
        else {
            this._exec("trace", ["warn trace"]);
        }
    };
    Log._exec = function (consoleMethod, args, sliceBegin) {
        if (sliceBegin === void 0) { sliceBegin = 0; }
        if (root.console && root.console[consoleMethod]) {
            root.console[consoleMethod].apply(root.console, Array.prototype.slice.call(args, sliceBegin));
            return true;
        }
        return false;
    };
    return Log;
}());
Log.info = {
    INVALID_PARAM: "invalid parameter",
    helperFunc: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result = "";
        args.forEach(function (val) {
            result += String(val) + " ";
        });
        return result.slice(0, -1);
    },
    assertion: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 2) {
            return this.helperFunc(args[0], args[1]);
        }
        else if (args.length === 3) {
            return this.helperFunc(args[1], args[0], args[2]);
        }
        else {
            throw new Error("args.length must <= 3");
        }
    },
    FUNC_INVALID: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("invalid");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_BE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must be");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_NOT_BE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must not be");
        return this.assertion.apply(this, args);
    },
    FUNC_SHOULD: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("should");
        return this.assertion.apply(this, args);
    },
    FUNC_SHOULD_NOT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("should not");
        return this.assertion.apply(this, args);
    },
    FUNC_SUPPORT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("support");
        return this.assertion.apply(this, args);
    },
    FUNC_NOT_SUPPORT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("not support");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_DEFINE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must define");
        return this.assertion.apply(this, args);
    },
    FUNC_MUST_NOT_DEFINE: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("must not define");
        return this.assertion.apply(this, args);
    },
    FUNC_UNKNOW: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("unknow");
        return this.assertion.apply(this, args);
    },
    FUNC_EXPECT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("expect");
        return this.assertion.apply(this, args);
    },
    FUNC_UNEXPECT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("unexpect");
        return this.assertion.apply(this, args);
    },
    FUNC_EXIST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("exist");
        return this.assertion.apply(this, args);
    },
    FUNC_NOT_EXIST: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("not exist");
        return this.assertion.apply(this, args);
    },
    FUNC_ONLY: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("only");
        return this.assertion.apply(this, args);
    },
    FUNC_CAN_NOT: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift("can't");
        return this.assertion.apply(this, args);
    }
};

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

var Queue = (function (_super) {
    __extends(Queue, _super);
    function Queue(children) {
        if (children === void 0) { children = []; }
        var _this = _super.call(this) || this;
        _this.children = children;
        return _this;
    }
    Queue.create = function (children) {
        if (children === void 0) { children = []; }
        var obj = new this(children);
        return obj;
    };
    Object.defineProperty(Queue.prototype, "front", {
        get: function () {
            return this.children[this.children.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Queue.prototype, "rear", {
        get: function () {
            return this.children[0];
        },
        enumerable: true,
        configurable: true
    });
    Queue.prototype.push = function (element) {
        this.children.unshift(element);
    };
    Queue.prototype.pop = function () {
        return this.children.pop();
    };
    Queue.prototype.clear = function () {
        this.removeAllChildren();
    };
    return Queue;
}(List));

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
            if (JudgeUtils.isBoolean(args[0])) {
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
            target.setChildren(ExtendUtils.extendDeep(this.children));
        }
        else {
            target.setChildren(ExtendUtils.extend([], this.children));
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
        return Collection.create(result);
    };
    Stack.prototype.findOne = function (func) {
        var scope = this.children, result = null;
        this.forEach(function (value, index) {
            if (!func.call(scope, value, index)) {
                return;
            }
            result = value;
            return $BREAK;
        });
        return result;
    };
    Stack.prototype.reverse = function () {
        return Collection.create(this.copyChildren().reverse());
    };
    Stack.prototype.removeChild = function (arg) {
        return Collection.create(this.removeChildHelper(arg));
    };
    Stack.prototype.sort = function (func, isSortSelf) {
        if (isSortSelf === void 0) { isSortSelf = false; }
        if (isSortSelf) {
            this.children.sort(func);
            return this;
        }
        return Collection.create(this.copyChildren().sort(func));
    };
    Stack.prototype.map = function (func) {
        var resultArr = [];
        this.forEach(function (e, index) {
            var result = func(e, index);
            if (result !== $REMOVE) {
                resultArr.push(result);
            }
            //e && e[handlerName] && e[handlerName].apply(context || e, valueArr);
        });
        return Collection.create(resultArr);
    };
    Stack.prototype.removeRepeatItems = function () {
        var noRepeatList = Collection.create();
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                return;
            }
            noRepeatList.addChild(item);
        });
        return noRepeatList;
    };
    Stack.prototype.hasRepeatItems = function () {
        var noRepeatList = Collection.create(), hasRepeat = false;
        this.forEach(function (item) {
            if (noRepeatList.hasChild(item)) {
                hasRepeat = true;
                return $BREAK;
            }
            noRepeatList.addChild(item);
        });
        return hasRepeat;
    };
    return Stack;
}(List));

var AjaxUtils = (function () {
    function AjaxUtils() {
    }
    /*!
     实现ajax

     ajax({
     type:"post",//post或者get，非必须
     url:"test.jsp",//必须的
     data:"name=dipoo&info=good",//非必须
     dataType:"json",//text/xml/json，非必须
     success:function(data){//回调函数，非必须
     alert(data.name);
     }
     });*/
    AjaxUtils.ajax = function (conf) {
        var type = conf.type; //type参数,可选
        var url = conf.url; //url参数，必填
        var data = conf.data; //data参数可选，只有在post请求时需要
        var dataType = conf.dataType; //datatype参数可选
        var success = conf.success; //回调函数可选
        var error = conf.error;
        var xhr = null;
        var self = this;
        if (type === null) {
            type = "get";
        }
        if (dataType === null) {
            dataType = "text";
        }
        xhr = this._createAjax(error);
        if (!xhr) {
            return;
        }
        try {
            xhr.open(type, url, true);
            if (this._isSoundFile(dataType)) {
                xhr.responseType = "arraybuffer";
            }
            if (type === "GET" || type === "get") {
                xhr.send(null);
            }
            else if (type === "POST" || type === "post") {
                xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                xhr.send(data);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4
                    && (xhr.status === 200 || self._isLocalFile(xhr.status))) {
                    if (dataType === "text" || dataType === "TEXT") {
                        if (success !== null) {
                            success(xhr.responseText);
                        }
                    }
                    else if (dataType === "xml" || dataType === "XML") {
                        if (success !== null) {
                            success(xhr.responseXML);
                        }
                    }
                    else if (dataType === "json" || dataType === "JSON") {
                        if (success !== null) {
                            success(eval("(" + xhr.responseText + ")"));
                        }
                    }
                    else if (self._isSoundFile(dataType)) {
                        if (success !== null) {
                            success(xhr.response);
                        }
                    }
                }
            };
        }
        catch (e) {
            error(xhr, e);
        }
    };
    AjaxUtils._createAjax = function (error) {
        var xhr = null;
        try {
            xhr = new ActiveXObject("microsoft.xmlhttp");
        }
        catch (e1) {
            try {
                xhr = new XMLHttpRequest();
            }
            catch (e2) {
                error(xhr, { message: "您的浏览器不支持ajax，请更换！" });
                return null;
            }
        }
        return xhr;
    };
    AjaxUtils._isLocalFile = function (status) {
        return document.URL.contain("file://") && status === 0;
    };
    AjaxUtils._isSoundFile = function (dataType) {
        return dataType === "arraybuffer";
    };
    return AjaxUtils;
}());

var ArrayUtils = (function () {
    function ArrayUtils() {
    }
    ArrayUtils.removeRepeatItems = function (arr, isEqual) {
        if (isEqual === void 0) { isEqual = function (a, b) {
            return a === b;
        }; }
        var resultArr = [], self = this;
        arr.forEach(function (ele) {
            if (self.contain(resultArr, function (val) {
                return isEqual(val, ele);
            })) {
                return;
            }
            resultArr.push(ele);
        });
        return resultArr;
    };
    ArrayUtils.contain = function (arr, ele) {
        if (JudgeUtils.isFunction(ele)) {
            var func = ele;
            for (var i = 0, len = arr.length; i < len; i++) {
                var value = arr[i];
                if (!!func.call(null, value, i)) {
                    return true;
                }
            }
        }
        else {
            for (var i = 0, len = arr.length; i < len; i++) {
                var value = arr[i];
                if (ele === value || (value.contain && value.contain(ele))) {
                    return true;
                }
            }
        }
        return false;
    };
    
    return ArrayUtils;
}());

var ConvertUtils = (function () {
    function ConvertUtils() {
    }
    ConvertUtils.toString = function (obj) {
        if (JudgeUtils.isNumber(obj)) {
            return String(obj);
        }
        //if (JudgeUtils.isjQuery(obj)) {
        //    return _jqToString(obj);
        //}
        if (JudgeUtils.isFunction(obj)) {
            return this._convertCodeToString(obj);
        }
        if (JudgeUtils.isDirectObject(obj) || JudgeUtils.isArray(obj)) {
            return JSON.stringify(obj);
        }
        return String(obj);
    };
    ConvertUtils._convertCodeToString = function (fn) {
        return fn.toString().split('\n').slice(1, -1).join('\n') + '\n';
    };
    return ConvertUtils;
}());

var DomQuery = (function () {
    function DomQuery() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._doms = null;
        if (JudgeUtils.isDom(args[0])) {
            this._doms = [args[0]];
        }
        else if (this._isDomEleStr(args[0])) {
            this._doms = [this._buildDom(args[0])];
        }
        else {
            this._doms = document.querySelectorAll(args[0]);
        }
        return this;
    }
    DomQuery.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var obj = new this(args[0]);
        return obj;
    };
    DomQuery.prototype.get = function (index) {
        return this._doms[index];
    };
    DomQuery.prototype.prepend = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var targetDom = null;
        targetDom = this._buildDom(args[0]);
        for (var _a = 0, _b = this._doms; _a < _b.length; _a++) {
            var dom = _b[_a];
            if (dom.nodeType === 1) {
                dom.insertBefore(targetDom, dom.firstChild);
            }
        }
        return this;
    };
    DomQuery.prototype.prependTo = function (eleStr) {
        var targetDom = null;
        targetDom = DomQuery.create(eleStr);
        for (var _i = 0, _a = this._doms; _i < _a.length; _i++) {
            var dom = _a[_i];
            if (dom.nodeType === 1) {
                targetDom.prepend(dom);
            }
        }
        return this;
    };
    DomQuery.prototype.remove = function () {
        for (var _i = 0, _a = this._doms; _i < _a.length; _i++) {
            var dom = _a[_i];
            if (dom && dom.parentNode && dom.tagName != 'BODY') {
                dom.parentNode.removeChild(dom);
            }
        }
        return this;
    };
    DomQuery.prototype.css = function (property, value) {
        for (var _i = 0, _a = this._doms; _i < _a.length; _i++) {
            var dom = _a[_i];
            dom.style[property] = value;
        }
    };
    DomQuery.prototype.attr = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 1) {
            var name = args[0];
            return this.get(0).getAttribute(name);
        }
        else {
            var name = args[0], value = args[1];
            for (var _a = 0, _b = this._doms; _a < _b.length; _a++) {
                var dom = _b[_a];
                dom.setAttribute(name, value);
            }
        }
    };
    DomQuery.prototype.text = function (str) {
        var dom = this.get(0);
        if (str !== void 0) {
            if (dom.textContent !== void 0) {
                dom.textContent = str;
            }
            else {
                dom.innerText = str;
            }
        }
        else {
            return dom.textContent !== void 0 ? dom.textContent : dom.innerText;
        }
    };
    DomQuery.prototype._isDomEleStr = function (eleStr) {
        return eleStr.match(/<(\w+)[^>]*><\/\1>/) !== null;
    };
    DomQuery.prototype._buildDom = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (JudgeUtils.isString(args[0])) {
            var div = this._createElement("div"), eleStr = args[0];
            div.innerHTML = eleStr;
            return div.firstChild;
        }
        return args[0];
    };
    DomQuery.prototype._createElement = function (eleStr) {
        return document.createElement(eleStr);
    };
    return DomQuery;
}());

var EventUtils = (function () {
    function EventUtils() {
    }
    EventUtils.bindEvent = function (context, func) {
        //var args = Array.prototype.slice.call(arguments, 2),
        //    self = this;
        return function (event) {
            //return fun.apply(object, [self.wrapEvent(event)].concat(args)); //对事件对象进行包装
            return func.call(context, event);
        };
    };
    EventUtils.addEvent = function (dom, eventName, handler) {
        if (JudgeUtils.isHostMethod(dom, "addEventListener")) {
            dom.addEventListener(eventName, handler, false);
        }
        else if (JudgeUtils.isHostMethod(dom, "attachEvent")) {
            dom.attachEvent("on" + eventName, handler);
        }
        else {
            dom["on" + eventName] = handler;
        }
    };
    EventUtils.removeEvent = function (dom, eventName, handler) {
        if (JudgeUtils.isHostMethod(dom, "removeEventListener")) {
            dom.removeEventListener(eventName, handler, false);
        }
        else if (JudgeUtils.isHostMethod(dom, "detachEvent")) {
            dom.detachEvent("on" + eventName, handler);
        }
        else {
            dom["on" + eventName] = null;
        }
    };
    return EventUtils;
}());

var FunctionUtils = (function () {
    function FunctionUtils() {
    }
    FunctionUtils.bind = function (object, func) {
        return function () {
            return func.apply(object, arguments);
        };
    };
    return FunctionUtils;
}());

var SPLITPATH_REGEX = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
//reference from
//https://github.com/cookfront/learn-note/blob/master/blog-backup/2014/nodejs-path.md
var PathUtils = (function () {
    function PathUtils() {
    }
    PathUtils.basename = function (path, ext) {
        var f = this._splitPath(path)[2];
        // TODO: make this comparison case-insensitive on windows?
        if (ext && f.substr(-1 * ext.length) === ext) {
            f = f.substr(0, f.length - ext.length);
        }
        return f;
    };
    PathUtils.changeExtname = function (pathStr, extname) {
        var extname = extname || "", index = pathStr.indexOf("?"), tempStr = "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf(".");
        if (index < 0) {
            return pathStr + extname + tempStr;
        }
        return pathStr.substring(0, index) + extname + tempStr;
    };
    PathUtils.changeBasename = function (pathStr, basename, isSameExt) {
        if (isSameExt === void 0) { isSameExt = false; }
        var index = null, tempStr = null, ext = null;
        if (basename.indexOf(".") == 0) {
            return this.changeExtname(pathStr, basename);
        }
        index = pathStr.indexOf("?");
        tempStr = "";
        ext = isSameExt ? this.extname(pathStr) : "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index + 1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    };
    PathUtils.extname = function (path) {
        return this._splitPath(path)[3];
    };
    PathUtils.dirname = function (path) {
        var result = this._splitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
            //no dirname whatsoever
            return '.';
        }
        if (dir) {
            //it has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
    };
    PathUtils._splitPath = function (fileName) {
        return SPLITPATH_REGEX.exec(fileName).slice(1);
    };
    return PathUtils;
}());

export { Collection, $BREAK, $REMOVE, root, Hash, List, Log, Queue, Stack, AjaxUtils, ArrayUtils, ConvertUtils, DomQuery, EventUtils, ExtendUtils, FunctionUtils, JudgeUtils, PathUtils };
//# sourceMappingURL=wdCb.module.js.map
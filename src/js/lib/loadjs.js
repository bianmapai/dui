/**
 * 构造函数
 */
export var Dui = function(){
    this.v = '1.0.0';
    this.DuiPath = getPath();
    this.modules = {};
    this.modulesMap = {};
    this.defined = {};
},
doc = document,
head = doc.head,
gid = 0,
slice = [].splice,
curExecModName = null,
getCurrent = function(){
    var jsPath = doc.currentScript ? doc.currentScript.src : function(){
      var js = doc.scripts
      ,last = js.length - 1
      ,src;
      for(var i = last; i > 0; i--){
        if(js[i].readyState === 'interactive'){
          src = js[i].src;
          break;
        }
      }
      return src || js[last].src;
    }();
    return jsPath;
},
getPath = function(src){
    return src ? src.substring(0, src.lastIndexOf('/') + 1) :
    getCurrent().substring(0, getCurrent().lastIndexOf('/') + 1);
},
config = {
    path:getPath()+'/modules/',//模块路径
};
var class2type = {},
hasOwn = class2type.hasOwnProperty,
support = {},
error = Dui.prototype.error = function(msg){
    window.console && console.error && console.error('Dui Error: ' + msg);
};
/**
 * 循环函数
 * @param {Object} object 循环对象
 * @param {Function} callback 回调函数
 */
export function each(obj, callback) {
    var length, i = 0;
    if (isArrayLike(obj)) {
        length = obj.length;
        for ( ; i < length; i++ ) {
            if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                break;
            }
        }
    } else {
        for ( i in obj ) {
            if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                break;
            }
        }
    }
    return obj;
}
/**
 * 判断参数是否是一个数组
 */
var isArray = Array.isArray || function(object){ return object instanceof Array };
/**
 * 判断传入的参数是否为window对象
 * @param {Object} obj 
 */
function isWindow(obj) {
    return obj != null && obj == obj.window;
}
each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
    function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    }
);
function isFunction(obj){
    return typeof obj === "function";
}
/**
 * 深度复制
 * @param {Object} target 属性
 */
export function extend(target) {
    var src,
      copyIsArray,
      copy,
      name,
      options,
      clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;
  
    if (typeof target === "boolean") {
      deep = target;
  
      target = arguments[i] || {};
      i++;
    }
    if (typeof target !== "object" && !isFunction(target)) {
      target = {};
    }
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];
  
          if (target === copy) {
            continue;
          }
          if (
            deep &&
            copy &&
            (isPlainObject(copy) || (copyIsArray = isArray(copy)))
          ) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            target[name] = extend(deep, clone, copy);
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    return target;
};
//继承方法
Dui.prototype.extend = extend;
//默认配置文件
Dui.defaults = {
    modules:{
        'jquery':'modules/jquery',
        'template':'modules/template',
        'popup':'modules/popup',
        'element':'modules/element',
        'form':'modules/form',
        'table':'modules/table'
    },
    //存储回调函数
    callBack:{},
};  
/**
 * 
 * @param {Object} options 配置参数
 */
Dui.prototype.config = function(options){
    options = options || {};
    for(var key in options){
      config[key] = options[key];
    }
    return this;
}
/**
 * 获取参数的类型
 * @param {Object} obj 
 */
export function type(obj) {
    if (obj == null) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function"
        ? class2type[toString.call(obj)] || "object"
        : typeof obj;
}
/**
 * 判断是否是Array
 * @param {Object} obj 
 */
Dui.prototype.isArrayLike = isArrayLike;
/**
 * 判断是否是Array
 * @param {Object} obj 
 */
function isArrayLike( obj ) {
	var length = !!obj && "length" in obj && obj.length,
		thistype = type( obj );
	if ( thistype === "function" || isWindow( obj ) ) {
		return false;
	}
	return thistype === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
/**
 * 检查是否是纯对象
 * @param {Object} obj 
 */
export function isPlainObject(obj){
    var key;

    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (
      !obj ||
      type(obj) !== "object" ||
      obj.nodeType ||
        isWindow(obj)
    ) {
      return false;
    }
    try {
      // Not own constructor property must be Object
      if (
        obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")
      ) {
        return false;
      }
    } catch (e) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Support: IE<9
    // Handle iteration over inherited properties before own properties.
    if (!support.ownFirst) {
      for (key in obj) {
        return hasOwn.call(obj, key);
      }
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    for (key in obj) {
    }
    return key === undefined || hasOwn.call(obj, key);
}
/**
 * 循环函数
 * @param {Object} object 循环对象
 * @param {Function} callback 回调函数
 */
Dui.prototype.each = each;
/**
 * 获取模块路径
 * @param {String} name 模块别名
 */
function getModName(name){
    if(!name){
        var js = getCurrent().substring(getCurrent().lastIndexOf('/')+1,getCurrent().length).split('?')[0];
        name = js.substring(0,js.lastIndexOf('.'));
    }
    return name;
}
/**
 * 定义一个模块
 * @param {String} name 模块名
 * @param {Array} deps 依赖
 * @param {function} callback 回调函数
 */
Dui.prototype.define  = function(name,deps, callback){
    var that  = dui;
    //省略模块名
    if (typeof name !== 'string') {
        callback = deps;
        deps = name;
        name = null;
    }
    //无依赖
    if (!isArray(deps)) {
        callback = deps;
        deps = [];
    }
    //获取模块别名
    var modName = getModName(name).split('?')[0];
    if(!modName) error('请定义模块名称');
    that.modules[modName] = that.modules[modName] || {};
    that.modules[modName].deps = deps;
    that.modules[modName].callback = callback;
    that.modules[modName].status = 'loaded';
    that.modules[modName].oncomplete = that.modules[modName].oncomplete || [];
    that.modulesMap[modName] = {};
}
/**
 * 使用模块
 * @param {Array} deps 使用依赖
 * @param {function} callback 回调函数
 */
Dui.prototype.use = function(deps,callback){
    var that = this;
    if (arguments.length < 2) {
        throw new Error('lodjs.use arguments miss');
        return 0;
    }
    if (typeof deps === 'string') {
        deps = [deps];
    }
    if (!isArray(deps) || !(typeof callback==="function")) {
        error('lodjs.use arguments type error');
        return 1;
    }
    if (deps.length === 0) {
        callback();
        return 2;
    }
    //如果页面已经存在jQuery1.7+库且所定义的模块依赖jQuery，则不加载内部jquery模块
    if(window.jQuery && jQuery.fn.on){
        that.each(deps, function(index, item){
          if(item === 'jquery'){
            that.modules.jquery = {};
            that.modules.jquery.status = 'loaded';
            that.modules.jquery.deps = [];
            that.modules.jquery.callback = function(){
                return window.$;
            }
            that.modules.jquery.oncomplete = that.modules.jquery.oncomplete || [];
            that.modulesMap.jquery = {};
          }
        });
    }
    var depsCount = deps.length;
    var params = [];
    each(deps,function(i,mod){
        (function (j) {
            that.loadMod(mod, function (param) {
                depsCount--;
                params[j] = param;
                if (depsCount === 0) {
                    callback.apply(null, params);
                }
            });
        }(i));
    })
    return 3;
}
/**
 * 加载模块
 * @param {String} name 名称
 * @param {function} callback 回调函数
 */
Dui.prototype.loadMod=function(name,callback){
    var that = this,
    path = config.path ? config.path : that.path;
    //未加载
    if(!that.modules[name]){
        that.modules[name] = {
            status:'loading',
            oncomplete:[],
        }
        //需要加载的地址
        var url = getDepUrl(name);
        that.loadJs(url,function(){
            
            //如果define的不是函数
            if (!isFunction(that.modules[name].callback)) {
                execMod(name, callback);
                return 0;
            }
            
            //define的是函数
            that.use(that.modules[name].deps, function () {
                execMod(name, callback, slice.call(arguments, 0));
            });
            return 1;
        },function(){
            that.modules[name].status = 'error';
            callback();
            execComplete(name);//加载失败执行队列
        },name)
        return 0;
    }
    //加载失败
    if (that.modules[name].status === 'error') {
        callback();
        return 1;
    }
    //正在加载
    if (that.modules[name].status === 'loading') {
        that.modules[name].oncomplete.push(callback);
        return 1;
    }
    //加载完成
    //尚未执行完成
    if (!that.modulesMap[name].exports) {
        //如果define的不是函数
        if (!isFunction(that.modules[name].callback)) {
            that.execMod(name, callback);
            return 2;
        }
        //define的是函数
        that.use(that.modules[name].deps, function () {                    
            execMod(name, callback, slice.call(arguments, 0));
        });
        return 3;
    }
    //已经执行过
    callback(that.modulesMap[name].exports);
    return 4;
}
/**
 * 执行模块
 * @param {String} modName 模块名称
 * @param {function} callback 回调函数
 * @param {Object} params 参数
 */
function execMod(modName,callback,params){
    //判断定义的是函数还是非函数
    if (!params) {
        dui.modulesMap[modName].exports = dui.modules[modName].callback;
    } else {
        curExecModName = modName;
        //commonjs
        var exp = dui.modules[modName].callback.apply(null, params);
        curExecModName = null;
        //amd和返回值的commonjs
        if (exp) {
            dui.modulesMap[modName].exports = exp;
        }
    }
    //添加模块
    dui.defined[modName] = dui.modulesMap[modName].exports;
    //执行回调函数
    callback(dui.modulesMap[modName].exports);
    //执行complete队列
    execComplete(modName);
}
/**
 * 执行complete队列
 * @param {String} modName 要执行的列名称
 */
function execComplete(modName){
    //模块定义完毕 执行load函数,当加载失败时，会不存在module
    for (var i = 0; i < dui.modules[modName].oncomplete.length; i++) {
        dui.modules[modName].oncomplete[i](dui.modulesMap[modName] && dui.modulesMap[modName].exports);
    }
    //释放内存
    dui.modules[modName].oncomplete = [];
}
/**
 * 加载js
 * @param {String} src 要加载的js地址
 * @param {function} success 成功回调函数
 * @param {function} error 错误回调函数
 * @param {String} name 加载的模块名称
 */
Dui.prototype.loadJs = function(src,success,error,name){
    var that=this,
    node = doc.createElement('script');
    node.src = src;
    node.charset = config.charset ? config.charset : doc.charset;
    node.id = 'dui-modules-'+(name?name:gid++);
    if ('onload' in node) {
        node.onload = success;
        node.onerror = error;
    } else {
      node.onreadystatechange = function() {
        if (/loaded|complete/.test(node.readyState)) {
            success();
        }
      }
    }
    head.appendChild(node);
}
/**
 * 获取当前活跃的js文件
 */
Dui.prototype.getCurrent = getCurrent;
/**
 * 获取需要加载的js路径
 * @param {String} name 模块名
 */
function getDepUrl(name){
    //如果是内置模块
    if(Dui.defaults.modules[name]){
        return fixSuffix(dui.DuiPath+Dui.defaults.modules[name],'js')
    }
    //如果已经加载过了

    return fixSuffix(config.path+name,'js');
}
/**
 * 设置完整后缀
 * @param {String} url 地址
 * @param {String} suffix 后缀
 */
export function fixSuffix(url, suffix) {
    var reg = new RegExp('\\.' + suffix + '$', 'i');
    return url.search(reg) !== -1 ? url : url + '.' + suffix;
}
export var dui=new Dui();
Dui.prototype.define.dui = dui.v;
if(!window.define) window.define = dui.define;
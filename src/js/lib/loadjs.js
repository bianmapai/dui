var class2type = {};
var toString = class2type.toString;
var hasOwn = class2type.hasOwnProperty;
var slice = [].slice;
var curExecModName = null;//当前执行的模块
var support = {};
// 模块容器
var definedModules ={};
// 默认配置
Dui.defaluts = {
    // 内置模块配置
    plugins:{
        'jquery':'plugins/jquery', // jquery
        'template':'plugins/template', // 模板引擎
        'popup':'plugins/popup', // 弹出层
        'element':'plugins/element', // 基本元素
        'form':'plugins/form', // 表单
        'table':'plugins/table', // 表格
        'pagination':'plugins/pagination',// 分页
        'tree':'plugins/tree', // 树形插件
        'duiDate':'plugins/duiDate',// 时间插件
        'upload':'plugins/upload',//上传插件
        'iconPicker':'plugins/iconPicker',//图标选择插件
        'pjax':'plugins/pjax',//pjax插件
    },
    config:{
        dir:getPath(),//dui所在目录
        base:'',//扩展模块地址
    }
}
/**
 * 获取当前运行的js
 */
function getCurrent(){
    var jsPath = document.currentScript ? document.currentScript.src : function(){
      var js = document.scripts
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
}
/**
 * 判断是否是完整的地址
 * @param {String} url 网址
 */
function isUrl(url) {
    return url.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1;
}
/**
 * 补充完整路径
 * @param {String} url 路径
 */
function fixUrl(url) {
    return url.replace(/([^:])\/+/g, '$1/');
}
/**
 * 获取路径
 * @param {String} path 需要组合的路径
 * @param {Object} cfg 配置信息
 */
function getUrl(path, cfg) {
    var url = cfg.base || window.location.href;
    //绝对网址
    if (isUrl(path)) {
        return fixUrl(path);
    }
    var rootUrl;
    //修复url
    if (rootUrl = url.match(/[^\/]*\/\/[^\/]*\//)) {
        //http://yanhaijing.com/abc
        url = url.slice(0, url.lastIndexOf('/') + 1);
        rootUrl = rootUrl[0];
    } else {
        //http://yanhaijing.com
        rootUrl = url = url + '/';
    }
    // /开头
    if (path.search(/^\//) !== -1) {
        return fixUrl(rootUrl + path);
    }

    // ../开头
    if (path.search(/^\.\.\//) !== -1) {
        while(path.search(/^\.\.\//) !== -1) {
            if (url.lastIndexOf('/', url.length - 2) !== -1) {
                path = path.slice(3);
                url = url.slice(0, url.lastIndexOf('/', url.length - 2) + 1);
            } else {
                throw new Error('lodjs geturl error, cannot find path in url');
            }
        }

        return fixUrl(url + path);
    }
    // ./
    path = path.search(/^\.\//) !== -1 ? path.slice(2) : path;
    return fixUrl(url + path);
}
/**
 * 修正完整的路径
 * @param {String} url 需要修正的路径
 * @param {String}} suffix 路径后缀名
 */
function fixSuffix(url, suffix) {
    var reg = new RegExp('\\.' + suffix + '$', 'i');
    return url.search(reg) !== -1 ? url : url + '.' + suffix;
}
/**
 * 获取当前依赖的完整地址
 * @param {String} id 模块id
 * @param {Object} cfg 配置信息
 */
function getDepUrl(id, cfg) {
    // 如果是内部地址
    if(Dui.defaluts.plugins[id]){
        return fixSuffix(Dui.defaluts.config.dir + Dui.defaluts.plugins[id],'js');
    }
    return fixSuffix(getUrl(id, cfg), 'js');
}
/**
 * 根据模块id获取模块地址
 * @param {String} id 模块id
 */
function getIdUrl(id,cfg){
    //没有id的情况
    if (!id) {
        var temp = getCurrentScript().src;
        // 获取当前活动的id
        if(temp){
            return temp;
        }else{
            throw new Error('在页面定义模块需要指定模块id');
        }
    }
    // 如果是内置模块则返回内置模块的url
    if(Dui.defaluts.plugins[id]){
        return fixSuffix(Dui.defaluts.config.dir + Dui.defaluts.plugins[id],'js');
    }
    //id不能为相对路径,amd规定此处也不能带后缀，此处放宽限制。
    if (id.search(/^\./) !== -1) {
        throw new Error('lodjs define id' + id + 'must absolute');
    }
    return fixSuffix(getUrl(id, cfg), 'js');
}
/**
 * 获取目录地址
 * @param {String} src 获取目录地址把url转为path
 */
function getPath(src){
    return src ? src.substring(0, src.lastIndexOf('/') + 1) :
    getCurrent().substring(0, getCurrent().lastIndexOf('/') + 1);
}
/**
 * 判断变量是否是数组
 * @param {Object=} arr 任意数据
 */
function isArray(arr) {
    return Array.isArray ? Array.isArray(arr) : getType(arr) === 'array';
}
/**
 * 用来判断的是否是对象数据
 * @param {Object} arr 任意变量
 */
function isObject(arr){
    return type(arr) === "object";
}
/**
 * 判断变量是否是方法
 * @param {Object=} arr 
 */
function isFunction(arr){
    return typeof arr === "function";
}
/**
 * 获取参数的类型
 * @param {Object} obj 
 */
function type(x) {
    if(x === null){
        return 'null';
    }

    var t= typeof x;

    if(t !== 'object'){
        return t;
    }

    var c = toString.call(x).slice(8, -1).toLowerCase();
    if(c !== 'object'){
        return c;
    }

    if(x.constructor==Object){
        return c;
    }

    return 'unkonw';
}
/**
 * 判断传入的参数是否为window对象
 * @param {Object} obj 
 */
function isWindow(obj) {
    return obj != null && obj == obj.window;
}
/**
 * 检查是否是纯对象
 * @param {Object} obj 
 */
function isPlainObject(obj){
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
 * 判断是否是Array
 * @param {Object} obj 
 */
function isArrayLike(obj) {
	var length = !!obj && "length" in obj && obj.length,
		thistype = type( obj );
	if ( thistype === "function" || isWindow( obj ) ) {
		return false;
	}
	return thistype === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
/**
 * 获取当前script标签
 */
var currentlyAddingScript;
var interactiveScript;
function getCurrentScript() {
    if(document.currentScript){
        return document.currentScript;
    }
    if (currentlyAddingScript) {
        return currentlyAddingScript;
    }
    // For IE6-9 browsers, the script onload event may not fire right
    // after the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script
    // ref: http://goo.gl/JHfFW
    if (interactiveScript && interactiveScript.readyState === "interactive") {
        return interactiveScript;
    }

    var scripts = document.head.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        if (script.readyState === "interactive") {
            interactiveScript = script;
            return interactiveScript;
        }
    }
    return null;
}
/**
 * 加载器也是主要方法
 * @param {String} id 模块id
 * @param {Array} deps 模块依赖
 * @param {Function} callback 回调地址
 */
function Dui(id,deps, factory){
    //省略模块名
    if (typeof id !== 'string') {
        factory = deps;
        deps = id;
        id = null;
    }
    //无依赖
    if (!isArray(deps)) {
        factory = deps;
        deps = [];
    }
    var cfg = extend(true,{},Dui.defaluts.config),
    url = getIdUrl(id,cfg).split('?')[0];
    definedModules[url] = definedModules[url] || {};
    definedModules[url] = {
        id:id,//模块标识
        deps:deps,//模块依赖
        factory:factory,//模块工厂
        status:'loaded',//模块状态
        oncomplete:definedModules[url].oncomplete || [],//模块回调参数
        config:cfg,
    }
}
/**
 * 使用模块
 * @param {Array} deps 使用依赖
 * @param {Function} callback 回调地址
 */
function use(deps,callback,options){
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
    // 如果没有依赖则直接运行函数
    if (deps.length === 0) {
        callback();
        return 2;
    }
    if(!isObject(options)){
        options = extend(true,Dui.defaluts.config,options)
    }
    
    // 如果页面已经存在jQuery1.7+库且所定义的模块依赖jQuery，则不加载内部jquery模块
    if(window.jQuery && jQuery.fn.on){
        each(deps, function(index, item){
          if(item === 'jquery'){
            var url = getIdUrl(item).split('?')[0];
            definedModules[url] = definedModules[url] || {};
            definedModules[url] = {
                id:item,//模块标识
                deps:[],//模块依赖
                factory:function(){
                    return window.$;
                },//模块工厂
                status:'loaded',//模块状态
                oncomplete:definedModules[url].oncomplete || [],//模块回调参数
                config:{}
            }
          }
        });
    }
    var depsCount = deps.length;
    var params = [];
    each(deps,function(i,mod){
        (function (j) {
            loadMod(mod, function (param) {
                depsCount--;
                params[j] = param;
                if (depsCount === 0) {
                    callback.apply(null, params);
                }
            },options);
        }(i));
    })
    return 3;
}
/**
 * 加载模块
 * @param {String} name 名称
 * @param {function} callback 回调函数
 */
function loadMod(id,callback,options){
    // 当前的配置信息
    var cfg = extend(true,{},Dui.defaluts.config,options),
    url = getDepUrl(id, cfg);
    cfg.id = id;
    // 没有加载
    if(!definedModules[url]){
        definedModules[url] = {
            status: 'loading',
            exports:{},
            oncomplete: []
        };
        loadjs(url, function () {
            //如果define的不是函数
            if (!isFunction(definedModules[url].factory)) {
                execMod(url, callback);
                return 0;
            }
            //define的是函数
            use(definedModules[url].deps, function () {
                execMod(url, callback, slice.call(arguments, 0));
            }, {base: url});
            return 1;
        }, function () {
            definedModules[url].status === 'error';
            callback();
            execComplete(url);//加载失败执行队列
        },cfg);
        return 0;
    }
    //加载失败
    if (definedModules[url].status === 'error') {
        callback();
        return 1;
    }
    //正在加载
    if (definedModules[url].status === 'loading') {
        definedModules[url].oncomplete.push(callback);
        return 1;
    }
    //加载完成
    //尚未执行完成
    if (!definedModules[url].exports) {
        //如果define的不是函数
        if (!isFunction(definedModules[url].factory)) {
            execMod(url, callback);
            return 2;
        } 
        //define的是函数
        use(definedModules[url].deps, function () {
            execMod(url, callback, slice.call(arguments, 0));
        }, {base: url});
        return 3;
    }
    //已经执行过
    callback(definedModules[url].exports);
    return 4;
}
/**
 * 执行模块
 * @param {String} url 模块的地址
 * @param {Function} callback 回调地址
 * @param {Object} params 参数
 */
function execMod(url, callback, params) {
    if(!params){
        definedModules[url].exports = definedModules[url].factory;
    }else{
        curExecModName = url;
        var exp = definedModules[url].factory.apply(null, params);
        curExecModName = null;
        if (exp) {
            definedModules[url].exports = exp;
        }
    }
    //执行回调函数
    callback(definedModules[url].exports);
    // //执行complete队列
    execComplete(url);
}
/**
 * 函数定义完毕执行load函数
 * @param {url} url 模块的地址
 */
function execComplete(url) {
    //模块定义完毕 执行load函数,当加载失败时，会不存在module
    for (var i = 0; i < definedModules[url].oncomplete.length; i++) {
        definedModules[url].oncomplete[i](definedModules[url] && definedModules[url].exports);
    }
    //释放内存
    definedModules[url].oncomplete = [];
}
/**
 * 
 * @param {String} src 需要加载的地址
 * @param {Function} success 成功回调地址
 * @param {Function} error 错误回调地址
 * @param {Object}} cfg 配置信息 
 */
function loadjs(src, success, error, cfg) {
    var d = extend({
        charset: document.charset,
    }, cfg);
    var node = document.createElement('script');
    node.src = src;
    node.modId = cfg.id;
    node.setAttribute(Dui.defaluts.plugins[cfg.id]?'dui-plugin':'dui-modules',cfg.id);
    node.charset = d.charset;
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
    currentlyAddingScript = node;
    document.head.appendChild(node);
    currentlyAddingScript = null;
}
/**
 * 深度复制
 * @param {Object} target 属性
 */
function extend(target){
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
}
/**
 * 循环函数
 * @param {Object} object 循环对象
 * @param {Function} callback 回调函数
 */
function each(obj, callback) {
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
Dui.extend = extend;
Dui.define = Dui;
Dui.use = use;
Dui.each = each;
Dui.config = function(options){
    // 如果给与的base不是带域名的路径
    if(!isUrl(options.base)){
        //修复base
        var base = location.origin;
        if(options.base.search(/^\//) !== -1){
            // 以/开头
            options.base = base+options.base;
        }else if(options.base.search(/^\.\//)!==-1){
            base = location.href.slice(0, location.href.lastIndexOf('/') + 1);
            // 删除./
            options.base = options.base.slice(2,options.base.length)
            // 组装
            options.base = base+options.base;
        }else{
            throw new Error('参数base不能以../开头');
        }
    }
    Dui.defaluts.config = extend(true,{},Dui.defaluts.config,options);
    return Dui;
}
if(!window.define){
    window.define = Dui;
    if(typeof window.require !== 'function'){
        window.require = Dui.use;
    }
}
Dui.amd = {};
// 增加<script src="__DUI__/js/dui.min.js" data-base="__ADMIN_JS__/" data-plugin="admin"></script>的用法
var thisScript = getCurrentScript();
if(thisScript.attributes['config-base']){
    var base = thisScript.attributes['config-base'].nodeValue;
    if(base){
        Dui.config({
            base:base
        })
    }
}
if(thisScript.attributes['exec-plugin']){
    var plugin = thisScript.attributes['exec-plugin'].nodeValue;
    if(plugin){
        Dui.use([plugin],function(plugin){

        })
    }
}
// 返回数据
export { Dui,extend,isArray,isObject,isPlainObject,isFunction,isArrayLike,each,type }
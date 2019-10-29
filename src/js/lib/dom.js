export var isServer = typeof window === 'undefined';
export var ieVersion = isServer ? 0 : Number(document.documentMode);
export var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
export var MOZ_HACK_REGEXP = /^moz([A-Z])/;
export var camelCase = function(name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};
/**
 * 去掉字符串空格
 * @param {String} string 需要去掉空格的字符串
 * @returns {String}   返回去掉空格后的字符串
 */
export function trim(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
}
/**
 * 给dom绑定事件
 * @param {Element} el 要操作的dom节点
 * @param {String} type 时间类型
 * @param {function} fn 回调函数
 */
export const bind = (function() {
  if (document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
})();
/**
 * 给dom移除事件
 * @param {Element} el 要操作的dom节点
 * @param {String} type 事件类型
 * @param {function} fn 回调函数
 */
export const unbind = (function() {
  if (document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
})();
/**
 * 给dom执行一次事件
 * @param {Element} el 操作的dom节点
 * @param {String} event 事件
 * @param {function} fn 回调函数
 */
export function once(el, event, fn) {
    var listener = function() {
      if (fn) {
        fn.apply(this, arguments);
      }
      off(el, event, listener);
    }
    on(el, event, listener);
};
/**
 * 判断元素是否包含该元素
 * @param {Element} el 操作的dom节点
 * @param {String} cls 查找的class
 */
export function hasClass(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
};
/**
 * 给元素新增class
 * @param {Element} el 操作的dom节点
 * @param {String} cls 要增加的className
 */
export function addClass(el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');
    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;
      if (el.classList) {
        el.classList.add(clsName);
      } else if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
    if (!el.classList) {
      el.className = curClass;
    }
};
/**
 * 给元素移除class
 * @param {Element} el 操作的dom节点
 * @param {String} cls 要移除的className
 */
export function removeClass(el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';
    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;
      if (el.classList) {
        el.classList.remove(clsName);
      } else if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
    if (!el.classList) {
      el.className = trim(curClass);
    }
};
/**
 * 获取元素的样式
 * @param {Element} element 要操作的dom节点
 * @param {String} styleName 要获取的属性名
 * @returns {String} 返回该style的值
 */
export var getStyle = ieVersion < 9 ? function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'styleFloat';
    }
    try {
        switch (styleName) {
            case 'opacity':
                try {
                    return element.filters.item('alpha').opacity / 100;
                } catch (e) {
                    return 1.0;
                }
            default:
                return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
        }
    } catch (e) {
        return element.style[styleName];
    }
} : function (element, styleName) {
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        var computed = document.defaultView.getComputedStyle(element, '');
        return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
        return element.style[styleName];
    }
};
/**
 * 给元素设置样式
 * @param {Element} element 操作的dom节点
 * @param {String} styleName 操作的属性名
 * @param {String} value 设置的属性值
 */
export function setStyle(element, styleName, value) {
    if (!element || !styleName) return;
    if (typeof styleName === 'object') {
      for (var prop in styleName) {
        if (styleName.hasOwnProperty(prop)) {
          setStyle(element, prop, styleName[prop]);
        }
      }
    } else {
      styleName = camelCase(styleName);
      if (styleName === 'opacity' && ieVersion < 9) {
        element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
      } else {
        element.style[styleName] = value;
      }
    }
};
/**
 * 当前浏览器的滚动条宽度
 */
export function scrollBarWidth(){
  var outer = document.createElement('div');
    outer.className = 'aiui-scrollbar-wrap';
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);
    var widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';
    var inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);
    var widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    var width = widthNoScroll - widthWithScroll;
    return  width;
}
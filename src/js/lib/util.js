import { each, extend } from "./loadjs";
/**
 * 设置某个函数只执行一次
 * @param {function} fn 只使用一次的函数
 * @returns {function} fn 返回只执行一次的函数
 */
export function once (fn){
    let called = false
    return function () {
      if (!called) {
        called = true
        fn.apply(this, arguments)
      }
    }
}
/**
 * 获取指定元素的模拟node
 * @param {Element} el 要获取Vnode的属性
 * @param {Object} defaultProp 要获取的默认属性
 * @param {Object} Prop 参数属性
 */
export function setVnode(el){
    if(!el.vnode){
        var attrs = el.attributes,
        vnode = {
            elm:el,
            data:{

            },
            event:{

            },
            attrs:{

            }
        };
        each(attrs,function(key,attr){
            var attrName = attr.name;
            var value = attr.nodeValue;
            vnode.attrs[attrName] = value;
        })
        el.vnode = vnode;
    }
}
/**
 * 给元素设置dui识别数据
 * @param {Element} el 要设置属性的元素
 * @param {String} name 数据名称
 * @param {Object} defaultProp 默认数据
 * @param {Object} option 传递的数据
 */
export function setData(el,name,defaultProp,option){
    if(!el.vnode){
        setVnode(el);
    }
    el.vnode.data[name] = extend(true,defaultProp,option);
}
/**
 * 给网页元素设置方法//统一委托
 * @param {Element} el 要给那个设置回调方法
 * @param {String} name 要给那个组件设置
 * @param {function} fn 回调函数
 */
export function bind(el,name,fn){
    if(!el.vnode){
        setVnode(el);
    }
    el.vnode.event[name] = fn;
}

/**
 * 给网页元素取消方法//统一委托
 * @param {Element} el 要给那个设置回调方法
 * @param {String} name 要给那个组件设置
 * @param {function} fn 回调函数
 */
export function unbind(el,name,fn){
    if(!el.vnode){
        return;
    }
    delete el.vnode.event[name];
}
import { each } from "./loadjs";
/**
 * 给元素绑定事件
 * @param {Element}} el 指定元素
 * @param {String} event 事件名，需要与组件定义的一致
 * @param {Function} fn 回调函数
 */
export function on(el,event,fn){
    if(typeof el!=="object" || !el.nodeType || !event) return this;
    if(el.events){
        var index = -1;
        each(el.events[event],function(i,item){
            if(item==fn){
                index = i;
            }
        })
        if(index==-1){
            el.events[event].push(fn);
        }
    }else{
        el.events = {};
        el.events[event] = [fn];
    }
}
/**
 * 给元素取消事件
 * @param {Element}} el 指定元素
 * @param {String} event 事件名，需要与组件定义的一致
 * @param {Function} fn 回调函数
 */
export function off(el,event,fn){
    if(typeof el!=="object" || !el.nodeType) return this;
    if(el.events && el.events[event]){
        each(el.events[event],function(i,item){
            if(item==fn){
                delete el.events[event][i];
            }
        })
        el.events[event] = el.events[event].filter(d=>d);
        if(el.events[event].length==0){
            delete el.events[event];
        }
        if(Object.keys(el.events).length==0){
            delete el.events;
        }
    }
}
/**
 * 触发事件
 * @param {Element}} el 指定元素
 * @param {String} event 事件名，需要与组件定义的一致
 */
export function trigger(el,event){
    var that = this,args;
    if(typeof el !=="object"){
        event = el;
        el = this;
        args = Array.prototype.slice.call(arguments, 1)
    }else{
        args = Array.prototype.slice.call(arguments, 2)
    }
    var that = this;
    if(el.events && el.events[event]){
        each(el.events[event],function(i,item){
            if(typeof item==="function"){
                item.apply(that,args);
            }
        })
    }
}
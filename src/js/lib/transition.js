import { Dui, extend } from "./loadjs";
import { once,nextFrame } from "./util";
import { addClass, removeClass, setStyle, getStyle } from "./dom";
// import { watchJs } from "./watch";
function Class(elem,options){
    this.init(elem,options);
    return this;
}
/**
 * 离开过渡
 */
export function enter(){
    var that = this,
    data = that.config,
    el = that.elem;
    if (el._leaveCb) {
        el._leaveCb.cancelled = true
        el._leaveCb()
    }
    if (el._enterCb) {
        return
    }
    var startClass = data.name+'-enter';
    var activeClass = data.name+'-enter-active';
    var toClass = data.name+'-enter-to';
    // 设置为不显示
    setStyle(el,'display','none');
    // 4个生命周期钩子函数
    var beforeEnterHook = data.beforeEnter;
    var enterHook = data.enter;
    var afterEnterHook = data.afterEnter;
    var enterCancelledHook = data.enterCancelled;
    var cb = el._enterCb = once(function(){
        removeClass(el, toClass)
        removeClass(el, activeClass)
        if (cb.cancelled) {
            removeClass(el, startClass)
            enterCancelledHook && enterCancelledHook(el);
        } else {
            afterEnterHook && afterEnterHook(el)
        }
        el._enterCb = null
    })

    // 如果有回调函数
    beforeEnterHook && beforeEnterHook(el)
    addClass(el, startClass)
    addClass(el, activeClass)
    nextFrame(function(){
        setStyle(el,'display','');
        nextFrame(function(){
            removeClass(el, startClass);
            if(!cb.cancelled) {
                // 添加 v-enter-to
                addClass(el, toClass)
                if(enterHook && typeof enterHook==="function"){
                    enterHook(el,cb);
                }else{
                    setTimeout(cb, data.duration)
                }
            }
        })
    })
}
/**
 * 进入过渡
 */
export function leave(){
    var that = this,
    data = that.config,
    el = that.elem;
    // call leave callback now
    if (el._enterCb) {
        el._enterCb.cancelled = true
        el._enterCb()
    }
    if (el._leaveCb) {
        return
    }
    var startClass = data.name+'-leave';
    var activeClass = data.name+'-leave-active';
    var toClass = data.name+'-leave-to';
    // 设置为不显示
    setStyle(el,'display','');
    // 4个生命周期钩子函数
    var beforeLeaveHook = data.beforeLeave;
    var leaveHook = data.leave;
    var afterLeaveHook = data.afterLeave;
    var leaveCancelledHook = data.leaveCancelled;
    var cb = el._leaveCb = once(function(){
        removeClass(el, toClass)
        removeClass(el, activeClass)
        if (cb.cancelled) {
            removeClass(el, startClass)
            leaveCancelledHook && leaveCancelledHook(el);
        } else {
            afterLeaveHook && afterLeaveHook(el)
            setStyle(el,'display','none');
        }
        el._leaveCb = null
    })

    // 如果有回调函数
    beforeLeaveHook && beforeLeaveHook(el)
    addClass(el, startClass)
    addClass(el, activeClass)
    nextFrame(function(){
        removeClass(el, startClass);
        if(!cb.cancelled) {
            // 添加 v-enter-to
            addClass(el, toClass)
            if(leaveHook && typeof leaveHook==="function"){
                leaveHook(el,cb);
            }else{
                setTimeout(cb, data.duration)
            }
        }
    })
}

Class.prototype = Class.fn =  {
    init:function(elem,options){
        var that = this;
        that.elem = elem;
        options = extend(true,{
            name:'face',
            elem:elem,
            duration:300,//过渡时间
            beforeEnter:'',//进入前
            enter:'',//当与 CSS 结合使用时
            afterEnter:'',//过渡后回调
            enterCancelled:'',//取消过渡回调
            beforeLeave:'',//离开前回调
            leave:'',//当与 CSS 结合使用时
            afterLeave:'',//离开之后回调
            leaveCancelled:'',//取消的时候回调
        },options);
        //获取data
        var data = that.config = options;
        //设置状态
        that.status = getStyle(elem,'display')==='none' ? 'hide' : 'show';
        return that;
    },
    show:function(){
        this.status = 'show';
        enter.call(this);
    },
    hide:function(){
        
        this.status = 'hide';
        leave.call(this);
    }
}
var transition = function(elem,options){
    return new Class(elem,options);
}
export default transition;
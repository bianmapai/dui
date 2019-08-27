import { dui, extend } from "./loadjs";
import { once,setData,nextFrame } from "./util";
import { addClass, removeClass, setStyle } from "./dom";
import watcher from "./watcher";
// import { watchJs } from "./watch";
function Class(elem,options){
    this.init(elem,options);
    return this;
}
/**
 * 过渡进入时发生
 * @param {Object} vnode nodeData对象
 */
export function enter(vnode){
    var el = vnode.elm;
    // call leave callback now
    if (el._leaveCb) {
        el._leaveCb.cancelled = true
        el._leaveCb()
    }
    var data = vnode.data.transition;
    if (!data) {
        return
    }
    if (el._enterCb) {
        return
    }
    var startClass = data.name+'-enter';
    var activeClass = data.name+'-enter-active';
    var toClass = data.name+'-enter-to';

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
 * 过渡离开时发生
 * @param {Object} vnode nodeData对象
 */
export function leave(vnode){
    var el = vnode.elm;
    // call leave callback now
    if (el._enterCb) {
        el._enterCb.cancelled = true
        el._enterCb()
    }
    var data = vnode.data.transition;
    if (!data) {
        return
    }
    if (el._leaveCb) {
        return
    }
    var startClass = data.name+'-leave';
    var activeClass = data.name+'-leave-active';
    var toClass = data.name+'-leave-to';

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
            show:true,//默认是否显示
        },options);
        //设置数据
        setData(elem,'transition',options);
        //获取data
        var data = that.data = elem.vnode.data.transition;
        //设置状态
        that.status = data.show === true ? 'show' : 'hide';
        that.watcher = watcher({
            data:data,
            watch:{
                show:function(newVal,oldVal){
                    if(newVal===true){
                        that.status = 'show';
                        enter(elem.vnode);
                    }else{
                        that.status = 'hide';
                        leave(elem.vnode);
                    }
                }
            }
        })
        //如果默认为不显示
        if(data.show===false){
            dui.setStyle(elem,'display','none');
        }
        return that;
    },
    show:function(){
        this.watcher.$data.show = true;
    },
    hide:function(){
        this.watcher.$data.show = false;
    }
}
var transition = function(elem,options){
    return new Class(elem,options);
}
export default transition;
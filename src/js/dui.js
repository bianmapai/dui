import { Dui } from "./lib/loadjs";
import { trim,on,off, once, hasClass, getStyle, setStyle, scrollBarWidth, addClass, removeClass } from "./lib/dom";
import transition from "./lib/transition";
import { collapseTransition } from "./lib/collapse-transition";
import watcher from "./lib/watcher";
import { setVnode, setData, bind ,unbind, setProps, convertProp, getMaxZIndex } from "./lib/util";
import addPopper from "./lib/addPopper";
import addScrollBar from "./lib/addScrollBar";
import { addResizeListener,removeResizeListener } from "./lib/resize-event";
import sort from "./lib/sort";//排序
import JsTree from "./lib/jsTree";
Dui.extend({
    trim:trim,//去空
    on:on,//给元素添加事件
    off:off,//给元素关闭事件
    once:once,//只运行一次的函数
    getStyle:getStyle,//获取元素的样式
    setStyle:setStyle,//设置样式
    scrollBarWidth,//获取当前浏览器滚动条的宽度
    hasClass:hasClass,//判断该元素是否有该class
    addClass:addClass,//给元素添加class
    removeClass:removeClass,//给元素移除class
    transition:transition,//过渡组件
    collapseTransition:collapseTransition,//高度变化过渡组件
    watcher:watcher,//监听属性变化
    setVnode:setVnode,//给元素设置一个模拟属性
    setData:setData,//给元素设置一些数据
    bind:bind,//在组件化的事件管理器里添加事件
    unbind:unbind,//在组件化的事件管理器里移除事件
    setProps:setProps,//设置元素的prop属性，只在vnode里面展示
    convertProp:convertProp,//转换现有的元素的prop属性
    getMaxZIndex:getMaxZIndex,//获取元素最大的z-index
    addPopper:addPopper,//给元素添加弹出层
    addScrollBar:addScrollBar,//给元素添加内置的滚动条
    addResizeListener:addResizeListener,//添加监听元素发生变化事件
    removeResizeListener:removeResizeListener,//移除监听元素发生变化事件
    sort:sort,//排序方法
    jsTree:JsTree,//前端数组转tree库
})
export default Dui;
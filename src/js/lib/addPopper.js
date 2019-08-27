import PopperJS from "./popper";
import { extend, type } from "./loadjs";
import { getMaxZIndex } from "./util";
import { on } from "./dom";
var stop = e => e.stopPropagation();
var Class = function(reference, popper, options){
    var that = this,
    createCallback = that.createCallback = extend(true,{},options).onCreate,
    updateCallback = that.updateCallback = extend(true,{},options).onUpdate;
    that.reference = reference;
    that.popperElm = popper;
    // 删除多余的
    delete options['onCreate'] && delete options['onUpdate'];
    // 创建popper
    that.popperJS  = new PopperJS(reference,popper,options);
    //设置修改方法
    if (typeof createCallback === 'function') {
        that.popperJS.onCreate(createCallback);
    }
    //设置修改方法
    if (typeof updateCallback === 'function') {
        that.popperJS.onUpdate(updateCallback);
    }
    that.popperJS._popper.style.zIndex = (getMaxZIndex()+1);
    on(that.popperElm,'click',stop);
};
Class.prototype.updatePopper = function(){
    const popperJS = this.popperJS;
    if (popperJS) {
        popperJS.update();
        if (popperJS._popper) {
          popperJS._popper.style.zIndex = (getMaxZIndex()+1);
        }
    } else {
        this.createPopper();
    }
}
export default function(reference, popper, options){
    return new Class(reference, popper, options);
}
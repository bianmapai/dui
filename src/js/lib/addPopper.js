import PopperJS from "./popper";
import { extend, type } from "./loadjs";
import { getMaxZIndex } from "./util";
import { on } from "./dom";
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
    on(window,'resize',function(){
        that.updatePopper();
    })
};
Class.prototype.updatePopper = function(fn){
    const popperJS = this.popperJS,
    that = this;
    if (popperJS) {
        if(fn){
            popperJS.onUpdate(function(data){
                fn.call(that,data);
                popperJS.onUpdate(that.updateCallback);
            })
        }
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
import { setData } from "./util";
var Selector ={
    scrollbar:'.dui-scrollbar',
    scrollbar__wrap:'.dui-scrollbar__wrap',
    bar:'.dui-scrollbar__bar',
    horizontalBar:'.is-horizontal',
    verticalBar:'is-vertical'
},
scroll = function(el,options){
    var that = this;
    that.original = el;
    setData(el,'scrollbar',options);
    that.innerTemplate = [
        '<div class="dui-scrollbar__wrap">',

        '</div>',
        '<div class="dui-scrollbar__bar is-horizontal">',
            '<div class="dui-scrollbar__thumb"></div>',
        '</div>',
        '<div class="dui-scrollbar__bar is-vertical">',
            '<div class="dui-scrollbar__thumb"></div>',
        '</div>'].join('');
    that.el = document.createElement('div');
    that.el.className = 'dui-scrollbar';
    el.parentNode.appendChild(that.el);
    el.parentNode.insertBefore(el,that.el);
    that.el.innerHTML = that.innerTemplate;
    //设置各个元素
    that.scrollbar__warp  = that.el.querySelector(Selector.scrollbar__wrap);
    that.scrollbarX = that.el.querySelector(Selector.bar+Selector.horizontalBar);
    that.scrollbarY = that.el.querySelector(Selector.bar+Selector.verticalBar);
    //把原始的dom放在scroll_wrap
    that.scrollbar__warp.appendChild(that.original);
    







};
export default function(el,options){
    return new scroll(el,options);
}
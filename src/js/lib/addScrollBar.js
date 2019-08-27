import { setData, } from "./util";
import { scrollBarWidth, addClass, on, off } from "./dom";
import { extend, each } from "./loadjs";
import { addResizeListener } from "./resize-event";
var ClassName = {
    scroll:'dui-scrollbar',
},
BAR_MAP = {
    vertical: {
        offset: 'offsetHeight',
        scroll: 'scrollTop',
        scrollSize: 'scrollHeight',
        size: 'height',
        key: 'vertical',
        axis: 'Y',
        client: 'clientY',
        direction: 'top'
    },
    horizontal: {
        offset: 'offsetWidth',
        scroll: 'scrollLeft',
        scrollSize: 'scrollWidth',
        size: 'width',
        key: 'horizontal',
        axis: 'X',
        client: 'clientX',
        direction: 'left'
    }
};
function scrollbar(el,options){
    //创建根节点
    var that = this;
    that.original = el;//这是需要添加滚动条的元素
    setData(el,'scrollbar',options);
    that.data = el.vnode.data.scrollbar;
    // 创建scroll
    that.scroll = document.createElement('div');
    addClass(that.scroll,ClassName.scroll);
    // 创建wrap
    that.wrap = document.createElement('div');
    that.scroll.append(that.wrap);
    that.moveX = 0;
    that.moveY = 0;
    that.sizeWidth = '0',
    that.sizeHeight = '0',
    // 初始化
    that.init();
};
//初始化
scrollbar.prototype.init = function(){
    var that = this;
    let gutter = scrollBarWidth();
    let style = that.data.wrapStyle;
    if (gutter) {
        const gutterWith = `-${gutter}px`;
        const gutterStyle = `margin-bottom: ${gutterWith}; margin-right: ${gutterWith};`;
        if (typeof this.wrapStyle === 'string') {
            style += gutterStyle;
        } else {
            style = gutterStyle;
        }
    }
    // 设置wrap的class
    that.wrap.className = 'dui-scrollbar__wrap'+(that.data.wrapClass ? (' '+that.data.wrapClass) :'')+(!gutter?' dui-scrollbar__wrap--hidden-default':'');
    // 设置样式
    style ? that.wrap.style = style :'';
    that.setSize();
    // 设置bar
    that.barX = new bar(that,{vertical:false,size:that.sizeWidth,move:that.moveX});
    that.barY = new bar(that,{vertical:true,size:that.sizeHeight,move:that.moveY});
    // 把元素放置在滚动里面
    that.original.parentNode ? that.original.parentNode.insertBefore(that.scroll,that.original):
    document.body.append(that.scroll);
    that.wrap.append(that.original);
    that.update();
    // 设置事件
    on(that.wrap,'scroll',function(e){
        that.moveY = ((that.wrap.scrollTop * 100) / that.wrap.clientHeight);
        that.moveX = ((that.wrap.scrollLeft * 100) / that.wrap.clientWidth);
        that.barY.thumb.style.transform = 'translateY('+that.moveY+'%)';
        that.barX.thumb.style.transform = 'translateX('+that.moveX+'%)';
    })
    // 元素大小发生变化事件
    !that.data.noresize && addResizeListener(that.original,function(){
        that.update();
    });
}
scrollbar.prototype.setSize = function(){
    var that=this,heightPercentage, widthPercentage;
    var wrap = this.wrap;
    if (!wrap) return;
    heightPercentage = (wrap.clientHeight * 100 / wrap.scrollHeight);
    widthPercentage = (wrap.clientWidth * 100 / wrap.scrollWidth);
    that.sizeHeight = (heightPercentage < 100) ? (heightPercentage + '%') : '';
    that.sizeWidth = (widthPercentage < 100) ? (widthPercentage + '%') : '';
}
//手动修改
scrollbar.prototype.update = function(){
    var that=this;
    that.setSize();
    that.barY.thumb.style.height = that.sizeHeight;
    that.barX.thumb.style.width = that.sizeWidth;
}
function bar(parent,options){
    var that = this;
    var bar = that.config = extend(true,{},BAR_MAP[options.vertical?'vertical':'horizontal']);//创建的配置
    var size = options.size ? options.size : '';//大小
    var move = options.move ? options.move : 0;//初始化移动位置
    // 设置bar
    that.bar = document.createElement('div');
    that.bar.className = 'dui-scrollbar__bar'+' is-'+that.config.key;
    // 设置thumb
    that.thumb = document.createElement('div');
    that.thumb.className = 'dui-scrollbar__thumb';
    // 设置thumb的styl
    that.thumb.style = renderThumbStyle({move,size,bar});
    // 添加元素
    that.bar.append(that.thumb);
    parent.scroll.append(that.bar);
    // 设置事件
    on(that.bar,'mousedown',function(e){
        // console.log();
        const offset = Math.abs(e.target.getBoundingClientRect()[bar.direction] - e[bar.client]);
        const thumbHalf = (that.thumb[bar.offset] / 2);
        const thumbPositionPercentage = ((offset - thumbHalf) * 100 / that.bar[bar.offset]);
        parent.wrap[bar.scroll] = (thumbPositionPercentage * parent.wrap[bar.scrollSize] / 100);
    })
    // 设置滚动条被点击
    on(that.thumb,'mousedown',function(e){
        // 防止右键点击
        if (e.ctrlKey || e.button === 2) {
            return;
        }
        startDrag(e);
        that[bar.axis] = (e.currentTarget[bar.offset] - (e[bar.client] - e.currentTarget.getBoundingClientRect()[bar.direction]));
    })
    function startDrag(e){
        e.stopImmediatePropagation();
        that.cursorDown = true;
        on(document, 'mousemove', mouseMoveDocumentHandler);
        on(document, 'mouseup', mouseUpDocumentHandler);
        document.onselectstart = () => false;
    }
    function mouseMoveDocumentHandler(e){
        if (that.cursorDown === false) return;
        const prevPage = that[bar.axis];
        if (!prevPage) return;
        const offset = ((that.bar.getBoundingClientRect()[bar.direction] - e[bar.client]) * -1);
        const thumbClickPosition = (that.thumb[bar.offset] - prevPage);
        const thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / that.bar[bar.offset]);
        parent.wrap[bar.scroll] = (thumbPositionPercentage * parent.wrap[bar.scrollSize] / 100);
    }
    function mouseUpDocumentHandler(e){
        that.cursorDown = false;
        that[bar.axis] = 0;
        off(document, 'mousemove', mouseMoveDocumentHandler);
        document.onselectstart = null;
    }
};
export function renderThumbStyle({ move, size, bar }) {
    const style = {};
    var returns = '';
    const translate = `translate${bar.axis}(${ move }%)`;
    style[bar.size] = size;
    style.transform = translate;
    each(style,function(key,value){
        returns += key+':'+value+';';
    })
    return returns;
};
export default function(el,options){
    return new scrollbar(el,options);
}

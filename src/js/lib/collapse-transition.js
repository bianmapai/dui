import transition from "./transition";
import { addClass, removeClass } from "./dom";
import { extend } from "./loadjs";
export function collapseTransition(el,option){
    option = extend(true,{
        show:false
    },option);
    return transition(el,{
        name:'collapse',
        beforeEnter:function(el){
            addClass(el, 'collapse-transition');
            if (!el.dataset) el.dataset = {};
            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;
            el.style.height = '0';
            el.style.paddingTop = 0;
            el.style.paddingBottom = 0;
            el.style.overflow = 'hidden';
        },
        enter:function(el,cb){
            el.dataset.oldOverflow = el.style.overflow;
            if (el.scrollHeight !== 0) {
                el.style.height = el.scrollHeight + 'px';
                el.style.paddingTop = el.dataset.oldPaddingTop;
                el.style.paddingBottom = el.dataset.oldPaddingBottom;
            } else {
                el.style.height = '';
                el.style.paddingTop = el.dataset.oldPaddingTop;
                el.style.paddingBottom = el.dataset.oldPaddingBottom;
            }
            setTimeout(cb,300);
        },
        afterEnter:function(el){
            removeClass(el, 'collapse-transition');
            el.style.height = '';
            el.style.overflow = el.dataset.oldOverflow;
        },
        beforeLeave:function(el){
            if (!el.dataset) el.dataset = {};
            el.dataset.oldPaddingTop = el.style.paddingTop;
            el.dataset.oldPaddingBottom = el.style.paddingBottom;
            el.dataset.oldOverflow = el.style.overflow;
            el.style.height = el.scrollHeight + 'px';
            el.style.overflow = 'hidden';
        },
        leave:function(el,cb){
            if (el.scrollHeight !== 0) {
                // for safari: add class after set height, or it will jump to zero height suddenly, weired
                addClass(el, 'collapse-transition');
                el.style.height = 0;
                el.style.paddingTop = 0;
                el.style.paddingBottom = 0;
            }
            setTimeout(cb,300);
        },
        afterLeave:function(el){
            removeClass(el, 'collapse-transition');
            el.style.height = '';
            el.style.overflow = el.dataset.oldOverflow;
            el.style.paddingTop = el.dataset.oldPaddingTop;
            el.style.paddingBottom = el.dataset.oldPaddingBottom;
            option.afterLeave && option.afterLeave(el);
        },
        show: option.show
    })
}
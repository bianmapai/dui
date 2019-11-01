import $ from "jquery";
var FORM_NODE='[dui-form]',
INIT_FORM = '[dui-init]',
SUBMIT_BTN = 'dui-submit',
SWITCH = '[dui-switch]',
CHECKBOX='[dui-checkbox]',
RADIO ='[dui-radio]',
SELECT='[dui-select]',
// 提交验证方法
submit = function(e){
    var othis = $(this);
    console.log(othis.serialize());
    return false;
},
$doc = $(document);
function form(el,type,only){
    return form.render(el,type,only);
}
/**
 * 自动渲染
 */
form.init = function(){
    var $forms = $(FORM_NODE+INIT_FORM);
    $.each($forms,function(i,item){
        form.render(item);
    })
}
/**
 * 手动触发验证
 */
form.submit = function(el){

}
/**
 * 渲染表单
 */
form.render = function(el,type,only){
    var $form = $(el?el:FORM_NODE);
    var items = {
        switch:function(){
            if(only && only.nodeType){
                only.Switch = new Switch(only);
            }else{
                $form.find(SWITCH).each(function(i,swc){
                    swc.Switch = new Switch(swc);
                })
            }
        },
        checkbox:function(){
            if(only && only.nodeType){
                only.checkbox = new checkbox(only);
            }else{
                $form.find(CHECKBOX).each(function(i,cbx){
                    cbx.checkbox = new checkbox(cbx);
                })
            }
        },
        radio:function(){
            if(only && only.nodeType){
                only.radio = new radio(only);
            }else{
                $form.find(RADIO).each(function(i,rdo){
                    rdo.radio = new radio(rdo);
                })
            }
        },
        select:function(){
            if(only && only.nodeType){
                only.select = new select(only);
            }else{
                $form.find(SELECT).each(function(i,slt){
                    slt.select = new select(slt);
                })
            }
        }
    };
    type ? (items[type] && items[type]()) :
    ($.each(items,function(i,item){
        item();  
    }))
    // 重置表单验证
    $form.on('reset', $form, function(){
        form.render();
    });
    // 监听当前提交的表单
    $form.off('submit',submit).on('submit',submit);
}
/**
 * switch的方法
 */
form.switch = function(el,options){
    return new Switch(el,options);
};
/**
 * checkbox初始化方法
 */
form.checkbox = function(el,options){
    return new checkbox(el,options);
}
/**
 * 开关渲染函数
 * @param {Element} el 要初始化的元素
 * @param {Object} options 初始化参数
 */
function Switch(el,options){
    var that = this,
    props = {
        name: {
            type: String,
            default: ''
        },//表单名称
        activeValue:{
            type:[Boolean, String, Number],
            default:true
        },
        inactiveValue:{
            type:[Boolean, String, Number],
            default:false
        },
        skin:{
            type:[String],
            default:'label-out'
        },
        checked:{
            type:Boolean,
            default:false
        },
        value:{
            type:[Boolean, String, Number],
            default:false
        },//选中的值
        disabled:{
            type:Boolean,
            default:false
        },//禁用
        activeText: String,
        inactiveText: String,
        activeColor:String,
        inactiveColor:String,
        width:{
            type:Number,
            default:40
        }
    };
    // 设置信息
    var setting = that.setting = {
        SELECTOR:'[dui-switch]',
        CLASS:'dui-switch',
        LABEL_LEFT:'.dui-switch__label--left',
        LABEL_RIGHT:'.dui-switch__label--right',
        CORE:'.dui-switch__core',
    };
    // 设置原始元素
    that.original = el;
    // 原始的value值
    !that.originalValue ? that.originalValue = el.value:'';
    // 获取配置信息
    var config = that.config = dui.getProps(el,props);
    // 设置模板
    var template = that.template = ['<div class="dui-switch'+function(){
            return config.activeValue==config.value ? ' is-checked':'';
        }()+' '+config.skin+'">',
        function(){
            if(config.skin=='label-out'){
                return config.inactiveText ? '<span class="dui-switch__label dui-switch__label--left'+function(){
                    return config.inactiveValue==config.value ? " is-active":'';
                }()+'"><span>'+config.inactiveText+'</span></span>':'';
            }
            return '';
        }(),
        '<span class="dui-switch__core" style="width: '+config.width+'px;'+function(){
            return config.activeValue==config.value ? 'border-color:'+config.activeColor+';'+'background-color:'+config.activeColor+';' : 
            'border-color:'+config.inactiveColor+';'+'background-color:'+config.inactiveColor+';';
        }()+'">'+function(){
            if(config.skin=='label-in'){
                return '<em>'+function(){
                    return config.activeValue==config.value ? config.activeText : config.inactiveText;
                }()+'</em>';
            }
            return '';
        }()+'</span>',
        function(){
            if(config.skin=='label-out'){
                return config.activeText ? '<span class="dui-switch__label dui-switch__label--right'+function(){
                    return config.activeValue==config.value ? " is-active":'';
                }()+'"><span>'+config.activeText+'</span></span>' : '';
            }
            return '';
        }(),
    '</div>'].join('');
    // 设置为选中状态
    $(el).prop('checked',true);
    // 设置显示元素
    var $elem = that.$elem = $(template),
    // 获取已经渲染了的元素
    hasRender = $(el).next('.'+setting.CLASS);
    // 如果已经渲染了，就移除渲染的元素,还原默认值
    hasRender[0] && (el.value = that.originalValue) && 
    (config.checked==false?$(el).prop('checked',false):'') && 
    hasRender.remove();
    // 添加显示元素在页面
    $(el).after($elem);
    // 设置点击事件
    $elem.on('click',function(e){
        // 如果被禁用
        if(config.disabled) return false;
        // 如果设置有beforeChange
        if(el.events && el.events.beforeChange){
            dui.trigger.call(el,'beforeChange',done);
        }else{
            done();
        }
    })
    // 设置完整函数
    function done(){
        //获取当前值
        var othis = $(el),value = othis.val();
        if(dui.convertProp(value,props.value.type)==that.config.activeValue){
            //设置当前是选中
            othis.val(that.config.inactiveValue);
            //设置当前没有选中
            $elem.removeClass('is-checked');//移除选中样式
            $elem.find(setting.LABEL_LEFT).addClass('is-active');
            $elem.find(setting.LABEL_RIGHT).removeClass('is-active');
            if(config.skin=='label-in'){
                $elem.find(setting.CORE).find('em').text(config.inactiveText);
            }
            //颜色
            $elem.find(setting.CORE).css('background',config.inactiveColor);
            //颜色
            $elem.find(setting.CORE).css('border-color',config.inactiveColor);
        }else{
            //设置当前是选中
            othis.val(that.config.activeValue);
            $elem.addClass('is-checked');//移除选中样式
            $elem.find(setting.LABEL_LEFT).removeClass('is-active');
            $elem.find(setting.LABEL_RIGHT).addClass('is-active');
            if(config.skin=='label-in'){
                $elem.find(setting.CORE).find('em').text(config.activeText);
            }
            //颜色
            $elem.find(setting.CORE).css('background',config.activeColor);
            //颜色
            $elem.find(setting.CORE).css('border-color',config.activeColor);
        }
        //手动回调一下
        othis[0] && othis.change && othis.change()
        el.events && el.events.beforeChange && dui.trigger.call(el,'change',done);
    }
    return that;
}
/**
 * 多选框渲染函数
 * @param {Element} el 要初始化的元素
 * @param {Object} options 初始化参数
 */
function checkbox(el,options){
    var that = this,props={
        name:String,
        disabled:{
            type:[Boolean,String],
            default:false
        },
        label:String,
        value:String,
        bordered:Boolean,
        indeterminate:Boolean,
        buttoned:Boolean,
        checked:{
            type:[Boolean,String],
            default:false
        },
        items:String
    },
    // 配置信息
    config = that.config = $.extend(true,{},dui.getProps(el,props)),
    // 选中的样式
    CHECKED = 'is-checked',
    // 元素的样式
    CLASS = 'dui-checkbox'+(config.buttoned?'-button':''),
    // 核心输入框
    COREINPUT = 'dui-checkbox'+(config.buttoned?'-button':'')+'__input',
    // 全选按钮，但是子元素没有全选的样式
    INDETERMINATE = 'is-indeterminate',
    // 是否已经渲染过的选择器
    RENDERCLASS = '.'+CLASS+'__inner',
    // 原始元素
    $original = that.$original = $(el),
    // 当前选中状态
    currentChecked = config.checked = $(el).prop('checked'),
    // 模板
    template = that.template = ['<div class="dui-checkbox'+(config.buttoned?'-button':'')+(config.checked ? ' is-checked' :'')+
        (config.disabled ? ' is-disabled' :'')+(config.bordered ? ' is-bordered' :'')+'">',
        (config.buttoned ? '' : ('<span class="dui-checkbox__input'+(config.checked ? ' is-checked' :'')+(config.disabled ? ' is-disabled' :'')+'">')),
            '<span class="dui-checkbox'+(config.buttoned?'-button':'')+'__inner">'+(config.buttoned?config.label:'')+'</span>',
        (config.buttoned ? '' : '</span>'),
        (config.buttoned ? '':function(){
            return config.label ? '<span class="dui-checkbox__label">'+config.label+'</span>':'';
        }()),
    '</div>'].join(''),
    // 显示样式元素
    $elem = that.$elem = $(template),
    // 用来判断是否已经渲染过的元素
    hasRender = $original.prev(RENDERCLASS);
    // 判断是否已经渲染过,已经渲染过就删除掉
    hasRender[0] && 
    // 先把原始元素移动到显示元素的兄弟节点
    hasRender.parents('.'+CLASS).after(el) && 
    // 移除显示元素
    hasRender.parents('.'+CLASS).remove();
    // 插入显示元素
    $original.after($elem) && 
    // 隐藏原始元素
    $elem.find(RENDERCLASS).after(el);
    // 设置当前组的全选按钮
    if(config.indeterminate){
        // 删除掉name属性
        $original.attr('name','');
        // 设置全选的控制
        that.groupAll(true);
    }
    // 设置事件
    // 如果禁用则没有任何事件
    if(config.disabled)return;
    // 点击事件
    $elem.on('click',function(e){
        if(el.events && el.events.beforeChange){
            dui.trigger.call(el,'beforeChange',done);
        }else{
            done();
        }
        function done(){
            // 当前被点击的对象
            var othis = $elem,
            // 核心显示框
            $core = othis.find('.'+COREINPUT),
            // 当前的选择状态
            checked=$original.prop('checked');
            if(config.indeterminate){
                if($core.hasClass(INDETERMINATE)){
                    // 设置为选中
                    othis.addClass(CHECKED).find($core).addClass(CHECKED).removeClass(INDETERMINATE);
                    // 设置子节点选中
                    that.subset(true);
                }else if(othis.hasClass(CHECKED)){
                    // 设置为不选中
                    othis.removeClass(CHECKED).find($core).removeClass(CHECKED).removeClass(INDETERMINATE);
                    // 设置子节点不选中
                    that.subset(false);
                }else{
                    // 设置为选中
                    othis.addClass(CHECKED).find($core).addClass(CHECKED).removeClass(INDETERMINATE);
                    // 设置子节点选中
                    that.subset(true);
                }
            }else{
                // 如果是选中
                if(checked===true){
                    // 取消选中
                    $original.prop('checked',false);
                    // 移除选中的class
                    othis.removeClass(CHECKED);
                    // 如果是按钮的显示状态
                    !config.buttoned && othis.find('.'+COREINPUT).removeClass(CHECKED);

                }else{
                    // 选中操作
                    $original.prop('checked',true);
                    // 添加选中的class
                    othis.addClass(CHECKED);
                    // 如果是按钮的显示状态
                    !config.buttoned && othis.find('.'+COREINPUT).addClass(CHECKED);
                }
                that.groupAll(false);
            }
            // 触发原始事件
            el.change && el.change();
            // 触发dui管理事件
            el.events && el.events.change && dui.trigger.call(el,'change',done);
        }
    })
}
/**
 * 设置全选的样式
 */
checkbox.prototype.groupAll = function(indeterminate){
    var that = this,config = that.config,
    // 原始元素
    $original = that.$original,
    // 全选按钮，但是子元素没有全选的样式
    INDETERMINATE = 'is-indeterminate',
    // 选中的样式
    CHECKED = 'is-checked',
    // 全选样式
    COREINPUT = '.dui-checkbox__input',
    // 影响元素的选择器
    GROUPCLASS='.dui-checkbox-check-group',
    // 选择全部的按钮
    $elem = function(){
        if(indeterminate===true){
            return that.$elem;
        }else{
            return that.$original.parents(GROUPCLASS).find('[indeterminate]').parents('.dui-checkbox');
        }
    }(),
    // 除开全选按钮外的其他按钮
    $allCheckbox = $original.parents(GROUPCLASS).find(CHECKBOX+':not("[indeterminate]")'),
    // 选中的按钮
    $allChecked = $original.parents(GROUPCLASS).find(CHECKBOX+':checked:not("[indeterminate]")');
    if($allCheckbox.length==$allChecked.length && $allCheckbox.length>0){
        // 添加选中的class
        $elem.addClass(CHECKED).find(COREINPUT).removeClass(INDETERMINATE).addClass(CHECKED);
    }else if($allChecked.length>0){
        // 添加选中的class
        $elem.removeClass(CHECKED).find(COREINPUT).addClass(INDETERMINATE).removeClass(CHECKED);
    }else{
        $elem.removeClass(CHECKED).find(COREINPUT).removeClass(INDETERMINATE).removeClass(CHECKED);
    }
}
/**
 * 子元素的样式设置
 */
checkbox.prototype.subset = function(checked){
    var that = this,config = that.config,
    // 选中的样式
    CHECKED = 'is-checked',
    CLASS = '.dui-checkbox',
    // 元素的样式
    BUTTONCLASS = '.dui-checkbox-button',
    // 核心输入框
    COREINPUT = '.dui-checkbox'+(config.buttoned?'-button':'')+'__input',
    // 全选按钮，但是子元素没有全选的样式
    INDETERMINATE = 'is-indeterminate',
    // 当前分组组样式名
    GROUPCLASS='.dui-checkbox-check-group',
    // 当前操作元素
    $elem = that.$elem,
    // 原始元素
    $original = that.$original,
    // 没有选中的元素
    $noCheckeds = $original.parents(GROUPCLASS).find(CHECKBOX+':not(":checked"):not("[indeterminate]")'),
    // 选中了的元素
    $checkeds = $original.parents(GROUPCLASS).find(CHECKBOX+':checked:not("[indeterminate]")');
    if(checked==true){
        // 设置选中
        $noCheckeds.each(function(i,checkbox){
            // 原始元素
            var $checkbox = $(checkbox),
            // 显示元素
            othis = $checkbox.parents(CLASS)[0]?$checkbox.parents(CLASS):$checkbox.parents(BUTTONCLASS);
            // 设置选中
            $checkbox.prop('checked',true);
            // 设置样式
            othis.addClass(CHECKED);
            // 核心
            !$checkbox.attr('buttoned') && othis.find(COREINPUT).addClass(CHECKED);
        })
    }else{
        $checkeds.each(function(i,checkbox){
            // 原始元素
            var $checkbox = $(checkbox),
            // 显示元素
            othis = $checkbox.parents(CLASS)[0]?$checkbox.parents(CLASS):$checkbox.parents(BUTTONCLASS);
            // 设置选中
            $checkbox.prop('checked',false);
            // 设置样式
            othis.removeClass(CHECKED);
            // 核心
            !$checkbox.attr('buttoned') && othis.find(COREINPUT).removeClass(CHECKED);
        })
    }
}
/**
 * 单选按钮渲染函数
 * @param {Element} el 要初始化的元素
 * @param {Object} options 初始化参数
 */
function radio(el,options){
    var that = this,props = {
        name:String,
        value:{
            type:[Boolean,Number,String],
            default:'',
        },
        label:{
            type:[Boolean,Number,String],
            default:'',
        },
        bordered:Boolean,//是否有边框
        disabled:{
            type:[Boolean,String],
            default:false
        },//是否禁用
        buttoned:Boolean,//是否已按钮的样式
        checked:{
            type:[Boolean,String],
            default:false
        }//是否选中
    },
    // 配置信息
    config = that.config = $.extend(true,{},dui.getProps(el,props)),
    // 原始元素
    $original = that.$original = $(el),
    // 显示元素选择器
    CLASS = 'dui-radio'+(config.buttoned?'-button':''),
    // 核心样式选择器
    COREINPUT = CLASS + '__input',
    // 组选择器
    GROUPCLASS = '.dui-radio-group',
    // 选中样式
    CHECKED = config.buttoned ? 'is-active' : 'is-checked',
    // 获取当前分组元素
    group = $original.parents(GROUPCLASS).length>0 ? $original.parents(GROUPCLASS):$original.parents(FORM_NODE),
    // 是否已经渲染过的选择器
    RENDERCLASS = '.'+CLASS+'__inner',
    // 获取当前选中样式
    mrchecked = function(){
        if($original.is(':checked')){
            return ' '+CHECKED;
        }else{
            return '';
        }
    }(),
    // 模板
    template = that.template = ['<div class="dui-radio'+(config.buttoned ? '-button' : '')+(config.bordered?' is-bordered':'')+(mrchecked?' '+CHECKED:'')+(config.disabled?' is-disabled':'')+'">',
        (!config.buttoned ? '<span class="dui-radio__input'+(mrchecked?' is-checked':'')+(config.disabled ? ' is-disabled' :'')+'">':''),
            '<span class="dui-radio'+(config.buttoned?'-button':'')+'__inner">'+(config.buttoned?config.label:'')+'</span>',
        (!config.buttoned ? '</span>' : ''),
        (!config.buttoned ? '<span class="dui-radio__label">'+config.label+'</span>':''),
    '</div>'].join(''),
    // 显示样式元素
    $elem = that.$elem = $(template),
    // 用来判断是否已经渲染过的元素
    hasRender = $original.prev(RENDERCLASS);
    // 判断是否已经渲染过,已经渲染过就删除掉
    hasRender[0] && 
    // 先把原始元素移动到显示元素的兄弟节点
    hasRender.parents('.'+CLASS).after(el) && 
    // 移除显示元素
    hasRender.parents('.'+CLASS).remove();
    // 插入显示元素
    $original.after($elem) && 
    // 隐藏原始元素
    $elem.find(RENDERCLASS).after(el);
    // 设置事件
    // 如果禁用则没有任何事件
    if(config.disabled)return;
    // 点击事件
    $elem.on('click',function(e){
        if(el.events && el.events.beforeChange){
            dui.trigger.call(el,'beforeChange',done);
        }else{
            done();
        }
        function done(){
            // 当前被点击的对象
            var othis = $elem,
            // 核心显示框
            $core = othis.find('.'+COREINPUT),
            // 当前的选择状态
            checked=$original.prop('checked');
            // 如果当前按钮没有被选中则设置选中
            if(checked==false){
                // 其他的元素
                var other = group.find('[name="'+config.name+'"]:checked'),
                otherElem = other.parents('.dui-radio')[0]?other.parents('.dui-radio'):other.parents('.dui-radio-button'),
                OTHERCHECKCLASS,
                otherCore = function(){
                    if(otherElem.hasClass('dui-radio')){
                        OTHERCHECKCLASS = 'is-checked';
                        return otherElem.find('.dui-radio__input');
                    }else{
                        OTHERCHECKCLASS = 'is-active';
                        return otherElem.find('.dui-radio-button__input');
                    }
                }();
                // 设置样式
                otherElem.removeClass(OTHERCHECKCLASS) && otherCore.removeClass(OTHERCHECKCLASS);
                // 设置其他不选中
                other.prop('checked',false);
                // 设置当前状态
                $original.prop('checked',true);
                // 设置当前选中样式
                othis.addClass(CHECKED) && $core.addClass(CHECKED);
                // 回调事件
                // 触发原始事件
                el.change && el.change();
                // 触发dui管理事件
                el.events && el.events.change && dui.trigger.call(el,'change',done);
            }
        }
    })
    
}
/**
 * 下拉选择框的渲染类
 * @param {Element} el 要初始化的元素
 * @param {Object} options 初始化参数
 */
function select(el,options){
    var that = this,props = {
        name:String,//表单提交名
        multiple:{
            type:[Boolean,String],
            default:false
        },//多选
        disabled:{
            type:[Boolean,String],
            default:false
        },//是否禁用
        size:String,//大小
        clearable:Boolean,//是否有清除按钮
        placeholder:String,//没有选中的显示值
        filterable:Boolean,//是否允许搜索
        original:Boolean,//是否原始
    },
    CLASS = 'dui-select',
    CLEARABLE = 'dui-icon-circle-close',
    config = that.config = dui.getProps(el,props),
    // 原始元素
    original = that.el = el,
    // 原始元素jquery选择
    $original = that.$original = $(original),
    // 是否已经有渲染元素
    hasRender = $original.next('.'+CLASS),
    // 当前选中的值
    value   = that.value = $original.val(),
    // 获取选项数据
    optData = that.getOptData(),
    // 获取所有标签
    $tags = that.$tags = that.getAlltag(),
    // 获取选项显示html
    optHtml = that.optHtml = [
        '<div class="dui-select-dropdown dui-popper'+(config.multiple ? ' is-multiple':'')+'" style="display:none">',
            '<ul class="dui-select-dropdown__list">'+that.getOptHtml(optData)+'</ul>',
            '<div x-arrow="" class="popper__arrow"></div>',
        '</div>'
    ].join(' '),
    // 点击元素
    clickHtml = ['<div class="'+CLASS+(config.size ? ' '+CLASS+'--'+config.size:'')+'">',
        // 是否有多选
        (config.multiple ? '<div class="dui-select__tags"><span></span></div>':''),
        '<div class="dui-input'+(config.size ? ' dui-input--'+config.size:'')+' dui-input--suffix'+(config.disabled ? ' is-disabled':'')+'">',
            '<input class="dui-input__inner dui-input--suffix"'+(!config.filterable ? ' readonly="readonly"':'')+' placeholder="'+config.placeholder+'"'+(config.disabled ? 'disabled="disabled"':'')+'>',
            // 显示箭头按钮
            '<span class="dui-input__suffix">',
                '<span class="dui-input__suffix-inner">',
                    '<i class="dui-select__caret dui-input__icon dui-icon-arrow-up"></i>',
                    //清除按钮
                    (config.clearable ? '<i class="dui-select__caret dui-input__icon '+CLEARABLE+'" style="display:none"></i>':''),
                '</span>',
            '</span>',
        '</div>',
    '</div>'].join(''),
    // 没有任何内容的显示元素
    $emptyDom = that.$emptyDom = $(['<p class="dui-select-dropdown__empty">'+
        '无匹配数据'+
    '</p>'].join('')),
    // 触发点击的元素
    $clickDom = that.$clickDom = $(clickHtml),
    // 输入框元素
    $input = that.$input = $clickDom.find('.dui-input__inner'),
    // 角标元素
    $caret = that.$caret = $clickDom.find('.dui-select__caret'),
    // 选项显示元素
    $optDom = that.$optDom = $(optHtml),
    // 选项点击元素
    $opts = that.$opts = $optDom.find('.dui-select-dropdown__item');
    // 给选项添加滚动条
    that.scrollbar = dui.addScrollBar($optDom.find('.dui-select-dropdown__list')[0],{
        wrapClass:'dui-select-dropdown__wrap'
    });
    // 添加显示元素
    hasRender[0] && hasRender.remove();
    $(el).css('display','none').after($clickDom);
    // 设置popper
    that.setPopper();
    // 同步值
    that.sysStyle();
    // 如果是禁用没有任何事件
    if(config.disabled) return;
    // 设置事件
    that.setEvents();
}
/**
 * 显示popper
 */
select.prototype.showPopper = function(){
    var that = this,transition = that.transition,
    $optDom = that.$optDom,$clickDom=that.$clickDom,
    $input = that.$input,$caret = that.$caret;
    // 添加元素到body
    $('body').append($optDom);
    // 设置打开样式
    $input.addClass('is-focuse');
    // 给选项角标添加样式
    $caret.addClass('is-reverse');
    // 开始显示动画
    transition.show();
}
/**
 * 隐藏popper
 */
select.prototype.hidePopper = function(){
    var that = this,transition = that.transition,
    $input = that.$input,$caret = that.$caret;
    // 设置打开样式
    $input.removeClass('is-focuse');
    // 给选项角标添加样式
    $caret.removeClass('is-reverse');
    // 开始显示动画
    transition.hide();
}
/**
 * 设置事件
 */
select.prototype.setEvents = function(){
    var that = this,$clickDom = that.$clickDom,
    $input = that.$input;
    // 点击元素显示选项事件
    $clickDom.on('click',function(e){
        if($input.hasClass('is-focuse')){
            that.hidePopper();
        }else{
            that.showPopper();
        }
    })
}
/**
 * 同步样式
 */
select.prototype.sysStyle = function(){
    var that    = this,config = that.config,
    $clickDom   = that.$clickDom,
    $original   = that.$original,
    $optDom     = that.$optDom,
    $opts       = $optDom.find('.dui-select-dropdown__item'),
    $tagdom     = $clickDom.find('.dui-select__tags>span'),
    $input      = that.$input,
    value       = $original.val();
    //1.全部置空
    $tagdom.html('');
    $opts.removeClass('selected');
    // 根据值设置样式
    // 获取当前选中的值
    if(value.length>0){
        // 有值的情况下
        if(config.multiple){
            // 设置提示
            $input.attr('placeholder','');
            // 设置选项选中
            $.each(value,function(i,val){
                var selectOpt = $optDom.find('.dui-select-dropdown__item[dui-value="'+val+'"]');
                // 设置选中
                selectOpt.addClass('selected');
                // 设置tag
                $tagdom.append(that.$tags[val]);
            })
        }else{
            // 设置提示
            $input.attr('placeholder',config.placeholder);
            // 设置样式
            $optDom.find('.dui-select-dropdown__item[dui-value="'+value+'"]').addClass('selected');
        }
    }else{
        // 多选
        $input.attr('placeholder',config.placeholder);
    }
}
/**
 * 设置选项
 */
select.prototype.setPopper= function(){
    var that = this,$clickDom = that.$clickDom,
    $input = that.$input,
    $optDom = that.$optDom;
    // 添加元素
    $('body').append($optDom);
    var ref = $clickDom[0],pop = $optDom[0];
    var x = {top:'bottom','bottom':'top'};
    that.popper = dui.addPopper(ref,pop,{
        arrowOffset:35,
        onCreate:function(data){
            that.transition = dui.transition(pop,{
                name:'dui-zoom-in-'+x[data._options.placement],
                beforeEnter:function(){
                    that.popper.updatePopper();
                },
                afterLeave:function(){
                    that.$optDom.remove();
                }
            });
        },
        onUpdate:function(data){
            that.transition.config.name = 'dui-zoom-in-'+x[data.placement];
        }
    });
    $optDom.css('min-width',$input.outerWidth());
    // 手动修改一下
    that.popper.updatePopper();
}
/**
 * 多选的时候获取所有tag
 */
select.prototype.getAlltag = function(){
    var that = this,el = that.el,tags = {};
    $(el).find('option').each(function(i,opt){
        var title = $(opt).text(),val = $(opt).val()
        //添加元素到tagdom
        var thisTag = $('<span class="dui-tag dui-tag--info dui-tag--small dui-tag--light">'+
                            '<span class="dui-select__tags-text">'+title+'</span>'+
                            '<i class="dui-tag__close dui-icon-close"></i>'+
                        '</span>')[0];
        thisTag.value = val;
        tags[val] = thisTag;
    })
    return tags;
}
/**
 * 根据选项数据获取选项html
 */
select.prototype.getOptHtml = function(data){
    var returnHtml = '',that = this,config= that.config;
    $.each(data,function(i,item){
        if(item.type=='group'){
            returnHtml +='<ul class="dui-select-group__wrap"><li class="dui-select-group__title">'+item.label+'</li><li>'+function(){
                if(item.childrens){
                    return '<ul class="dui-select-group">'+that.getOptHtml(item.childrens)+'</ul>'
                }
            }()+'</li></ul>';
        }else if(item.type=='item'){
            returnHtml += '<li class="dui-select-dropdown__item'+(item.disabled?' is-disabled':'')+(item.selected?' selected':'')+'" dui-value="'+item.value+'"><span>'+item.label+'</span></li>';
        }
    })
    return returnHtml;
}
/**
 * 获取器所有的选项数据
 */
select.prototype.getOptData = function(elem){
    var that = this,elem = elem?elem:that.el;
    var res = [];
    var childrens = $(elem).children();
    childrens.each(function(i,opt){
        var item = {};
        if(opt.tagName.toLowerCase()==='optgroup'){
            item.label = $(opt).attr('label');
            item.type = 'group';
            if(opt.children.length>0){
                item.childrens =  that.getOptData(opt);
            }
        }else if(opt.tagName.toLowerCase()==='option'){
            item.type = 'item';
            item.label = $(opt).text();
            item.value = $(opt).val();
            item.selected = ($(that.el).val()==$(opt).val() || $.inArray($(opt).val(),$(that.el).val())!=-1) ? true : false;
            item.disabled = typeof $(opt).attr('disabled') !=="undefined" ? true : false;
        }
        res.push(item);
    })
    return res;
}
form.init();
export default form;
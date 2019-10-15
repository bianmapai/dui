import $ from "jquery";
var form = function(el,type,option){
    return new form.Item[type](el,option);
},
Switch = function(el,options){
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
        value:{
            type:[Boolean, String, Number],
            default:false
        },//选中的值
        disabled:{
            type:Boolean,
            default:false
        },//禁用
        multiple:{
            type:Boolean,
            default:false
        },//多选
        activeText: String,
        inactiveText: String,
        clearable:{
            type:Boolean,
            default:false
        },
        width:{
            type:Number,
            default:40
        }
    };
    that.el = el;
    !that.originalValue ? that.originalValue = el.value:'';
    dui.setData(el,'switch',{},options);
    dui.setProps(el,'switch',props);
    var config = that.config = $.extend(true,{},el.vnode.props.switch);
    that.template = ['<div class="dui-switch'+function(){
        return config.activeValue==config.value ? ' is-checked':'';
    }()+'">',
        function(){
            return that.config.inactiveText ? '<span class="dui-switch__label dui-switch__label--left'+function(){
                return config.inactiveValue==config.value ? " is-active":'';
            }()+'"><span>'+config.inactiveText+'</span></span>':'';
        }(),
        '<span class="dui-switch__core" style="width: '+config.width+'px;"></span>',
        function(){
            return that.config.activeText ? '<span class="dui-switch__label dui-switch__label--right'+function(){
                return config.activeValue==config.value ? " is-active":'';
            }()+'"><span>'+config.activeText+'</span></span>' : '';
        }(),
    '</div>'].join('');
    //设置checkbox选中
    $(el).prop("checked",true)
    //判断是否已经渲染过了
    var $dom = that.$showDom = $(that.template),
    hasRender = $(el).next('.'+ClassName.switch);
    //如果已经渲染了，就移除渲染的元素
    hasRender[0] && (el.value = that.originalValue) && hasRender.remove();
    $(el).after($dom);
    //设置点击事件
    $dom.off('click').on('click',function(e){
        if(config.disabled){
            return;
        }
        //获取当前值
        var othis = $(that.el),value = othis.val();
        if(dui.convertProp(value,props.value.type)==that.config.activeValue){
            //当前是选中
            othis.val(that.config.inactiveValue);
            $dom.removeClass('is-checked');//移除选中样式
            $dom.find('.'+ClassName.switchLabelLeft).addClass('is-active');
            $dom.find('.'+ClassName.switchLabelRight).removeClass('is-active');
        }else{
            //当前没有选中
            othis.val(that.config.activeValue);
            $dom.addClass('is-checked');//移除选中样式
            $dom.find('.'+ClassName.switchLabelLeft).removeClass('is-active');
            $dom.find('.'+ClassName.switchLabelRight).addClass('is-active');
        }
        //手动回调一下
        othis[0] && othis.change && othis.change()
        el.vnode.event.switch && el.vnode.event.switch.change && el.vnode.event.switch.change.call(el,othis.val());
    })
    return that;
},
Checkbox=function(el,options){
    var that = this,
    props={
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
        state:{
            type:[Boolean,String],
            default:false
        },
        items:String
    };
    dui.setData(el,'checkbox',{},options);
    dui.setProps(el,'checkbox',props);
    that.el = el;
    // 配置信息
    var config = that.config = $.extend(true,{},el.vnode.props.checkbox),
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
    // 显示的jquery元素
    $showDom = that.$showDom = $(template),
    // 当前所属的form
    thisForm = $(el).parents(Selector.form),
    // 赛选器
    filter=Selector.checkbox+'[name="'+config.items+'"]',
    // 选中样式
    checkClass="is-checked",
    // 是否已经渲染过的选择器
    hasRenderSelector = '.'+ClassName.checkbox+(config.buttoned?'-button':'')+'__inner',
    // 用来判断是否已经渲染过的元素
    hasRender = $(el).prev(hasRenderSelector);
    // 如果是用来做全选的则去除掉name
    config.indeterminate && $(el).removeAttr('name');
    // 判断是否已经渲染过,已经渲染过就删除掉
    hasRender[0] && 
    // 先把原始元素移动到显示元素的兄弟节点
    hasRender.parents('.'+ClassName.checkbox).after(el) && 
    // 移除显示元素
    hasRender.parents('.'+ClassName.checkbox).remove();
    // 插入显示元素
    $(el).after($showDom) && 
    // 隐藏原始元素
    $showDom.find(hasRenderSelector).after(el);
    // 设置元素的选中状态
    el.checked = (config.checked && config.indeterminate!==true) ?  true : false;
    // 设置事件
    // 如果disabled
    if(config.disabled){
        return;
    }
    $showDom.off('click').on('click',function(e){
        // 当前被点击的对象
        var othis = $showDom,
        // 当前被点击的checkbox
        thisCheckbox = $(el),
        // 当前的选择状态
        checked=thisCheckbox.prop('checked');
        // 如果是用来当做全选的元素
        if(config.indeterminate){
            if(othis.find('.'+ClassName.checkboxInput).hasClass('is-indeterminate')){
                checked = false;
            }else{
                if(othis.hasClass(checkClass)){
                    checked = true;
                }else{
                    checked = false;
                }
            }
        }
        that.setChecked(!checked);
        //手动回调一下
        thisCheckbox[0] && thisCheckbox.change && thisCheckbox.change()
        el.vnode.event.checkbox && el.vnode.event.checkbox.change && el.vnode.event.checkbox.change.call(el,thisCheckbox.prop('checked'));
    })
},
Radio=function(el,options){
    var that = this,
    props = {
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
    };
    dui.setData(el,'checkbox',{},options);
    dui.setProps(el,'checkbox',props);
    var config = that.config = $.extend(true,{},el.vnode.props.checkbox),
    group = $(el).parents('.'+ClassName.radioGroup).length>0 ? $(el).parents('.'+ClassName.radioGroup):$(el).parents(Selector.form),
    checkClass = config.buttoned ? 'is-active' : 'is-checked',
    mrchecked = function(){
        if(group.find(Selector.radio+'[name="'+config.name+'"][checked]').length==1 && config.checked){
            return ' '+checkClass;
        }else{
            $(el).prop('checked',false);
            $(el).removeAttr('checked');
            return '';
        }
    }(),
    template = that.template = ['<div class="dui-radio'+(config.buttoned ? '-button' : '')+(config.bordered?' is-bordered':'')+(mrchecked?' '+checkClass:'')+(config.disabled?' is-disabled':'')+'">',
        (!config.buttoned ? '<span class="dui-radio__input'+(mrchecked?' is-checked':'')+(config.disabled ? ' is-disabled' :'')+'">':''),
            '<span class="dui-radio'+(config.buttoned?'-button':'')+'__inner">'+(config.buttoned?config.label:'')+'</span>',
        (!config.buttoned ? '</span>' : ''),
        (!config.buttoned ? '<span class="dui-radio__label">'+config.label+'</span>':''),
    '</div>'].join(''),
    $dom = that.$showDom = $(template),
    hasRenderSelector = '.'+ClassName.radio+(config.buttoned?'-button':'')+'__inner',
    hasRender = $(el).prev(hasRenderSelector);
    hasRender[0] && hasRender.parents('.'+ClassName.radio).after(el) && hasRender.parents('.'+ClassName.radio).remove();
    $(el).after($dom) && $dom.find(hasRenderSelector).after(el);
    //设置事件
    $dom.on('click',function(e){
        if(config.disabled){
            return;
        }
        var othis = $(el),thischecked = othis.prop('checked');
        if(thischecked===false){
            //没有选中则设置选中
            group.find(Selector.radio+'[name="'+config.name+'"]').prop('checked',false);
            othis.prop('checked',true);
            //设置选中样式
            //首先设置其他选择框为不选中
            group.find(Selector.radio+'[name="'+config.name+'"]').parents('.'+ClassName.radio+(config.buttoned?'-button':'')).removeClass(checkClass);
            checkClass == 'is-checked' ? (group.find(Selector.radio+'[name="'+config.name+'"]').parents('.'+ClassName.radioInput).removeClass(checkClass)): '';
            //然后再设置当前选择框选中
            $dom.addClass(checkClass);
            checkClass == 'is-checked' ? (othis.parents('.'+ClassName.radioInput).addClass(checkClass)):'';
            //手动回调一下
            othis[0] && othis.change && othis.change()
            el.vnode.event.radio && el.vnode.event.radio.change && el.vnode.event.radio.change.call(el,othis.prop('checked'));
        }
    })
},
Select = function(el,options){
    var that = this,elements = that.elements = {},
    props = {
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
    };
    that.state = {
        inited:false
    };
    dui.setData(el,'checkbox',options);
    dui.setProps(el,'checkbox',props);
    var config = that.config = $.extend(true,{},el.vnode.props.checkbox),
    hasRender = $(el).next('.'+ClassName.select),
    getOptData = function(elem){
        var res = [];
        var childrens = $(elem).children();
        childrens.each(function(i,opt){
            var item = {};
            if(opt.tagName.toLowerCase()==='optgroup'){
                item.label = $(opt).attr('label');
                item.type = 'group';
                if(opt.children.length>0){
                    item.childrens =  getOptData(opt);
                }
            }else if(opt.tagName.toLowerCase()==='option'){
                item.type = 'item';
                item.label = $(opt).text();
                item.value = $(opt).val();
                item.selected = typeof $(opt).attr('selected') !=="undefined" ? true : false;
                item.disabled = typeof $(opt).attr('disabled') !=="undefined" ? true : false;
            }
            res.push(item);
        })
        return res;
    },
    getOptHtml = function(data){
        var returnHtml = '';
        $.each(data,function(i,item){
            if(item.type=='group'){
                returnHtml +='<ul class="dui-select-group__wrap"><li class="dui-select-group__title">'+item.label+'</li><li>'+function(){
                    if(item.childrens){
                        return '<ul class="dui-select-group">'+getOptHtml(item.childrens)+'</ul>'
                    }
                }()+'</li></ul>';
            }else if(item.type=='item'){
                returnHtml += '<li class="dui-select-dropdown__item'+(item.disabled?' is-disabled':'')+(item.selected?' selected':'')+'" dui-value="'+item.value+'"><span>'+item.label+'</span></li>';
            }
        })
        return returnHtml;
    },
    getAlltag = function(){
        var tags = {};
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
        return tags
    },
    show = function(){
        $('body').append(pop);
        // 设置input的focuse状态
        elements.input.addClass('is-focuse');
        // 给选项角标添加样式
        caret.addClass('is-reverse');
        // 设置弹出框的宽度
        optDom.css('min-width',clickDom.outerWidth());
        // 手动修改一下
        that.popper.updatePopper();
        // 设置当前的显示状态
        that.isShow = true;
        // 显示元素方法
        that.transition.show();
    },
    hide = function(){
        // 取消input的focuse状态
        elements.clickDom.removeClass('is-focuse');
        // 给选项角标添加样式
        caret.removeClass('is-reverse');
        // 设置当前的显示状态
        that.isShow = false;
        // 隐藏元素方法
        that.transition.hide();
    },
    value   = that.value   = config.multiple ? [] : '',
    optData = that.optData = getOptData(el),
    tags    = that.tags    = getAlltag(),
    optHtml = that.optHtml = [
        '<div class="dui-select-dropdown dui-popper'+(config.multiple ? ' is-multiple':'')+'" style="display:none">',
            '<ul class="dui-select-dropdown__list">'+getOptHtml(optData)+'</ul>',
            '<div x-arrow="" class="popper__arrow"></div>',
        '</div>'
    ].join(' '),
    clickHtml = ['<div class="'+ClassName.select+(config.size ? ' '+ClassName.select+'--'+config.size:'')+'">',
        // 是否有多选
        (config.multiple ? '<div class="dui-select__tags"><span></span></div>':''),
        '<div class="dui-input'+(config.size ? ' dui-input--'+config.size:'')+' dui-input--suffix'+(config.disabled ? ' is-disabled':'')+'">',
            '<input class="dui-input__inner dui-input--suffix"'+(!config.filterable ? ' readonly="readonly"':'')+' placeholder="'+config.placeholder+'"'+(config.disabled ? 'disabled="disabled"':'')+'>',
            // 显示箭头按钮
            '<span class="dui-input__suffix">',
                '<span class="dui-input__suffix-inner">',
                    '<i class="dui-select__caret dui-input__icon dui-icon-arrow-up"></i>',
                    //清除按钮
                    (config.clearable ? '<i class="dui-select__caret dui-input__icon '+ClassName.selectClearable+'" style="display:none"></i>':''),
                '</span>',
            '</span>',
        '</div>',
    '</div>'].join(''),
    // 原始的元素 select
    original    =  elements.original = $(el),
    // 没有option显示
    emptyDom   =  elements.emptyDom = $(['<p class="dui-select-dropdown__empty">'+
        '无匹配数据'+
    '</p>'].join('')),
    // 点击元素
    clickDom   =  elements.clickDom = $(clickHtml),
    // 输入框外部元素
    input      =  elements.input = elements.clickDom.find('.dui-input'),
    // 输入框内部元素
    inputInner =  elements.inputInner = elements.clickDom.find('.dui-input__inner'),
    // caret元素
    caret      =  elements.caret      = elements.clickDom.find('.dui-select__caret'),
    // popper显示元素
    optDom     =  elements.optDom = $(optHtml),
    // 选项元素
    opts       =  elements.opts   = optDom.find('.'+ClassName.selectOption);
    // 给选项添加滚动条
    that.scrollbar = dui.addScrollBar(optDom.find('.dui-select-dropdown__list')[0],{
        wrapClass:'dui-select-dropdown__wrap'
    });
    // 添加显示元素
    hasRender[0] && hasRender.remove();
    $(el).css('display','none').after(clickDom);
    // 添加选项元素
    clickDom.append(optDom)
    optDom.css('min-width',inputInner.outerWidth());
    // 设置popper
    var ref = clickDom[0],pop = optDom[0];
    var x = {top:'bottom','bottom':'top'};
    that.popper = dui.addPopper(ref,pop,{
        arrowOffset:35,
        onCreate:function(data){
            that.transition = dui.transition(pop,{
                name:'dui-zoom-in-'+x[data._options.placement]
            });
        },
        onUpdate:function(data){
            that.transition.data.name = 'dui-zoom-in-'+x[data.placement];
            optDom.css('min-width',clickDom.outerWidth());
        }
    });
    // 设置默认值
    if(config.multiple){
        //多选
        original.find('option[selected]').each(function(i,slt){
            var val = $(slt).val();
            if($.inArray(val,value)==-1){
                that.value.push(val);
            }
        })
    }else{
        //单选
        original.find('option[selected]').each(function(i,slt){
            that.value = $(slt).val();
        })
    }
    that.setValue();
    if(config.disabled) return;
    // 设置事件
    dui.on(clickDom[0],'click',function(e){
        e.stopPropagation();
        if(that.isShow){
            hide();
        }else{
            show();
        }
    })
    // 设置选项点击事件
    opts.on('click',function(e){
        var othis = $(this),val = othis.attr('dui-value');
        if(config.multiple){
            if(othis.hasClass('selected')){
                that.value.splice($.inArray(val,value),1)
            }else{
                if($.inArray(val,value)==-1){
                    that.value.push(val);
                } 
            }
        }else{
            that.value = val;
            // 关闭选项显示页面
            hide();
        }
        that.setValue();
    })
    // 设置tag的关闭事件
    $.each(tags,function(v,tag){
        dui.on(tag.children[1],'click',function(e){
            e.stopPropagation();
            that.value.splice($.inArray(v,that.value),1)
            that.setValue();
        })
    })
    // 设置显示清除按钮和点击事件
    if(config.clearable){
        clickDom.hover(function(){
            if(that.value.length>0){
                clickDom.find('.dui-icon-arrow-up').css('display','none');
                clickDom.find('.'+ClassName.selectClearable).css('display','');
            }
        },function(e){
            clickDom.find('.dui-icon-arrow-up').css('display','');
            clickDom.find('.'+ClassName.selectClearable).css('display','none');
        });
        clickDom.find('.'+ClassName.selectClearable).on('click',function(e){
            e.stopPropagation();
            value = that.value = config.multiple?[]:'';
            that.setValue();
        })
    }
    // 搜索
    if(config.filterable){
        inputInner.on('input',function(e){
           var value = this.value,keyCode = e.keyCode;
           if(keyCode === 9 || keyCode === 13 
                || keyCode === 37 || keyCode === 38 
                || keyCode === 39 || keyCode === 40
            ){
                return false;
            }
            // 判断是否存在选项
            opts.each(function(i,opt){
                var othis = $(opt),
                text = othis.text(),
                isNot = text.indexOf(value) === -1;
                // 设置样式
                othis[isNot ? 'addClass':'removeClass'](ClassName.hide);

            })
            // 如果有group的情况下
            $(optDom).find('.dui-select-group__wrap').each(function(i,group){
                var othis = $(group);
                //判断选项和隐藏选项是否一样多是则隐藏自己，否则就显示
                if(othis.find('.'+ClassName.selectOption+'.'+ClassName.hide).length==othis.find('.'+ClassName.selectOption).length){
                    othis.addClass(ClassName.hide);
                }else{
                    othis.removeClass(ClassName.hide);
                }
            })
            // 判断没有选项个数和总体个数
            // 搜索后的隐藏个数
            var hideNum = optDom.find('.'+ClassName.selectOption+'.'+ClassName.hide).length;
            // 如果隐藏个数等于总个数
            if(hideNum==opts.length){
                $(that.scrollbar.scroll).addClass('is-empty');
                $(that.scrollbar.scroll).after(emptyDom);
            }else{
                $(that.scrollbar.scroll).removeClass('is-empty');
                emptyDom.remove();
            }
        })
    }
    // 给docment设置点击的时候关闭
    dui.on(document,'click',function(e){
        var othis = $(e.target);
        //不是当前元素
        if(elements.optDom.find(othis)[0] || elements.optDom[0]==othis[0]){
            return false;
        }
        hide();
    })
},
Selector={
    form:'[dui-form]',
    switch:'input[type="checkbox"][dui-switch]',
    checkbox:'input[type="checkbox"][dui-checkbox]',
    radio:'input[type="radio"][dui-radio]',
    select:'select[dui-select]'
},
ClassName={
    switch:'dui-switch',
    switchLabelLeft:'dui-switch__label--left',
    switchLabelRight:'dui-switch__label--right',
    checkbox:'dui-checkbox',
    checkboxInput:'dui-checkbox__input',
    radio:'dui-radio',
    radioInput:'dui-radio__input',
    radioGroup:'dui-radio-group',
    select:'dui-select',
    selectOption:'dui-select-dropdown__item',
    selectClearable:'dui-icon-circle-close',
    hide:'dui-hide',
};
form.Item = form.prototype={
    //初始化form
    init:function(el,options,rendered){
        var that = this;
        that.el = el;
        if(el.vnode){
            delete el.vnode;
        }
        dui.setData(el,'form',{
            rule:false
        },options);
        var submit = function(e){
            var data = el.vnode.data.form;
            var event = el.vnode.event.form;
            if(event['submit'] && typeof event['submit']==="function"){
                event['submit'].call(el,e);
            }
            if(!data.rule){
                //查看dom是否有规则

            }
            return true;
        }
        // dui.off(el,'submit') && dui.on(el,'submit',submit);
        $(el).off('submit').on('submit',submit);
        //初始化元素
        !rendered ? form.render(el) : '';
        return that;
    },
    switch:Switch,
    checkbox:Checkbox,
    radio:Radio,
    select:Select
};
form.render = function(el,type,filter,options){
    var filter = filter ? '[dui-filter="'+filter+'"]' : '',
    Item = {
        switch:function(){
            $(el).find(Selector.switch+filter).each(function(i,swc){
                swc.switchClass = new form.Item.switch(swc,options);
            })
        },
        checkbox:function(){
            $(el).find(Selector.checkbox).each(function(i,cbx){
                cbx.checkboxClass = new form.Item.checkbox(cbx,options);
            })
        },
        radio:function(){
            $(el).find(Selector.radio).each(function(i,rdo){
                rdo.radioClass = new form.Item.radio(rdo,options);
            })
        },
        select:function(){
            $(el).find(Selector.select).each(function(i,slt){
                slt.selectClass = new form.Item.select(slt,options);
            })
        }
    };
    el.vnode ? new form.Item.init(el,{},true) : '';
    type ? (Item[type] && Item[type]()) :
    ($.each(Item,function(key,item){
        item();  
    }))
}
form.init = function(filter,options){
    var filter = filter ? '[dui-filter="'+filter+'"]' : '',
    forms = $(Selector.form+filter);
    var list = [];
    forms.each(function(i,item){
        list.push(new form.Item.init(item,options));
    })
    if(list.length>1){
        return list;
    }else{
        return list[0];
    }
}
Select.prototype.setValue = function(data){
    var that = this,config=that.config,elements=that.elements,
    opts = elements.optDom.find('.'+ClassName.selectOption),
    tagdom = elements.clickDom.find('.dui-select__tags>span');
    if(data) that.value = data;
    if(that.value.length==0){
        // 没有设置值
        elements.inputInner.val(''),elements.original.val(null);
        config.multiple &&  elements.inputInner.attr('placeholder',config.placeholder);
    }else{
        // 有值
        elements.original.val(that.value);
        if(config.multiple){
            elements.inputInner.attr('placeholder','');
        }
    }
    // 清空tag样式
    tagdom.html('');
    // 清除选中样式
    opts.removeClass('selected');
    // 设置样式
    if(config.multiple){
        //多选
        $.each(that.value,function(i,v){
            var selOpt = elements.optDom.find('.'+ClassName.selectOption+'[dui-value="'+v+'"]');
            selOpt.addClass('selected');
            //设置tag
            tagdom.append(that.tags[v]);
        })
        var tagHeight = parseFloat(tagdom.parent().outerHeight()),
        inputInnerHeight = parseFloat(elements.inputInner.outerHeight());
        // 设置文本框的高度
        if(tagHeight>inputInnerHeight || inputInnerHeight>36){
            elements.inputInner.css('height',parseFloat(tagHeight)+6);
        }else{
            elements.inputInner.css('height','');
        }
    }else{
        //单选
        var selOpt = elements.optDom.find('.'+ClassName.selectOption+'[dui-value="'+that.value+'"]');
        selOpt.addClass('selected');
        elements.inputInner.val(selOpt.text());
    }
    // 跟新一下popper
    that.popper.updatePopper();
    // 设置回调函数
    if(that.state.inited){
        var events = elements.original[0].vnode.event;
        elements.original.change && elements.original.change();
        events.select && events.select.change 
        && typeof events.select.change === "function" 
        && events.select.change.call(elements.original,that.value);
    }else{
        that.state.inited = true;
    }
}
Checkbox.prototype.setChecked = function(checked){
    var that = this,config= that.config,el=that.el;
    var thisCheckbox = $(el),
    othis = thisCheckbox.parents('.dui-checkbox'),
    checkClass="is-checked";
    if(checked==='indeterminate' && config.indeterminate){
        thisCheckbox.prop('checked',false)
        othis.find('.'+ClassName.checkboxInput).removeClass('is-checked').addClass('is-indeterminate')
        othis.removeClass('is-checked');
        !config.buttoned && othis.find('.'+ClassName.checkboxInput).removeClass('is-checked');
    }
    else if(checked===true){
        //设置选中
        !config.indeterminate ? thisCheckbox.prop('checked',true) : thisCheckbox.prop('checked',false);
        othis.addClass(checkClass);
        !config.buttoned && othis.find('.'+ClassName.checkboxInput).addClass(checkClass);
        config.indeterminate && othis.find('.'+ClassName.checkboxInput).removeClass('is-indeterminate');
    }else{
        //设置不选中
        thisCheckbox.prop('checked',false);
        othis.removeClass(checkClass);
        !config.buttoned && othis.find('.'+ClassName.checkboxInput).removeClass(checkClass);
        config.indeterminate && othis.find('.'+ClassName.checkboxInput).removeClass('is-indeterminate');
    }
}
form.init();
export default form;
dui.define(['jquery'],function($){
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
            items:String
        };
        dui.setData(el,'checkbox',{},options);
        dui.setProps(el,'checkbox',props);
        var config = that.config = $.extend(true,{},el.vnode.props.checkbox),
        template = that.template = ['<div class="dui-checkbox'+(config.buttoned?'-button':'')+(config.checked ? ' is-checked' :'')+(config.disabled ? ' is-disabled' :'')+(config.bordered ? ' is-bordered' :'')+'">',
            (config.buttoned ? '' : ('<span class="dui-checkbox__input'+(config.checked ? ' is-checked' :'')+(config.disabled ? ' is-disabled' :'')+'">')),
                '<span class="dui-checkbox'+(config.buttoned?'-button':'')+'__inner">'+(config.buttoned?config.label:'')+'</span>',
            (config.buttoned ? '' : '</span>'),
            (config.buttoned ? '':function(){
                return config.label ? '<span class="dui-checkbox__label">'+config.label+'</span>':'';
            }()),
        '</div>'].join(''),
        $dom = that.$showDom = $(template),
        form = $(el).parents(Selector.form),filter=Selector.checkbox+'[name="'+config.items+'"]',
        checkClass="is-checked",
        hasRenderSelector = '.'+ClassName.checkbox+(config.buttoned?'-button':'')+'__inner',
        hasRender = $(el).prev('.'+ClassName.checkbox);
        config.indeterminate && $(el).removeAttr('name');
        //判断是否已经渲染过,已经渲染过就删除掉
        hasRender[0] && hasRender.parents('.'+ClassName.checkbox).after(el) && hasRender.parents('.'+ClassName.checkbox).remove();
        $(el).after($dom) && $dom.find(hasRenderSelector).after(el);
        if((config.indeterminate && config.items)){
            //设置当前是否默认勾选
            //设置监听事件
            form.find(filter).on('change',function(){
                if(form.find(filter).length!==form.find(filter+':checked').length){
                    $dom.removeClass(checkClass);
                    if(form.find(filter+':checked').length>0){
                        !config.buttoned && $dom.find('.'+ClassName.checkboxInput).removeClass(checkClass).addClass('is-indeterminate'); 
                    }else{
                        !config.buttoned && $dom.find('.'+ClassName.checkboxInput).removeClass(checkClass).removeClass('is-indeterminate'); 
                    }
                }else{
                    $dom.addClass(checkClass);
                    !config.buttoned && $dom.find('.'+ClassName.checkboxInput).removeClass('is-indeterminate').addClass(checkClass);
                }
            })
        }
        //设置事件
        $dom.off('click').on('click',function(e){
            if(config.disabled){
                return;
            }
            var othis = $(el),checked = othis.prop('checked');
            if(config.indeterminate){
                if($dom.find('.'+ClassName.checkboxInput).hasClass('is-indeterminate')){
                    $dom.find('.'+ClassName.checkboxInput).removeClass('is-indeterminate').addClass(checkClass)
                    $dom.addClass(checkClass);
                    //选中其他
                    //表示选中
                    form.find(filter).prop('checked',true);
                    (form.find(filter).parents('.'+ClassName.checkbox)[0] ?  form.find(filter).parents('.'+ClassName.checkbox) : form.find(filter).parents('.'+ClassName.checkbox+'-button'))
                    .addClass(checkClass)
                    .find(ClassName.checkboxInput)
                    .addClass(checkClass);
                }else{
                    if($dom.hasClass(checkClass)){
                        $dom.removeClass(checkClass);
                        !config.buttoned && $dom.find('.'+ClassName.checkboxInput).removeClass(checkClass);
                        //表示不选中
                        form.find(filter).prop('checked',false);
                        
                        (form.find(filter).parents('.'+ClassName.checkbox)[0] ?  form.find(filter).parents('.'+ClassName.checkbox) : form.find(filter).parents('.'+ClassName.checkbox+'-button'))
                        .removeClass(checkClass)
                        .find('.'+ClassName.checkboxInput)
                        .removeClass(checkClass);
                    }else{
                        $dom.addClass(checkClass);
                        !config.buttoned && $dom.find('.'+ClassName.checkboxInput).addClass(checkClass);
                        //表示选中
                        form.find(filter).prop('checked',true);
                        (form.find(filter).parents('.'+ClassName.checkbox)[0] ?  form.find(filter).parents('.'+ClassName.checkbox) : form.find(filter).parents('.'+ClassName.checkbox+'-button'))
                        .addClass(checkClass)
                        .find('.'+ClassName.checkboxInput)
                        .addClass(checkClass);
                    }
                }

            }else{
                if(checked===false){
                    //设置选中
                    othis.prop('checked',true);
                    $dom.addClass(checkClass);
                    !config.buttoned && $dom.find('.'+ClassName.checkboxInput).addClass(checkClass);
                }else{
                    //设置不选中
                    othis.prop('checked',false);
                    $dom.removeClass(checkClass);
                    !config.buttoned && $dom.find('.'+ClassName.checkboxInput).removeClass(checkClass);
                }
            }
            //手动回调一下
            othis[0] && othis.change && othis.change()
            el.vnode.event.checkbox && el.vnode.event.checkbox.change && el.vnode.event.checkbox.change.call(el,othis.prop('checked'));
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
        hasRender = $(el).prev('.'+ClassName.radio);
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
            clearable:Boolean,//是否有清除按钮
            placeholder:String,//没有选中的显示值
            filterable:false,//是否允许搜索
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
        show = function(){
            $('body').append(pop);
            // 设置input的focuse状态
            elements.input.addClass('is-focuse');
            // 给选项角标添加样式
            caret.addClass('is-reverse');
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
        value   = that.value   = config.multiple ? [] : '';
        optData = that.optData = getOptData(el),
        optHtml = that.optHtml = [
            '<div class="dui-select-dropdown dui-popper" style="display:none">',
                '<ul class="dui-select-dropdown__list">'+getOptHtml(optData)+'</ul>',
                '<div x-arrow="" class="popper__arrow"></div>',
            '</div>'
        ].join(' '),
        clickHtml = ['<div class="'+ClassName.select+'">',
            // 是否有多选
            (config.multiple ? '<div class="dui-select__tags"><span></span></div>':''),
            '<div class="dui-input">',
                '<input class="dui-input__inner dui-input--suffix"'+(!config.filter ? ' readonly="readonly"':'')+' placeholder="'+config.placeholder+'">',
                // 显示箭头按钮
                '<span class="dui-input__suffix">',
                    '<span class="dui-input__suffix-inner">',
                        '<i class="dui-select__caret dui-input__icon dui-icon-angle-up"></i>',
                    '</span>',
                '</span>',
                // 显示清除按钮
                (config.clearable ? ['<span class="dui-input__suffix" style="display:none">',
                '<span class="dui-input__suffix-inner">',
                    '<i class="dui-select__caret dui-input__icon el-icon-arrow-up"></i>',
                '</span>',
            '</span>'].join(''):''),
            '</div>',
        '</div>'].join(''),
        // 原始的元素 select
        original    =  elements.original = $(el),
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
        opts       =  elements.opts   = optDom.find('.dui-select-dropdown__item');
        // 给选项添加滚动条
        that.scrollbar = dui.addScrollBar(optDom.find('.dui-select-dropdown__list')[0],{
            wrapClass:'dui-select-dropdown__wrap'
        });
        // 添加显示元素
        hasRender[0] && hasRender.remove();
        $(el).css('display','none').after(clickDom);
        // 添加选项元素
        optDom.css('min-width',clickDom.outerWidth());
        clickDom.append(optDom)
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
                if($.inArray(value,val)==-1){
                    value.push($(slt).val());
                }
            })
        }else{
            //单选
            original.find('option[selected]').each(function(i,slt){
                 value = $(slt).val();
            })
        }
        that.setValue();
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
                if($.inArray(that.value,val)==-1){
                    that.value.push(val);
                }
            }else{
                that.value = val;
                // 关闭选项显示页面
                hide();
            }
            that.setValue();
        })
        // 设置清除事件

        // 给docment设置点击的时候关闭
        dui.on(document,'click',function(e){
            e.preventDefault();
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
    Select.prototype.setValue = function(data){
        var that = this,config=that.config,elements=that.elements,
        opts = elements.optDom.find('.dui-select-dropdown__item');
        if(data) that.value = data;
        if(that.value.length==0){
            // 没有设置值
            elements.inputInner.val(''),elements.original.val(null);
            config.multiple &&  elements.inputInner.attr('placeholder',config.placeholder);
        }else{
            // 有值
            elements.original.val(that.value);
        }
        // 设置显示样式
        opts.removeClass('selected').each(function(i,opt){
            var val = $(opt).attr('dui-value'),
            title = $(opt).text();
            if(config.multiple){
                //多选
                if($.inArray(val,that.value)!=-1){
                    $(opt).addClass('selected');
                }
            }else{
                //单选
                if(val==that.value){
                    $(opt).addClass('selected');
                    elements.inputInner.val(title);
                }
            }
        })
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
    form.render = function(el,type,filter,options){
        var filter = filter ? '[dui-filter="'+filter+'"]' : '',
        Item = {
            switch:function(){
                $(el).find(Selector.switch+filter).each(function(i,swc){
                    new form.Item.switch(swc,options);
                })
            },
            checkbox:function(){
                $(el).find(Selector.checkbox).each(function(i,cbx){
                    new form.Item.checkbox(cbx,options);
                })
            },
            radio:function(){
                $(el).find(Selector.radio).each(function(i,rdo){
                    new form.Item.radio(rdo,options);
                })
            },
            select:function(){
                $(el).find(Selector.select).each(function(i,slt){
                    new form.Item.select(slt,options);
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
    form.init();
    return form;
})
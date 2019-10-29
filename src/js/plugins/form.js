import $ from "jquery";
var FORM_NODE='[dui-form]',
INIT_FORM = '[dui-init]',
SUBMIT_BTN = 'dui-submit',
SWITCH = '[dui-switch]',
// 提交验证方法
submit = function(e){
    console.log('我是form，我进来了');
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
 * 开关渲染类
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
    var $dom = that.$dom = $(template),
    // 获取已经渲染了的元素
    hasRender = $(el).next('.'+setting.CLASS);
    // 如果已经渲染了，就移除渲染的元素,还原默认值
    hasRender[0] && (el.value = that.originalValue) && 
    (config.checked==false?$(el).prop('checked',false):'') && 
    hasRender.remove();
    // 添加显示元素在页面
    $(el).after($dom);
    // 设置点击事件
    $dom.on('click',function(e){
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
            $dom.removeClass('is-checked');//移除选中样式
            $dom.find(setting.LABEL_LEFT).addClass('is-active');
            $dom.find(setting.LABEL_RIGHT).removeClass('is-active');
            if(config.skin=='label-in'){
                $dom.find(setting.CORE).find('em').text(config.inactiveText);
            }
            //颜色
            $dom.find(setting.CORE).css('background',config.inactiveColor);
            //颜色
            $dom.find(setting.CORE).css('border-color',config.inactiveColor);
        }else{
            //设置当前是选中
            othis.val(that.config.activeValue);
            $dom.addClass('is-checked');//移除选中样式
            $dom.find(setting.LABEL_LEFT).removeClass('is-active');
            $dom.find(setting.LABEL_RIGHT).addClass('is-active');
            if(config.skin=='label-in'){
                $dom.find(setting.CORE).find('em').text(config.activeText);
            }
            //颜色
            $dom.find(setting.CORE).css('background',config.activeColor);
            //颜色
            $dom.find(setting.CORE).css('border-color',config.activeColor);
        }
        //手动回调一下
        othis[0] && othis.change && othis.change()
        el.events && el.events.beforeChange && dui.trigger.call(el,'change',done);
    }
    return that;
}
form.init();
export default form;
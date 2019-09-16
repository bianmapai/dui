
// jquery
import $ from "jquery";
// 编辑器
import codemirror from "./lib/codemirror";
// 编辑器模式帮助库
import "./lib/modutils";
// 编辑器markdown模式解析库
import "./lib/markdown";
// 编辑器markdown模式gmf解析库
import "./lib/gfm";
// 解析器编译后的
import  marked from "./lib/gfmParser";
// 编辑器的一些基本信息
mdEditor.title = 'mdEditor'; //编辑器名字
// mdEditor运行路径方便以后使用模式，插件，主题
mdEditor.path = getMdEditorPath();//编辑器路径
mdEditor.version = '1.0.0';//当前版本
mdEditor.homePage= 'https://github.com/a876771120/dui';//GitHub地址
mdEditor.classPrefix = 'dui-mdeditor';//样式名
mdEditor.guid = 0;//用来生成唯一id的变量
mdEditor.$codeMirror = codemirror;
mdEditor.$marked = marked;
// 工具条点击的回调功能方法配置
mdEditor.callBackConfig = {
    bold:{
        prefix:'**',
        suffix:'**',
    },
    italic:{
        prefix:'*',
        suffix:'*',
    },
    underline:{
        prefix:'++',
        suffix:'++',
    },
    strikethrough:{
        prefix:'~~',
        suffix:'~~',
    },
    mark:{
        prefix:'==',
        suffix:'==',
    },
    alignleft:{
        prefix:'::: align-left\n\n',
        suffix:'\n\n:::',
    },
    aligncenter:{
        prefix:'::: align-center\n\n',
        suffix:'\n\n:::',
    },
    alignright:{
        prefix:'::: align-right\n\n',
        suffix:'\n\n:::',
    },
    quote:{
        prefix:'> ',
        suffix:'',
    },
    'list-ol':{
        prefix:'1. ',
        suffix:'',
    },
    'list-ul':{
        prefix:'- ',
        suffix:'',
    },
    'code':{
        prefix:'```markdown\n\n',
        suffix:'\n\n```',
    }
}
// 本插件样式名称
mdEditor.className = {
    toolbarContainer:mdEditor.classPrefix+'__toolbar',//工具条容器
    toolbarLeftContainer:mdEditor.classPrefix+'__toolbar-left',//工具栏左侧样式
    toolbarRightContainer:mdEditor.classPrefix+'__toolbar-right',//工具栏右侧样式
    toolbarDivider:mdEditor.classPrefix+'__toolbar-divider',
    toolbarOperation:mdEditor.classPrefix+'__toolbar-op',//操作按钮
    toolbarTip:mdEditor.classPrefix+'__toolbar-tip',//操作提示
    panelContainer:mdEditor.classPrefix+'__panel',//面板容器
    editorContainer:mdEditor.classPrefix+'__edit',
    previewContainer:mdEditor.classPrefix+'__show',
    stanceContainer:mdEditor.className+'__stance',
}
mdEditor.toolbarHasStatusIcons = ['preview','fullscreen','readmodel','fullscreen','subfield','catalog'];
// 编辑器默认配置信息
mdEditor.defaults = {
    el:'',//编辑器容器
    path:'',//当前mdEditor所在的路径
    width:'auto',//宽度
    height:'auto',//高度
    subfield:true,//分栏展示
    preview:true,//查看视图
    fullscreen:false,//全屏
    syncScrolling:true,//病毒同步滚动条
    saveDelay:200,//自动转换延迟时间，毫秒
    htmlDecode:false,//关闭忽略HTML标签，即开启识别HTML标签，默认为false
    // 编辑器的个性化配置
    codeMirror:{},
    // 解析器个性化配置
    marked:{},
    toolBars:{
        left:['bold','italic','header','divider','strikethrough','mark','alignleft','aligncenter','alignright','divider',
        'quote','list-ol','list-ul','divider','link','imagelink','code','table','divider','undo','redo','trash','save'],//左侧按钮
        right:['catalog','preview','fullscreen','readmodel','subfield','divider','htmlcode','help']//右侧按钮
    },
    // 图标
    toolbarIcons:{
        bold:'dui-icon-bold',
        italic:'dui-icon-italic',
        header:'dui-icon-header',
        strikethrough:'dui-icon-strikethrough',
        mark:'dui-icon-mark',
        alignleft:'dui-icon-align-left',
        aligncenter:'dui-icon-align-center',
        alignright:'dui-icon-align-right',
        quote:'dui-icon-quote',
        'list-ol':'dui-icon-list-ol',
        'list-ul':'dui-icon-list-ul',
        link:'dui-icon-link',
        imagelink:'dui-icon-image',
        code:'dui-icon-code',
        table:'dui-icon-table',
        undo:'dui-icon-undo',
        redo:'dui-icon-redo',
        trash:'dui-icon-trash',
        save:'dui-icon-save',
        catalog:'dui-icon-catalog',
        preview:{
            on:'dui-icon-eye-slash',
            off:'dui-icon-eye',
        },
        fullscreen:{
            on:'dui-icon-compress',
            off:'dui-icon-arrows-alt',
        },
        readmodel:'dui-icon-window-maximize',
        subfield:'dui-icon-columns',
        htmlcode:'dui-icon-code',
        help:'dui-icon-question-circle',
    },
    // 拥有状态的按钮
    toolbarHasStatusIcons:[],
    // 自定义的工具栏按钮
    toolbarCustomIcons:{},
    // 使用文字代替图标
    toolbarIconTexts:{},
    // 工具栏的事件处理配置
    toolbarHandlers:{},
    // 工具栏的回调配置
    callBackConfig:{},
    // 语言
    langs:{
        name        : "zh-cn",
        description : "开源markdown编辑器，可集成在任意项目",
        tocTitle    : "目录",
        toolbar     : {
            tip:{
                bold:'粗体 (ctrl+b)',
                italic:'斜体 (ctrl+i)',
                header:'标题 (ctrl+h)',
                strikethrough:'删除线 (ctrl+shift+d)',
                mark:'标记 (ctrl+m)',
                alignleft:'居左 (ctrl+l)',
                aligncenter:'居中 (ctrl+e)',
                alignright:'居右 (ctrl+r)',
                quote:'段落引用 (ctrl+q)',
                'list-ol':'有序列表 (ctrl+o)',
                'list-ul':'无序列表 (ctrl+u)',
                link:'链接',
                imagelink:'插入图片',
                code:'代码块 (ctrl+alt+c)',
                table:'表格 (ctrl+alt+t)',
                undo:'上一步 (ctrl+z)',
                redo:'下一步 (ctrl+y)',
                trash:'清空 (ctrl+del)',
                save:'保存 (ctrl+s)',
                catalog:'目录 (F8)',
                preview:{
                    on:'编辑 (F9)',
                    off:'预览 (F9)',
                },
                fullscreen:{
                    on:'退出全屏 (F10)',
                    off:'全屏 (F10)',
                },
                readmodel:'沉浸阅读 (F11)',
                subfield:{
                    on:'单栏 (F12)',
                    off:'双栏 (F12)',
                },
                htmlcode:'查看html文本',
                help:'markdown语法帮助',
            },
            inset:{
                bold:'粗体',
                italic:'斜体',
                header:'标题',
                strikethrough:'删除线',
                mark:'标记',
                alignleft:'居左',
                aligncenter:'居中',
                alignright:'居右',
                quote:'段落引用',
                'list-ol':'有序列表',
                'list-ul':'无序列表',
                code:'查看html文本',
            }
        },
    },
    
}
// mdEditor所在的路径
function getMdEditorPath(){
    var patharr = getCurSrc().split('/');
    delete patharr[patharr.length-1]
    return patharr.join('/');
}
/**
 * 获取当前运行js的路径
 */
let currentlyAddingScript=null,
interactiveScript = null;
function getCurSrc() {
    if(document.currentScript){
        return document.currentScript.src;
    }
    if (currentlyAddingScript) {
        return currentlyAddingScript.src;
    }
    // For IE6-9 browsers, the script onload event may not fire right
    // after the script is evaluated. Kris Zyp found that it
    // could query the script nodes and the one that is in "interactive"
    // mode indicates the current script
    // ref: http://goo.gl/JHfFW
    if (interactiveScript && interactiveScript.readyState === "interactive") {
        return interactiveScript.src;
    }
  
    var scripts = document.head.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
        var script = scripts[i];
        if (script.readyState === "interactive") {
            interactiveScript = script;
            return interactiveScript.src;
        }
    }
    return null;
}
/**
 * 外部暴露接口
 * @param {Object} options 初始化参数
 */
function mdEditor(options){
    let ins = new Class(options);
    return thisMdEditor.call(ins);
}
/**
 * 当前运行实例
 */
function thisMdEditor(){
    var that = this,config = that.config;
    return {
        config:config,
    };
}
/**
 * 内部初始化接口
 * @param {Object} options 初始化参数
 */
function Class(options){
    var that = this,config = that.config = $.extend(true,mdEditor.defaults,options);
    if(!$(config.el)[0]) throw new Error('Initialization failed because there was no editor container');
    // 编辑器容器
    var el = that.el = $(config.el)
    // 如果容器是textarea，则需要生成容器
    if(!el.is("textarea")) throw new Error('Initialization failed ，Element only is textarea');
    // 设置文本域
    var textarea = that.textarea = el;
    // 是否是渲染过的组件
    var isRender = el.parents('.'+mdEditor.classPrefix);
    // 判断是否已经渲染过了
    if(isRender[0]){
        // 销毁
        that.cm.toTextarea();
        // 移动元素到之前节点
        isRender.before(textarea);
        // 还原textarea的样式
        textarea.css({
            display:el[0].oldDisplay,
            height:el[0].oldHeight
        })
        // 移除之前生成的元素
        isRender.remove();
    }
    // 工具栏的每一个按钮的状态管理器
    that.IconStatusManager = {
        preview:config.preview,
        subfield:config.subfield,
        fullscreen:config.fullscreen
    };
    // 设置编辑器布局
    that.setLayout().setToolbarView().setCodemirror().completed();
}
Class.prototype = {
    /**
     * 设置布局
     * @returns this
     */
    setLayout:function(){
        var that = this,config = that.config;
        // 获取当前textarea宽度
        var height = function(){
            if(config.height=='auto'){
                return that.el.outerHeight();
            }else if(config.height.indexOf('%')){
                return $(window).height() * (Number(config.height)) /100;
            }else{
                return Number(config.height);
            }
        }();
        // 获取当前textarea宽度
        var width = function(){
            if(config.height=='auto'){
                return '100%';
            }else if(config.width.indexOf('%')){
                return config.width;
            }else{
                return Number(config.width);
            }
        }();
        // mdEditor容器
        var mdeditorContainer = that.mdeditorContainer = $('<div class="'+mdEditor.classPrefix+'"></div>');
        // 工具条容器
        var toolbarContainer = that.toolbarContainer = $('<div class="'+mdEditor.className.toolbarContainer+'"></div>');
        // 面板容器
        var panelContainer = that.panelContainer = $(['<div class="'+mdEditor.className.panelContainer+'">',
            '<div class="'+mdEditor.className.editorContainer+'"></div>',
            '<div class="'+mdEditor.className.previewContainer+'"></div>',
        '</div>'].join(''))
        // codemirror容器
        var editorContainer = that.editorContainer = panelContainer.find('.'+mdEditor.className.editorContainer);
        // 视图容器
        var previewContainer = that.previewContainer = panelContainer.find('.'+mdEditor.className.previewContainer);
        // 设置mdEditor的宽高
        mdeditorContainer.css({
            height:height,
            width:width
        })
        // 设置编辑器容器的样式
        $.each(that.IconStatusManager,function(key,status){
            if(status===true){
                editorContainer.addClass(key+'-selected');
            }
        })
        // 添加mdEditor容器
        that.el.after(mdeditorContainer);
        // 添加工具条容器
        mdeditorContainer.append(toolbarContainer);
        // 添加面板容器
        mdeditorContainer.append(panelContainer);
        // 把文本域移动到codemirror容器
        editorContainer.append(that.el);
        // 设置textarea的样式
        that.el[0].oldHeight = that.el.css('height');
        that.el[0].oldDisplay = that.el.css('display');
        that.textarea.css({
            display:'none',
            height:(height-toolbarContainer.outerHeight())
        });
        return that;
    },
    /**
     * 设置工具条视图
     * @returns Class
     */
    setToolbarView:function(){
        var that = this,config = that.config;
        var btnList = {
            left:config.toolBars.left || [],
            right:config.toolBars.right || []
        }
        // 工具栏的每一个按钮的状态管理器
        var IconStatusManager = that.IconStatusManager;
        // 语言
        var tips = config.langs.toolbar.tip;
        // 语言
        var insets = config.langs.toolbar.inset;
        // 图标
        var icons = config.toolbarIcons;
        // 使用文字代替图标
        var iconTexts = config.toolbarIconTexts;
        // 有状态的工具按钮
        var hasStatus = that.hasStatus = mdEditor.toolbarHasStatusIcons.concat(config.toolbarHasStatusIcons);
        // 工具栏左侧容器
        var toolbarLeftContainer = $('<ul class="'+mdEditor.className.toolbarLeftContainer+'"></ul>');
        // 工具栏右侧容器
        var toolbarRightContainer = $('<ul class="'+mdEditor.className.toolbarRightContainer+'"></ul>');
        // 添加工具栏按钮
        $.each(btnList,function(algin,list){
            $.each(list,function(key,item){
                if(typeof item === "string") key = item;
                var info = {
                    icon:function(){
                        if($.inArray(key,hasStatus)===-1){
                            return icons[key] ? icons[key] : '';
                        }else{
                            if(IconStatusManager[key]===true){
                                return icons[key] ? (typeof icons[key]==="string" ? icons[key] : icons[key].on) : '';
                            }else{
                                return icons[key] ? (typeof icons[key]==="string" ? icons[key] : icons[key].off) : '';
                            }
                        }
                    }(),
                    iconText:function(){
                        if($.inArray(key,hasStatus)===-1){
                            return iconTexts[key] ? iconTexts[key] : '';
                        }else{
                            if(IconStatusManager[key]===true){
                                return iconTexts[key] ? (typeof iconTexts[key]==="string" ? iconTexts[key] : iconTexts[key].on) : '';
                            }else{
                                return iconTexts[key] ? (typeof iconTexts[key]==="string" ? iconTexts[key] : iconTexts[key].off) : '';
                            }
                        }
                    }(),
                    tip:function(){
                        if($.inArray(key,hasStatus)===-1){
                            return tips[key] ? tips[key] : '';
                        }else{
                            if(IconStatusManager[key]===true){
                                return tips[key] ? (typeof tips[key]==="string" ? tips[key] : tips[key].on) : '';
                            }else{
                                return tips[key] ? (typeof tips[key]==="string" ? tips[key] : tips[key].off) : '';
                            }
                        }
                    }(),
                    inset:insets[key],
                },btn;
                if(key=='divider'){
                    btn = $('<span class="'+mdEditor.className.toolbarDivider+'"></span>');
                }else{
                    !info.icon && (info.icon = config.toolbarCustomIcons[key]);
                    if(!info.icon && !info.iconText) return;
                    btn = $('<li class="'+mdEditor.className.toolbarOperation+(info.icon ? 
                            (' '+info.icon):'')+(IconStatusManager[key]?' is-selected':'')+'">'+(info.icon?'':(info.iconText))+
                            '<span class="'+mdEditor.className.toolbarTip+'">'+(typeof info.tip==="string" ? info.tip.split(' ')[0]:'')+'</span>'
                        +'</li>');
                    btn[0].key = key;
                    btn[0].title = info.tip || '';
                    // 设置工具栏回调事件
                }
                if(algin=='left'){
                    toolbarLeftContainer.append(btn);
                }else{
                    toolbarRightContainer.append(btn);
                }
            })
        })
        that.toolbarContainer.append(toolbarLeftContainer).append(toolbarRightContainer);
        // 设置工具栏处理事件
        that.setToolbarHandler();
        return that;
    },
    /**
     * 注册定义快捷键
     * @returns Class
     */
    setShortcutKeys:function(){
        var that = this,extraKeys={},config = that.config,
        mac = mdEditor.$codeMirror.keyMap.default == mdEditor.$codeMirror.keyMap.macDefault,
        runKey = (mac ? "Cmd" : "Ctrl");
        //先添加事件
        $.each(that.toolbarHandlers,function(key,info){
            if(info && typeof info.shortcutkey==="function"){
                mdEditor.$codeMirror.commands[key] = function (cm) {
                    info.shortcutkey.call(that.getCallBackParams(),null,cm);
                };
            }
        })
        //粗体
        extraKeys[runKey+'-B'] = 'bold';
        extraKeys[runKey+'-I'] = 'italic';
        extraKeys[runKey+'-U'] = 'underline';
        extraKeys[runKey+'--'] = 'strikethrough';
        extraKeys[runKey+'-Delete'] = 'trash';
        extraKeys[runKey] = 'autocomplete';
        extraKeys[runKey+'-Z'] = 'undo';
        extraKeys[runKey+'-Y'] = 'redo';
        extraKeys['F11'] = 'readmodel';
        extraKeys['F10'] = 'fullscreen';
        return $.extend(true,extraKeys,config.extraKeys);
    },
    /**
     * 绑定默认的事件事件
     * @returns Class
     */
    bindDefaultToolbarHandler:function(){
        var that = this,config = that.config;
        // 事件处理的配置
        var callBackConfig = $.extend(true,mdEditor.callBackConfig,config.callBackConfig);
        // 当前实例事件处理容器
        var toolbarHandlers = that.toolbarHandlers = {};
        // 工具栏的插入语言
        var insets = config.langs.toolbar.inset;
         // 工具栏的提示语言
         var tips = config.langs.toolbar.tip;
        // 所有的工具栏按钮
        var allToolbarBtn = [].concat(config.toolBars.left).concat(config.toolBars.right);
        // 有状态的按钮
        var hasStatus = that.hasStatus;
        // 循环添加默认事件
        $.each(allToolbarBtn,function(i,key){
            // 设置事件容器
            toolbarHandlers[key] = {};
            // 设置点击事件和快捷键事件
            toolbarHandlers[key].click = toolbarHandlers[key].shortcutkey = function(e,cm){
                var othis = this;
                // 沉浸阅读
                if(key=='readmodel'){
                    var screenChange = 'webkitfullscreenchange' || 'mozfullscreenchange' || 'fullscreenchange';
                    var isFullScreen = document.fullscreenElement || document.mozFullScreenElement||document.webkitFullscreenElement;
                    // 开启全屏方法
                    function launchFullScreen(element) {
                         if (element.requestFullscreen) {
                           element.requestFullscreen();
                         } else if (element.mozRequestFullScreen) {
                           element.mozRequestFullScreen();
                         } else if (element.webkitRequestFullscreen) {
                           element.webkitRequestFullscreen();
                         } else if (element.msRequestFullscreen) {
                           element.msRequestFullscreen();
                         }
                    }
                    // 关闭全屏
                    function exitFullscreen() {
                        if(document.exitFullscreen){
                            document.exitFullscreen();
                        }else if(document.mozCancelFullScreen){
                            document.mozCancelFullScreen();
                        }else if(document.webkitExitFullscreen){
                            document.webkitExitFullscreen();
                        }
                    };
                    // 当前就是全屏阅读
                    if(isFullScreen){
                        exitFullscreen();
                    }else{
                        launchFullScreen(that.previewContainer[0]);
                    }
                    // 直接不执行后面
                    return;
                }
                // 如果是有状态的
                if($.inArray(key,hasStatus)!==-1){
                    // 获取状态管理器
                    var status = that.IconStatusManager[key];
                    // 图标样式名
                    var iconClass = (config.toolbarIcons[key] && typeof config.toolbarIcons[key]==="string") ?
                    config.toolbarIcons[key] : (config.toolbarIcons[key] && typeof config.toolbarIcons[key][status?'off':'on']==="string") ?
                    config.toolbarIcons[key][status?'off':'on']:'';
                    // 也可能是使用了文字
                    var iconText = !iconClass ? ((config.toolbarIconTexts[key] && typeof config.toolbarIconTexts[key]==="string") ?
                    config.toolbarIconTexts[key] : (config.toolbarIconTexts[key] && typeof config.toolbarIconTexts[key][status?'off':'on']==="string") ?
                    config.toolbarIconTexts[key][status?'on':'off']:'') : '';
                    // 获取tip
                    var tip = (tips[key] && typeof tips[key]==="string") ?
                    tips[key] : (tips[key] && typeof tips[key][status?'off':'on']==="string") ?
                    tips[key][status?'off':'on']:'';
                    // 按钮的样式名称
                    var btnClass = mdEditor.className.toolbarOperation+' '+iconClass+(status ? '' : ' is-selected');
                    // 当前状态为选中
                    if(status===true){
                        // 设置状态为false
                        that.IconStatusManager[key] = false;
                    }else{
                        // 设置状态为false
                        that.IconStatusManager[key] = true;
                    }
                    // 设置按钮样式
                    othis.toolbarContainer.find('.'+mdEditor.className.toolbarOperation).each(function(i,btn){
                        // 获取了当前的按钮
                        if(key==btn.key){
                            // 当前按钮
                            var $btn = $(btn),$tip = $btn.find('.'+mdEditor.className.toolbarTip);
                            // 设置样式
                            $btn.attr('class',btnClass).attr('title',tip).text(iconText).append($tip);
                            // 设置编辑器样式
                            othis.editorContainer.removeClass(status===true ? (key+'-selected'):'').addClass(status===true ? '':(key+'-selected'));
                            // 设置提示
                            $tip.text(tip.split(' ')[0]);
                            return;
                        }
                    })
                }
                // 如果是有事件的
                if(callBackConfig[key] && typeof callBackConfig[key]==="object"){
                    var info = callBackConfig[key];//配置信息
                    var defaultText = insets[key] ? insets[key]:'';
                    var cursor    = cm.getCursor();
                    var selection = cm.getSelection();
                    var start = {};
                    var end = {};
                    // 获取行数
                    var tmp = /(\n)/.exec(info.prefix);
                    var prefixLine = tmp ? tmp.length : 0;
                    var prefixlen = info.prefix.length - prefixLine + function(){
                        var res = /([\f\t\v])/.exec(info.prefix);
                        return res ? res.length : 0;
                    }()
                    var tmp2 = /(\n)/.exec(info.suffix);
                    var suffixLine = tmp2 ? tmp2.length : 0;
                    var suffixlen = info.suffix.length - suffixLine + function(){
                        var res = /([\f\t\v])/.exec(info.suffix);
                        return res ? res.length : 0;
                    }()
                    if(selection){
                        // 从后往前选
                        if(cursor.sticky=='after'){
                            start.line = cursor.line - prefixLine;
                            end.line = cursor.line + suffixLine;
                            start.ch = prefixLine ? 0 : (cursor.ch-prefixlen);
                            end.ch = cursor.ch +defaultText.length+ suffixlen;
                        }else{
                            start.line = cursor.line - prefixLine;
                            end.line = cursor.line + suffixLine;
                            start.ch = prefixLine ? 0 : (cursor.ch-defaultText.length-prefixlen);
                            end.ch = cursor.ch + suffixlen;
                        }
                        var checkvalue = cm.getRange(start,end)
                        if(checkvalue==info.prefix+selection+info.suffix){
                            cm.setSelection(start,end);
                            if(selection==defaultText){
                                cm.replaceSelection('');
                            }else{
                                cm.replaceSelection(selection);
                            }
                        }else{
                            cm.replaceSelection(info.prefix+selection+info.suffix);
                        }
                    }else{
                        start.line = cursor.line + prefixLine
                        start.ch = prefixLine ? 0 : (cursor.ch + prefixlen);
                        end.line = cursor.line + suffixLine;
                        end.ch = suffixLine ? suffixlen : (cursor.ch + defaultText.length + prefixlen);
                        // 添加字符串
                        cm.replaceSelection(info.prefix+defaultText+info.suffix);
                        // 设置选中
                        cm.setSelection(start,end);
                    }
                }
                // 如果是全屏
                if(key=='fullscreen'){
                    // 站位元素
                    that.stanceContainer = that.stanceContainer ? that.stanceContainer : $('<div class="'+mdEditor.className.stanceContainer+'">');
                    // 退出全屏
                    if(status===true){
                        // 还原元素
                        that.stanceContainer.after(othis.mdeditorContainer);
                        // 移除站位元素
                        that.stanceContainer.remove();
                        // 移除样式
                        othis.mdeditorContainer.removeClass('is-fullscreen');
                    }
                    //进入全屏
                    else{
                        // 插入站位元素
                        othis.mdeditorContainer.before(that.stanceContainer);
                        // 把节点插入到body
                        $('body').append(othis.mdeditorContainer);
                        // 然后设置样式
                        othis.mdeditorContainer.addClass('is-fullscreen');
                    }
                    // 获得焦点
                    cm.focus();
                }
                // 如果是分栏需要同时改动preview
                if(key=='subfield'){
                    // 取消
                    if(status===true){
                        // 退出预览模式
                        that.IconStatusManager['preview'] = false;
                    }
                    else{
                        // 退出预览模式
                        that.IconStatusManager['preview'] = true;
                    }
                    // 设置按钮样式
                    othis.toolbarContainer.find('.'+mdEditor.className.toolbarOperation).each(function(i,btn){
                        // 获取了当前的按钮
                        if('preview'==btn.key){
                            // 当前按钮
                            var $btn = $(btn),$tip = $btn.find('.'+mdEditor.className.toolbarTip);
                            var title = status===true ? tips.preview.off:tips.preview.on;
                            // 设置当前按钮是不选中
                            $btn.removeClass(status===true ? 'is-selected':'')
                            .addClass(status===true ? '':'is-selected').attr('title',title);
                            // 取消codeMirror容器的样式
                            othis.editorContainer.removeClass(status===true ? 'preview-selected':'')
                            .addClass(status===true ? '':'preview-selected').attr('title',title);
                            // 设置提示
                            $tip.text(title.split(' ')[0]);
                        }
                    })
                    
                }
                // 清空
                if(key=='trash'){
                    cm.setValue('');
                }
                // 上一步
                if(key=='undo'){
                    cm.undo();
                }
                // 下一步
                if(key=='redo'){
                    cm.redo();
                }
                
            }
        })
        return that;
    },
    /**
     * 设置工具栏处理程序
     * @returns Class
     */
    setToolbarHandler:function(){
        var that = this,config = that.config;
        // 绑定默认的事件
        that.bindDefaultToolbarHandler();
        // 获取已经绑定的事件,包含用户自定义
        var toolbarHandlers = that.toolbarHandlers = $.extend(true,that.toolbarHandlers,config.toolbarHandlers);
        // 工具栏容器
        var toolbarContainer = that.toolbarContainer;
        // 获取所有的工具栏按钮
        var toolbarBtnIcon = toolbarContainer.find('.'+mdEditor.className.toolbarOperation);
        // 循环绑定事件,因为需要设置样式
        // 鼠标进入
        $(toolbarBtnIcon).mouseenter(function(e){
            e.stopPropagation();
            var btn = $(this),tip = btn.children(),key = btn[0].key;
            clearTimeout(btn[0].timer);
            if(btn.hasClass('is-hover')){
                return;
            }else{
                btn.addClass('is-hover')
            }
            if(toolbarHandlers[key] && typeof toolbarHandlers[key]==="object" && toolbarHandlers[key].mouseenter){
                $.proxy(toolbarHandlers[key].mouseenter,that.getCallBackParams())(e,cm);
            }
        }).
        find('.'+mdEditor.className.toolbarTip).mouseenter(function(e){
            e.stopPropagation();
            var tip = $(this),btn = tip.parent();
            clearTimeout(btn[0].timer);
            if(btn.hasClass('is-hover')){
                return;
            }else{
                btn.addClass('is-hover')
            }
        })
        // 鼠标离开事件
        $(toolbarBtnIcon).mouseleave(function(e){
            e.stopPropagation();
            var btn = $(this),tip = btn.children(),key = btn[0].key;
            btn[0].timer = setTimeout(function(){
                btn.removeClass('is-hover');
            },200)
            if(toolbarHandlers[key] && typeof toolbarHandlers[key]==="object" && toolbarHandlers[key].mouseleave){
                $.proxy(toolbarHandlers[key].mouseleave,that.getCallBackParams())(e,cm);
            }
        })
        .find('.'+mdEditor.className.toolbarTip).mouseleave(function(e){
            e.stopPropagation();
            var tip = $(this),btn =  tip.parent();
            btn[0].timer = setTimeout(function(){
                btn.removeClass('is-hover');
            },200);
        })
        // 鼠标点击事件
        $(toolbarBtnIcon).on(mdEditor.mouseOrTouch("click", "touchend"),function(e){
            e.stopPropagation();
            var btn = $(this),key = btn[0].key;
            // 如果有定义的事件
            if(toolbarHandlers[key] && typeof toolbarHandlers[key]==="function"){
                $.proxy(toolbarHandlers[key],that.getCallBackParams())(e,that.cm);
            }else if(toolbarHandlers[key] && typeof toolbarHandlers[key]==="object" && toolbarHandlers[key].click){
                $.proxy(toolbarHandlers[key].click,that.getCallBackParams())(e,that.cm);
            }
            if(name !== "link"  && name !== "image" && name !== "code-block" && 
            name !== "subfield" && name !== "watch" && name !== "preview" && name !== "search" && name !== "fullscreen" && name !== "help"){
                that.cm.focus();
            }
        })
        return that;
    },
    /**
     * 获取回调函数参数
     * @returns Object 返回的参数对象
     */
    getCallBackParams:function(){
        var that = this,res = {};
        res.IconStatusManager = that.IconStatusManager;
        res.cm = that.cm;
        res.cmContainer = that.cmContainer;
        res.codeEditor = that.codeEditor;
        res.codeMirror = that.codeMirror;
        res.editorContainer = that.editorContainer;
        res.el = that.el;
        res.mdeditorContainer = that.mdeditorContainer;
        res.panelContainer = that.panelContainer;
        res.previewContainer = that.previewContainer;
        res.textarea = that.textarea;
        res.toolbarContainer = that.toolbarContainer;
        return res;
    },
    /**
     * 设置代码编辑器
     * @returns Class
     */
    setCodemirror:function(){
        var that = this,config = that.config;
        // 当前codeMirror的容器
        var editorContainer = that.editorContainer;
        // 如果没有设置主题则设置默认
        !config.codeMirror.theme && (config.codeMirror.theme = 'default');
        // 设置编辑器主题
        if (config.codeMirror.theme !== "default"){
            mdEditor.loadCSS(config.path||mdEditor.path + "theme/editor/" + config.editorTheme);
        }
        /**
         * 编辑器配置
         */
        var codeMirrorConfig = $.extend(true,{
            mode                      : 'gfm',
            theme                     : 'default',
            tabSize                   : 4,//一个table相当于移动多少字符
            dragDrop                  : false,
            autofocus                 : true,//是否在初始化时自动获取焦点
            autoCloseTags             : true,//在键入' >'或' 时自动关闭XML标记
            readOnly                  : false,//这会禁止用户编辑编辑器内容。如果"nocursor"给出特殊值（而不是简单true），则不允许对编辑器进行聚焦
            indentUnit                : 4,//应该缩进一个块（无论编辑语言中的含义）多少个空格。默认值为2
            lineNumbers               : true,//是否显示行数
            lineWrapping              : true,//CodeMirror是否自动换行
            extraKeys                 : that.setShortcutKeys(),
            gutters                   : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            matchBrackets             : true,//括号匹配
            indentWithTabs            : true,//在缩进时，是否需要把 n*tab宽度个空格替换成n个tab字符
            styleActiveLine           : true,//当前行背景高亮
            styleSelectedText         : true,//表示选中后文本颜色是否改变
            autoCloseBrackets         : true,//目前暂未可知
            showTrailingSpace         : true,//目前暂未可知
            highlightSelectionMatches : ( (!config.codeMirror.matchWordHighlight) ? false : { showToken: (config.codeMirror.matchWordHighlight === "onselected") ? false : /\w/ } )
        },config.codeMirror,{
            readOnly:config.codeMirror.readOnly?'nocursor':false//绝对的readony
        });
        that.codeEditor = that.cm = mdEditor.$codeMirror.fromTextArea(that.textarea[0],codeMirrorConfig);
        that.codeMirror = that.cmContainer = editorContainer.children('.CodeMirror');
        // 绑定文本变化事件
        return that;
    },
    /**
     * 绑定滚动条同步
     */
    bindScrollEvent:function(){
        var that = this,config = that.config;


        return that;
    },
    /**
     * 绑定编辑器的文本框变更事件
     * @returns Class
     */
    bindChangeHandler:function(){
        var that = this,config = that.config,
        cm = that.cm;
        cm.on("change", function(_cm, changeObj) {
            that.saveTimer = setTimeout(function() {
                clearTimeout(that.saveTimer);
                that.save();
                that.saveTimer = null;
            }, config.saveDelay);
        });
        return that;
    },
    /**
     * 所有事件处理完毕后
     * Display handle of the module queues loaded after.
     * 
     * @param   {Boolean}   recreate   是否为重建编辑器
     * @returns {editormd}             返回editormd的实例对象
     */
    completed:function(){
        var that = this,config = that.config;
        // 保存一个代码,因为如果有初始值，则需要解析成markdown
        that.save();
        // 绑定
        that.bindScrollEvent().bindChangeHandler();
    },
    /**
     * 解析和保存Markdown代码
     * Parse & Saving Markdown source code
     * @returns {editormd}     返回editormd的实例对象
     */
    save:function(){
        var that = this,config = that.config;
        if(that.saveTimer===null) return that;
        var that            = this;
        var state            = this.state;
        var settings         = this.settings;
        var cm               = this.cm;            
        var cmValue          = cm.getValue();
        var previewContainer = this.previewContainer;
        var marked           = mdEditor.$marked;
        var renderer         = new marked.Renderer()
        // 自定义语法的渲染函数
        renderer.mark = (text) => {
            return `<mark>${text}</mark>`
        }
        renderer.textAlign = (align,text) => {
            return `<div class="hljs-${align}">
                        <p>${text}</p>
                    </div>`
        }
        renderer.blockquote = (body,Identification)=>{
            var content = /\ {0,1}\[\S+\](\S+)/.exec(body);
            content = content ? '<p>'+content[1] : body;
            return `<blockquote class="${Identification && ['info','warning','success','danger'].indexOf(Identification)!==-1 ? Identification:'default'}">
                        ${content}
                    </blockquote>`
        }
        // 配置信息
        var markedOptions = that.markedOptions = {
            renderer    : renderer,
            gfm         : true,
            tables      : true,
            breaks      : true,
            pedantic    : false,
            sanitize    : (config.htmlDecode) ? false : true,  // 关闭忽略HTML标签，即开启识别HTML标签，默认为false
            smartLists  : true,
            smartypants : true
        };
        marked.setOptions(markedOptions);
        // 获取了html
        var markHtml = marked(cmValue);
        // 设置markdown数据
        that.textarea.val(cmValue);
        // 保存缓存数据
        cm.save();
        // 给视图显示数据
        that.previewContainer.html(markHtml);
        return that;
    }
}
/**
 * 鼠标和触摸事件的判断/选择方法
 * MouseEvent or TouchEvent type switch
 * 
 * @param   {String} [mouseEventType="click"]    供选择的鼠标事件
 * @param   {String} [touchEventType="touchend"] 供选择的触摸事件
 * @returns {String} EventType                   返回事件类型名称
 */
mdEditor.mouseOrTouch = function(mouseEventType, touchEventType) {
    mouseEventType = mouseEventType || "click";
    touchEventType = touchEventType || "touchend";
    
    var eventType  = mouseEventType;

    try {
        document.createEvent("TouchEvent");
        eventType = touchEventType;
    } catch(e) {}

    return eventType;
}
/**
 * 页面渲染方法
 */
mdEditor.render = function(options){
    return mdEditor(options);
}
mdEditor.config = function(options){
    Config = $.extend(true,{},Config,options);
    return this;
}
/**
 * 动态加载CSS文件的方法
 * Load css file method
 * 
 * @param {String}   fileName              CSS文件名
 * @param {Function} [callback=function()] 加载成功后执行的回调函数
 * @param {String}   [into="head"]         嵌入页面的位置
 */
mdEditor.loadCSS   = function(fileName, callback, into) {
    into       = into     || "head";        
    callback   = callback || function() {};
    var css    = document.createElement("link");
    css.type   = "text/css";
    css.rel    = "stylesheet";
    css.onload = css.onreadystatechange = function() {
        callback();
    };
    css.href   = fileName + ".css";
    if(into === "head") {
        document.getElementsByTagName("head")[0].appendChild(css);
    } else {
        document.body.appendChild(css);
    }
};
export default mdEditor;
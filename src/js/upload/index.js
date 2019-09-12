
import webUpload from "./src/preset/all";
import $ from "jquery";
/**
 * 外部接口
 */
var upload = function(options){
    var ins = new Class(options);
    return thisUpload.call(ins);
},
LIST_ITEM = '.dui-upload-list__item',UPLOAD_LIST='dui-upload-list',
PROGRESS_INNER='.dui-progress-bar__inner',PROGRESS_TEXT='.dui-progress__text',
UPLOAD_DRAG='.dui-upload-dragger',UPLOAD_TEXT='.dui-upload__text',
/**
 * 全局配置信息
 */
Config =  {},
/**
 * 内部运行类
 */
Class = function(options){
    var that = this,config=that.config=$.extend(true,{
        el:'',
        accept:'images',//允许上传的文件类型：images/file/video/audio
        showFileList:true,//控制是否显示文件列表
        fileList:[],//当前默认值
        listType:'text',
        autoUpload:true,//自动上传
        exts:'',//允许上传的文件后缀名
        server:'',//必选参数，上传的地址
        headers:{},//设置上传的请求头部
        pick:'',//选择文件按钮
        name:'file',//上传的文件字段名
        data:{},//上传额外带的参数
        method:'post',//上传文件使用的ajax方法
        drag:false,//是否运行拖拽上传
        onSuccess:'',//上传成功回调
        onError:'',//上传错误的回调
        onBefore:'',//上传前的回调
        onComplete:'',//成功或者失败都会回调
        onProgress:'',//进度条回调
        multiple:false,//多图片上传
        resize:false,
    },Config,options);
    that.render();
},
/**
 * 当前运行实例
 */
thisUpload = function(){
    var that = this;
    return {
        config:that.config,
        upload:function(){
            that.submit.call(that);
        }
    }
}
/**
 * 渲染页面
 */
Class.prototype.render = function(){
    var that = this,options = that.config,
    el = that.el = $(options.el),
    // 获取当前元素的innerHtml
    innerHtml = el.html(),
    // list_item_template
    listItemTpl = that.listItemTpl =function(item,status){
        return ['<li class="dui-upload-list__item is-'+status+'">',
        function(){
            if(options.listType=='picture'){
                return '<img src="'+item.url+'" alt="'+item.name+'" class="dui-upload-list__item-thumbnail">';
            }
            return '';
        }(),
        '<a class="dui-upload-list__item-name"><i class="dui-icon-document"></i>'+item.name+'</a>',
        '<label class="dui-upload-list__item-status-label"><i class="dui-icon-upload-success dui-icon-'+(options.listType=='text'?'circle-':'')+'check"></i></label>',
        '<i class="dui-icon-close"></i>',
    '</li>'].join('');
    },
    // 是否已经渲染过
    hasRender = that.innerHtml ? true : false,
    // 点击按钮的存储容器
    uploadDom = that.uploadDom = $('<div class="dui-upload dui-upload-'+options.listType+'"></div>'),
    // 选择文件的元素
    pick = that.pick = el.find(options.pick)[0] ? el.find(options.pick)[0] : el.children()[0],
    uploadOtp = {
        server:options.server,//服务器地址
        pick:{
            id:pick,
            multiple:options.multiple
        },
        resize:options.resize,
    };
    // 如果渲染过则覆盖掉
    hasRender && el.html(innerHtml);
    // 设置当前的innerhtml
    that.innerHtml = innerHtml;
    // 显示pick容器兵器把pick放入容器中
    el.prepend(uploadDom),uploadDom.append(pick);
    // 如果有drag
    if(options.drag!==false){
        uploadOtp.dnd = el;
        uploadOtp.pick.id = el.find(UPLOAD_TEXT).find('em')[0];
    }
    // 创建上传类
    that.webUpload = webUpload.create(uploadOtp);
    // 如果有列表展示
    if(options.showFileList){
        var template = ['<ul class="dui-upload-list dui-upload-list--'+options.listType+'">',
            //如果有list
            function(){
                if(options.fileList && options.fileList.length>0){
                    var res = [];
                    $.each(options.fileList,function(i,item){
                        var temp = listItemTpl(item,'success');
                        res.push(temp);
                    })
                    return res.join('');
                }
                return '';
            }(),
        '</div>'].join(''),
        showListDom = that.showListDom = el.find(UPLOAD_LIST)[0]? el.find(UPLOAD_LIST): $(template);
        el.append(showListDom);
    }
    // 设置事件
    that.events();
}
/**
 * 事件管理
 */
Class.prototype.events = function(){
    var that = this,options = that.config;
    // 当有文件被添加进队列的时候
    that.webUpload.on('fileQueued',function(file){
        var item = {
            name:file.name,
            url:'',
        }
        // 如果有预览功能
        if(options.showFileList){
            that.webUpload.makeThumb( file, function( error, ret ) {
                if ( error ) {
                    item.url = '';
                } else {
                    item.url = ret;
                }
                var tpl = $(that.listItemTpl(item,'is-ready'));
                tpl[0].uploadId = file.id;//设置图片的唯一id
                that.showListDom.append(tpl);
                // 进度条html
                var prs = ['<div class="dui-progress dui-progress--line">',
                    '<div class="dui-progress-bar">',
                        '<div class="dui-progress-bar__outer" style="height: 2px;">',
                            '<div class="dui-progress-bar__inner" style="width: 0%;">',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="dui-progress__text" style="font-size: 12.8px;">0%</div>',
                '</div>'].join(''),
                progress = tpl[0].progress = $(prs);
                // 生成一张可以预览的图片
                if(options.autoUpload){
                    var res = true;
                    if(options.onBefore && typeof options.onBefore==="function"){
                        res = options.onBefore.call(null,file);
                    }
                    if(res!==false){
                        that.webUpload.upload();
                    }
                }
            });
        }else{
            // 生成一张可以预览的图片
            if(options.autoUpload){
                that.webUpload.upload();
            }
        }
    })
    // 上传发生错误时
    that.webUpload.on( 'uploadError', function( file ) {
        // 如果有预览功能
        if(options.showFileList){
            // 删除掉显示文件
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.id){
                    item.remove();
                }
            })
        }
        if(options.onError && typeof options.onError==="function"){
            options.onError.call(null,file);
        }
    });
    // 文件上传成功
    that.webUpload.on( 'uploadSuccess', function( file ) {
        // 如果有预览功能
        if(options.showFileList){
            // 删除掉显示文件
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.id){
                    $(item).removeClass('is-uploading').addClass('is-success');
                    item.progress.remove();
                }
            })
        }
        if(options.onSuccess && typeof options.onSuccess==="function"){
            options.onSuccess.call(null,file);
        }
    });
    // 成功或者失败都会调用
    that.webUpload.on( 'uploadComplete', function( file ) {
        if(options.onComplete && typeof options.onComplete==="function"){
            options.onComplete.call(null,file);
        }
    });
    // 上传前，一个文件只触发一次
    that.webUpload.on('uploadStart',function(file){
        if(options.onStart && typeof options.onStart==="function"){
            options.onStart.call(null,file);
        }
        // 显示进度条
        that.showListDom.find(LIST_ITEM).each(function(i,item){
            if(item.uploadId==file.id){
                $(item).append(item.progress);
                $(item).removeClass('is-ready').addClass('is-uploading');
            }
        })
    })
    // 显示进度条
    that.webUpload.on( 'uploadProgress', function( file,percentage ) {
        // 如果有预览功能
        if(options.showFileList){
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.id){
                    // 进度条样式
                    $(item).find(PROGRESS_INNER).css('width',percentage+'%');
                    // 进度条文字
                    $(item).find(PROGRESS_TEXT).text(percentage+'%');
                }
            })
        }
        if(options.onProgress && typeof options.onProgress==="function"){
            options.onProgress.call(null,file,percentage);
        }
    });
}
/**
 * 提交上传
 */
Class.prototype.submit = function(){
    // 手动上传
    this.webUpload.upload();
}
/**
 * 设置配置信息
 */
upload.config = function(options){
    Config = $.extend(true,{},options)
    return upload;
}
/**
 * 渲染页面
 */
upload.render = function(options){
    return upload(options);
}
export default upload;
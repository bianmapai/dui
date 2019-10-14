import $ from "jquery";
import Resumable from "resumablejs";
import BMF from "browser-md5-file";

/**
 * 存储全局配置信息
 */
let Config = {},
LIST_ITEM = '.dui-upload-list__item',UPLOAD_LIST='dui-upload-list',
PROGRESS_INNER='.dui-progress-bar__inner',PROGRESS_TEXT='.dui-progress__text',
UPLOAD_DRAG='.dui-upload-dragger',UPLOAD_TEXT='.dui-upload__text',
browserMD5File = new BMF();
/**
 * 外部暴露接口
 * @param {Object} options 参数
 */
function upload(options){
    let ins = new Class(options);
    return thisUpload.call(ins);
}
/**
 * 文件转base64的方法
 * @param {File} blob 文件
 * @param {Function} callback 回调函数
 */
function readBlobAsDataURL(blob, callback) {
    var error = '',ok = false,url;
    var a = new FileReader();
    a.onerror  = function(e){
        error = '转换错误';
        ok = true;
    }
    a.onload = function(e) {
        error = '';
        ok = true;
        url = e.target.result;
    };
    a.readAsDataURL(blob);
    var timer = setInterval(() => {
        if(ok===true){
            clearInterval(timer);
            callback(error,url)
        }
    }, 10);
}
/**
 * 内部创建方法
 * @param {Object} options 参数
 */
function Class(options){
    var that = this,config = that.config =$.extend(true,{
            el:'',//上传容器
            server:'',//必选参数，上传的地址
            accept:'images',//允许上传的文件类型：images/file/video/audio
            showFileList:true,//控制是否显示文件列表
            listType:'text',//列表显示样式
            fileList:[],//默认显示内容
            autoUpload:true,//自动上传
            exts:'',//允许上传的文件后缀名
            headers:{},//设置上传的请求头部
            pick:'',//选择文件按钮
            pickText:'上传图片',
            name:'file',//上传的文件字段名
            data:{},//上传额外带的参数
            testChunks:false,//是否在上传前使用get访问一下
            drag:false,//是否运行拖拽上传
            onSuccess:'',//上传成功回调
            onError:'',//上传错误的回调
            onBefore:'',//上传前的回调
            onComplete:'',//成功或者失败都会回调
            onProgress:'',//进度条回调
            multiple:false,//多图片上传
            chunkSize:1*1024*1024,//单个分片上传的大小
            maxFiles:undefined,//最大可选file数量
            resize:false,
        },Config,options);
        // 渲染界面
        that.render();
}
/**
 * 渲染界面
 */
Class.prototype.render = function(){
    var that = this,config = that.config,
    // 获得容器
    el = that.el = $(config.el);
    // 主动抛出异常
    if(!el[0]) throw new Error('upload initialization failed，Because there is no container.');
    // 是否已经渲染过
    let hasRender = that.innerHtml ? true : false;
    // 如果渲染过则覆盖掉
    hasRender && el.html(that.innerHtml);
    // 设置当前innerhtml
    that.innerHtml = el.html();
    // 文件列表显示模板
    that.listItemTpl =function(item,status){
        return ['<li class="dui-upload-list__item is-'+status+'">',
        function(){
            if(config.listType=='picture'){
                return '<img src="'+item.url+'" alt="'+item.name+'" class="dui-upload-list__item-thumbnail">';
            }
            return '';
        }(),
        '<a class="dui-upload-list__item-name"><i class="dui-icon-document"></i>'+item.name+'</a>',
        '<label class="dui-upload-list__item-status-label"><i class="dui-icon-upload-success dui-icon-'+(config.listType=='text'?'circle-':'')+'check"></i></label>',
        '<i class="dui-icon-close"></i>',
    '</li>'].join('');
    }
    // 点击按钮的存储容器
    that.uploadDom = $('<div class="dui-upload dui-upload-'+config.listType+'"></div>');
    // 设置选择文件按钮，如果指定的元素存在则设置指定元素，如果不存在则找第一个元素，如果只有容器没有元素则创建上传按钮
    that.pick = el.find(config.pick)[0] ? el.find(config.pick)[0] : el.children()[0] ? el.children()[0] : 
    $('<button type="button" class="dui-button dui-button--primary dui-button--small">'+config.pickText+'</button>');
    // 显示pick容器并且把pick放入容器中
    el.prepend(that.uploadDom),that.uploadDom.append(that.pick);
    // 如果有设置列表展示
    if(config.showFileList){
        var template = ['<ul class="dui-upload-list dui-upload-list--'+config.listType+'"></div>'].join(''),
        showListDom = that.showListDom = el.find(UPLOAD_LIST)[0]? el.find(UPLOAD_LIST): $(template);
        el.append(showListDom);
        // 如果有图片数据
        if(config.fileList && config.fileList.length>0){
            var res = [];
            $.each(config.fileList,function(i,item){
                var temp = listItemTpl(item,'success');
                res.push(temp);
            })
            showListDom.append(res.join(''));
        }
    }
    // 上传库的配置
    let options = {
        target:config.server,
        query:$.extend(true,{
            form:'dui.upload'
        },config.data),
        simultaneousUploads:config.simultaneousUploads||3,//同时上传数量
        fileParameterName:config.name,//上传的file框名
        chunkSize:config.chunkSize,//单个分片大小
        headers:config.headers,//上传头
        maxFiles:config.maxFiles,//最大可选文件数量
        testChunks:config.testChunks,//上传前是否检查文件是否存在
    };
    // 创建上传库
    that.r = new Resumable(options);
    // 设置上传库的回调
    that.setCallBack()
    // 设置事件
}
/**
 * 设置上传库回调
 */
Class.prototype.setCallBack = function(){
    var that = this,config = that.config,
    r = that.r,uploadDom = that.uploadDom,
    pick = that.pick,drag = that.el.find(UPLOAD_DRAG)[0]?that.el.find(UPLOAD_DRAG)[0]:that.el[0];
    // 设置上传按钮
    r.assignBrowse(pick);
    // 如果允许拖拽上传
    config.drag!==false && r.assignDrop(drag);
    // 添加了一个文件
    r.on('fileAdded',function(file){
        var item = {
            name:file.fileName,
            url:'',
        }
        // 如果有预览功能
        if(config.showFileList){
            readBlobAsDataURL(file.file, function (error,dataurl){
                if ( error ) {
                    item.url = '';
                } else {
                    item.url = dataurl;
                }
                // 预览模板
                var tpl = $(that.listItemTpl(item,'is-ready'));
                // 设置图片的唯一id
                tpl[0].uploadId = file.uniqueIdentifier;
                // 添加显示
                that.showListDom.append(tpl);
                // 进度条html
                var prs = ['<div class="dui-progress dui-progress--line" style="display:none">',
                    '<div class="dui-progress-bar">',
                        '<div class="dui-progress-bar__outer" style="height: 2px;">',
                            '<div class="dui-progress-bar__inner" style="width: 0%;">',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<div class="dui-progress__text" style="font-size: 12.8px;">0%</div>',
                '</div>'].join(''),
                progress = tpl[0].progress = $(prs);
                // 添加进度条
                tpl.append(progress);
            })
        }
        browserMD5File.md5(file.file,function(error,md5){
            r.opts.query.fileMd5 = md5;
            file.file.fileMd5 = md5;
            // 设置设置了自动上传
            if(config.autoUpload){
                var res = true;
                if(config.onBefore && typeof config.onBefore==="function"){
                    res = config.onBefore.call(null,file);
                }
                if(res!==false){
                    r.upload();
                }
            }
        })
    })
    // 上传进度条
    r.on('fileProgress',function(file){
        var percentage = file.progress();
        // 如果有预览功能
        if(config.showFileList){
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.uniqueIdentifier){
                    item.progress.css('display','');
                    // 进度条样式
                    $(item).find(PROGRESS_INNER).css('width',(percentage*100)+'%');
                    // 进度条文字
                    $(item).find(PROGRESS_TEXT).text((percentage*100)+'%');
                }
            })
        }
        if(config.onProgress && typeof config.onProgress==="function"){
            config.onProgress.call(null,file,percentage);
        }
    })
    // 文件上传成功
    r.on('fileSuccess',function(file,msg) {
        // 如果有预览功能
        if(config.showFileList){
            // 删除掉显示文件
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.uniqueIdentifier){
                    $(item).removeClass('is-uploading').addClass('is-success');
                    item.progress.remove();
                }
            })
        }
        if(config.onSuccess && typeof config.onSuccess==="function"){
            config.onSuccess.call(null,file,JSON.parse(msg));
        }
    });
    // 上传错误
    r.on('fileError',function(file,msg){
        // 如果有预览功能
        if(config.showFileList){
            // 删除掉显示文件
            that.showListDom.find(LIST_ITEM).each(function(i,item){
                if(item.uploadId==file.uniqueIdentifier){
                    item.remove();
                }
            })
        }
        if(config.onError && typeof config.onError==="function"){
            config.onError.call(null,file,msg);
        }
    })
}
/**
 * 手动上传
 */
Class.prototype.upload = function(){
    var that = this,r = that.r;
    r.upload();
}
/**
 * 手动暂停
 */
Class.prototype.pause = function(){
    var that = this,r = that.r;
    r.pause();
}
/**
 * 取消上传
 */
Class.prototype.cancel = function(){
    var that = this,r = that.r;
    r.cancel();
}
/**
 * 返回的外部暴露接口
 */
function thisUpload(){
    var that = this;
    return {
        config:that.config,
        upload:function(){
            that.upload.call(that);
        },
        pause:function(){
            that.pause.call(that);
        },
        cancel:function(){
            that.cancel.call(that);
        }
    }
}
/**
 * 设置配置信息
 */
upload.config = function(options){
    Config = $.extend(true,Config,options);
    return this;
}
/**
 * 渲染界面
 * @param {Object} options 配置信息
 */
upload.render = function(options){
    return upload(options);
}
export default upload;
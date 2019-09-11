dui.define(['jquery'],function($){
  /**
   * 外部接口
   */
  var upload = function(options){
      var ins = new Class(options);
      return thisUpload.call(ins);
  },
  /**
   * 全局配置信息
   */
  Config =  {

  },
  /**
   * 内部运行类
   */
  Class = function(options){
      var that = this,config=that.config=$.extend(true,{
          el:'',
          accept:'images',//允许上传的文件类型：images/file/video/audio
          exts:'',//允许上传的文件后缀名
          action:'',//必选参数，上传的地址
          headers:{},//设置上传的请求头部
          name:'file',//上传的文件字段名
          data:{},//上传额外带的参数
          method:'post',//上传文件使用的ajax方法
          drag:true,//是否运行拖拽上传
          onSuccess:'',//上传成功回调
          onError:'',//上传错误的回调
          onBefore:'',//上传前
          multiple:false,//多图片上传
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
          uploada:function(files){
              that.upload.call(that,files);
          }
      }
  }
  /**
   * 渲染页面
   */
  Class.prototype.render = function(){
      var that = this,options = that.config;
      options.el = $(options.el);
      
  }
  /**
   * 设置配置信息
   */
  upload.config = function(){

  }
  /**
   * 渲染页面
   */
  upload.render = function(options){
      return upload(options);
  }
  return upload;
})
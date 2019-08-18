dui.define(["jquery"], function () {
  var Popup = function (options) {

  },
  transition = ['dialog-fade','dialog-fade','dialog-fade','aiui-message-fade','aiui-notice-fade'],
  index = 1,
  body = $("body"),
  win = $(window),
  Class = function (setings) {
    var that = this;
    that.index = index++;
    that.config = $.extend({}, that.config, Popup.config, setings);
    that.create();
  };
  Class.fn = Class.prototype;
  /**
   * 默认的配置信息
   */
  Popup.config = {
    type:0,//类型，0.messagebox,1.dialog,2.iframe,1.message,4.notice
    title:'',//标题
    content:'',//内容
    height:'auto',//弹出框的高
    width:'auto',//弹窗框的宽
    top:'auto',//弹出框在屏幕当中的位置，top
    left:'auto',//弹出框在屏幕当中的位置，left
    position: 'top-right',//显示的位置
    icon:'info',//图标
    btn:['取消','确定'],//按钮组
    customClass:'',//自定义class
    center:false,//是否居中布局
    showClose:true,//是否显示关闭按钮
    beforeClose:'',//关闭前回调，如果返回值为false则不关闭
    closeed:'',//已经关闭了的回调函数
    shade:[0.3,'#000'],
    duration:0,//0为不自动关闭
    ColseOnModel:true,

  };
  /**
   * 创建popup骨架
   */
  Class.fn.create = function(){
    var that = this,config=that.config,
    index = that.index,content = config.content,
    contentType = typeof content,template,shade;
    if(config.type==3){
      //消息提示层
      template = [
        '<div class="aiui-message" id="aiui-popup'+index+'" role="aiui-popup" style="display:none;">',
            '<table cellspacing="0" cellpadding="0">',
                '<tr>',
                    '<td class="aiui-message-icon aiui-message-icon-{{icon}}">',
                        '<div>',
                            '<i class="aiui-icon aiui-icon-{{icon}}"></i>',
                        '</div>',
                    '</td>',
                    '<td class="aiui-message-text">',
                        '<span>{{content}}<span>',
                    '</td>',
                    '<td class="aiui-message-close">',
                    '{{if showClose}}',
                        '<div class="aiui-message-close-btn aiui-popup-close">',
                        '<i class="aiui-icon aiui-icon-message-close"></i>',
                        '<div>',
                    '{{/if}}',
                    '</td>',
                '</tr>',
            '</table>',
        '</div>'
      ].join('');
    }else if(config.type==4){
      //notice
      template = ['<div class="aiui-notice-item" id="aiui-popup'+index+'" role="aiui-popup" style="display:none;">',
          '<table cellspacing="0" cellpadding="0">',
          '<tr>',
          '<td class="aiui-notice-icon">',
          '{{if icon}}',
          '<div class="aiui-notice-{{icon}}">',
          '<i class="aiui-icon aiui-icon-{{icon}}"></i>',
          '</div>',
          '{{/if}}',
          '</td>',
          '<td class="aiui-notice-text">',
          '<div class="aiui-notice-title">',
          '{{title}}',
          '</div>',
          '{{if content}}',
          '<div class="aiui-notice-message">',
          '{{content}}',
          '</div>',
          '{{/if}}',
          '</td>',
          '</tr>',
          '</table>',
          '{{if showClose}}',
          '<div class="aiui-popup-close aiui-notice-close">',
          '<i class="aiui-icon aiui-icon-message-close"></i>',
          '</div>',
          '{{/if}}',
          '</div>'].join('');
    }else{
      template = ['<div class="aiui-dialog{{if customClass}} {{customClass}}{{/if}}" id="aiui-popup'+index+'" role="aiui-popup" style="display:none">',
            '<div class="aiui-dialog-header">',
                '<span class="aiui-dialog-title">{{title}}</span>',
                '<div class="aiui-dialog-close aiui-popup-close"><i class="aiui-icon aiui-icon-message-close"></i></div>',
            '</div>',
            '<div class="aiui-dialog-body">',
                '<div class="aiui-dialog-body-content"></div>',
            '</div>',
            '<div class="aiui-dialog-footer">',
                '{{each btn}}',
                    '<button class="aiui-btn aiui-btn-small aiui-btn-{{if $index==btn.length-1}}primary{{else}}default{{/if}}" aiui-btn-key="{{$index}}">{{$value}}</button>',
                '{{/each}}',
            '</div>',
      '</div>'].join('');
    }
    //如果有遮盖罩
    if(config.shade){
      shade = '<div class="aiui-dialog-modal" style="display:none;"></div>';
      that.shade = $(aiui.render(shade,config))[0];
      that.shadetransition = aiui.transition(that.shade,{
        name:'aiui-modal',
        duration:200,
        onleaved:function(){
          that.shade.remove();
        }
      })
      body.append(that.shade);
    }
    that.dom = $(aiui.render(template,config))[0];
    that.transition = aiui.transition(that.dom,{
      name:transition[config.type],
      duration:300,
      onleaved:function(){
        that.dom.remove();
        if(typeof that.config.closeed ==="function"){
          that.config.closeed.call();
        }
      }
    })
    //添加元素
    that.addDom();
    //如果是dilog类型的系列数据则需要设置内容
    if($.inArray(that.config.type,[0,1,2])!=-1){
      //设置dilog内容
      that.setContent();
    }
    //设置基本样式
    that.setting();
    //设置各种事件
    that.setEvent();
    //显示popup
    that.show();
    that.dom.ClassObj = that;
  }
  /**
   * 添加元素
   */
  Class.fn.addDom = function(){
    var that = this,config = that.config;
    if(config.type==4){
      var position = that.config.position.split('-'),
      container = $('.aiui-notice-' + that.config.position),
      isShow = container[0]?true:false;
      $(that.dom).addClass(position[1]);
      if(isShow){
        if(position[0]=='top'){
          container.append(that.dom);
        }else{
          container.prepend(that.dom);
        }
      }else{
        container = $(['<div class="aiui-notice aiui-notice-' + that.config.position + '">', '</div>'].join(''));
        body.append(container);
        if(position[0]=='top'){
          container.append(that.dom);
        }else{
          container.prepend(that.dom);
        }
      }
    }else{
      body.append(that.dom);
    }
  }
  /**
   * 设置样式
   */
  Class.fn.setting = function(){
    var that = this,$dom = $(that.dom),
    zindex=aiui.getMaxZIndex(),$shade = $(that.shade);
    //设置最上层
    if(that.shade){
      $shade.css('z-index',parseInt(zindex)+1);
    }
    if(that.config.type==4){
      $dom.parent().css('z-index',parseInt(zindex)+2)
    }else{
      $dom.css('z-index',parseInt(zindex)+2)
    }
    //如果是dilog类型的系列数据则需要定位
    if($.inArray(that.config.type,[0,1,2])!=-1){
      //设置宽高
      that.auto()
      //元素定位
      that.offset();
    }
  }
  /**
   * 自适应宽高
   */
  Class.fn.auto = function(){
    var that = this, config = that.config,bodyStyle={},
    style = {},$dom = $(that.dom),iframeDom = $dom.find('.aiui-dialog-iframe')[0];
    if($.inArray(config.type,[1,2])!=-1){
      //表示如果是iframe模式或者ajax模式
      //宽度设置
      if(config.width=="auto"){
        if(win.width()<728){
          style.width = win.width()/10*9;
        }else{
          style.width = win.width()/2;
        }
      }else{
        style.width = that.config.width;
      }
      //高度设置
      if(config.height=="auto"){
        style.height = win.height()/10*8;
      }else{
        style.height = config.height;
      }
      $.each(style,function(key,value){
        $dom.css(key,value);
      })
      //设置body样式
      bodyStyle.height = $dom.outerHeight() - 47 - 58;
      if(iframeDom){
        $dom.find('.aiui-dialog-iframe').css('height',bodyStyle.height);
      }
      $.each(bodyStyle,function(key,value){
        $dom.find('.aiui-dialog-body').css(key,value)
      })
    }
  }
  /**
   * 自适应位置
   */
  Class.fn.offset = function(){
    var that = this,config = that.config,
    style = {},$dom = $(that.dom);
    if(that.config.top=="auto"){
        //上下居中
        //获取当前弹窗的高度
        var height = $dom.outerHeight();
        style.top = ((win.height() - height) / 2)
    }else{
        style.top = config.top;
    }
    if(that.config.left=="auto"){
      //左右居中
      //获取当前弹窗的高度
      var width = $dom.outerWidth();
      style.left = ((win.width() - width) / 2)
    }else{
      style.left = config.left;
    }
    $.each(style,function(key,value){
      $dom.css(key,value);
    })
  }
  /**
   * 设置内容
   */
  Class.fn.setContent = function(){
    var that = this,config = that.config,content,bodyHeight,
    $dom = $(that.dom),template='',$contentDom = $dom.find('.aiui-dialog-body-content');
    if(config.type==0){
      $dom.addClass('aiui-message-box');
      template = [
            '{{if icon!="none"}}',
            '<div class="aiui-message-box-icon aiui-message-box-icon-{{icon}}">',
                '<i class="aiui-icon aiui-icon-{{icon}}"></i>',
            '</div>',
            '{{/if}}',
            '<div class="aiui-message-box-message">',
            '{{content}}',
            '</div>'].join('');
    }else if(config.type==1){

    }else if(config.type==2){
      template = '<iframe class="aiui-dialog-iframe" scrolling="auto" allowtransparency="true" frameborder="0" src="'+config.content+'"></iframe>'
    }
    content = $(aiui.render(template,config));
    $contentDom.append(content);
  }
  /**
   * 设置事件
   */
  Class.fn.setEvent = function () {
    var that = this, config = that.config,
      dict = {}, _Doc = $(document),
      $dom = $(that.dom);
    //自动关闭方法
    if (config.duration > 0) {
      that.timer = setTimeout(function () {
        that.close();
      }, config.duration)
    }
    //关闭按钮事件
    if (config.showClose) {
      $dom.find('.aiui-popup-close').off('click').on('click', function (e) {
        clearTimeout(that.timer);
        that.close();
      })
    }
    //设置拖动
    var docmove = function (e) {
      if (dict.moveStart) {
        var X = e.clientX - dict.offset[0]
          , Y = e.clientY - dict.offset[1]
          , fixed = $dom.css('position') === 'fixed';
        e.preventDefault();
        dict.stX = fixed ? 0 : win.scrollLeft();
        dict.stY = fixed ? 0 : win.scrollTop();

        //控制元素不被拖出窗口外
        if (!that.config.moveOut) {
          var setRig = win.width() - $dom.outerWidth() + dict.stX
            , setBot = win.height() - $dom.outerHeight() + dict.stY;
          X < dict.stX && (X = dict.stX);
          X > setRig && (X = setRig);
          Y < dict.stY && (Y = dict.stY);
          Y > setBot && (Y = setBot);
        }

        $dom.css({
          left: X
          , top: Y
        });
      }
    };
    var docmoveup = function (e) {
      if (dict.moveStart) {
        delete dict.moveStart;
      }
    };
    /**
     * 拖拽移动事件
     */
    var header = $dom.find('.aiui-dialog-header');
    header.off('mousedown').on('mousedown', function (e) {
      e.preventDefault();
      dict.moveStart = true;
      dict.offset = [
        e.clientX - parseFloat($dom.css('left'))
        , e.clientY - parseFloat($dom.css('top'))
      ];
    })
    _Doc.off('mousemove', docmove).on('mousemove', docmove).off('mouseup', docmoveup).on('mouseup', docmoveup)
    //点击遮盖层事件
    if (that.config.ColseOnModel) {
      $(that.shade).off('click').on('click', function (e) {
        e.preventDefault();
        that.close();
      })
    }
  }
  /**
   * 显示方法
   */
  Class.fn.show = function(){
    var that = this;
    if(that.shade){
      that.shadetransition.show();
    }
    that.transition.show();
  }
  /**
   * 关闭方法
   */
  Class.fn.close= function(){
    var that = this;
    that.transition.hide();
    if(that.config.shade){
      that.shadetransition.hide();
    }
  }
  /**
   * 打开一个Popup
   */
  Popup.open = function (options) {
    var o = new Class(options);
    return o.index;
  };
  /**
   * 关闭一个Popup
   */
  Popup.close = function (index) { 
    body.find('#aiui-popup'+index).each(function(index,item){
      item.ClassObj && item.ClassObj.close && item.ClassObj.close()
    });
  };
  /**
   * 关闭所有的Popup
   */
  Popup.closeAll = function () { 
    body.find('[role="aiui-popup"]').each(function(index,item){
      item.ClassObj && item.ClassObj.close && item.ClassObj.close()
    })
  };
  /**
   * 消息提示
   */
  Popup.message = function(content,options,closeed){
    var config = $.extend({}, this.config, {
      type: 3,
      btn:[],
      duration: 3000,
      icon: 'info',
      shade:false,
      showClose:false
    },
      options, {
        content: content,
        closeed: closeed
      })
    return this.open(config)
  }
  /**
   * 通知组件
   */
  Popup.notice = function(title,options,closeed){
    var config = $.extend({}, this.config, {
      type: 4,
      btn:[],
      duration: 3000,
      shade:false,
      icon: 'info',
      showClose:true
    },
      options, {
        title: title,
        closeed: closeed
      })
    return this.open(config)
  }
  return Popup;
});

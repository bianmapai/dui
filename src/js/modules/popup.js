dui.define('popup',['jquery'],function($){
  var popup = function(type,options){
    var ins = new Items[type](options);
    ins.type = type;
    allPopup[ins.id] = ins;
    return ins;
  },
  resetTop = function(type){
    var pups = [],currenheight=0;
    $.each(allPopup,function(i,item){
      if(type==item.type){
        pups.push(item);
      }
    })
    $.each(pups,function(i,item){
      var $dom = item.dom,height=item.offsetHeight;
      if(pups.length>1){
        $dom.css('top',((i+1)*20)+currenheight);
        currenheight += height;
      }else{
        $dom.css('top','');
      }
    })
  },
  message = function(options){
    var that = this,id = that.id = 'popup-'+seed++,
    config = that.config = $.extend(true,{
      message:'',
      type:'info',
      iconClass:'',
      customClass:'',
      duration:3000,
      showClose:false,
      center:false,
      onClose:'',
      offset:20
    },options),
    template = that.template = [
      '<div class="dui-message'+(config.type && !config.iconClass ? ' dui-message--'+config.type : ''),
      config.center ? ' is-center' : '',
      config.showClose ? ' is-closable' : '',
      '" style="" id="'+id+'">',
        function(){
          if(config.iconClass){
            return '<i class="'+config.iconClass+'"></i>';
          }else{
            return '<i class="dui-message__icon dui-icon-info"></i>';
          }
        }(),
        '<p class="dui-message__content">'+config.message+'</p>',
        config.showClose?'<i class="dui-message__closeBtn dui-icon-close"></i>':'',
      '</div>'
    ].join(''),
    dom = that.dom = $(template),
    getTop = function(type,cur){
      var num = 0,allHeight=0;
      $.each(allPopup,function(id,item){
        if(item.type == type){
          allHeight += item.offsetHeight;
          if(item.id==cur.id){
            return (num+1)*20+allHeight;
          }
          num++;
        }
      })
      return {
        num:num,
        top:(num+1)*20+allHeight
      };
    },
    startTimer = function(){
      if (config.duration > 0) {
        that.timer = setTimeout(function(){
          if (!that.closed) {
            that.close();
          }
        }, config.duration);
      }
    },
    clearTimer = function(){
      clearTimeout(that.timer);
    },
    btn = that.btn = dom.find('.dui-message__closeBtn');
    $('body').append(dom);//添加了元素
    // 获取元素的高度
    offsetHeight = that.offsetHeight = dom.outerHeight();
    // 设置z-index
    dom.css('display','none');//设置元素看不见
    dom.css('z-index',dui.getMaxZIndex()+1);//设置元素为最顶层
    // 设置过渡
    that.transition = dui.transition(dom[0],{
      name:'dui-message-fade',
      afterLeave:function(data){
        dom.remove();
        delete allPopup[id];
        resetTop('message');
      }
    })
    // 设置top
    var position = getTop('message',that);
    if(position.num>0)
    dom.css('top',position.top);
    // 设置事件
    dom.hover(clearTimer,startTimer);
    // 设置点击事件
    btn.on('click',function(e){
      that.close();
    })
    // 显示
    that.transition.show();
    startTimer();
  },
  seed = 1,//每一个popup的唯一编号，自增
  allPopup = {},
  Items = {
    message:message,

  }
  //关闭方法
  message.prototype.close=function(){
    this.transition.hide();
  }
  popup.message = function(msg,options){
    options = $.extend(true,options,{message:msg});
    return popup('message',options);
  }
  popup.close = function(id){

  }
  popup.closeAll = function(){

  }
  return popup;
})
dui.define('popup',['jquery'],function($){
  var popup = function(type,options){
    var ins = new Items[type](options);
    ins.type = type;
    allPopup.push(ins);
    return ins;
  },
  resetMessage = function(){
    var pups = [],currenheight=0,type='message';
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
  }
  resetNotification=function(x,y){
    var pups = [],currenheight=0,type='notify';
    $.each(allPopup,function(i,item){
      if(type==item.type && x==item.horizontalClass && y==item.verticalProperty){
        pups.push(item);
      }
    })
    $.each(pups,function(i,item){
      var $dom = item.dom,height=item.offsetHeight;
      $dom.css(y,((i+1)*20)+currenheight);
      currenheight += height;
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
            return '<i class="dui-message__icon dui-icon-'+config.type+'"></i>';
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
  notification = function(options){
    var that = this,id = that.id = 'popup-'+seed++,
    config = that.config = $.extend(true,{
      title:'',
      position:'top-right',
      message:'',
      type:'',
      iconClass:'',
      customClass:'',
      duration:3000,
      showClose:true,
      center:false,
      onClose:'',
      onClick:'',
      offset:20
    },options),
    horizontalClass  = that.horizontalClass  = config.position.indexOf('right')!==-1?'right':'left',
    verticalProperty = that.verticalProperty = /^top-/.test(config.position) ? 'top' : 'bottom',
    typeClass = 'dui-notification__icon dui-icon-'+config.type,
    template = that.template = [
      '<div class="dui-notification '+horizontalClass+(config.customClass? ' '+config.customClass:'')+'" id="'+id+'">',
        (config.type || config.iconClass ? '<i class="'+(config.type ? typeClass : config.iconClass)+'"></i>':''),
        '<div class="dui-notification__group'+(config.type || config.iconClass ? ' is-with-icon':'')+'">',
          '<h2 class="dui-notification__title">'+config.title+'</h2>',
          config.message ? '<div class="dui-notification__content"><p>'+config.message:'',
          config.message ? '</p></div>':'',
          config.showClose ? '<div class="dui-notification__closeBtn dui-icon-close"></div>':'',
        '</div>',
      '</div>'
    ].join(''),
    dom = that.dom = $(template),
    getPosition = function(cur){
      var num = 0,allHeight=0,type='notify';
      $.each(allPopup,function(id,item){
        if(item.type == type && cur.verticalProperty==item.verticalProperty && cur.horizontalClass==item.horizontalClass){
          allHeight += item.offsetHeight;
          if(item.id==cur.id){
            return (num+1)*20+allHeight;
          }
          num++;
        }
      })
      return {
        num:num,
        px:(num+1)*20+allHeight
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
    btn = that.btn = dom.find('.dui-notification__closeBtn');
    $('body').append(dom);//添加了元素
    // 获取元素的高度
    offsetHeight = that.offsetHeight = dom.outerHeight();
    // 设置z-index
    dom.css('display','none');//设置元素看不见
    dom.css('z-index',dui.getMaxZIndex()+1);//设置元素为最顶层
    // 设置过渡
    that.transition = dui.transition(dom[0],{
      name:'dui-notification-fade',
      afterLeave:function(data){
        dom.remove();
      }
    })
    // 设置top
    var position = getPosition(that);
    // 设置距离
    dom.css(verticalProperty,position.px);
    // 设置事件
    dom.hover(clearTimer,function(){
      if(config.duration!==0){
        startTimer();
      }
    });
    // 设置点击事件
    btn.on('click',function(e){
      that.close();
    })
    // 设置主体点击事件
    if(typeof config.onClick==="function"){
      dom.on('click',function(e){
        config.onClick.call(this,e);
      })
    }
    // 显示
    that.transition.show();
    if(config.duration!==0){
      startTimer();
    }
  },
  dialog = function(options){
    var that = this,id = that.id = 'popup-'+seed++,
    config = that.config = $.extend(true,{
      title:'',
      content:'',
      offset:'auto',
      type:'',
      width:'50%',
      top:'',
      modal:true,
      modalClose:false,//点击modal是否关闭
      customClass:'',
      showClose:true,
      center:false,
      close:'',//关闭的回调函数
      closed:'',//关闭动画完成后回调
      btns:['确定','取消'],//按钮
      btnAngin:'right',//btn显示的
    },options),
    btns = that.btns = function(){
      var res = [],thisBtn = $.extend(true,{},config).btns,
      btns = config.btnAngin=='right' ? thisBtn.reverse() : thisBtn;
      $.each(btns,function(i,btn){
        var btnStr = [
          '<button type="button" class="dui-button dui-button--'+((config.btnAngin=='right'&&i==(btns.length-1)|| (config.btnAngin!='right'&&i==0))?'primary':'default')+' dui-button--small">',
            '<span>'+btn+'</span>',
          '</button>'
        ].join('');
        res.push(btnStr);
      })
      return res.join('');
    }(),
    template = [
      '<div class="dui-popup'+(config.customClass?' '+config.customClass:'')+'">',
        '<div class="dui-popup__header">',
          '<div class="dui-popup__title">',
            '<span>'+config.title+'</span>',
          '</div>',
          config.showClose ? '<button type="button" class="dui-popup__headerbtn"><i class="dui-popup__close dui-icon-close"></i></button>':'',
        '</div>',
        '<div class="dui-popup__content">'+config.content+'</div>',
        '<div class="dui-popup__btns"'+((config.btnAngin!='right')?'style=" text-align:'+config.btnAngin+';"':'')+'>'+btns+'</div>',
      '</div>',
      config.modal?'<div class="dui-modal"></div>':''
    ].join(''),
    dom = that.dom = $(template);
    // 给元素设置z-index
    $(dom[0]).css('z-index',dui.getMaxZIndex()+2);//dialog元素
    config.modal && $(dom[1]).css('z-index',dui.getMaxZIndex()+1);//modal元素
    // 设置元素不可见
    $(dom[0]).css('display','none');//dialog元素
    config.modal && $(dom[1]).css('display','none');//modal元素
    // 元素设置过渡
    var modal = that.modalTransition = dui.transition(dom[1],{
      name:'v',
      duration:200,
      beforeEnter:function(el){
        $(el).addClass('dui-modal-enter');
      },
      afterEnter:function(el){
        $(el).removeClass('dui-modal-enter');
      },
      beforeLeave:function(el){
        $(el).addClass('dui-modal-leave');
      },
      afterLeave:function(el){
        $(el).removeClass('dui-modal-leave');
        dom[0].remove();
      }
    });
    that.transition = dui.transition(dom[0],{
      name:'popup-fade',
      beforeEnter:function(){
        config.modal && modal.show();
      },
      beforeLeave:function(){
        config.modal && modal.hide();
      },
      afterLeave:function(){
        dom.remove();
        if(typeof config.closed==="function"){
          config.closed.call()
        }
      }
    })
    // 添加元素
    $('body').append(dom);
    // 设置元素宽度和offset
    // 换算width
    var getWidth = function(){
      if(typeof config.width === "number"){
        return config.width;
      }else if(config.width.indexOf('%')!==-1){
        var warray = config.width.split('%'),
        num = Number(warray[0]);
        return ($('body').width()*num/100);
      }else if(config.width.indexOf('px')!==-1){
        return (Number(config.width.split('px')[0]));
      }else{
        return ($('body').width()*50/100)
      }
    },
    // 换算offset
    getOffset = function(){
      if(typeof config.offset==="string"){
        if(config.offset=='auto'){
          return {
            top:(($('body').height()-$(dom[0]).outerHeight())/2),
            left:(($('body').width()-$(dom[0]).outerWidth())/2),
          }
        }else if(config.offset.indexOf('%')!==-1){
          var warray = config.offset[0].split('%'),
            num = Number(warray[0]);
          return {
            top:($('body').width()*num/100)
          };
        }else if(config.offset.indexOf('px')!==-1){
          var warray = config.offset[0].split('px'),
            num = Number(warray[0]);
          return {
            top:num
          };
        } 
      }else if($.isArray(config.offset)){
        var top = function(){
          if(typeof config.offset[0] === "number"){
            return config.offset[0];
          }else if(config.offset[0].indexOf('%')!==-1){
            var warray = config.offset[0].split('%'),
            num = Number(warray[0]);
            return ($('body').width()*num/100);
          }else if(config.offset[0].indexOf('px')!==-1){
            return (Number(config.offset[0].split('px')[0]));
          }else{
            return ($('body').width()*10/100)
          }
        }();
        var left = function(){
          if(typeof config.offset[1] === "number"){
            return config.offset[1];
          }else if(config.offset[1].indexOf('%')!==-1){
            var warray = config.offset[1].split('%'),
            num = Number(warray[1]);
            return ($('body').width()*num/100);
          }else if(config.offset[1].indexOf('px')!==-1){
            return (Number(config.offset[1].split('px')[0]));
          }else{
            return ($('body').width()*10/100)
          }
        }();
        return {
          top:top,
          left:left,
        }
      }else if(typeof config.offset==="number"){
        return {
          top:config.offset
        }
      }
    },
    // 设置width，offset
    setResize = function(){
      var width = getWidth();
      $(dom[0]).css('width',width);
      var offset = getOffset();
      $(dom[0]).css('top',offset.top);
      $(dom[0]).css('left',offset.left);
    }
    setResize();
    // 设置关闭按钮事件
    dom.find('.dui-popup__headerbtn').on('click',function(e){
      that.close();
    })
    // 按钮的回调
    dom.find('.dui-popup__btns>button').each(function(i,item){
      $(item).on('click',function(e){
        if(config.btnAngin=='right'){
          if(typeof config['btn'+((config.btns.length-1)-i)]==="function"){
            config['btn'+((config.btns.length-1)-i)].call(this,e);
          }
        }else{
          if(typeof config['btn'+i]==="function"){
            config['btn'+(config.btns.length-i)].call(this,e);
          }
        }
      })
    })
    // modal点击关闭事件
    if(config.modal && config.modalClose){
      $(dom[1]).on('click',function(e){
        that.close();
      })
    }
    // 显示元素
    that.transition.show();
  },
  seed = 1,//每一个popup的唯一编号，自增
  allPopup = [],
  Items = {
    message:message,
    notify:notification,
    dialog:dialog,
  }
  //关闭方法
  message.prototype.close=function(){
    var  that = this;
    $.each(allPopup,function(i,item){
      if(item && item.id==that.id){
        allPopup.splice(i,1);
      }
    })
    resetMessage();
    this.transition.hide();
    // 回调
    if(typeof that.config.onClose ==="function"){
      that.config.onClose.call()
    }
  }
  notification.prototype.close = function(){
    var  that = this;
    $.each(allPopup,function(i,item){
      if(item && item.id==that.id){
        allPopup.splice(i,1);
      }
    })
    resetNotification(that.horizontalClass,that.verticalProperty);
    this.transition.hide();
    // 回调
    if(typeof that.config.onClose ==="function"){
      that.config.onClose.call()
    }
  }
  dialog.prototype.close = function(){
    var  that = this;
    $.each(allPopup,function(i,item){
      if(item && item.id==that.id){
        allPopup.splice(i,1);
      }
    })
    this.transition.hide();
    // 回调
    if(typeof that.config.close ==="function"){
      that.config.close.call()
    }
  }
  popup.message = function(msg,options){
    options = $.extend(true,options,{message:msg});
    return popup('message',options);
  }
  popup.notify= function(title,options){
    options = $.extend(true,options,{
      title:title
    })
    return popup('notify',options);
  }
  popup.dialog = function(options){
    return popup('dialog',options);
  }
  popup.msgbox = function(options){
    var type = options.type,
    message = options.message,
    content = [
      type?'<div class="dui-popup__status dui-icon-'+type+'"></div>':'',
      '<div class="dui-popup__message"><p>'+message+'</p></div>',
    ].join('');
    options = $.extend(true,options,{
      width:'420px',
      content:content,
    })
    return popup('dialog',options);
  }
  popup.close = function(id){

  }
  popup.closeAll = function(){

  }
  return popup;
})
import $ from "jquery";
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
  },
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
    dom.find('.dui-message__content').html('').append(config.message);
    $('body').append(dom);//添加了元素
    // 获取元素的高度
    var offsetHeight = that.offsetHeight = dom.outerHeight();
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
    var offsetHeight = that.offsetHeight = dom.outerHeight();
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
    var that = this,
    warp_class='dui-popup__wrap',id = that.id = 'popup-'+seed++,
    config = that.config = $.extend(false,{
      title:'',
      content:'',
      offset:'auto',
      type:'',
      htmlAppend:'',//完成渲染后的会回调
      done:'',//页面渲染完毕，可以显示的时候
      width:'50%',
      height:'auto',
      top:'',
      showFooter:true,//是否显示脚
      modal:true,
      modalClose:false,//点击modal是否关闭
      customClass:'',
      showClose:true,
      move:true,
      moveOut:false,
      center:false,
      close:'',//关闭的回调函数
      closed:'',//关闭动画完成后回调
      btns:['确定','取消'],//按钮
      btnAlign:'right',//btn显示的
    },options),
    btns = that.btns = function(){
      var res = [],thisBtn = $.extend(true,{},config).btns,
      btns = config.btnAlign=='right' ? thisBtn.reverse() : thisBtn;
      $.each(btns,function(i,btn){
        var btnStr = [
          '<button type="button" class="dui-button dui-button--'+((config.btnAlign=='right'&&i==(btns.length-1)|| (config.btnAlign!='right'&&i==0))?'primary':'default')+' dui-button--small">',
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
            '<span style="display:block">'+config.title+'</span>',
          '</div>',
          config.showClose ? '<button type="button" class="dui-popup__headerbtn"><i class="dui-popup__close dui-icon-close"></i></button>':'',
        '</div>',
        '<div class="dui-popup__content"></div>',
        config.showFooter?'<div class="dui-popup__btns"'+((config.btnAlign!='right')?'style=" text-align:'+config.btnAlign+';"':'')+'>'+btns+'</div>':'',
      '</div>',
      config.modal?'<div class="dui-modal"></div>':''
    ].join(''),
    _doc = $(document),
    win  = $(window),
    dom = that.dom = $(template),
    header = that.header = dom.find('.dui-popup__header'),
    content = that.content = dom.find('.dui-popup__content'),
    footer = that.footer = dom.find('.dui-popup__btns'),
    closeBtn = that.closeBtn = header.find('.dui-popup__headerbtn'),
    clickbtns = footer.find('button');
    // 添加元素
    content.append(config.content);
    // 给元素设置z-index
    $(dom[0]).css('z-index',dui.getMaxZIndex()+2);//dialog元素
    config.modal && $(dom[1]).css('z-index',dui.getMaxZIndex()+1);//modal元素
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
      duration:300,
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
    // 换算高
    getHeight = function(){
      if(typeof config.height === "number"){
        return config.height;
      }else if(config.height.indexOf('%')!==-1){
        var warray = config.height.split('%'),
        num = Number(warray[0]);
        return ($('body').height()*num/100);
      }else if(config.height.indexOf('px')!==-1){
        return (Number(config.height.split('px')[0]));
      }else{
        return 'auto';
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
            num = parseFloat(warray[0]);
          return {
            top:($('body').width()*num/100)
          };
        }else if(config.offset.indexOf('px')!==-1){
          var warray = config.offset[0].split('px'),
            num = parseFloat(warray[0]);
          return {
            top:num
          };
        }
      }else if($.isArray(config.offset)){
        var top = function(){
          if(config.offset[0]=='auto'){
            return (($('body').height()-$(dom[0]).outerHeight())/2);
          }
          else if(typeof config.offset[0] === "number"){
            return config.offset[0];
          }else if(config.offset[0].indexOf('%')!==-1){
            var num = parseFloat(config.offset[0]);
            return ($('body').height()*num/100);
          }else if(config.offset[0].indexOf('px')!==-1){
            return (parseFloat(config.offset[0]));
          }else{
            return ($('body').height()*10/100)
          }
        }();
        var left = function(){
          if(config.offset[1]=='auto'){
            return (($('body').width()-$(dom[0]).outerWidth())/2);
          }
          else if(typeof config.offset[1] === "number"){
            return config.offset[1];
          }else if(config.offset[1].indexOf('%')!==-1){
            var warray = config.offset[1].split('%'),
            num = parseFloat(warray[1]);
            return ($('body').width()*num/100);
          }else if(config.offset[1].indexOf('px')!==-1){
            return (parseFloat(config.offset[1]));
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
          top:config.offset,
          left:($(window).width()-parseFloat($(dom).css('width')))/2
        }
      }
    },
    // 设置width，offset
    setResize = function(){
      var width = getWidth();
      $(dom[0]).css('width',width);
      var height = getHeight();
      if(height!=='auto'){
        $(dom[0]).css('height',height);
        //设置body的高度
        //获取headerHeight
        var hearderHeight = header.outerHeight();
        var buttonHeight = footer.outerHeight();
        var thisPadding = parseFloat(content.css('padding-top'))+parseFloat(content.css('padding-bottom'));
        var bodyHeight = height-hearderHeight-buttonHeight-thisPadding;
        content.css({
          'max-height':bodyHeight,
          'overflow-y':'auto'
        });
      }
      var offset = getOffset();
      offset.top = offset.top<0 ? 20 : (offset.top);
      $(dom[0]).css('top',offset.top);
      $(dom[0]).css('left',offset.left);
      if(config.height=='auto'){
        $(dom[0]).css('margin-bottom','50px');
      }
    }
    // 重置宽高和position
    setResize();
    if(config.htmlAppend && typeof config.htmlAppend==="function"){
      config.htmlAppend.call(that,config);
    }
    // 设置元素不可见
    dom.css('display','none');
    // 设置关闭按钮事件
    closeBtn.on('click',function(e){
      that.close();
    })
    // 设置拖拽事件
    var move = {},
    docmousemove = function(e){
      if(move.moveStart){
        e.preventDefault();
        var X = e.clientX - move.start.left
          , Y = e.clientY - move.start.top
          , fixed = $(dom[0]).css('position') === 'fixed';
          move.stX = fixed ? 0 : win.scrollLeft();
          move.stY = fixed ? 0 : win.scrollTop();
          //控制元素不被拖出窗口外
          if (!that.config.moveOut) {
            var setRig = win.width() - $(dom[0]).outerWidth() + move.stX
              , setBot = win.height() - $(dom[0]).outerHeight() + move.stY;
            X < move.stX && (X = move.stX);
            X > setRig && (X = setRig);
            Y < move.stY && (Y = move.stY);
            Y > setBot && (Y = setBot);
          }
          $(dom[0]).css({
            left: X
            , top: Y
          });
      }
    },
    docmouseup = function(e){
      delete move.moveStart;
    };
    // 如果配置允许移动才移动
    if(config.move){
      header.on('mousedown',function(e){
        e.preventDefault();
        move.moveStart =true;
        move.start = {
          left:(e.clientX - parseFloat($(dom[0]).css('left'))),
          top:(e.clientY - parseFloat($(dom[0]).css('top')))
        }
      })
      _doc.on('mousemove',docmousemove).on('mouseup',docmouseup)
    }else{
      header.css('cursor','default');
    }
    // 设置点击按钮事件
    clickbtns.each(function(i,item){
      $(item).on('click',function(e){
        if(config.btnAlign=='right'){
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
    // 设置wind大小发生变化事件
    $(window).on('resize',function(e){
      setResize();
    })
    // modal点击关闭事件
    if(config.modal && config.modalClose){
      $(dom[1]).on('click',function(e){
        that.close();
      })
    }
    if(config.done && typeof config.done==="function"){
      var res = config.done.call(that,config);
      if(res){
        // 显示元素
        that.transition.show();
      }
    }else{
      // 显示元素
      that.transition.show();
    }
  },
  loading= function(options){
    var that = this,id = that.id = 'popup-'+seed++,
    config = that.config = $.extend(true,{
      target:'',
      fullscreen:true,
      lock:false,
      text:'',
      spinner:'',
      background:'',
      customClass:''
    },options),
    template = [
      '<div class="dui-loading-mask" '+(config.background ? (' style="background-color:'+config.background+'"'):'')+'>',
        '<div class="dui-loading-spinner">',
          config.spinner?'<i class="'+config.spinner+'"></i>':'<svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg>',
          config.text? '<p class="dui-loading-text">'+config.text+'</p>':'',
        '</div>',
      '</div>',
    ].join('');
    // 如果没有target则直接返回
    if(!config.target) return;
    var target = that.target = $(config.target);
    // 需要插入的元素
    var showDom = that.showDom = $(template);
    // 设置元素为none
    showDom.css('display','none');
    // 设置过渡
    var transition = that.transition = dui.transition(showDom[0],{
      name:'dui-loading-fade',
      afterLeave:function(el){
        // 给target添加class
        target.removeClass('dui-loading-parent--relative');
        // 如果是lock
        target.removeClass('dui-laoding-parent--hidden');
        // 移除显示元素
        showDom.remove();
      }
    })
  },
  seed = 1,//每一个popup的唯一编号，自增
  allPopup = [],
  Items = {
    message:message,
    notify:notification,
    dialog:dialog,
    loading:loading,
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
  // 显示方法
  loading.prototype.show = function(){
    var that = this,config=that.config;
    // 给target添加class
    that.target.addClass('dui-loading-parent--relative');
    // 如果是lock
    config.lock && that.target.addClass('dui-laoding-parent--hidden');
    // 添加元素
    that.target.append(that.showDom);
    // 显示元素
    that.transition.show();
  }
  // 关闭方法
  loading.prototype.close = function(){
    var  that = this;
    $.each(allPopup,function(i,item){
      if(item && item.id==that.id){
        allPopup.splice(i,1);
      }
    })
    that.transition.hide();
  }
  popup.loading = function(options){
    options = $.extend(true,{},options);
    return popup('loading',options);
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
  popup.messageBox = function(options){
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
  popup.confirm = function(message,options){
    options = options || {};
    var type = 'question',title=options.title||'信息',
    thisOpt = {
      title:title,
      type:type,
      message:message
    };
    $.each(arguments,function(i,val){
      if(i>1){
        //设置回调函数
        thisOpt['btn'+(i-2)] = val;
      }
    })
    console.log(thisOpt);
    options = $.extend(true,options,thisOpt)
    return popup.messageBox(options);
  }
  popup.alert = function(message,options){
    options = options || {};
    var type = 'info',title=options.title||'信息',
    callBack = arguments[2],
    thisOpt = {
      title:title,
      type:type,
      message:message,
      btns:['确定'],
      btn0:function(el){
        thisPop.close();
        if(callBack && typeof callBack==="function"){
          callBack.call(this,el);
        }
      }
    };
    options = $.extend(true,options,thisOpt);
    var thisPop = popup.messageBox(options);
    return thisPop;
  }
  popup.close = function(id){

  }
  popup.closeAll = function(){

  }
  export default popup;
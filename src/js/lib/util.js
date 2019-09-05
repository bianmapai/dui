import { each, extend, type } from "./loadjs";
import { getStyle } from "./dom";
/**
 * 下一帧执行的方法
 */
export var nextFrame = window.requestAnimationFrame ? window.requestAnimationFrame : function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
    window.setTimeout(function() {
        callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
}
/**
 * 设置某个函数只执行一次
 * @param {function} fn 只使用一次的函数
 * @returns {function} fn 返回只执行一次的函数
 */
export function once (fn){
    var called = false;
    return function () {
      if (!called) {
        called = true
        fn.apply(this, arguments)
      }
    }
}
/**
 * 获取指定元素的模拟node
 * @param {Element} el 要获取Vnode的属性
 * @param {Object} defaultProp 要获取的默认属性
 * @param {Object} Prop 参数属性
 */
export function setVnode(el){
    if(!el.vnode){
        var attrs = el.attributes,
        vnode = {
            elm:el,
            data:{

            },
            event:{

            },
            attrs:{

            },
            props:{

            }
        };
        each(attrs,function(key,attr){
            var attrName = attr.name;
            var value = attr.nodeValue;
            vnode.attrs[attrName] = value;
        })
        el.vnode = vnode;
    }
}
/**
 * 给元素设置dui识别数据
 * @param {Element} el 要设置属性的元素
 * @param {String} name 数据名称
 * @param {Object} option 传递的数据
 */
export function setData(el,name,option){
    if(!el.vnode){
        setVnode(el);
    }
    el.vnode.data[name] = extend(true,{},option);
}
/**
 * 给网页元素设置方法//统一委托
 * @param {Element} el 要给那个设置回调方法
 * @param {String} name 要给那个组件设置
 * @param {String} type 设置什么方法
 * @param {function} fn 回调函数
 */
export function bind(el,name,type,fn){
    if(!el.vnode){
        setVnode(el);
    }
    if(!el.vnode.event[name]){
        el.vnode.event[name] = {};
    }
    el.vnode.event[name][type] = fn;
}
/**
 * 给网页元素取消方法//统一委托
 * @param {Element} el 要给那个设置回调方法
 * @param {String} name 要给那个组件设置
 * @param {String} type 取消什么方法
 * @param {function} fn 回调函数
 */
export function unbind(el,name,type,fn){
    if(!el.vnode){
        return;
    }
    el.vnode.event[name] && el.vnode.event[name][type] && delete el.vnode.event[name][type];
}
/**
 * 给元素设置props
 * @param {Element} el 要设置属性的元素
 * @param {String} name 给哪个组件设置
 * @param {Object} propconfig 默认属性
 */
export function setProps(el,name,propconfig){
    if(!el.vnode){
        setVnode(el);
    }
    el.vnode.props[name] = {};
    each(propconfig,function(k,info){
        var thisk = toLowerLine(k).replace('','');
        //设置默认值
        if(el.vnode.attrs[thisk]){
            //有值
            if(typeof info === "function"){
                if(info===Boolean){
                    el.vnode.props[name][k] = el.vnode.attrs[thisk] == 'true' ? true : false;
                }else if(info===Number){
                    el.vnode.props[name][k] = Number(el.vnode.attrs[thisk]);
                }else if(info===String){
                    el.vnode.props[name][k] = String(el.vnode.attrs[thisk]);
                }
            }else{
                if('array'===type(info.type)){
                    var value;
                    if(['true','false'].indexOf(el.vnode.attrs[thisk])!=-1){
                        value = el.vnode.attrs[thisk]=='true' ? true : false;
                    }else if(el.vnode.attrs[thisk]===(Number(el.vnode.attrs[thisk])+'')){
                        value = Number(el.vnode.attrs[thisk]);
                    }else{
                        value = String(el.vnode.attrs[thisk]);
                    }
                    el.vnode.props[name][k] = value;
                }else{
                    if(info.type(el.vnode.attrs[thisk])){
                        el.vnode.props[name][k] = info.type(el.vnode.attrs[thisk]);
                    }else{
                        if(typeof propconfig[k].default==="undefined"){
                            var converFunction;
                            if(type(propconfig[k].type)==='array'){
                                converFunction = propconfig[k].type[0];
                            }else{
                                converFunction = propconfig[k].type;
                            }
                            if(converFunction===Boolean){
                                el.vnode.props[name][k] = false;
                            }else if(converFunction===Number){
                                el.vnode.props[name][k] = 0;
                            }else{
                                el.vnode.props[name][k] = '';
                            }
                        }
                    }
                }
            }
        }else{
            if(type(info)==='function'){
                if(info===Boolean){
                    el.vnode.props[name][k] = false;
                }else if(info===Number){
                    el.vnode.props[name][k] = 0;
                }else{
                    el.vnode.props[name][k] = '';
                }
            }else{
                if(typeof info.default !=="undefined"){
                    el.vnode.props[name][k] = info.default;
                }else{
                    var converFunction;
                    if(type(info.type)==='array'){
                        converFunction = info.type[0];
                    }else{
                        converFunction = info.type;
                    }
                    if(converFunction===Boolean){
                        el.vnode.props[name][k] = false;
                    }else if(converFunction===Number){
                        el.vnode.props[name][k] = 0;
                    }else{
                        el.vnode.props[name][k] = '';
                    }
                }
            }
        }
    })
}
/**
 * 带-的字符串转驼峰
 * @param {Sring} str 要转换的字符串
 */
export function toCamel(str) {
    return str.replace(/([^-])(?:-+([^-]))/g, function ($0, $1, $2) {
      return $1 + $2.toUpperCase();
    });
}
/**
 * 驼峰转呆横线的字符串
 * @param {Sting} str 要转换的字符串
 */
export function toLowerLine(str) {
	var temp = str.replace(/[A-Z]/g, function (match) {	
		return "-" + match.toLowerCase();
  	});
  	if(temp.slice(0,1) === '-'){ //如果首字母是大写，执行replace时会多一个-，这里需要去掉
  		temp = temp.slice(1);
  	}
	return temp;
};
/**
 * 把一个字符串自动转到适应类型
 * @param {String} value 任何数
 * @param {any} convertType 要转换的类型
 */
export function convertProp(value,convertType){
    if(type(convertType)==='array'){
            if(['true','false'].indexOf(value)!=-1){
                value= value=='true'? true : false;
            }else if(value===(Number(value)+'')){
                value = Number(value);
            }else{
                value = String(value);
            }
    }else{
        value = convertType(value);
    }
    return value;
}
/**
 * 获取当前页面最大的z-index
 */
export function getMaxZIndex(){
	var all = document.querySelectorAll('*');
	var maxZ = 0;
	each(all,function(index,item){
		if(parseInt(getStyle(item,'z-index'))>maxZ){
			maxZ = parseInt(getStyle(item,'z-index'));
		}
	})
	return maxZ;
}
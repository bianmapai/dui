import { each, type } from "./loadjs";
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
 * 获取指定元素的Attr属性值
 * @param {Element} el 要获取的元素
 * @param {Object} propsCfg 要获取的类型配置
 */
export function getProps(el,propconfig){
    var attrs = el.attributes;
    var attrsObj = {};
    var props = {};
    each(attrs,function(key,attr){
        var attrName = attr.name;
        var value = attr.nodeValue;
        attrsObj[attrName] = value;
    })
    each(propconfig,function(k,info){
        var thisk = toLowerLine(k).replace('','');
        //设置默认值
        if(attrsObj[thisk]){
            //有值
            if(typeof info === "function"){
                if(info===Boolean){
                    props[k] = attrsObj[thisk] == 'true' ? true : false;
                }else if(info===Number){
                    props[k] = Number(attrsObj[thisk]);
                }else if(info===String){
                    props[k] = String(attrsObj[thisk]);
                }
            }else{
                if('array'===type(info.type)){
                    var value;
                    if(['true','false'].indexOf(attrsObj[thisk])!=-1){
                        value = attrsObj[thisk]=='true' ? true : false;
                    }else if(attrsObj[thisk]===(Number(attrsObj[thisk])+'')){
                        value = Number(attrsObj[thisk]);
                    }else{
                        value = String(attrsObj[thisk]);
                    }
                    props[k] = value;
                }else{
                    if(info.type(attrsObj[thisk])){
                        props[k] = info.type(attrsObj[thisk]);
                    }else{
                        if(typeof propconfig[k].default==="undefined"){
                            var converFunction;
                            if(type(propconfig[k].type)==='array'){
                                converFunction = propconfig[k].type[0];
                            }else{
                                converFunction = propconfig[k].type;
                            }
                            if(converFunction===Boolean){
                                props[k] = false;
                            }else if(converFunction===Number){
                                props[k] = 0;
                            }else{
                                props[k] = '';
                            }
                        }
                    }
                }
            }
        }else{
            if(type(info)==='function'){
                if(info===Boolean){
                    props[k] = false;
                }else if(info===Number){
                    props[k] = 0;
                }else{
                    props[k] = '';
                }
            }else{
                if(typeof info.default !=="undefined"){
                    props[k] = info.default;
                }else{
                    var converFunction;
                    if(type(info.type)==='array'){
                        converFunction = info.type[0];
                    }else{
                        converFunction = info.type;
                    }
                    if(converFunction===Boolean){
                        props[k] = false;
                    }else if(converFunction===Number){
                        props[k] = 0;
                    }else{
                        props[k] = '';
                    }
                }
            }
        }
    })
    return props;
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
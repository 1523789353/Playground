// 16,863,438,848字节
(16863438848).toLocaleString('zh', {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'long'
});
// 临时转格式
Number.protocal.toLocaleString
// 批量转格式(更高性能)
Intl.NumberFormat



var _toFixed = Number.prototype.toFixed
function toFixed(fractionDigits = 0){
	if (-100 <= fractionDigits && fractionDigits < 0) {
		return String(this).padStart(String(this).length - String(Number.parseInt(this)).length - fractionDigits, 0)
	} else {
		return _toFixed.apply(this, arguments);
	}
}
Number.prototype.toFixed = toFixed;



// 保留数字
var toNumArr=arr=>arr.map(i=>parseFloat(i)).filter(i=>!isNaN(i))
// 求和
var sum=arr=>arr.length&&arr.reduce((a,b)=>a+b)
// 求平均数
var avg=arr=>arr.length&&sum(arr)/arr.length
// 数组转集合
var unite=(arr,fn)=>arr.reduce((ret, item, index)=>((obj,key,value)=>(obj[key]?obj[key].push(value):obj[key]=[value])&&obj)(index==1?{[fn(ret)]:[ret]}:ret,fn(item),item))





Array.prototype.toNumArr=function(){return this.map(i=>parseFloat(i)).filter(i=>!isNaN(i))}
Array.prototype.sum=function(){return this.length&&this.reduce((a,b)=>a+b)}
Array.prototype.avg=function(){return this.length&&this.sum()/this.length}
Array.prototype.unite=function(fn){return this.reduce((ret,item,index)=>((obj,key,value)=>(obj[key]?obj[key].push(value):obj[key]=[value])&&obj)(index==1?{[fn(ret)]:[ret]}:ret,fn(item),item))}




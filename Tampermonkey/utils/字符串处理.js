var getDay = (year, month) => {
	var date=new Date();
	date.setYear(year);
	date.setMonth(month);
	date.setDate(0);
	return Array(date.getDate()).fill().map((_,i)=>i+1);
}
String.prototype.replaceAll = function(matcher, replaceStr="") {
	replaceStr = replaceStr.toString();
	if (matcher instanceof RegExp) {
        return this.replace(new RegExp(matcher,'g'),replaceStr)
		var CharArr = [...this], i = 0;
		[...matcher.global?this.matchAll(matcher):this.match(matcher)].forEach(matchRes => {
			CharArr.splice(matchRes.index + i,matchRes.length,...replaceStr);
			i += replaceStr.length - matchRes.length;
		});
		return CharArr.join('');
	} else {
		return this.split(matcher.toString()).join(replaceStr);
	}
}

html_str
.replaceAll('&','&amp;')
.replaceAll('<','&lt;')
.replaceAll('>','&gt;')
.replaceAll("'",'&apos;')
.replaceAll('"','&quot;')
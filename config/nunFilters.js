
module.exports = function (app, nunjucks) {
	var env = nunjucks.configure('projects', {
	    autoescape: true,
	    express: app
	});

	// var env = new nunjucks.Environment();
	env.addFilter('subDoubleByte', function(str, len) {
	  if(len === +len && len > 0 && len < str.length){
	    var reg = /[^\x00-\xff]/,
	        sub = i = 0,
	        arr = str.split('');
	    len *= 2;
	    for(var l = str.length; sub < len && i < l; ++i){
	      reg.test(str[i]) ? sub+=2 : ++sub;
	    }
	    return str.substr(0, i-1)+'…';
	  }
	  return str;
	});
	env.addFilter('splitBirthday', function(str, tag, i) {
	  if(str.length < 18){str += ' 00:00:00';}
	  str = str.substr(0, str.length - 9);
	  if(!tag){
	    return str;
	  }
	  var arr = str.split(tag);
	  if(i in [0,1,2]){
	    return arr[i]
	  }
	  str = arr[0]+'年'+arr[1]+'月'+arr[2]+'日';
	  return str;
	});
}
	function Page(obj){
		var _this = this;
		this.option = $.extend({},{
			curPage : +obj.cur === obj.cur && obj.cur >0 ? obj.cur : 1,
			maxPage : obj.pages,
			objContainer : '.paginating'
		},obj);
		/*
		* @param curPage 当前页码
		* @param maxPage 最大页码
		*/
		if(_this.option.maxPage !== 1 && _this.option.maxPage !== 0) _this.renderPage();
	}
	Page.prototype.renderPage = function(){
		var _this = this,
				_a = '';
		if(_this.option.curPage !== 1){
			_a += '<a href="'+ _this.option.url +'&page='+(_this.option.curPage-1)+'">上一页</a>';
		}
		if(_this.option.maxPage > 10){
			var tmp = [];
			tmp.push('<a href="javascript:;" class="cur">'+_this.option.curPage+'</a>')
			for(var i = 1; i <= 5; ++i){
				if(_this.option.curPage+i <= _this.option.maxPage) tmp.push('<a href="'+_this.option.url+'&page='+(_this.option.curPage+i)+'">'+(_this.option.curPage+i)+'</a>');
				if(_this.option.curPage-i > 0) tmp.unshift('<a href="'+_this.option.url+'&page='+(_this.option.curPage-i)+'">'+(_this.option.curPage-i)+'</a>');
			}
			_a += tmp.join('');
		}else{
			for(var i = 1; i <= _this.option.maxPage; ++i){
				if(i === _this.option.curPage){
					_a += '<a class="cur" href="javascript:;"'+i+'>'+i+'</a>';
				}else{
					_a += '<a href="'+_this.option.url+'&page="'+i+'>'+i+'</a>';
				}
			}
		}
		if(_this.option.curPage !== _this.option.maxPage){
			_a += '<a href="'+_this.option.url+'&page='+(_this.option.curPage+1)+'">下一页</a>';
		}
		$(_this.option.objContainer).html(_a);
	};
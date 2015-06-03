	function Page(url, obj, trObj, goPage, cur){
		var _this = this;
		this.curPage = +cur === cur && cur >0 ? cur : 1;
		this.url = url;
		this.index = 0;
		this.goPage = 0;
		this.data = {
			member_id : 59,
			type: 3,
			page: 0,
			page_size: 10
		};

		_this.pagesObj = $(obj) || $('.paginating .page_list');
		_this.trObj = $(trObj) || $('.tab_content tbody tr');
		_this.maxPage = _this.pagesObj.children('a').last().data('page');
		_this.bindEvent();
	}

	Page.prototype.bindEvent = function(){
		var _this = this;
		_this.pagesObj.on('click', 'a', function(){
			_this.data.page = $(this).data('page');
			_this.index = $(this).index();
			if($(this).siblings('i') && $(this).siblings('i').hasClass('front')) _this.index-=1;
			if(!$(this).hasClass('cur')) _this.ajax();
		});
	};

	Page.prototype.renderPage = function(){
		var _this = this,
				_a = '';
		// prePageNextPage();
		if(_this.maxPage > 10 && Math.abs(_this.data.page - _this.curPage) > 5){
			_a += '<i class="front">…</i>';
			for(var i = 4; i >= 1 && _this.data.page - i >= 1; --i){
				_a += '<a style="cursor:pointer" data-page="'+(_this.data.page - i)+'">'+(_this.data.page - i)+'</a>';
			}
			_a += '<a class="cur" data-page="'+_this.data.page+'">'+_this.data.page+'</a>';
			for(i = 1; i <= 4 && _this.data.page + i <= _this.maxPage; ++i){
				_a += '<a style="cursor:pointer" data-page="'+(_this.data.page + i)+'">'+(_this.data.page + i)+'</a>';
			}
			_a += '<i class="end">…</i>';
			_this.pagesObj.html(_a);
		}else{
			_this.pagesObj.children('a').removeClass('cur');
			_this.pagesObj.children('a').eq(_this.index).addClass('cur');
		}
		_this.curPage = _this.data.page;

	};

	Page.prototype.ajax = function(){
		var _this = this,
				_tr = '';
		$.ajax({
			url:this.url,
			data: this.data,
			success: function(data){
				for(var i = 0, l = data.pointsList.length; i < l; ++i){
					_tr += '<tr><td>'+data.pointsList[i].creation_time+'</td><td>'+data.pointsList[i].number+'</td><td style="text-align:left;">'+data.pointsList[i].remark+'</td></tr>';
				}
				_this.trObj.first().siblings().remove();
				_this.trObj.first().after(_tr);
				// window.scrollTo(0,0);
				_this.renderPage();
			}
		}	);
	};

	Page.prototype.nextPage = function(){
		var _this = this;
		_this.data.page += 1;
		_this.ajax();
	}
	Page.prototype.prePage = function(){
		var _this = this;
		_this.data.page -= 1;
		_this.ajax();
	}
	// Page.prototype.handleResponse = function(data){
	// 	var _tr = '',
	// 			_this = this;
	// 	for(var i = 0, l = data.pointsList.length; i < l; ++i){
	// 		_tr += '<tr><td>'+data.pointsList[i].creation_time+'</td><td>'+data.pointsList[i].number+'</td><td style="text-align:left;">'+data.pointsList[i].remark+'</td></tr>';
	// 	}
	// 	_this.trObj.first().siblings().remove();
	// 	_this.trObj.after(_tr);
	// 	window.scrollTo(0,0);
	// 	_this.renderPage();
	// };
	function Page(url, obj, trObj, goPage, cur){
		var _this = this;
		this.curPage = +cur === cur && cur >0 ? cur : 1;
		this.url = url;
		this.goPage = 0;
		this.data = {
			member_id : 59,
			type: 3,
			page: 0
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
			if(!$(this).hasClass('cur')) _this.ajax();
		});
	};

	Page.prototype.renderPage = function(){
		var _this = this,
				_a = '';
		// prePageNextPage();
		if(_this.maxPage > 10 && Math.abs(_this.data.page - _this.curPage) > 5){
			_a += '<i>…</i>';
			for(var i = 1; i <= 4; ++i){
				_a += '<a data-page="'+(_this.data.page - i)+'">'+(_this.data.page - i)+'</a>';
			}
			_a += '<a class="cur">'+_this.data.page+'</a>';
			for(i = 1; i <= 4; --i){
				_a += '<a data-page="'+(_this.data.page + i)+'">'+(_this.data.page + i)+'</a>';
			}
			_a += '<i>…</i>';
			_this.pagesObj.html(_a);
		}else{
			_this.pagesObj.children('a').eq(_this.curPage - 1).removeClass('cur');
			_this.pagesObj.children('a').eq(_this.data.page - 1).addClass('cur');
		}
		_this.curPage = _this.data.page;

	};

	Page.prototype.ajax = function(){
		var _this = this;
		$.ajax({
			url:this.url,
			data: this.data,
			success: _this.handleResponse
		});
	};
	Page.prototype.handleResponse = function(data){
		var _tr = '',
				_this = this;
		for(var i = 0, l = data.pointsList.length; i < l; ++i){
			_tr += '<tr><td>'+data.pointsList[i].creation_time+'</td><td>'+data.pointsList[i].number+'</td><td style="text-align:left;">'+data.pointsList[i].remark+'</td></tr>';
		}
		_this.trObj.first().siblings().remove();
		_this.trObj.after(_tr);
		window.scrollTo(0,0);
		_this.renderPage();
	};
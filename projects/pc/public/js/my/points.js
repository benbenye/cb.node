$(function(){
	$('.paginating').on('click','#getNextPage', function(){
		$.getJSON('/my/points/59/3/3/10',function(data){
			var li = '';
			for(var i = 0, l = data.pointsList.length; i < l; ++i){
				li += '<li>'+ data.pointsList[i].remark +'</li>'
			}
			$('.paginating ul').html(li);
		});
	});

	// 分页
	$('.page_list').on('click', 'a', function(){
		var member_id = 59,
				page = $(this).data('page'),
				type = 3,
				page_size = 10,
				getJsonUrl = '/my/points/page?member_id='+ member_id + '&type=' + type + '&page=' + page + '&page_size=' + page_size;

		$.getJSON(getJsonUrl, function(data){
			var tr = '';
			for(var i = 0, l = data.pointsList.length; i < l; ++i){
				tr += '<tr><td>'+ data.pointsList[i].modification_time +'</td>';
				tr += '<td>'+ data.pointsList[i].used_number +'</td>';
				tr += '<td style="text-align:left;">'+ data.pointsList[i].remark +'</td></tr>';
			}
			$('.points_table tr:gt(0)').remove();
			$('.points_table tr').after(tr);
		});
	})
});
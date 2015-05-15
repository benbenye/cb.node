$(function(){
	$('.paginating').on('click','#getNextPage', function(){
		$.getJSON('/mychunbo/points/59/3/3/10',function(data){
			var li = '';
			for(var i = 0, l = data.pointsList.length; i < l; ++i){
				li += '<li>'+ data.pointsList[i].remark +'</li>'
			}
			$('.paginating ul').html(li);
			console.log(data);
		});
	});
});
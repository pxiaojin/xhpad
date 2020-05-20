var DataList = [];
	function lunbo(){
		// 获取雷达拼图数据
		$.ajax({
			url:appendInfoToURL('http://weather.xinhong.net/radarmap/info'),
			dataType:'json',
			success: function(res){
				var data = res.data.reverse().slice(0,10);
				var list = [];
				
				for(var i = 0; i < data.length; i++) {
					list[i] = {
						url: data[i].url,
						// time: data[i].date,
						times: data[i].date.slice(8).slice(0,2)+":"+data[i].date.slice(8).slice(2),
						time: data[i].date.slice(0,8),						
						areas: [data[i].slng,data[i].slat,data[i].elng,data[i].elat]
					}
						
				}
				
			},			
			error:function(res){
				
			}
		});
		
	};

	lunbo();
	
		
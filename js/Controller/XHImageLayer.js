//openLayers 添加ImageLayers

//实现功能：云图/雷达图等图片覆盖物的添加、删除、切换
//只针对一次请求并接口返回图片列表形式
define([], function() {
	var DataList = {};			//数据列表
	var showIndex = {};			//不同类型数据显示列表
	var ImageLayers = {};		//图片覆盖物
	var isOpen = {};			//开关标识
	var isPlay = {};			//播放标识
	var playIndex = {};			//播放状态下的延时任务
	
	function close(type) {					//关闭功能，删除图层清除数据(需要调整)
		DataList[type] = [];
		if(ImageLayers[type]) {
			XHW.map.removeLayer(ImageLayers[type]);
		}
		isOpen[type] = false;
	}
	
	function queryData(url, param, type) {	//查询数据，按照固定格式存储数据
		$.ajax({
			url: appendInfoToURL(url + param),
			dataType: 'json',
			success: function (res) {
				var data = res.data;
				var list = [];
				for (var i = 0; i < data.length; i++) {
					list[i] = {
						url: data[i].url,
						time: data[i].date,
						areas: [data[i].slng, data[i].slat, data[i].elng, data[i].elat]
					}
				}
				DataList[type] = list;

				showIndex[type] = 0;
				showImageLayer(type, '.mkt');
				isOpen[type] = true;
			},
			error: function (error) {

			},
		});
	}
	// image: new CircleStyle({
	// 	radius: 7,
	// 	fill: new Fill({
	// 		color: '#ffcc33'
	// 	})
	// })
	
	

	function showImageLayer(type,mkt) {		//绘制openLayers图片图层
		var index = showIndex[type];	
		var extent = ol.proj.transformExtent(DataList[type][index].areas, 'EPSG:4326', 'EPSG:3857');
		var projection = new ol.proj.Projection({
			code: 'xkcd-image',
			units: 'pixels',
			extent: extent
		});
		var myImage = new ol.layer.Image({
			source: new ol.source.ImageStatic({
				url:'http://weather.xinhong.net' + DataList[type][index].url + mkt,
				projection: projection,
				imageExtent:extent
			})
		})
		XHW.map.addLayer(myImage);
		
		if(ImageLayers[type]) {			//替换旧图片图层（需要优化：新图层添加完毕后再删除旧图层）
			XHW.map.removeLayer(ImageLayers[type]);
		}
		ImageLayers[type] = myImage;
		
		if(isPlay[type]) {	
			var a = $('#inter').val();
			window.setTimeout(function(){
				next(type);	
			}, 1000*a)	
						//处于播放状态，则设置延时任务，显示下一张													
		}
		
		$('#myUl>li:eq('+ index +')').addClass('current').siblings().removeClass('current');
	}		

	function next(type) {				//显示下一张
		if(showIndex[type] == DataList[type].length - 1) {
			$('#lunBo-play').removeClass('current');
			showIndex[type] = -1;
			isPlay[type] = false;
			return;
		}
		showIndex[type] ++;
		showImageLayer(type,'.mkt');
	}
	
	function previous(type) {			//显示上一张
		if(showIndex[type] == 0) {
			return;
		}
		showIndex[type] --;
		showImageLayer(type, '.mkt');
	}
	
	//--------------------------------对外接口------------------------------------------
	function imageSwitch(url,param, type) {		//功能开启/关闭
		if(isOpen[type]) {
			close(type);			
		} else{
			queryData(url,param, type);
		}
	}

	function imageSwitch1(url, param, type, lastData,mkt) {		//功能开启/关闭
		if(isOpen[type]) {
			close(type);
		} else{
			radarCloud(url, param, type, lastData,mkt);
		}
		
	}
	
	function showIndex(index, type) {		//根据索引显示对应图片
		if(!isOpen[type]) return;
		if(isPlay[type]){					//停止播放任务
			play(type);
		}
		
		showIndex[type] = index;
		showImageLayer(type, '.mkt');
	}
	
	function clickButton(isNext, type){    //点击上/下一张按钮时执行
		if(!isOpen[type]) return;
		if(isPlay[type]){					//停止播放任务
			play(type);
		}
		if(isNext){
			next(type);
		} else {
			previous(type);
		}
	}
	
	function play(type) {			//播放/暂停
		if(!isOpen[type]) return;
		if(isPlay[type]) {
			isPlay[type] = false;
			if(playIndex[type]) {
				window.clearInterval(playIndex[type]);
				playIndex[type] = null;
			};
			
		} else {
			isPlay[type] = true;
			next(type);
		}
		$('#lunBo-play').toggleClass('current');
	}
	// 加载雷达与云图数据接口
	function radarCloud(url,param,type,lastData,mkt){
		$.ajax({
			url:appendInfoToURL(url + param),
			dataType:'json',
			success: function(res){
				// var lastData = res.data;	
				$('#myUl>li').show();	
				var count = 10;
				if(res.data.length < 10){
					count = res.data.length;
					for(var i = count; i<=9;i++){
						$('#myUl>li:eq('+i+')').hide();
					}					
				};		
				var data = eval(lastData).reverse().slice(0, count).reverse();	
				// var data = lastData.slice(res.data.length-11,res.data.length-1);												
				var list = [];
				var index = showIndex[type];
				
				for (let i = 0; i < data.length; i++){
					var dataAreas = [data[i].slng,data[i].slat,data[i].elng,data[i].elat];						
					$('#myUl>li:eq('+i+')>a>img').attr('src',url+data[i].url);
					// XHW.map.removeLayer(ImageLayers[type]);
					$('#myUl>li:eq('+i+')>a>img').click(function(){
						for(var elem in ImageLayers){
							XHW.map.removeLayer(ImageLayers[elem]);
						};
						showIndex[type] = i ;
						var extent = ol.proj.transformExtent(dataAreas, 'EPSG:4326', 'EPSG:3857');
						var projection = new ol.proj.Projection({
							code: 'xkcd-image',
							units: 'pixels',
							extent: extent
						});
						var myImage = new ol.layer.Image({
							source: new ol.source.ImageStatic({
								url:url + data[i].url+ mkt,
								projection: projection,
								imageExtent:extent
							})
						});
						XHW.map.addLayer(myImage);
						if(ImageLayers[type]) {			//替换旧图片图层（需要优化：新图层添加完毕后再删除旧图层）
							XHW.map.removeLayer(ImageLayers[type]);
						};
						ImageLayers[type] = myImage;
						if(isPlay[type]) {	
							var a = $('#inter').val();
							window.setTimeout(function(){
								next(type);	
							}, 1000*a)	
							//处于播放状态，则设置延时任务，显示下一张													
						};
						$('#myUl>li:eq('+i+')').addClass('current').siblings().removeClass('current');
					});

					$('#myUl>li:eq('+i+')>span:eq(0)').html(data[i].date.slice(6,8)+"日"+data[i].date.slice(8,10)+"时"+data[i].date.slice(10,12)+"分");										
				
					list[i] = {
						url: data[i].url,
						// time: data[i].date,
						times: data[i].date.slice(8).slice(0,2)+":"+data[i].date.slice(8).slice(2),
						time: data[i].date.slice(0,8),						
						areas: [data[i].slng,data[i].slat,data[i].elng,data[i].elat],
						
					};
					DataList[type] = list;				
					isOpen[type] = true;

				}; 
				showIndex[type] = data.length-1; 
				showImageLayer(type, mkt);		
			},
			error:function(error){
				
			},
		});
	};

	return {
		imageSwitch: imageSwitch,
		imageSwitch1: imageSwitch1,
		showIndex: showIndex,
		clickButton: clickButton,
		play: play,
		close:close,
	};
});
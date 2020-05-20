/**
 * 云图
 */
define(['Controller/Http', 
'Controller/DataFormat', 
'Function/Himawari8Img',
'Function/numberFC/DrawTypeBuilder'], function(http, format, Himawari8Img, chartBuilder){

	var key;		//当前功能
	var html;		//图例HTML布局
	var item;		//当前功能配置

	var buttonWC;	//按钮 数据来源风云2
	// var buttonWC4;	//风云4按钮
	var buttonSF;	//按钮 数据来源葵花8
	// var selectWC4;	//风云4 选择框
	// var select;		//选择框 葵花8格式

	var menu;		//数据列表菜单
	var menuPlay;	//数据菜单播放按钮
	var menuContent;//数据菜单列表主题
	
	var data;	//数据
	var tLayer;	//当前图层

	var timeCode;	//播放动画
	var animationTime = 1500;	//动画播放间隔 毫秒
	var overlayCloud;
	function init(){
		key = 'meteo_cloud';
		html =  '<p class="tuCengP">云图色温</p>' + 
				'<img src="img/legend/cloud.png" alt="" />' +
				'<p>单位 k</p>';
        item = XHW.C.layerC.createItem('', html, function(){	//云图目前没有图例
			close();
		})
		
		$('#cloud').click(function(e) {
			$('.swiper-containerFc').hide();
			$('.swiper-containerReal').hide();
			$('.swiper-containerFio').hide();
			$('.time').hide();
			$('#cloud_source_list .swiper-containerCloud').show();
			if($('#cloud_source_windCloud').hasClass('current')) {
				openWC()
			}
		// 	if($('#fy4_gll_mult').hasClass('current')) {
		// 		openWC4()
		// 	}
		})

		buttonWC = $('#cloud_source_windCloud');
		buttonWC.click(function(){
			if($(this).hasClass('current')) {
				$('#cloud li').css('background','none');
				// $(this).parent().css('background','rgb(7, 70, 137)');
				isFY4 = false;
				if (fy4AnimationCtrl) {
					fy4AnimationCtrl.close();
				}
				$('#cloud_source_list .swiper-containerCloud').show();
				//开启 数据来源 风云
				openWC();
			} else {
				//关闭
				closeWC();
			}
		});
		$('#cloud_source_windCloud2').click(function(){
			if($(this).hasClass('current')) {
				//开启 数据来源 风云
				openWC();
			} else {
				//关闭
				closeWC();
			}
		});

		$('#cloud_source_list .del').click(function(e) {
			$(this).parent().hide()
		})

		// buttonWC4 = $('#cloud_source_windCloud4');
		// buttonWC4.click(function(){
		// 	if(!$(this).parent().hasClass('currenterJiBtn')) {
		// 		//开启 数据来源 风云
		// 		openWC4();
		// 	} else {
		// 		//关闭
		// 		closeWC4();
		// 	}
		// });
		// selectWC4 = $('#cloud_windCloud4_select');
		// selectWC4.change(function(){
		// 	if(buttonWC4.parent().hasClass('currenterJiBtn')) {
		// 		stop();
		// 		queryCloudWC4();
		// 	}
		// });

		$('#cloud .kui8').on('click', function(event) {
			
			var elem = $(this).html();
			if($(this).hasClass('current')) {
				$('#cloud li').css('background','none');
				// $(this).parent().css('background','rgb(7, 70, 137)');
				isFY4 = false;
				if (fy4AnimationCtrl) {
					fy4AnimationCtrl.close();
				}
				$('#cloud_source_list .swiper-containerCloud').show();
				openSF(elem);
			} else {
				closeSF()
			}
			
		});

		buttonSF = $('#cloud_source_sunflower');
		buttonSF.click(function(){
			if(!$(this).parent().hasClass('currenterJiBtn')) {
				//开启 数据来源 葵花8
				openSF(elem);
			}else {
				//关闭
				closeSF();
			}
		});
		// select = $('#cloud_sunflower_select');
		// select.change(function(){
		// 	if(buttonSF.parent().hasClass('currenterJiBtn')) {
		// 		//------------停止动画播放
		// 		stop();
		// 		//------------重新查询数据
		// 		queryCloudSF();
		// 	}
		// });

		menu = $('#cloud_source_list');		//数据列表
		menu.children('.taiFengDel').click(function(){
			close();
		});
		menuPlay = $('#cloud_list_play');
		menuPlay.click(function(){
			if (isFY4) return;
			if(!timeCode) {
				play();
			} else {
				stop();
			}
		});
		menuContent = $('#cloud_source_list .bottomF');
	}

	/**
	 * 查询风云数据
	 */
	function queryCloudWC(){
		// http://weather.xinhong.net/cloudmap/info
		http.get(http.weatherUrl, '/cloudmap/info', {}, function(json){
			data = json.data;
			fillData();
			$('#showTuLi .tuLify2').show();
		}, function(){
			//----------------step1 清空列表及数据
			data = null;
			menuContent.empty();
		});
	}

	function getSelectOption(funcSelectId) {
		let currentBlue = $('#' + funcSelectId).children('.currentBlue');
		currentBlue = currentBlue ? currentBlue[0] : undefined;
		if (!currentBlue) {
			currentBlue = $('#' + funcSelectId).children();
			currentBlue = currentBlue ? currentBlue[0] : undefined;
		}
		return currentBlue ? currentBlue.getAttribute("data-value") : undefined;
	}

	/**
	 * 查询风云4数据
	 */
	function queryCloudWC4(){
		// https://weather.xinhong.net/xhweatherfcsys/fy4a/info
		// https://weather.xinhong.net/xhweatherfcsys//fy4a/info?type=SST		TODO修改后
		//var elem = selectWC4.val();
		var elem = getSelectOption('cloud_sunflower_select');
		var param = {
			type: elem
		}
		http.get(http.weatherUrl, '/fy4a/info', param, function(json){
			data = json.data;
			fillData();
		}, function(json){
			//----------------step1 清空列表及数据
			data = json.data;
			fillData();
		});
	}

	/**
	 * 查询葵花8数据
	 */
	function queryCloudSF(elem){
		// https://weather.xinhong.net/himawari8l2map/info?&channel=cltype
		var elems = getCloudSFElem(elem);
		var param = {
			channel: elems
		}
		http.get(http.weatherUrl, '/himawari8l2map/info', param, function(json){
			data = json.data;
			fillData();
		}, function(){
			//----------------step1 清空列表及数据
			data = null;
			menuContent.empty();
		});
	}

	/**
	 * 查询葵花8 单点数据
	 */
	function getPopupHtml(lng,lat){
		var param = {
			lng: lng,
			lat: lat,
		};
		http.get(http.weatherUrl, '/himawari8l2/pointspacedata', param, function(json){
			if(json.status_code != 0){
				return console.log('无葵花8单点数据');
			};
			removePopup();
			let profiledata = json.data.profiledatas[0];
			var ct = format.tt(profiledata.CT - 273);  //亮温
			var ch = format.ch(profiledata.CH * 1000);  //云顶高
			var cp = profiledata.CP == 0 ? '晴空' :
                     profiledata.CP == 1 ? '卷云' : 
                     profiledata.CP == 2 ? '卷层云' :
                     profiledata.CP == 3 ? '深对流' :
                     profiledata.CP == 4 ? '高积云' : 
                     profiledata.CP == 5 ? '高层云' : 
                     profiledata.CP == 6 ? '雨层云' : 
                     profiledata.CP == 7 ? '淡积云' : 
                     profiledata.CP == 8 ? '层积云' :
                     profiledata.CP == 9 ? '层云' :
                     profiledata.CP == 10 ? '无法观测':
					 '--' ;
			var time = format.jsonDate(json.time);
			var co = profiledata.CO;  //光学厚度
			var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
						+ 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
						+ '<h1 style="font-size:12px;margin:5px 0;">' + time[0] + '</h1>'
						+ '<h1 style="font-size:12px;margin:5px 0;">' + format.lnglat(lng, lat) + '</h1>'
						+'<h1 style="font-size:12px;margin:5px 0;"> 云顶:' + ch + '</h1>'
						+'<h2 style="font-size:12px;margin:5px 0;"> 云类:' + cp + '</h2>'
						+'<h2 style="font-size:12px;margin:5px 0;"> 亮温:' + ct + '</h2>'
					+'</div>';	
			var popup = '<div id="c_popup_mouseMove"></div>';
			$('body').append(popup);	
			var container = document.getElementById('c_popup_mouseMove');
			container.innerHTML = html;			
			//-------打开弹窗
			overlayCloud = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
				element: container,
				autoPan: true,
				position: ol.proj.fromLonLat([lng,lat]),    //--------设置弹窗位置  值为marker位置
				positioning: 'bottom-left',          //--------默认左下角（设置下方居中无效，依靠样式自己设置）
				autoPanAnimation: {
					duration: 250   //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度. 单位为毫秒（ms）
				}
			}));
			if($('#cloud_source_sunflower').parent().hasClass('currenterJiBtn')) {				
				XHW.map.addOverlay(overlayCloud);				
			}
		}, function(){
		});
	}

	function removePopup(){
        if(overlayCloud) {
            XHW.map.removeOverlay(overlayCloud);
            overlayCloud = null;
        }
    }

	function getCloudSFElem(elem) {
		// var elem = getSelectOption('cloud_sunflower_select');
		switch(elem){
			case '葵花8(云顶)':
				elem = 'clth';
				break;
			case '葵花8(云类)':
				elem = 'cltype';
				break;
			case '葵花8(亮温)':
				elem = 'cltt';
				break;
		}
		return elem;
	}

	/**
	 * 填充数据
	 */
	function fillData(){
		//----------------step1 清空列表
		menuContent.empty();
		//----------------step1.5 反序
		data.reverse();
		//----------------step2 遍历数据
		for(var i = 0; i < data.length; i++) {
			//------------------step3 填充列表
			var time = data[i].date;
			//  time.substring(0,4) + '-' + time.substring(4,6) + '-' + time.substring(6,8) + ' ' +
				time =	time.substring(8,10) + ':' + time.substring(10,12);
			var html = 	'<p class="swiper-slide"><span>' + time + '</span></p>';
			menuContent.append(html);
		}
		//----------------step4 添加点击事件
		menuContent.children().click(function(){
			var index = $(this).index();
			showIndex(index);
		});

		//---------------step5 默认选中最新
		showIndex(0);
	}

	/**
	 * 根据索引 展示云图数据
	 * @param {*} index 
	 */
	function showIndex(index){
		//--------step1-------对应索引图片添加到地图
		//-------------获取范围
		var slat = data[index].elat;
        var slng = data[index].slng;
        var elat = data[index].slat;
		var elng = data[index].elng;
		//-------------转为openlayers地图经纬度格式
		var start = ol.proj.fromLonLat([slng, elat]);
		var end = ol.proj.fromLonLat([elng, slat]);
		var extent = [start[0], start[1], end[0], end[1]];
		//-------------创建地图图层
		// var mkt = '.mkt';
		// if(buttonSF.parent().hasClass('currenterJiBtn')) {
		// 	mkt += '.png';
		// }
		// if(buttonWC4.parent().hasClass('currenterJiBtn')) {
		// 	mkt = '';
		// }
		let source =  new ol.source.ImageStatic({
			url: XHW.C.http.imgUrl + data[index].url,
			imageExtent: extent
		})
		if (!tLayer) {
			tLayer = new ol.layer.Image({
			
			});
			//---------------添加到地图
			tLayer.setZIndex(1);
			tLayer.id = key;
		}
		tLayer.setSource(source);
		if ($.inArray(tLayer, XHW.map.getLayers().getArray()) == -1)
			XHW.map.addLayer(tLayer);
		
		
		//---------step2----------选中显示的位置并且滚动到指定位置


		let liIndex = index;
		if ((data.length - 1 - liIndex)%6 == 0) {
			let top = 0;
			if (liIndex > 5) {
				top =  menuContent.children().eq(liIndex - 6/2).position().top;
			}
			top = top - 60 <= 0 ? top : top - 60;
			$('#cloud_source_list .contenty').mCustomScrollbar('scrollTo', top, { scrollInertia:animationTime/2 });
		}
		menuContent.children().eq(index).addClass('current').siblings().removeClass('current');

		// var top = menuContent.children().eq(index).position().top;
		// top = top - 60 <= 0 ? top : top - 60;
		// $('#cloud_source_list .contenty').mCustomScrollbar('scrollTo', top);

		//----------step3-----------更改图层标题
		var mytime = format.jsonDate(data[index].date);
		// var level;
		// if(buttonWC.parent().hasClass('currenterJiBtn')) {
		// 	level = '风云2卫星云图';
		// 	item.htmlLegend = html;
			
		// } else if(buttonSF.parent().hasClass('currenterJiBtn')) {
		// 	level = '葵花8号 ' + getSelectOption('cloud_sunflower_select');
		// 	item.htmlLegend = chartBuilder.buildLegendHtml(getCloudSFElem(elem), getSelectOption('cloud_sunflower_select'));
		// }
		// item.htmlLayer = mytime[0] + ' ' + level;
		// XHW.C.layerC.updateLayerData(key, item);
		$('#show-time').html('<p class="current"><span style="font-size: 28px;">'+mytime+'</span></p>');
	}

	/**
	 * 删除当前展示图层
	 */
	function removeLayer(){
		if(tLayer) {
			XHW.map.removeLayer(tLayer);
			tLayer = null;
		}
	}

	//--------创建地图弹窗对象				
	XHW.map.on('pointermove', function(e) {
		if (e.dragging) { //指针拖动地图
			return;
		};
		if (!buttonSF || !buttonSF.parent().hasClass('currenterJiBtn')) {
			return;
		}
		//----------------ol地图坐标转换为经纬度
		var lnglat = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'); 
		var lng = lnglat[0];
		var lat = lnglat[1];
		getPopupHtml(lng,lat);			
	});
	XHW.map.on('hover', function(e) {
		if (!buttonSF || !buttonSF.parent().hasClass('currenterJiBtn')) {
			return;
		}
		console.info('hover');
	});
	//开启风云数据源
	function openWC(){
		close();		//与其他云图内容互斥
		//-------------step1 加入图层控制（失败则取消操作）
		var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            closeWC();
            return;
        }
		//---------添加按钮选中样式
		buttonWC.parent().addClass('currenterJiBtn');
		buttonWC.prev().attr('src',buttonWC.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(buttonWC);
		XHW.C.layout.fenBianLv();
		//---------查询数据
		queryCloudWC();
		menu.show();
	}

	//关闭风云数据源
	function closeWC(){
		//---------删除图层控制
        XHW.C.layerC.removeLayer(key);
		//---------取消按钮选中样式
		buttonWC.parent().removeClass('currenterJiBtn');
		buttonWC.prev().attr('src',buttonWC.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(buttonWC);
		//---------隐藏列表
		menu.hide();
		//---------停止播放
		stop();
		//---------删除图层
		removeLayer();
		$('#showTuLi .tuLify2').hide();
	}

	//开启葵花8数据源
	function openSF(elem){
		close();		//与其他云图内容互斥
		//-------------step1 加入图层控制（失败则取消操作）
		var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            closeSF();
            return;
        }
		//---------添加按钮选中样式
		buttonSF.parent().addClass('currenterJiBtn');
		buttonSF.prev().attr('src',buttonSF.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(buttonSF);
		// $('#cloud_sunflower_select').show();
		$('#cloud_sunflower_select').css('display', 'inline-block');
		// $('#cloud_sunflower_select').parent().css('display', 'inline-block');//选中时展示层次选择框
		XHW.C.layout.fenBianLv();
		//---------查询数据
		queryCloudSF(elem);
		menu.show();
	}

	//关闭葵花8数据源
	function closeSF(){
		//---------删除图层控制
        XHW.C.layerC.removeLayer(key);
		//---------取消按钮选中样式
		buttonSF.parent().removeClass('currenterJiBtn');
		buttonSF.prev().attr('src',buttonSF.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(buttonSF);
		$('#cloud_sunflower_select').hide();
		//---------隐藏列表
		menu.hide();
		//---------停止播放
		stop();
		//---------删除图层
		removeLayer();
		removePopup();
	}

	/**
	 * 关闭云图
	 */
	function close(){
		closeWC();
		// closeWC4();
		closeSF();
		closeFY4CloudFunc();
		if (Himawari8Img && Himawari8Img.close){
			Himawari8Img.close();
		}
	}

	function play(){
		stop();
		timeCode = setInterval(function(){
			var index = menuContent.children('.current').index();
			index--;
			if(index < 0) index = data.length - 1;
			showIndex(index);
		}, animationTime);
		$('#show-time').css('display','block');
		menuPlay.css('background', 'url(img/layout/stop.png) no-repeat');
	}

	function stop(){
		if(timeCode) {
			clearInterval(timeCode);
			menuPlay.css('background', 'url(img/layout/play.png) no-repeat');
			timeCode = null;
		}
		$('#show-time').css('display','none');
	}

	//--------------------------------------------------风云4
/**
	 * 填充数据
	 */
	function fillData4(){
		//----------------step1 清空列表
		menuContent.empty();

		//----------------step2 遍历数据
		for(var i = 0; i < data.length; i++) {
			//------------------step3 填充列表
			var time = data[i].date;
			// time.substring(0,4) + '-' + time.substring(4,6) + '-' + time.substring(6,8) + ' ' +
				time = 	time.substring(8,10) + ':' + time.substring(10,12);
			var html = 	'<p class="swiper-slide"><span>' + time + '</span></p>';
			menuContent.append(html);
		}
		//----------------step4 添加点击事件
		menuContent.children().click(function(){
			var index = $(this).index();
			showIndex4(index);
		});

		//---------------step5 默认选中最后一张
		showIndex4(data.length - 1);
	}

	/**
	 * 根据索引 展示云图数据
	 * @param {*} index 
	 */
	function showIndex4(index){
		//--------step1-------对应索引图片添加到地图
		//-------------获取范围
		var slat = data[index].elat;
        var slng = data[index].slng;
        var elat = data[index].slat;
		var elng = data[index].elng;
		//-------------转为openlayers地图经纬度格式
		var start = ol.proj.fromLonLat([slng, elat]);
		var end = ol.proj.fromLonLat([elng, slat]);
		var extent = [start[0], start[1], end[0], end[1]];
		//-------------创建地图图层
		var layer = new ol.layer.Image({
			source: new ol.source.ImageStatic({
				url: XHW.C.http.imgUrl + data[index].url,
				imageExtent: extent
			})
		});
		//---------------添加到地图
		layer.setZIndex(1);
		XHW.map.addLayer(layer);
		//-----------------删除旧的图层
		removeLayer();
		//---------------新图层替换旧图层
		tLayer = layer;

		//---------step2----------选中显示的位置并且滚动到指定位置
		menuContent.children().eq(index).addClass('current').siblings().removeClass('current');
		var top = 0;
		for(var i = 0; i < index; i++) {
			top += menuContent.children().eq(i).outerHeight();
		}
		menuContent.scrollTop(top - 30);

		//----------step3-----------更改图层标题
		item.htmlLayer = '风云4卫星产品' + ' ' + selectWC4.find("option:selected").text();
        XHW.C.layerC.updateLayerData(key, item);
	}

	function showWC4(){
		//--------step1-------对应索引图片添加到地图
		//-------------获取范围
		var slat = 60;
        var slng = 60;
        var elat = 0;
		var elng = 160;
		//-------------转为openlayers地图经纬度格式
		var start = ol.proj.fromLonLat([slng, elat]);
		var end = ol.proj.fromLonLat([elng, slat]);
		var extent = [start[0], start[1], end[0], end[1]];
		//-------------创建地图图层
		// var mkt = '.mkt';
		// if(buttonSF.parent().hasClass('currenterJiBtn')) {
		// 	mkt += '.png';
		// }
		var url = '/images/fy4actt/FY4A-_AGRI--_N_DISK_1047E_L2-_CTT-_MULT_NOM_20190214070000_20190214071459_4000M_V0001.NC.jpg';
		var layer = new ol.layer.Image({
			source: new ol.source.ImageStatic({
				url: XHW.C.http.imgUrl + url,
				imageExtent: extent
			})
		});
		//---------------添加到地图
		layer.setZIndex(1);
		XHW.map.addLayer(layer);
		//-----------------删除旧的图层
		removeLayer();
		//---------------新图层替换旧图层
		tLayer = layer;

		//----------step2-----------更改图层标题
		item.htmlLayer = '风云4产品';
        XHW.C.layerC.updateLayerData(key, item);
	}

	//开启风云数据源
	function openWC4(){
		close();		//与其他云图内容互斥
		//-------------step1 加入图层控制（失败则取消操作）
		var b = XHW.C.layerC.addLayer(key, item);
		if(!b) {
			closeWC4();
			return;
		}
		//---------添加按钮选中样式
		buttonWC4.parent().addClass('currenterJiBtn');
		buttonWC4.prev().attr('src',buttonWC4.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(buttonWC4);
		// selectWC4.parent().css('display', 'inline-block');
		XHW.C.layout.fenBianLv();
		//---------查询数据
		queryCloudWC4();
		menu.show();
	}

	//关闭风云数据源
	function closeWC4(){
		//---------删除图层控制
		XHW.C.layerC.removeLayer(key);
		//---------取消按钮选中样式
		buttonWC4.parent().removeClass('currenterJiBtn');
		buttonWC4.prev().attr('src',buttonWC4.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(buttonWC4);
		// selectWC4.parent().hide();
		//---------隐藏列表
		menu.hide();
		//---------停止播放
		stop();
		//---------删除图层
		removeLayer();
	}




	return {
		init: init,
		close: close
	}
});
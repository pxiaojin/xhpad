/**
 * 雷达图
 */
define(['Controller/Http', 'Controller/DataFormat', 'Function/RadarWindow'], function(http, format, rw){

	var legend;		//图例
    var buttonS;    //按钮 单站雷达

	var menu;		//数据列表菜单
	var menuPlay;	//数据菜单播放按钮
	var menuContent;//数据菜单列表主题
	var timeCode;	//播放动画

    //----------------------------雷达图 单站-------------------------------------

    var type;
    var key2;		//当前功能代号
	var item2;		//当前功能配置
	
    var tLayerS;	//站点位置图层
    var tLayerSInfo;    //站点数据图层
    var singleData; //单站数据

	function inits(){
        type = 'radarSingle';
		key2 = 'radar_single';
        item2 = XHW.C.layerC.createItem('单站雷达', legend, function(){
			// closeRadarSingle();
        })

		menu = $('#radar-list');
		menuContent = $('#radar-list .bottomF');
		menuPlay = $('#radar_list_play');
		buttonS = $('#radar_data_single');
		buttonS.click(function(){
			if(!$(this).parent().hasClass('currenterJiBtn')) {
				//开启
				openRadarSingle();
			} else {
				//关闭
				closeRadarSingle();
			}
		});
		
		$('#yiji_radar').click(function(){
            $('#radar-list .swiper-containerRadar').show();
            $('.time').hide();
			openRadarSingle();
			rw.open();
		})
        
        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){
            return getPopupHtml(value);
        });

        //--------------雷达站点marker点击事件
        XHW.C.mapclick.addCallback(type, function(value){
            stopS();
			XHW.C.layout.fenBianLv();

			rw.close();
            $('.radar_huibo .radar-list_btn').removeClass('current');
            $('#radar-list').show();
            $('.time').hide();
            $('#radar-list .swiper-containerRadar').show();
			// $('.radar-list_btn').css('background','rgba(0,0,0,0.5)');
            queryRadarSingleInfo(value);
        })
	}

    /**
     * 查询单站雷达位置及编号列表
     */
    function queryRadarSingle(){
        // https://weather.xinhong.net/stationradarmap/distribinfo
        http.get(http.weatherUrl, '/stationradarmap/distribinfo', {}, function(json){
            drawRadarSingle(json.data);
		}, function(){
			
		});
    }

    /**
     * 显示单站雷达位置及编号列表
     */
    function drawRadarSingle(data){
        var markers = [];
        for(var i = 0; i < data.length; i++) {
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i].lng), parseFloat(data[i].lat)]))
            })

            marker.type = type;
            marker.value = {
                code: data[i].code,
                name: data[i].cname,
                lng: data[i].lng,
                lat: data[i].lat,
                province: data[i].province,
            }

            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: 'img/11.png',
                    scale: 0.5,
                })),                                          
            }));

            markers.push(marker);
        }

        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: markers
            })
        });

		layer.setZIndex(15);
        XHW.map.addLayer(layer);
        removeSingleLayer();
        tLayerS = layer;
    }

    /**
	 * 删除单站雷达位置图层
	 */
	function removeSingleLayer(){
		if(tLayerS) {
			XHW.map.removeLayer(tLayerS);
			tLayerS = null;
		}
	}

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        var lng = value['lng'];
        var lat = value['lat'];
        var name = value['name'];
        var station = value['code'];
        var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                            + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                        +'<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + station + ")" + '</h1>'
                        +'<h2 style="font-size:12px;margin:5px 0;">' + lat + ", " + lng + '</h2>'
                    +'</div>';
        return html;
    }

    /**
     * 查询单个站点的雷达图
     * @param {*} value 
     */
    function queryRadarSingleInfo(value){
        // https://weather.xinhong.net/stationradarmap/info?radarIDs=AZ9240
        var param = {
            radarIDs: value.code
        }
        http.get(http.weatherUrl, '/stationradarmap/info', param, function(json){
            if(json.data && json.data[0]) {
                singleData = {
                    value: value,
                    data: json.data[0].imagesdata
                };
                fillSingleInfoData();
            } else {
                //----------------step1 查询失败
                closeSingleInfo();
            }
		}, function(){
            //----------------step1 查询失败
            closeSingleInfo();
		});
    }

    /**
	 * 填充单个站点详情数据
	 */
	function fillSingleInfoData(){
		//----------------step1 清空列表
		menuContent.empty();
		//----------------step1.5 反序
		singleData.data.reverse();

        var myDate = singleData.data;
		//----------------step2 遍历数据
		for(var i = 0; i < myDate.length; i++) {
			//------------------step3 填充列表
			var time = myDate[i].date;
			// time.substring(0,4) + '-' + time.substring(4,6) + '-' + time.substring(6,8) + ' ' +
			time = time.substring(8,10) + ':' + time.substring(10,12);
			var html = 	'<p class="swiper-slide"><span>' + time + '</span></p>';
			menuContent.append(html);
		}
		//----------------step4 添加点击事件
		menuContent.children().click(function(){
			var index = $(this).index();
			showSingleIndex(index);
		});

		//---------------step5 默认选中最后一张
        showSingleIndex(0);
        
        //---------------step6 显示列表
        // menu.show();
        $('#radar-list .swiper-containerRadar').show();
    }
    
    /**
     * 单站雷达 根据索引添加雷达图
     * @param {*} index 
     */
    function showSingleIndex(index){
        //--------step1-------对应索引图片添加到地图
        var myDate = singleData.data;
		//-------------获取范围
		var slat = myDate[index].elat;
        var slng = myDate[index].slng;
        var elat = myDate[index].slat;
		var elng = myDate[index].elng;
		//-------------转为openlayers地图经纬度格式
		var start = ol.proj.fromLonLat([slng, elat]);
		var end = ol.proj.fromLonLat([elng, slat]);
		var extent = [start[0], start[1], end[0], end[1]];

		
		//-------------创建地图图层
		let source =  new ol.source.ImageStatic({
			url: XHW.C.http.imgUrl + myDate[index].url,
			imageExtent: extent
		})
		if (!tLayerSInfo) {
			tLayerSInfo = new ol.layer.Image({
			
			});
			tLayerSInfo.id = key2;
		}
		tLayerSInfo.setSource(source)
		//---------------添加到地图
		tLayerSInfo.setZIndex(1);
		if ($.inArray(tLayerSInfo, XHW.map.getLayers().getArray()) == -1)
			XHW.map.addLayer(tLayerSInfo);
		//---------step2----------选中显示的位置并且滚动到指定位置
		menuContent.children().eq(index).addClass('current').siblings().removeClass('current');
		// var top = menuContent.children().eq(index).position().top;
		// top = top - 60 <= 0 ? top : top - 60;
		// $('#radar_list .contenty').mCustomScrollbar('scrollTo', top);

		//----------step3-----------更改图层标题
		var time = format.jsonDate(myDate[index].date);
		item2.htmlLayer = time[0] + ' ' + singleData.value['name'] + '(' + singleData.value['province'] + ')' 
				+ '单站雷达';
        XHW.C.layerC.updateLayerData(key2, item2);
    }

    /**
     * 删除站点雷达图详情的图层
     */
    function removeSingleInfoLayer(){
        if(tLayerSInfo) {
            XHW.map.removeLayer(tLayerSInfo);
            tLayerSInfo = null;
        }
    }

	//开启单站雷达
	function openRadarSingle(){
        //-------------step1 加入图层控制（失败则取消操作）
		var b = XHW.C.layerC.addLayer(key2, item2);
        if(!b) {
            closeRadarSingle();
            return;
        }
		//---------添加按钮选中样式
		buttonS.parent().addClass('currenterJiBtn');
		buttonS.prev().attr('src',buttonS.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(buttonS);
		
		//---------查询数据
		queryRadarSingle();
		
	}

	//关闭单站雷达
	function closeRadarSingle(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key2);
		//---------取消按钮选中样式
		buttonS.parent().removeClass('currenterJiBtn');
		buttonS.prev().attr('src',buttonS.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(buttonS);
        //----------停止播放动画
        stopS();
        //-----------隐藏列表
        // menu.hide();
        menuContent.empty();
        singleData = null;
		//---------删除图层
        removeSingleLayer();
        removeSingleInfoLayer();
    }

    /**
     * 关闭单站雷达详情
     */
    function closeSingleInfo(){
        //----------图层标题置空
        item2.htmlLayer = '单站雷达';
        XHW.C.layerC.updateLayerData(key2, item2);
        //----------停止动画效果
        stopS();
        //----------清空隐藏列表及数据
        // menu.hide();
        menuContent.empty();
        singleData = null;
        //-----------删除单站详情图层
        removeSingleInfoLayer();
    }

	function stopS(){
		if(timeCode) {
			clearInterval(timeCode);
			menuPlay.css('background', 'url(img/layout/play.png) no-repeat');
			timeCode = null;
		}
	}

	function close() {
		closeSingleInfo();
	}
	
	return {
		inits: inits,
		close: close,
		closeRadarSingle: closeRadarSingle
	}

});
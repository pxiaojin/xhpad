define(['Controller/Http',
    'lib/echarts'], function(http, echarts){

    var key;
    var type;
    var item;

    var button;     //功能开关按钮
    var isOpen = false;
    var layer;      //功能图层
    var data;       //城镇气象数据（按分级记录，站点、站名、经纬度、天气信息）

    var curCid;

    var closeFunction;
    function showBuoyBy(cid, closeFunction){
        curCid = cid;
        close();
        type = key = 'ocean_buoy_station';
        item = XHW.C.layerC.createItem('浮标' + cid + '路径显示', '', function(){
            close();
        })

        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){
            return getPopupHtml(value);
        });

        XHW.C.mapclick.addCallback(type, function(value){
            // search.queryStation(value.code, value.name);
            showChart(value);
        })
        closeFunction = closeFunction;
        open();
        queryBuoyStationInfo(cid);
    }

    function queryBuoyStationInfo(cid) {
        var time = XHW.silderTime;
        var param = 'cid=' + cid 
            + '&year=' + time.year + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;

        //https://ocean.xinhong.net/original/getOriginalGtsppBuoy/?cid=Q390184418
        // XHW.C.http.oceanHttp('/original/getOriginalGtsppBuoy?', param, function(data, time){
        $.ajax({
            url: XHW.C.http.oceanUrl + '/original/getOriginalGtsppBuoy?' + param,
            dataType: 'json',
            async: false,
            success: function (data, time) {   
                if(data.status_code != 0){
                    //http://192.6.1.21:7018/argo/getOriginalGtsppBuoy?station=2902755
                    $.ajax({
                        url: XHW.C.http.buoyUrl + '/argo/getOriginalGtsppBuoy?' + param,
                        dataType: 'json',
                        async: false,
                        success: function (res, time) {
                            item.time = time;
                            XHW.C.layerC.updateLayerData(key, item);
                            showBuoyPath(cid, res.data);
                        },
                        error: function(error){        
                            item.htmlLayer = ' 浮标资料显示(无数据)';                    
                            XHW.C.layerC.updateLayerData(key, item);
                        }
                    });
                    return;
                }
                item.time = time;
                XHW.C.layerC.updateLayerData(key, item);
                showBuoyPath(cid, data.data)
            },
            error: function(error){        
                item.htmlLayer = ' 浮标资料显示(无数据)';                    
                XHW.C.layerC.updateLayerData(key, item);
            }
        })
    }
    

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        var lng = value['lng'];
        var lat = value['lat'];
        var name = value['date'];
        var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                            + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                        +'<h1 style="font-size:12px;margin:5px 0;">' + name + '</h1>'
                        +'<h2 style="font-size:12px;margin:5px 0;">' + lat + ", " + lng + '</h2>'
                    +'</div>';
        return html;
    }
    /**
     * 根据索引绘制台风
     * @param {} data 
     */
    function showBuoyPath(cid, data){
        var points = data;      
        
        //-----------------------step1 绘制路径------------------------
        drawBuoyPath(cid, points);

        // var latlon = ol.proj.fromLonLat([parseFloat(points[points.length-1].lng), parseFloat(points[points.length-1].lat)]);
        //-----------------------step2 地图转到最后一点------------------------
        // XHW.map.getView().animate({center: latlon, zoom: 5});
    }
    var timeOut = [];    //延时动画ID组
    var layers = [];     //图层组
    var speed = 6; //动画时间间隔(毫秒)
    var geoMarker;
    
        
    var styles = {
        'path': new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 6, color: [237, 212, 0, 0.8]
          })
        }),
        'icon': new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'img/sea/buoy_label.png'
          })
        }),
        'mark':new ol.style.Style({
            image: new ol.style.Circle({
              radius: 7,
              fill: new ol.style.Fill({color: 'white'}),
              stroke: new ol.style.Stroke({
                color: 'white', width: 2
              })
            })
        }),
        'geoMarker': new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.5, 1],
              src: 'img/sea/buoy_label.png'
            })
        })
      };
    var routeCoords = [];   //-----历史路径点的列表（openlayers的经纬度对象）
    /**
     * 绘制台风，加入延时效果
     * @param {*} cid
     */
    function drawBuoyPath(cid, points){
        var features = [];
        
        // features.push(buildFirstPoint(cid, points[0]))
        for(let i = 0; i < points.length; i++) {
            let point = points[i];
            routeCoords.push(ol.proj.fromLonLat([parseFloat(point.lng), parseFloat(point.lat)]));
        }
        var routeFeature = new ol.Feature({
            type: 'path',
            geometry: new ol.geom.LineString(routeCoords)
        });
        features.push(routeFeature);

        
        geoMarker = new ol.Feature({
            type: 'geoMarker',
            geometry: new ol.geom.Point(routeCoords[0])
        });
        features.push(geoMarker);

        for(let i = 0; i < points.length; i++) {
            let marker = buildMark(cid, points[i]);
            features.push(marker);
        } 

        routeLength = points.length;

        if(layer){
         XHW.map.removeLayer(layer);
        }

        let source = new ol.source.Vector({
            features: features
        });

        if (!layer) {
            layer = new ol.layer.Vector({
                style: function(feature) {
                    // hide geoMarker if animation is active
                    if (animating && feature.get('type') === 'geoMarker') {
                      return null;
                    }
                    return styles[feature.get('type')];
                }
            });
            layer.setZIndex(15);
            layer.id = 'ocean_buoy_station';
        }
        layer.setSource(source);
        
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);

        startAnimation();
    }
    var animating = false;
    
    var moveFeature = function(event) {
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;

        if (animating) {
          var elapsedTime = frameState.time - now;
          // here the trick to increase speed is to jump some indexes
          // on lineString coordinates
          var index = Math.round(speed * elapsedTime / 1000);

          if (index >= routeLength) {
            stopAnimation(true);
            return;
          }
          if (index < routeCoords.length - 1) {
            var currentPoint = new ol.geom.Point(routeCoords[index]);
            var feature = new ol.Feature(currentPoint);
            vectorContext.drawFeature(feature, styles.geoMarker);
          }
        }
        // tell OpenLayers to continue the postcompose animation
        XHW.map.render();
      };

    var now;
    function startAnimation() {
      if (animating) {
        stopAnimation(false);
      } else {
        animating = true;
        now = new Date().getTime();
        // hide geoMarker
        geoMarker.setStyle(null);
        // just in case you pan somewhere else
        // XHW.map.getView().setCenter(center);
        XHW.map.on('postcompose', moveFeature);
        XHW.map.render();
      }
    }


    /**
     * @param {boolean} ended end of animation.
     */
    function stopAnimation(ended) {
      animating = false;
    
      if (layer && layer.getSource()) {
        layer.getSource().removeFeature(geoMarker);
    }
    //   // if animation cancelled set the marker at the beginning
    //   var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0];
    //   /** @type {module:ol/geom/Point~Point} */
    //    (geoMarker.getGeometry()).setCoordinates(coord);
    //   //remove listener
      XHW.map.un('postcompose', moveFeature);
    }

    function buildFirstPoint(cid, point) {
        var latlon = ol.proj.fromLonLat([parseFloat(point.lng), parseFloat(point.lat)]);
        //-----------------------step2 标注名称------------------------
        var markFeatu = new ol.Feature({
            geometry: new ol.geom.Point(latlon)
        });
        markFeatu.setStyle(new ol.style.Style({
            text: new ol.style.Text({
                textAlign: "center",
                textBaseline: "middle",
                font: '14px Normal Arial',
                text: cid+ ' ' + point.date,
                fill: new ol.style.Fill({    //文字填充色
                    color: 'red',
                }),
                offsetX: 0,
                offsetY: 15, 
                //标签的背景填充
                // backgroundStroke:new ol.style.Stroke({
                //     color:'#3D89D4',
                //     width:10,
                // }),
                // backgroundFill:new ol.style.Fill({
                //     color:'#3D89D4',
                // }),
            }),
        }));
        markFeatu.value = point;
        return markFeatu;
    }


    function buildMark(cid, point) {
        var latlon = ol.proj.fromLonLat([parseFloat(point.lng), parseFloat(point.lat)]);
        var marker = new ol.Feature({
            geometry:new ol.geom.Point(latlon), 
        });
        //----------step3------------给marker加入标记
        marker.type = type;
        marker.value = point;
        //-----------step4-------------调整marker的样式
        marker.setStyle(styles.mark);
        return marker;
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
    }

    function open(){
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        isOpen = true;
    }

    function close(){
        $('.buoy').addClass('buoy-none');
        remove();
        routeCoords = [];
        isOpen = false;
        XHW.C.layerC.removeLayer(key);
        closeFunction;
    }
    var oneChart;
    
    $('.buoyDel').click(function(){
        $('.buoy').addClass('buoy-none');
    })
    //
	function showChart(buoyData) {
        if (layer && layer.getSource() && layer.getSource().getFeatures()) {
            var features = layer.getSource().getFeatures();
            for (let i = 0; i < features.length; i++) {
                if (features[i].value) {
                    if (features[i].value.date == buoyData.date) {
                        features[i].style = styles.icon;
                    } else {
                        features[i].style = styles.mark;
                    }
                }
            }
        }
        if ($('.buoy').hasClass('buoy-none')){
            $('.buoy').removeClass('buoy-none');
        }
        $('.buoy .tabtitle span').html(curCid + ' <span style="color:#5BC0DE">(' + buoyData.date + ')</span>');
        //---------------绘制曲线
        var sourceData = buoyData.depthdata;
        var data = {};
        var keys = [];
        for(var key in sourceData) {
            for(var key2 in sourceData[key]){
                !data[key2] ? data[key2] = [] : null;
                if (sourceData[key][key2] == 99999) {
                    data[key2].push('-');
                } else {
                    data[key2].push(sourceData[key][key2]);
                }
            }
            keys.push(key);
        }
        //------------------------------寻找数据最大/最小值
        var tMax; var tMin;
        var saMax; var saMin;
        for(var i = 0; i < keys.length; i++) {
            if (data.temp[i] != '-') {
                tMax = tMax && tMax > data.temp[i] ? tMax : data.temp[i];
                tMin = tMin && tMin < data.temp[i] ? tMin : data.temp[i];
            }

            if (data.salt[i] != '-') {
                saMax = saMax && saMax > data.salt[i] ? saMax : data.salt[i];
                saMin = saMin && saMin < data.salt[i] ? saMin : data.salt[i];
            }
        }
        tMax = Math.ceil(tMax) - 0.5 <= tMax ? Math.ceil(tMax) : Math.ceil(tMax) - 0.5;
        tMin = Math.floor(tMin) + 0.5 >= tMin ? Math.floor(tMin) : Math.floor(tMin) + 0.5;
        tMin = Math.floor(tMin / 10) * 10;
        tMax = Math.floor((tMax+5) / 5) * 5;
        saMax = Math.ceil(saMax) - 0.5 <= saMax ? Math.ceil(saMax) : Math.ceil(saMax) - 0.5;
        saMin = Math.floor(saMin) + 0.5 >= saMin ? Math.floor(saMin) : Math.floor(saMin) + 0.5;
        saMin = Math.floor(saMin / 10) * 10;
        saMax = Math.floor((saMax+5) / 5) * 5;

        oneChart = oneChart ? oneChart.dispose() : '';
        oneChart = echarts.init(document.getElementById('buoyPic'));
        var option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            color: ['red', 'yellow'],
            legend: {
                data:[
                    {name:'海温', textStyle: {
                        color: 'red'
                    }},
                    {name:'海盐', textStyle: {
                        color: 'yellow'
                    }}]
            },
            grid: {
                top: 60,
                bottom: 10,
                right: 60,
                left: 45
            },
            xAxis: [
                {
                    name: '海温(℃)',
                    type: 'value',
                    max: tMax,
                    min: tMin,
                    position:'top',
                    nameTextStyle: {padding: [0,0,0,-10]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: 'red'}},
                    axisTick: {inside: true},
                    axisLabel:{show: true, margin: 0},
                },
                {
                    name: '海盐(%)',
                    type: 'value',
                    max: saMax,
                    min: saMin,
                    position:'top',
                    offset: 20,
                    nameTextStyle: {padding: [0,0,0,-10]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: 'yellow'}},
                    axisTick: {inside: true},
                    axisLabel:{show: true, margin: 0},
                },
            ],
            yAxis: {
                data: data.depth,
                inverse: true,
                boundaryGap:false,
                axisLine: {onZero: false, lineStyle:{color: '#ffffff'}},
            },
            series: [{
                name: '海温',
                xAxisIndex: 0,
                type: 'line',
                smooth:true,
                data: data.temp
            },{
                name: '海盐',
                xAxisIndex: 1,
                type: 'line',
                smooth:true,
                data: data.salt
            }]
        };
        oneChart.setOption(option);
	}

    function init(){
        // 默认不显示
        $('.buoy').addClass('buoy-none');
    }
    init();

    return {
        showBuoyBy: showBuoyBy,
        close: close
    }
});
//-----------------多点航空数据详情
define(['Controller/Http',
        'Controller/layout',
        'Controller/DataFormat',
        'lib/echarts',
        'Function/tool/ProfileChart'],
    function(http, layout, format, echarts) {
        var hasInitialed;
        var windImg;
        var airRouteHourSelect;

        var curPositions;
        var locationNameMap;
        var par_start;  //起飞时间
        var par_end;        //降落时间
        var par_high;       //高度
        var par_lng;        //经度参数
        var par_lat;        //纬度参数

        var overlay; //弹框

        var popupAr = [];
        function init(){
            windImg = new Image();
            windImg.src = './img/wind/windy.png';

            $('input:radio[name="route_profileChart_multi_radio"]').parent().click(function(){
                drawCrossSection();
            });

            initDateDiv();

            $('#airRouteHeightUnit').on('click', function(){
                let text = this.text;
                if (text == 'hPa') {
                    $(this).html('m');
                    $(this).css('background-image','url(./img/layout/icon_lizi3.png)');
                } else{
                    $(this).html('hPa');
                    $(this).css('background-image','url(./img/layout/icon_lizi.png)');
                }
                queryAviation();
            })

            $('.botPanelHangKong .botHangKongRight .dataDiv .time_btn').click(function(){
                $('.botHangKongLeft').show();
                if($('.botHangKongRight .dataDiv .time1 input').val() == '' || $('.botHangKongRight .dataDiv .time2 input').val() == '')return;
                var routes_startTime = $('.botHangKongRight .dataDiv .time1 .flydate').val() + $('.botHangKongRight .dataDiv .time1 .flyhour').val();
                par_start = routes_startTime.replace(/-/g,'').split(':')[0];
                var routes_endtTime = $('.botHangKongRight .dataDiv .time2 .flydate').val() + $('.botHangKongRight .dataDiv .time2 .flyhour').val();
                par_end = routes_endtTime.replace(/-/g,'').split(':')[0];

                queryAviation();
            })
        }
        
        function initDateDiv() {
            let time = new Date();
            unityDate(time);
            time = curDate.year + '-' + curDate.month + '-' + curDate.day;
            resetDate(time);

            $('#airRouteDateInput').html(time);
            airRouteHourSelect = $('#airRouteHourSelect');
            airRouteHourSelect.val(curDate.hour);
            airRouteHourSelect.on('change', function(){
                curDate.hour = airRouteHourSelect.val();
                if(curDate.hour < 10)
                    curDate.hour = '0' + curDate.hour;
                queryAviation();
            });

            function resetDate(time) {
                laydate.render({
                    elem: '#airRouteDateInput',
                    value: time,
                    min: time,
                    showBottom: false,
                    done: function(value, date){
                        curDate.year = date.year;
                        curDate.month = date.month;
                        curDate.day = date.date;
                        if(curDate.month < 10) curDate.month = '0' + curDate.month;
                        if(curDate.day < 10) curDate.day = '0' + curDate.day;

                        queryAviation();
                    },
                });
            }

            $('#airRouteHourReduce').on('click', function() {
                hourUpdate(-1);
            });
            $('#airRouteHourPlus').on('click', function() {
                hourUpdate(1);
            });

            function hourUpdate(hour) {
                curDate.hour = airRouteHourSelect.val();
                let date = new Date(curDate.year, parseInt(curDate.month)-1, curDate.day, curDate.hour);
                date = new Date(date.getTime() + hour * 3600 * 1000);
                unityDate(date);
                time = curDate.year + '-' + curDate.month + '-' + curDate.day;
                resetDate(time);
                airRouteHourSelect.val(curDate.hour);
                queryAviation();
            }
        }
        

        var curDate;
        function unityDate(date) {
            curDate = {
                year : date.getFullYear(),
                month : date.getMonth() + 1,
                day: date.getDate(),
                hour: date.getHours(),
            };
            if(curDate.month < 10) curDate.month = '0' + curDate.month;
            if(curDate.day < 10) curDate.day = '0' + curDate.day;
            if(curDate.hour < 10) curDate.hour = '0' + curDate.hour;
        }
       
        /**
         * 查询海面单点详细信息
         * @param {*} positions 位置
         */
        // function queryAviationInfo(positions, locationNameMap_){
        //     curPositions = positions;
        //     locationNameMap = locationNameMap_;
        //     if (!hasInitialed) {
        //         init();
        //         hasInitialed = true;
        //     }

        //     $('.botPanelHangKong').show().animate({'bottom':'0px'}, 200);
        //     queryAviation();
        // }
        function queryAviationInfo(value,locationNameMap_){
            par_lat = value.lat;
            par_lng = value.lng;
            par_start = value.start.substr(0,value.start.length-2);
            par_end = value.end.substr(0,value.end.length-2);
            par_high = value.high;
            curPositions = [par_lat, par_lng];
            locationNameMap = locationNameMap_;
            
            if (!hasInitialed) {
                init();
                hasInitialed = true;
            }

            $('.botPanelHangKong').show().animate({'bottom':'0px'}, 200);
            queryAviation();
        }
        // [温,盐,流U,流V, 浪向,浪高,浪周期,涌浪周期,风U,风V]
        var timeChart;  //随时间变化的图表
        var lnglats;      //位置列表
        var dataS;      //数据列表
        var gfshPas = ['050', 100, 200,300,500,700,800,850,900,925,950,975];
        var ecHPas = ['050', 100, 200,300,500,700,800,850,900,925,950,1000];
        var heights = [12000,9000,5500,3000,2000,1500,900,700,500,300];
        var dangerHPas = [200,300,400,500,600,700,800,850,900,925,950];
        var hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;
        /**
         * 查询随位置变化的数据
         * @param {*} positions
         */
        function queryAviation(){
            // http://ocean.xinhong.net:8000/xhweatherfcsys/ecmf/timelyspaceprofiledatabyendtime?
            // lng=118.7628936767578,119.42447662353513&lat=34.4419553461225,33.128135555050875&start=2020041409&end=2020041419
            // http://weather.xinhong.net/gfs/spaceprofiledata?lat=35.002,-20.5,37.2,40&lng=128.76,115,122.3,135
            // var param = {
            //     lng: '',
            //     lat: ''
            // };
            // for(var i = 0; i < curPositions.length; i++) {
            //     param.lng += curPositions[i][0] + ',';
            //     param.lat += curPositions[i][1] + ',';
            // }
            var param = {
                lng: curPositions[1],
                lat: curPositions[0],
                start:par_start,
                end:par_end
            };
            // param.year = curDate.year;
            // param.month = curDate.month;
            // param.hour = curDate.hour;
            // param.day = curDate.day;

            let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
            let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
            // paramsURL += '/spaceprofiledata';
            paramsURL += '/timelyspaceprofiledatabyendtime';
            hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;

            let heightUnit = $('#airRouteHeightUnit')[0].innerHTML;
            if (heightUnit == 'm') {
                param.leveltype = 'height';
                hPas = heights;
            }

            http.get(url, paramsURL, param, function(json){
                //http.get(http.weatherUrl, '/gfs/spaceprofiledata', param, function(json){
                // var time = json.time.split('_');
                // var date = new Date(time[0].substring(0,4), parseInt(time[0].substring(4, 6)) -1,
                //     time[0].substring(6,8), time[0].substring(8,10));
                // time = new Date(date.getTime() + parseInt(time[1]) * 60 * 60 * 1000);
                // time = time.getFullYear() + '年' + (time.getMonth() + 1) + '月' + time.getDate()
                //     + '日' + time.getHours() + '时';
                // $('#rightInfo_multi_time').html('时间:' + time);
                //-----------------------整理数据
                lnglats = [];
                dataS = {
                    //-------------强对流
                    TS:[],
                    VIS:[],
                    CTH:[],
                    CBH:[],
                    //--------------航空危险天气
                    WS:[],
                    WD:[],
                    TT:[],
                    RH:[],
                    TURB:[],
                    ICE:[],
                    // -------------地面
                    SURF_RN:[],
                    SURF_RH:[],
                    SURF_WS:[],
                    SURF_WD:[],
                    SURF_TT:[]
                };
                let sourceType = XHW.config.datasource;
                if (sourceType == 'ecmf' || sourceType == 'ECMF')
                    sourceType = 'EC';
                let data = json.data;
                dangerInfo = [];
                for(let i = 0; i < data.latlngs.length; i++){
                    let locationName = getNearstLocationName(data.latlngs[i]);
                    if (locationName) {
                        data.latlngs[i] += ',' +  locationName;
                    } else {
                        data.latlngs[i] += ', ';
                    }
                    lnglats.push(data.latlngs[i]);
                    let profiledatas = data.profiledatas[i];
                    //-----------------------强对流
                    if (profiledatas.DANGER && profiledatas.DANGER['9999']) {
                        dataS.TS.push(profiledatas.DANGER['9999']['TS']);
                        dataS.VIS.push(profiledatas.DANGER['9999']['VIS']);
                        dataS.CTH.push(profiledatas.DANGER['9999']['CTH']);
                        dataS.CBH.push(profiledatas.DANGER['9999']['CBH']);
                    }
                    //-----------------------地面
                    if (profiledatas[sourceType]
                        && profiledatas[sourceType]['9999']) {
                        if (profiledatas[sourceType]
                            && profiledatas[sourceType]['9999']) {
                            let u = profiledatas[sourceType]['9999']['UU'];
                            let v = profiledatas[sourceType]['9999']['VV'];
                            let ws = Math.sqrt(u * u + v * v);
                            ws = ((ws * 10) >> 0) / 10;
                            let wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                            wd = ((wd * 10) >> 0) / 10;
                            if (wd > 360) {
                                wd -= 360;
                            }
                            dataS.SURF_WS.push(ws);
                            dataS.SURF_WD.push(wd);
                            dataS.SURF_TT.push(profiledatas[sourceType]['9999']['TT']);
                            dataS.SURF_RH.push(profiledatas[sourceType]['9999']['RH']);
                            dataS.SURF_RN.push(profiledatas[sourceType]['9999']['RN']);
                        } else {
                            dataS.SURF_WS.push(NaN);
                            dataS.SURF_WD.push(NaN);
                            dataS.SURF_TT.push(NaN);
                            dataS.SURF_RH.push(NaN);
                            dataS.SURF_RN.push(NaN);
                        }
                    }
                    //-----------------------航空危险天气
                    dataS.WS.push([]);
                    dataS.WD.push([]);
                    dataS.TT.push([]);
                    dataS.RH.push([]);
                    dataS.TURB.push([]);
                    dataS.ICE.push([]);

                    for(let j = 0; j < hPas.length; j++) {
                        let key = hPas[j] + '';
                        if (key.length < 4 && heightUnit == 'hPa') {
                            key = '0' + key;
                        }
                        // let key = gfshPas[j] + '';
                        // if (key.length < 4 && heightUnit == 'hPa') {
                            // key = '0' + key;
                        // }
                        if (profiledatas[sourceType]
                            && profiledatas[sourceType][key]) {
                            let u = profiledatas[sourceType][key]['UU'];
                            let v = profiledatas[sourceType][key]['VV'];
                            let ws = Math.sqrt(u * u + v * v);
                            ws = ((ws * 10) >> 0) / 10;
                            let wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                            wd = ((wd * 10) >> 0) / 10;
                            if (wd > 360) {
                                wd -= 360;
                            }

                            dataS.WS[i].push(ws);
                            dataS.WD[i].push(wd);
                            dataS.TT[i].push(profiledatas[sourceType][key]['TT']);
                            dataS.RH[i].push(profiledatas[sourceType][key]['RH']);
                        } else {
                            dataS.WS[i].push(NaN);
                            dataS.WD[i].push(NaN);
                            dataS.TT[i].push(NaN);
                            dataS.RH[i].push(NaN);
                        }
                        if (profiledatas.DANGER && profiledatas.DANGER[key]) {
                            dataS.TURB[i].push(profiledatas.DANGER[key]['TURB']);
                            dataS.ICE[i].push(profiledatas.DANGER[key]['ICE']);
                        } else {
                            dataS.TURB[i].push(NaN);
                            dataS.ICE[i].push(NaN);
                        }
                    }
                    var dangerhtml = '';
                    if(profiledatas.DANGER){
                        dangerhtml += '<p>时间:'+profiledatas.arriveTime+'</p>';
                    };
                    for(let j = 0; j < dangerHPas.length; j++) {
                        var danger_key = dangerHPas[j] + '';
                        if (danger_key.length < 4) {
                            danger_key = '0' + danger_key;
                        }
                        if (profiledatas.DANGER && profiledatas.DANGER[danger_key]) {
                            var turbHtml = profiledatas.DANGER[danger_key]['TURB'] != 0 ? '<p>' + danger_key + 'hPa颠簸：' + profiledatas.DANGER[danger_key]['TURB'].toFixed(2) + '</p>' : '';
                            var iceHtml = profiledatas.DANGER[danger_key]['ICE'] != 0 ? '<p>' + danger_key + 'hPa积冰:' + profiledatas.DANGER[danger_key]['ICE'].toFixed(2) + '</p>' : '';
                            dangerhtml += turbHtml + iceHtml;
                        } 
                    }
                    dangerInfo.push(dangerhtml)
                }
                //-------------------------航天危险天气绘制
                drawCrossSection();     
                showPopup(data.latlngs,par_start,par_end,dangerInfo)
            }, function(){
                // 请求数据失败，清除内容
                if (profileChart)
                    profileChart.resetData(undefined);
            })
        }
        function removePopup(){
            stopAnimation();
            if(popupAr.length > 0){
                for(var i = 0; i < popupAr.length; i++){
                    // XHW.map.removeOverlay(popupAr[i]);
                    XHW.map.removeLayer(popupAr[i]);
                }
                popupAr = [];
            }
        }

        var animating = false;
        var speed = 1; //动画时间间隔(毫秒)
        var geoMarker;
        var routeCoords; 
        var styles = {
            'geoMarker': new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: 'img/fly.png',
                    scale: 0.5,
                    rotation: Math.PI
                })
            })
            };
        var moveFeature = function(event) {
            var vectorContext = event.vectorContext;
            var frameState = event.frameState;
            if (animating) {
                var elapsedTime = frameState.time - now;
                var index = Math.round(speed * elapsedTime / 1000);
                if (index >= routeLength) {
                    stopAnimation(true);
                    return;
                }
               
                if (index < routeCoords.length - 1) {
                    var currentPoint = new ol.geom.Point(routeCoords[index]);
                    var feature = new ol.Feature(currentPoint);
                    $('body').append('<div id="dangerinfo"  style="margin:10px;padding:7px;background:white;color：black;border:3px solid #31BEF4;"></div>');
                    var elem =  document.getElementById('dangerinfo');
                    for(let i = 0; i < routeCoords.length; i++){ 
                        if(index >= i){
                            elem.innerHTML = dangerInfo[i] ? dangerInfo[i] : '<p>无警报信息</p>'; 
                        }                      
                    }
                    //--------创建地图弹窗对象     
                    overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
                            element: elem,
                            autoPan: true,
                            position: feature.values_.geometry.flatCoordinates,     //--------设置弹窗位置  值为marker位置
                            positioning: 'bottom-left',         //--------默认左下角（设置下方居中无效，依靠样式自己设置）
                            autoPanAnimation: {
                            duration: 250   //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度. 单位为毫秒（ms）
                        }
                    }));        
                    overlay.setElement(elem);
                    overlay.setPosition(feature.values_.geometry.flatCoordinates);
                    //-------打开弹窗
                    XHW.map.addOverlay(overlay);

                    vectorContext.drawFeature(feature, styles['geoMarker']);
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
                geoMarker.setStyle(null);
                XHW.map.on('postcompose', moveFeature);
                XHW.map.render();
            }
        }

        /**
         * @param {boolean} ended end of animation.
         */
        function stopAnimation(ended) {
            animating = false;   
            XHW.map.un('postcompose', moveFeature);
            if(overlay)XHW.map.removeOverlay(overlay);
        }
        function showPopup(data,sta,end,dangerInfo){
            removePopup();         
            let markers = [];
            routeCoords = []; 
            for(var i = 0; i < data.length; i++){
                var lonlat = data[i].split(',');

                //  动画point所有经纬度
                routeCoords.push(ol.proj.fromLonLat([parseFloat(lonlat[1]),parseFloat(lonlat[0])]));           
                //  结束

                if(dangerInfo[i] == '')continue;
                let lnglat = ol.proj.fromLonLat([parseFloat(lonlat[1]),parseFloat(lonlat[0])]);

                //--------step2-------------画点
                let marker = new ol.Feature({
                    geometry:new ol.geom.Point(lnglat), 
                });
                //----------step3------------给marker加入标记
                marker.type = 'danger_routePoint';
                marker.value = {
                    info:dangerInfo[i],
                    lonlat:data[i],
                };
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'orange'                                        
                        }), 
                        fill: new ol.style.Fill({
                            color: 'orange'
                        })
                    })
                }));             
                markers.push(marker);
            }
            let features = markers;
            
            //  动画point
            routeLength = routeCoords.length;
            geoMarker = new ol.Feature({
                type: 'geoMarker',
                geometry: new ol.geom.Point(routeCoords[0])
            });
            features.push(geoMarker);
            //  结束
            //-------step8--------删除旧图层，替换新的图层

            var layer = new ol.layer.Vector({
                style: function(feature) {
                    // hide geoMarker if animation is active
                    // if (animating && feature.get('type') === 'geoMarker') {
                    //   return null;
                    // }
                    return styles[feature.get('type')];
                }
            });
                layer.setZIndex(15);
                layer.id = 'danger_routePoint';
                XHW.map.addLayer(layer);
                startAnimation();
            let source = new ol.source.Vector({
                features: features
            });
            layer.setSource(source);
            popupAr.push(layer);
        }
        var profileChart;
        function getNearstLocationName(lnglat) {
            if (locationNameMap && lnglat) {
                let lnglats = lnglat.split(',');
                for (let i = 0; i < curPositions.length; i++) {
                    let lonDelta = Math.abs(curPositions[i][0] - parseFloat(lnglats[1]));
                    let latDelta = Math.abs(curPositions[i][1] - parseFloat(lnglats[0]));
                    if (lonDelta <= 0.015
                        && latDelta <= 0.015) {
                        return locationNameMap[curPositions[i][0] + ',' + curPositions[i][1]];
                    }
                }
            }
        }

        // 获取canvas的移动事件
        function canMove(dataS, option){         
            var canvas=document.querySelector('#ProfileChart_Content');
            canvas.onmousemove = function(e){
                p = getEventPosition(e);           
                let devicePixelRatio = window.devicePixelRatio || 1;
                var canWid = $('#ProfileChart_Content').width() * devicePixelRatio;
                var canHei = $('#ProfileChart_Content').height() * devicePixelRatio;
                let xi = 50 * devicePixelRatio*1.5;  //单个数据所占宽度
                if(option.xAxis.data.length <= 14){
                    xi = canWid / option.xAxis.data.length;
                }

                let chartHeight = canHei;
                let locationNameHeight = 0;
                if (option.isDrawLocationName) {
                    locationNameHeight = 20;
                }
                chartHeight -= locationNameHeight;
                let yAxisLength = option.yAxis.data.length;
                let yi = (chartHeight - 50 * devicePixelRatio) / yAxisLength;
                
                var i = parseInt(p.x * devicePixelRatio / xi);
                var j = parseInt(p.y * devicePixelRatio / yi);
                // if(p.y>200){
                if (j > hPas.length) {
                    $('#profilePopup').hide();
                    return;
                }
                var top;
                var left;
                if(j == hPas.length){
                    var ws = dataS.SURF_WS[i] ? dataS.SURF_WS[i].toFixed(1) : '--';
                    var wd = dataS.SURF_WD[i] ? dataS.SURF_WD[i].toFixed(1) : '--';
                    var tt = dataS.SURF_TT[i] ? format.tt(dataS.SURF_TT[i]) : '--';
                    var rn = dataS.SURF_RN[i] ? Math.round(dataS.SURF_RN[i]) : '--';
                    var innerHTML = '<span>温度：' + tt + ';</span><span> 3h降水：' + rn + 'mm;</span><span> 风速：' + ws + 'm/s;</span><span> 风向：' + wd + '度;</span>'
                    $('#profilePopup').html(innerHTML);
                    top = p.y-75;
                    left = p.x+15;
                }else{
                    var ws = dataS.WS[i][j] ? dataS.WS[i][j].toFixed(1) : '--';
                    var wd = dataS.WD[i][j] ? dataS.WD[i][j].toFixed(1) : '--';
                    var tt = dataS.TT[i][j] ? format.tt(dataS.TT[i][j]) : '--';
                    let type = $('input:radio[name="route_profileChart_multi_radio"]').parent('.current').children('input')[0].value;
                    var typeElem = null;
                    if(type == 'RH'){
                        // rh = '湿度： ' + dataS.RH[i][j] != 'undefined' ? dataS.RH[i][j] : '--' + '';
                        typeElem = '湿度: ' + format.rh(dataS.RH[i][j]);
                    }else if(type == 'TURB'){
                        var turb = dataS.TURB[i][j] ? dataS.TURB[i][j].toFixed(1) : '--';
                        typeElem = '颠簸: ' + turb;
                    }else if(type == 'ICE'){
                        var ice = dataS.ICE[i][j] ? dataS.ICE[i][j].toFixed(1) : '--';
                        typeElem = '积冰: ' + ice;
                    }
                    var innerHTML = '<span>温度：' + tt + ';</span><span> 风速：' + ws + 'm/s;</span><span> 风向：' + wd + '度;</span><span>' + typeElem + '</span>';
                    $('#profilePopup').html(innerHTML);
                    top = p.y+5;
                    left = p.x+5;
                }
                if (e.x + 100 > document.body.clientWidth) {
                    left -= 100;
                }
                $('#profilePopup').show();         
                $('#profilePopup').css({
                    'top' : top + 'px',
                    'left': left+ 'px'
                });
            };  
            $('#ProfileChart_Content').mouseout(function(){
                $('#profilePopup').hide();
            });        
        }
        
        function getEventPosition(ev){
            var x, y;
            if (ev.layerX || ev.layerX == 0) {
              x = ev.layerX;
              y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
              x = ev.offsetX;
              y = ev.offsetY;
            }
            return {x: x, y: y};
          }

        /**
         * 绘制剖面图
         * @param {*} type
         */
        function drawCrossSection(){
            // $('.botPanelHangKong .botHangKongLeft .botPanelScroll .botPanelLeftTu').empty();
            // $('.botPanelHangKong .botHangKongLeft .botPanelScroll .botPanelLeftTu').html(
            //     '<div class="content" style="width:100%;height:100%;">\n' +
            //     '                    <canvas id="ProfileChart_Content" style="width:100%;height:100%;"></canvas>\n' +
            //     '                </div>');
            // 初始化滚动条样式
            // $(".content").mCustomScrollbar({
            //     axis:"x"
            // });
            // //加载js
            // botPanelHangKong();
            // botHangKongLeftWidth();
            let contentWidth = $('.botPanelHangKong .botHangKongLeft .botPanelScroll .botPanelLeftTu').width();

            let devicePixelRatio = window.devicePixelRatio || 1;
            $('.botPanelHangKong .botHangKongLeft .mCSB_scrollTools.mCSB_scrollTools_horizontal').css('bottom', (72 - 12 * devicePixelRatio) + 'px');
            
            $('#ProfileChart_Content').css('width', contentWidth + 'px');
            let yAxisArr = hPas.slice(0);
            yAxisArr.push('9999');
            let type = $('input:radio[name="route_profileChart_multi_radio"]').parent('.current').children('input')[0].value;
            let profileOption = {
                xAxis: {
                    data: lnglats,
                    boundaryGap : true,
                    axisTick: { alignWithLabel: true},
                    axisLine: { onZero: false, lineStyle:{color: '#13507f'}},
                    axisLabel:{
                        formatter: function(value, index){
                            value = value.split(',');
                            let locationName = value.length > 2 ? value[2]:undefined;
                            value = format.lnglat(value[1], value[0]).split(' , ');
                            return value[0] + '\n' + value[1] + (locationName?'\n' + locationName:'');
                        }
                    },
                },
                yAxis: {
                    data: yAxisArr,
                    boundaryGap : true,
                    axisTick: { alignWithLabel: true},
                    axisLine: { onZero: false, lineStyle:{color: '#13507f'}}
                },
                isDrawLocationName: true,
                series: [{
                    name: '湿度',
                    type: 'fill',
                    data: dataS.RH,
                    yAxis: hPas,
                    visible: type == 'RH',
                    fillColorFunc: function(value) {
                        return getRHColor(value);
                    }
                },{
                    name: '颠簸',
                    type: 'fill',
                    data: dataS.TURB,
                    yAxis: hPas,
                    visible: type == 'TURB',
                    fillColorFunc: function(value) {
                        return getTRUBColor(value)
                    }
                },{
                    name: '积冰',
                    type: 'fill',
                    data: dataS.ICE,
                    yAxis: hPas,
                    visible: type == 'ICE',
                    fillColorFunc: function(value) {
                        return getICEColor(value)
                    }
                },{
                    name: '风羽',
                    type: 'windbarb',
                    WS: dataS.WS,
                    WD: dataS.WD,
                    visible: true,
                    yAxis: hPas,
                    Img: windImg
                },{
                    name: '温度',
                    type: 'label',
                    data: dataS.TT,
                    yAxis: hPas,
                    label: {
                        normal: {
                            show: true
                        }
                    },
                    visible: true,
                    color: '#850a06'
                },{
                    name: '降水',
                    type: 'bar',
                    data: dataS.SURF_RN,
                    filterValue: [0],
                    max: 50,
                    yAxis: ['9999'],
                    offset: {
                        x: 15,
                        y: 5
                    },
                    fillColorFunc: function(value) {
                        if (!value || value == "") {
                            return 'rgba(0,0,0,0)';
                        }
                        if(value <= 0.1) {
                            return 'rgba(255,255,255,0)';
                        } else if(value <= 3){return 'rgba(200,255,188,0.5)';
                        } else if(value <= 10){return 'rgba(1,219,0,0.5)';
                        } else if(value <= 20){return 'rgba(1,200,197,0.5)';
                        } else if(value <= 50){return 'rgba(32,60,255,0.5)';
                        } else { return 'rgba(240,2,132,0.5)'; }
                   },
                    visible: true
                },{
                    name: '温度',
                    type: 'label',
                    data: dataS.SURF_TT,
                    yAxis: ['9999'],
                    visible: true,
                    offset: {
                        x: -20,
                        y: 5
                    },
                    color: '#ff0000'
                },{
                    name: '降水',
                    type: 'label',
                    data: dataS.SURF_RN,
                    filterValue: [0],
                    yAxis: ['9999'],
                    color: '#00aa00',
                    offset: {
                        x: 20,
                        y: 5
                    },
                    visible: true
                },{
                    name: '地面风',
                    type: 'windbarb',
                    WS: dataS.SURF_WS,
                    WD: dataS.SURF_WD,
                    yAxis: ['9999'],
                    visible: true,
                    offset: {
                        x: 0,
                        y: 10
                    },
                    Img: windImg
                }]
            };
            if (!profileChart) {
                profileChart = new tool.ProfileChart({left_axe: 'ProfileChart_yAxis', right_content: 'ProfileChart_Content'});
            }
            profileChart.resetData(profileOption,par_high,par_lng,par_lat);
            $('#ProfileChart_Content').parent().css('width', $('#ProfileChart_Content').outerWidth());
            $('#botPanelHangKongDiv .content').mCustomScrollbar("update");

            canMove(dataS, profileOption);
        }

        /**
         * 根据湿度获取填充色
         * @param {*} val
         */
        function getRHColor(val) {
            if (!val || val == "") {
                return 'rgba(0,0,0,0)';
            }
            var r = 0.95;
            var g = 1.0;
            var b = 0.95;
            var a = 0.6;
            var delta = val - 20;
            var maxDeltaRight = 100;

            r = r - delta / maxDeltaRight;
            if (r < 0.1) r = 0.1;
            else if (r > 1.0) r = 1.0;
            r = (r * 255) >> 0;

            g = g - delta * 0.5 / maxDeltaRight;
            if (g < 0.5) g = 0.5;
            else if (g > 1.0) g = 1.0;
            g = (g * 255) >> 0;

            b = b - delta / maxDeltaRight;
            if (b < 0.1) b = 0.1;
            else if (b > 1.0) b = 1.0;
            b = (b * 255) >> 0;

            a = a + delta * 2 / maxDeltaRight;
            if (a > 1.0) a = 1.0;

            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
        }

        /**
         * 根据颠簸获取填充色
         * @param {*} val
         */
        function getTRUBColor(val) {
            if (!val || val == "") {
                return 'rgba(0,0,0,0)';
            }
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 0;
            if(val <= 0.7) {

            } else if(val <= 2){
                r = 0.996;
                g = 0.788;
                b = 0.349;
                a = 0.35;
            } else if(val <= 3.5){
                r = 0.922;
                g = 0.435;
                b = 0.075;
                a = 0.6;
            } else {
                r = 0.431;
                g = 0.153;
                b = 0.024;
                a = 0.75;
            }
            r = (r * 255) >> 0;
            g = (g * 255) >> 0;
            b = (b * 255) >> 0;

            if (a > 1.0) a = 1.0;

            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
        }

        /**
         * 根据积冰获取填充色
         * @param {*} val
         */
        function getICEColor(val) {
            if (!val || val == "") {
                return 'rgba(0,0,0,0)';
            }
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 0;
            if(val <= 0.7) {

            } else if(val <= 2){
                r = 0;
                g = 0.925;
                b = 0.925;
                a = 0.25;
            } else if(val <= 3.5){
                r = 0.004;
                g = 0.627;
                b = 0.965;
                a = 0.35;
            } else {
                r = 0;
                g = 0;
                b = 1;
                a = 0.45;
            }
            r = (r * 255) >> 0;
            g = (g * 255) >> 0;
            b = (b * 255) >> 0;

            if (a > 1.0) a = 1.0;

            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
        }
        return {
            queryAviationInfo: queryAviationInfo,
            resetDate: initDateDiv,
            removePopup:removePopup,
            drawCrossSection:drawCrossSection,
            queryAviation: queryAviation
        }
    });
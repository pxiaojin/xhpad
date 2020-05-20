define(['lib/echarts'],function(echarts){

    const chartId = 'waterLevelChart';
    const chartWinId = 'waterLevelChartWin';

    var type;
    var key;
    var item;
    var legend;
    var button;     //功能开关按钮
    var waterLayer;      //功能图层
    var waterAlarmLayer;  //超过警戒水位图层
    var isOpen = false;
   
    button = $('#live_water');
    // open();
    button.on('click', function(){
        if(isOpen) {
            close();   
            button.removeClass('current');
            $('#WATER').hide();
        } else {
            open();
            $('#WATER').show();
        }       
    });

    $('#waterLevelChartWin .del').click(function(e) {
        $(this).parent().hide()
    })

    $('#real_mixedGraph_level li').on('click', function(){
        if($(this).html() == '地面' && button.hasClass('current')){
            open();
        }else{
            close();
        }       
    })

    timeBar.addCallback(function(){
        if(isOpen) queryWaterLatestData();
    });

    $('#' + chartWinId + ' .chartWinDel').on('click', function(){
        $('#' + chartWinId).hide();
    });

    function open() {
        init();
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(button);
         isOpen = true;   
    }

    function close() {
        if (waterLayer)
            XHW.map.removeLayer(waterLayer);  
        if(waterAlarmLayer)
            XHW.map.removeLayer(waterAlarmLayer);  
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(button);
        $('#' + chartWinId).hide();
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);
        isOpen = false;     
    }

    var waterStationsMap;
    function init(){
        type = key = 'waterMark';
        legend = '<ul class="luDiShuiWen"><li style="line-height:1;">陆地水文</li>' + 
                    '<li><img src="img/sea/shuiwen_label.png" width="15" alt="" /><span>正常</span></li>' +
                    '<li><img src="img/sea/red.png" width="15" alt="" /><span>超过警戒水位</span></li>' +
                    '<li><img src="img/sea/gray.png" width="15" alt="" /><span>暂缺</span></li>' +
                '</ul>';
        item = XHW.C.layerC.createItem('陆地水文', legend, function(){
            close();
        })
        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){
            return getPopupHtml(value);
        });

        XHW.C.mapclick.addCallback(type, function(value){
            $('#' + chartWinId).show();
            drawChart(value);
            //后续添加机场条件不满足数据
            // airportInfo.queryAirportInfo(value.code, value.time, value.weather);
        });
        if (waterStationsMap) {
            queryWaterLatestData();
        } else {
            $.ajax({
                url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/landhydrology/stations'),
                success: function (res) {
                    res = JSON.parse(res);
                    if (res.status_code != 0) {
                        console.log("水文站点数据查询错误");
                        return;
                    }
                    waterStationsMap= res.data.data;
                    queryWaterLatestData();
                },
                error: function () {

                }
            });
        }
    }

    

    function queryWaterLatestData() {
        if (!waterStationsMap) {
            return;
        }
        var time = timeBar.getRequestTime().split('-');
        var year = time[0];
        var month = time[1];
        var day = time[2];
        var hour = time[3];
        // var param = {
        //     year: XHW.silderTime.year,
        //     month: XHW.silderTime.month,
        //     day: XHW.silderTime.day,
        //     hour: XHW.silderTime.hour
        // };
        var param = {
            year: year,
            month: month,
            day: day,
            hour: hour
        };
        var myParam = '?';
        for(var key in param) {
            myParam += key + '=' + param[key] + '&';
        };
        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/landhydrology/allStationsData' + myParam),
            dataType: 'json',
            success: function (res) {
                if (res.status_code != 0) {
                    console.log("数据错误");
                    return;
                }
                item.htmlLayer = ' 陆地水文';
                XHW.C.layerC.updateLayerData(key, item);
                if(res.data){
                    let stationDatas = res.data.data;
                    drawStations(stationDatas);
                }else{
                    drawStations();
                };              
            },
            error: function(){
                item.htmlLayer = ' 陆地水文(无数据)';
                XHW.C.layerC.updateLayerData(key, item);
                drawStations();
            }
        });
    }

    function drawStations(stationDatas) {
        let iconFeatures = [];
        let iconRedFea = [];
        for (let key in waterStationsMap) {
            if (!key || key.length <= 0)
                continue;
            let stationInfo = {};
            stationInfo.name = waterStationsMap[key].cHNN;
            stationInfo.stationCode = waterStationsMap[key].sTATION;
            stationInfo.lng = waterStationsMap[key].lON;
            stationInfo.lat = waterStationsMap[key].lAT;
            stationInfo.riverName = waterStationsMap[key].rIVERNAME;
            stationInfo.waterSysName = waterStationsMap[key].wATERSYSNAME;

            let stationData = searchCurDataBy(stationInfo.stationCode, stationDatas);
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([parseFloat(stationInfo.lng), parseFloat(stationInfo.lat)])),
            });

            iconFeature.type = type;

            iconFeature.value = {};
            iconFeature.value.stationInfo = stationInfo;
            if(stationData){
                iconFeature.value.stationData = stationData;
                if(parseFloat(stationData.level) > parseFloat(stationData.alarmLevel)){
                    iconRedFea.push(iconFeature);
                    continue;
                }
            }
            
            iconFeatures.push(iconFeature);
        }
        let redSource = new ol.source.Vector({
            features: iconRedFea
        });
        let vectorSource = new ol.source.Vector({
            features: iconFeatures
        });
        let clusterSource = new ol.source.Cluster({
            distance: 30,
            source: vectorSource
        });

        function createWaterStyle(feature) {
            // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
            // standards-violating <magnitude> tag in each Placemark.  We extract it
            // from the Placemark's name instead.
            let level = feature.value.stationData ? feature.value.stationData.level : '--';
            let alarmLevel = feature.value.stationData ? feature.value.stationData.alarmLevel : '--';
            let colorStr = (parseFloat(alarmLevel) > parseFloat(level) || level == '--' || alarmLevel == '--')? 'black': 'red';
            let imgStr = (alarmLevel == '--' || level == '--') ? 'gray' :
                            parseFloat(level) > parseFloat(alarmLevel) ? 'red' : 'shuiwen_label';
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: 'img/sea/' + imgStr + '.png',
                    scale: 0.5,
                })),
                text: new ol.style.Text({
                    textAlign: "center",
                    textBaseline: "middle",
                    font: '10px Normal Arial',
                    text: level + 'm',
                    fill: new ol.style.Fill({    //文字填充色
                        color: colorStr,
                    }),
                    backgroundStroke:new ol.style.Stroke({
                        width:0.4,
                        lineJoin: 'round',
                    }),
                    backgroundFill:new ol.style.Fill({
                        color:'rgba(153,217,234,0.5)',
                    }),
                    offsetY: 18
                }),
            })
        }
        let calculateClusterInfo = function(resolution) {
            let features = waterLayer.getSource().getFeatures();
            let feature;
            for (let i = features.length - 1; i >= 0; --i) {
                feature = features[i];
                feature.type = type;
                let originalFeatures = feature.get('features');
                let maxDisLevelIndex = 0;
                if (originalFeatures.length > 1) {
                    let j = (void 0), jj = (void 0);
                    let maxDisLevel = -9999;
                    for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
                        if (originalFeatures[j].value.stationData
                            && originalFeatures[j].value.stationData.level != '--'
                            && originalFeatures[j].value.stationData.alarmLevel != '--') {
                            let disLevel = parseFloat(originalFeatures[j].value.stationData.level) - parseFloat(originalFeatures[j].value.stationData.alarmLevel);
                            if (maxDisLevel < disLevel) {
                                maxDisLevel = disLevel;
                                maxDisLevelIndex = j;
                            }
                        }
                    }
                }
                feature.setGeometry(originalFeatures[maxDisLevelIndex].getGeometry());
                feature.value = originalFeatures[maxDisLevelIndex].value;
                feature.value.waterStationCount = originalFeatures.length;
            }
        };

        var currentResolution;
        function styleFunction(feature, resolution) {
            if (!feature.value || resolution != currentResolution) {
                calculateClusterInfo(resolution);
                currentResolution = resolution;
            }
            let style;
            var size = feature.get('features').length;
            if (size > 1) {
                style = createWaterStyle(feature);
            } else {
                var originalFeature = feature.get('features')[0];
                style = createWaterStyle(originalFeature);
            }
            return style;
        }

        function selectStyleFunction(feature) {
            let styles = [];
            let originalFeatures = feature.get('features');
            if (!originalFeatures)
                return;
            for (let i = originalFeatures.length - 1; i >= 0; --i) {
                originalFeature = originalFeatures[i];
                styles.push(createWaterStyle(originalFeature));
            }
            return styles;
        }

        if (!waterLayer) {
            waterLayer = new ol.layer.Vector({
                style: styleFunction
            });
            waterLayer.setZIndex(15);
            waterLayer.id = key;
        }
        if (!waterAlarmLayer) {
            waterAlarmLayer = new ol.layer.Vector({
                style: createWaterStyle
            });
            waterAlarmLayer.setZIndex(15);
            waterAlarmLayer.id = key;
        }
        waterAlarmLayer.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                crossOrigin: 'anonymous',
                src: 'img/sea/red.png',
                scale: 0.8,
            })),  
                                                 
        }));  
        waterAlarmLayer.setSource(redSource);
        waterLayer.setSource(clusterSource);
        
        if ($.inArray(waterLayer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(waterLayer);
        if ($.inArray(waterAlarmLayer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(waterAlarmLayer);

//         XHW.map.addInteraction(new ol.interaction.Select({
//             condition: function(evt) {
//                 return evt.type == 'pointermove' ||
//                     evt.type == 'singleclick';
//             },
//             style: selectStyleFunction
//         }))
    }

    function searchCurDataBy(code, curDatas){
        if (!code || !curDatas)
            return;
        let stationData = {};
        stationData.level = '--';
        stationData.time = '--';
        stationData.timeString = '--';
        stationData.alarmLevel = '--';
        for (let i = 0; i < curDatas.length; i++) {
            if (code == curDatas[i].station_num) {
                stationData.level = curDatas[i].water_level;
                stationData.time = curDatas[i].date_time;
                stationData.timeString = curDatas[i].time_string;
                stationData.alarmLevel = curDatas[i].warning_water_level;
                break;
            }
        }
        return stationData;
    }

    function getPopupHtml(value){
        let stationInfo = value.stationInfo;
        let stationData = value.stationData;
        let htmlContent = '';
        htmlContent += '<div style="position:absolute;left:-30px;bottom:12px;'
        htmlContent += 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
        htmlContent += '<h1 style="font-size:12px;margin:5px 0;">' + stationInfo.name + '</h1>'
        htmlContent += '<h2 style="font-size:12px;margin:5px 0;">' + stationInfo.lat + ", " + stationInfo.lng + '</h2>'
        if (stationData) {
            htmlContent += '<h2 style="font-size:12px;margin:5px 0;">' + stationData.timeString + '</h2>'
            htmlContent += '<h1 style="font-size:12px;margin:5px 0;">' + "水    位：" + stationData.level + "m" + '</h1>'
            htmlContent += '<h1 style="font-size:12px;margin:5px 0;">' + "警戒水位：" + stationData.alarmLevel + "m" + '</h1>'
        }
        if (value.waterStationCount > 1){
            htmlContent += '<h1 style="font-size:12px;margin:5px 0;">' + "附近数量：" + value.waterStationCount + "个" + '</h1>'
        }
        htmlContent += '</div>';
        return htmlContent;
    }
    //绘制曲线画法
    function drawChart(value){
        let stationInfo = value.stationInfo;
        let stationData = value.stationData;
        $.ajax({
            url: appendInfoToURL('http://ocean.xinhong.net:8000/xhweatherfcsys/landhydrology/timeProfileData?station=' + stationInfo.stationCode + '&pastday=10'),
            dataType:'json',
            success:function(json){
                if (json.status_code != 0) {
                    console.info("查询水文站的时间序列数据失败");
                    return;
                }
                showChart(json.data.data);
            }
        });
        $('#' + chartWinId + ' .tabtitle .titleInfo').html(stationInfo.name);
    }

    var oneChart;
    //
    function showChart(waterTimeData) {
        let times = [];
        let warningLevels = [];
        let waterLevels = [];

        function sortByTime(a, b) {
            return b.date_time - a.date_time;
        }
        waterTimeData.sort(sortByTime);

        for (let i = 0; i < waterTimeData.length; i++) {
            times.push(waterTimeData[i].time_string.substring(8, 10) + '日\n' + waterTimeData[i].time_string.substring(11, 13) + '时');
            warningLevels.push(parseFloat(waterTimeData[i].warning_water_level));
            waterLevels.push(parseFloat(waterTimeData[i].water_level));
        }

        //------------------------------寻找数据最大/最小值
        let levelMax;
        let levelMin;
        for (var i = 0; i < waterLevels.length; i++) {
            if (waterLevels[i] != '-') {
                levelMax = levelMax && levelMax > waterLevels[i] ? levelMax : waterLevels[i];
                levelMin = levelMin && levelMin < waterLevels[i] ? levelMin : waterLevels[i];
            }
        }
        levelMax = Math.ceil(levelMax) - 0.5 <= levelMax ? Math.ceil(levelMax) : Math.ceil(levelMax) - 0.5;
        levelMin = Math.floor(levelMin) + 0.5 >= levelMin ? Math.floor(levelMin) : Math.floor(levelMin) + 0.5;
        levelMin = Math.floor(levelMin / 10) * 10;
        levelMax = Math.floor((levelMax + 5) / 5) * 5;

        oneChart = oneChart ? oneChart.dispose() : '';
        oneChart = echarts.init(document.getElementById(chartId));
        let option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis'
            },
            color: ['red', '#90BCC2'],
            legend: {
                data: [
                    {
                        name: '警戒水位', textStyle: {
                            color: 'red'
                        }
                    },
                    {
                        name: '水    位', textStyle: {
                            color: '#90BCC2'
                        }
                    }]
            },
            grid: {
                left: '5%',
                right: '5%',
                top: '15%',
                bottom:'1%',
                containLabel: true
            },
            yAxis: [
                {
                    name: '(m)',
                    nameTextStyle:{padding:[-30,0,0,0],color:'white'},
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#9E9EB9',
                        }
                    },
                    min: levelMin,
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#fff'
                        }
                    },
                }
            ],
            xAxis: [{
                data: times,
                inverse: true,
                boundaryGap: false,
                axisLine: {onZero: false, lineStyle: {color: '#ffffff'}},
            }],
            series: [{
                name: '警戒水位',
                type: 'line',
                smooth: true,
                data: warningLevels
            }, {
                name: '水    位',
                type: 'line',
                smooth: true,
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: '#1ea6fd'
                        }, {
                            offset: 1,
                            color: '#d4f2e7'
                        }])
                    }
                },
                data: waterLevels
            }]
        };
        oneChart.setOption(option);
    }

    return {
        close: close,
    }
});
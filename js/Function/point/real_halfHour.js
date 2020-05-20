//站点 城市 气象数据
define(['lib/echarts','Controller/layout', 'Controller/DataFormat','Function/point/SingleInfo'],
 function(echarts,layout, format,Sing_info) {
    var key;
    var type;
    var item;
    var arrowSize = 18;
    var weatherIconSize = 25;
    var myChart;

    var button;     //功能开关按钮
    var isOpen = false;
    var layer;      //功能图层

    function init(){
        button = $('#real_halfHour_wea');
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        //层级缩放监听
        XHW.C.MapMove.addZoomCallback(function(){
            if(isOpen) getData();
        });

        type = key = 'real_halfHour';
        item = XHW.C.layerC.createItem('', '', function(){
            close();
        })

        XHW.C.mapclick.addCallback(type, function(value){
            $('.bottompanel').show();
            $('.bottompanel .posi_wea').show();
            rightRealInfo(value);
            $('.fcCurve').click(function(){
                getFcData(value);
            })
            $('.realCurve').click(function(){
                getRealData(value);
            })
        })
    }

    init();

    function getData(){
        var zoom = XHW.map.getView().getZoom();
        var level = zoom-4;
        if(level > 3){
            level = 3;
        }else if(level < 1){
            level = 1;
        }
        $.ajax({
            url: appendInfoToURL(XHW.C.http.ecmfUrl + '/halfreal/all?level=' + level),
            dataType:'json',
            success:function(json){
                if(json.status_code != 0) {
                    console.log('数据错误');
                    return;
                }
                var sourceTime = json.data.time.split(' ');
                var sourceTimeOne = sourceTime[0].split('-').join('');
                var sourceTimeTwo = sourceTime[1].split(':').join('');
                sourceTimes = new Array(sourceTimeOne,sourceTimeTwo).join('');
                var time = format.jsonDate(sourceTimes);
                item.htmlLayer = time[0] + ' 实时天气';
                XHW.C.layerC.updateLayerData(key, item);
                $('#station_info h3').html(time[0]);
                drawStationMarkers(json.data.data);
            },
            error: function(error){
                item.htmlLayer = ' 实时天气' + '(无数据)';
                XHW.C.layerC.updateLayerData(key, item);
            }
        })       
    }

    /**
     * 显示城镇气象信息
     */
    function drawStationMarkers(data){
        var markers = [];
        for(var i = 0; i < data.length; i++) {
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i].lng), parseFloat(data[i].lat)]))
            })
            marker.type = type;
            marker.value = {
                citycode: data[i].citycode,
                cityname: data[i].cityname,
                lng: data[i].lng,
                lat: data[i].lat,
                wth: data[i].chww,
                ww:data[i].ww,
                at:  data[i].at,
                tt:  data[i].tt,
                wd:  data[i].wd,
                ws:  data[i].fws,
                rain01:  data[i].rain01,
                rh:  data[i].rh,
                press:  data[i].press,
                vis: data[i].vis
            }

            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: 'img/halfhour_icon/cww' + data[i].ww +'.png',
                    scale: 0.2,
                })),                                          
            }));

            markers.push(marker);
        }

        let source = new ol.source.Vector({
            features: markers
        });
        
        if (!layer) {
            layer = new ol.layer.Vector({

            });
            layer.setZIndex(15);
            layer.id = key;
        }
        layer.setSource(source);
        
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);
    }

    /**
     * 右侧框显示
     */
    function rightRealInfo(value){
        realNow(value);  //  半小时实况信息
       
        getRealData(value);  //实况要素曲线

        //---------------------------显示详情
        layout.showRightMenu();
        $('#right_info_real').show();
    }

    /**
     *  自动站当前数据
     */
    function realNow(value){
        //-----------------------基础信息
        $('#rightInfo_single_qb').html(format.cityName(value.cityname));
        $('#rightInfo_single_lnglat').html(format.lnglat(value.lng, value.lat));

        //---------天气数据
        var pic_wea = './img/xianxingWeather/cww'+value.ww+'.png';
        $('#z_weather_img img').attr('src',pic_wea);
        $('#rightInfo_single_tt').html(format.tt(value.tt));
        $('#rightInfo_single_wind').html(value.wd + ', ' + value.ws + 'm/s');
        $('#rightInfo_single_rn').html(format.rn(value.rain01));
        $('#rightInfo_single_pr').html(format.pr(value.press));
        $('#rightInfo_single_rh').html(format.rh(value.rh));
        $('#rightInfo_single_vis').html(format.vis(value.vis));
    }

    /**
     * 实况要素曲线
     */
    function getRealData(value){
        var code = value.citycode;
        // $('#rightInfo_real_cityName').html(format.cityName(value.cityname));
        // $('#rightInfo_real_lnglat').html('经纬度：' + format.lnglat(value.lng, value.lat));
        $.ajax({
            url: appendInfoToURL(XHW.C.http.ecmfUrl + '/halfreal/timeProfileData?station=' + code),
            dataType:'json',
            success:function(json){
                if(json.status_code != 0) {
                    console.log('数据错误');
                    return;
                };
                var data = json.data;
                real_chart(data);
            }
        })  
    }

    //  预报要素曲线
    function getFcData(value){
        $.ajax({
            url: XHW.C.http.testIp + '/cityFC3/timeprofile?duration=72&lat=' + value.lat + '&lng=' +value.lng,
            dataType:'json',
            success:function(json){
                if(json.code != 0) {
                    console.log('数据错误');
                    return;
                };
                var data = json;
                forecast_chart(data);
            }
        })  
    }

    function forecast_chart(data){
        var times = data.times;
        var profiledatas = data.data;
        keyS = [];
        var value = {
            ww:[],
            tt:[],
            rh:[],
            ws:[],
            wd:[],
            wind:[]
        };
        for(var i = 0; i < times.length; i++) {
            var year = times[i].substring(0,4) + '年';
            var month = times[i].substring(4,6) + '月';
            var day = times[i].substring(6,8) + '日';
            var hour = times[i].substring(8,10) + '时';
            keyS.push(year + month + day + hour);
            let dataS = profiledatas[i];                                                                 
            value.tt.push(((dataS.TT * 10) >> 0) / 10);
            value.rh.push(((dataS.RH * 10) >> 0) / 10);
            value.ws.push(((dataS.WS * 10) >> 0) / 10);
            value.wd.push(dataS.WD);
            value.ww.push([i,dataS.WW]);
            value.wind.push([i,((dataS.WS * 10) >> 0) / 10,dataS.WD]);
        }
        myChart = myChart ? myChart.dispose() : '';
        myChart = echarts.init(document.getElementById('rightInfo_single_chart'));
        var option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis',
                position:function(x,y){
                    return [parseFloat(x)+10,50]
                },
                formatter:function(params) {  
                    if (params) {
                        let relVal = params[0].name; 
                        for (var i = 0, l = params.length; i < l; i++) {
                            let unit = '';
                            switch (params[i].seriesName) {
                                case "气温": unit = '℃';break;
                                case "湿度": unit = '%';break;
                                case "风速": unit = 'm/s';break;
                                case "风向": unit = '°';break;                                                           
                            } 
                            if(params[i].seriesName == '风向'){
                                relVal += '<br/>' +params[i].marker+ params[i].seriesName  + ': '+ params[i].value[2]+unit; 
                            }else if(params[i].seriesName == '天气现象'){
                                relVal += ''; 
                            }else{
                                relVal += '<br/>' +params[i].marker+ params[i].seriesName  + ': '+ params[i].value+unit;  
                            }                                       
                        }
                        return relVal;
                    }
                } 
            },
            color: ['#F80000','#52D1FE','#e49b55'],
            legend: {
                data:["气温","湿度","风向"],
                top:10
            },
            xAxis: {
                data: keyS,
                boundaryGap : true,
                axisTick:{alignWithLabel: true},
                axisLine: {onZero: false, lineStyle:{color: '#13A1E1'}},
                axisLabel:{
                    textStyle:{color:'white'},
                    formatter: function(value, index){
                        value = value.split('月')[1];
                        // value = value.split('日');
                        // var time = value[1];
                        // if(index == 0 || time == '02时') {    //如果是第一条数据或换天的数据
                        //     time = time + '\n' + value[0] + '日';
                        // }
                        return value;
                    }
                },
            },
            yAxis: [
                {
                    name: '气温(℃)',
                    type: 'value',
                    color:'white',
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {padding: [0,0,0,10],color:'white'},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                },{
                    name: '湿度(%)',
                    max: 100,
                    min: 0,
                    type: 'value',
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {color:'white'},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                },{
                    name: '风速(m/s)',
                    type: 'value',
                    position: 'left',
                    offset: 35,
                    axisLabel :{
                        textStyle:{color:'white'},
                        formatter: function (value, index) {            //使用函数模板，函数参数分别为刻度数值（类目），刻度的索引
                           console.log(value)
                            return value;
                        },
                    },
                    nameTextStyle: {padding: [0,25,0,0],color:'white'},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                }
            ],
            dataZoom:[{
                type:'slider',
                startValue: value.ww.length - 12,
                endValue:value.ww.length - 1,
                start:0,
                end:50
            },{
                type:'inside'
            }],
            series: [
                {
                    name: '气温',
                    type: 'line',
                    smooth:true,
                    data: value.tt
                },{
                    name: '湿度',
                    yAxisIndex: 1,
                    type: 'line',
                    smooth:true,
                    lineStyle:{
                        // color:'rgba(50, 205, 50, 1)',
                        width:1,
                    },
                    data: value.rh
                },{
                    name: '风速',
                    type: 'line',
                    smooth: true,
                    data: value.ws,
                },{
                    name: '风向',
                    type: 'custom',
                    renderItem: function (param, api) {
                        var point = api.coord([
                            api.value(0),
                            api.value(1)
                        ]);
                        return {
                            type: 'path',
                            shape: {
                                // pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                                pathData: 'M 123.5 230 L 113.298 239.011 L 123.5 210.595 L 133.702 239.011 Z',  //初始方向箭头朝下
                                x: -arrowSize / 4,
                                y: -arrowSize / 4,
                                width: arrowSize / 1.5,
                                height: arrowSize / 1.5
                            },
                            // rotation: (90 - api.value(2))*Math.PI/180 + 90,  //弧度转角度
                            rotation: (180-api.value(2))*Math.PI/180,  //弧度转角度
                            position: point,
                            style: api.style({
                                stroke: '#F8A352',
                                fill: '#F8A352',
                                lineWidth: 1,
                            })
                        };
                    },
                    data: value.wind,
                    z: 10
                },{
                    name: '天气现象',
                    type: 'custom',
                    renderItem: renderWeather,
                    data: value.ww,
                    yAxisIndex: 2,
                    z: 11
                }
            ]
        };
        myChart.setOption(option);
    }
    function real_chart(data){
        var times = data.time.reverse();
        var profiledatas = data.data.reverse();

        keyS = [];
        var value = {
            ww:[],
            tt:[],
            rh:[],
            rn:[],
            ws:[],
            wd:[],
            wind:[]
        };
        for(var i = 0; i < times.length; i++) {
            var sourceTime = times[i].split(' ');
            var sourceTimeOne = sourceTime[0].split('-').join('');
            var sourceTimeTwo = sourceTime[1].split(':').join('');
            var year = sourceTimeOne.substring(0,4) + '年';
            var month = sourceTimeOne.substring(4,6) + '月';
            var day = sourceTimeOne.substring(6,8) + '日';
            var hour = sourceTimeTwo.substring(0,2) + '时';
            var minute = sourceTimeTwo.substring(2,4) + '分';

            if(minute == '30分')continue;
            keyS.push(year + month + day + hour);
            let dataS = profiledatas[i];                                                                 
            value.tt.push(((dataS.tt * 10) >> 0) / 10);
            value.rh.push(((dataS.rh * 10) >> 0) / 10);
            value.ws.push(((dataS.ws * 10) >> 0) / 10);
            value.wd.push(format.windDeg(dataS.wd));
            value.ww.push([i/2,dataS.ww]);
            value.rn.push(((dataS.rain01 * 10) >> 0) / 10);
            value.wind.push([i/2,((dataS.ws * 10) >> 0) / 10,format.windDeg(dataS.wd)]);
        }
        let maxTT = Math.max.apply(Math,value.tt);
        let minTT = Math.min.apply(Math,value.tt);
        $('#rightInfo_real_mxt').html(format.tt(maxTT));
        $('#rightInfo_real_mit').html(format.tt(minTT));
        
        myChart = myChart ? myChart.dispose() : '';
        myChart = echarts.init(document.getElementById('rightInfo_single_chart'));
        var option = {
            title: {
                text: ''
            },
            tooltip: {
                trigger: 'axis',
                position:function(x,y){
                    return [parseFloat(x)+10,50]
                },
                formatter:function(params) {  
                    if (params) {
                        let relVal = params[0].name; 
                        // console.log(JSON.stringify(params))
                        for (var i = 0, l = params.length; i < l; i++) {
                            let unit = '';
                            // switch (i) {
                            //     case 0: unit = '℃';break;
                            //     case 1: unit = '%';break;
                            //     case 2: unit = 'hPa';break;
                            //     case 3: unit = 'km';break;
                            // }
                            switch (params[i].seriesName) {
                                case "气温": unit = '℃';break;
                                case "湿度": unit = '%';break;
                                case "降水": unit = 'mm';break;
                                case "风速": unit = 'm/s';break;
                                case "风向": unit = '°';break;                                                           
                            } 
                            if(params[i].seriesName == '风向'){
                                relVal += '<br/>' +params[i].marker+ params[i].seriesName  + ': '+ params[i].value[2]+unit; 
                            }else if(params[i].seriesName == '天气现象'){
                                relVal += ''; 
                            }else{
                                relVal += '<br/>' +params[i].marker+ params[i].seriesName  + ': '+ params[i].value+unit;  
                            }                                       
                        }
                        return relVal;
                    }
                } 
            },
            color: ['#F80000','#52D1FE','#e49b55','#e49b55','#17C905'],
            legend: {
                // data: [{
                //     name: '蒸发量',
                //     icon: 'circle',//'image://../asset/ico/favicon.png',//标志图形类型，默认自动选择（8种类型循环使用，不显示标志图形可设为'none'），默认循环选择类型有：'circle' | 'rectangle' | 'triangle' | 'diamond' |'emptyCircle' | 'emptyRectangle' | 'emptyTriangle' | 'emptyDiamond'另外，还支持五种更特别的标志图形'heart'（心形）、'droplet'（水滴）、'pin'（标注）、'arrow'（箭头）和'star'（五角星），这并不出现在常规的8类图形中，但无论是在系列级还是数据级上你都可以指定使用，同时，'star' + n（n>=3)可变化出N角星，如指定为'star6'则可以显示6角星
                //     textStyle: {fontWeight: 'bold', color: 'green'}
                // },
                // selected: {
                //     '降水量': false
                // },
                data:["气温","湿度","风向","降水"],
                top:10
            },
            // grid: {
            //     left: 90,
            // },
            xAxis: {
                data: keyS,
                boundaryGap : true,
                axisTick:{alignWithLabel: true},
                axisLine: {onZero: false, lineStyle:{color: '#13A1E1'}},
                axisLabel:{
                    textStyle:{color:'white'},
                    formatter: function(value, index){
                        value = value.split('月')[1];
                        value = value.split('日');
                        var time = value[1];
                        if(index == 0 || time == '02时') {    //如果是第一条数据或换天的数据
                            time = time + '\n' + value[0] + '日';
                        }
                        return time;
                    }
                },
            },
            yAxis: [
                {
                    name: '气温(℃)',
                    type: 'value',
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {padding: [0,0,0,10],color:'white'},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                },{
                    name: '湿度(%)',
                    max: 100,
                    min: 0,
                    type: 'value',
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {color:'white'},
                    // nameTextStyle: {padding: [0,0,2,0]},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                },{
                    name: '降水(mm)',
                    // max: 100,
                    // min: 0,
                    type: 'value',
                    position: 'right',
                    offset: 40,
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {padding: [0,0,0,20],color:'white'},
                    splitLine:{show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                },{
                    name: '风速(m/s)',
                    type: 'value',
                    // min: function (value) {console.log(value.min)
                    //    return value.min;
                    // },
                    // max: function (value) {
                    //    return value.max;
                    // },
                    position: 'left',
                    offset: 35,
                    axisLabel :{textStyle:{color:'white'}},
                    nameTextStyle: {padding: [0,25,0,0],color:'white'},
                    // splitLine: {show:false},
                    axisLine: {lineStyle:{color: '#13A1E1'}},
                    // axisTick : {//设置刻度
                    //     show:true,
                    //     lineStyle : {
                    //         color : 'black'
                    //     }
                    // },
    
                }
            ],
            dataZoom:[{
                type:'slider',
                // height: 20,
                // bottom: 5,
                startValue: value.ww.length - 12,
                endValue:value.ww.length - 1
            },{
                type:'inside'
                // type: 'slider', 
            }],
            series: [
                {
                    name: '气温',
                    type: 'line',
                    smooth:true,
                    data: value.tt
                },{
                    name: '湿度',
                    yAxisIndex: 1,
                    type: 'line',
                    smooth:true,
                    lineStyle:{
                        // color:'rgba(50, 205, 50, 1)',
                        width:1,
                    },
                    // areaStyle:{
                    //     color:{
                    //         type: 'linear',
                    //         x: 0,
                    //         y: 0,
                    //         x2: 0,
                    //         y2: 1,
                    //         colorStops: [{
                    //             offset: 0, color: 'rgba(100, 255, 100, 1)' // 0% 处的颜色
                    //         }, {
                    //             offset: 1, color: 'rgba(50, 255, 50, 0)' // 100% 处的颜色
                    //         }],
                    //         globalCoord: false
                    //     }
                    // },
                    data: value.rh
                },{
                    name: '风速',
                    type: 'line',
                    smooth: true,
                    data: value.ws,
                },{
                    name: '风向',
                    type: 'custom',
                    renderItem: function (param, api) {
                        var point = api.coord([
                            api.value(0),
                            api.value(1)
                        ]);
                        return {
                            type: 'path',
                            shape: {
                                // pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                                pathData: 'M 123.5 230 L 113.298 239.011 L 123.5 210.595 L 133.702 239.011 Z',  //初始方向箭头朝下
                                x: -arrowSize / 4,
                                y: -arrowSize / 4,
                                width: arrowSize / 1.5,
                                height: arrowSize / 1.5
                            },
                            // rotation: (90 - api.value(2))*Math.PI/180 + 90,  //弧度转角度
                            rotation: (180-api.value(2))*Math.PI/180,  //弧度转角度
                            position: point,
                            style: api.style({
                                stroke: '#F8A352',
                                fill: '#F8A352',
                                lineWidth: 1,
                            })
                        };
                    },
                    data: value.wind,
                    z: 10
                },{
                    name: '降水',
                    yAxisIndex: 2,
                    type: 'bar',
                    smooth:true,
                    data: value.rn
                },{
                    name: '天气现象',
                    type: 'custom',
                    renderItem: renderWeather,
                    data: value.ww,
                    // tooltip: {
                    //     trigger: 'item',
                    //     formatter: function (param) {
                    //         return param.value[dims.time] + ': '
                    //             + param.value[dims.minTemp] + ' - ' + param.value[dims.maxTemp] + '°';
                    //     }
                    // },
                    yAxisIndex: 2,
                    z: 11
                }
            ]
        };
        myChart.setOption(option);
    }

    function renderWeather(param, api) {
        var point = api.coord([
            // api.value(dims.time) + 3600 * 24 * 1000 / 2,
            // 0
            api.value(0),
            180
        ]);
        var ww = api.value(1) <= 9 ? '0' + api.value(1) : api.value(1);
        var imgsrc = './img/xianxingWeather/cww'+ ww +'.png';
        return {
            type: 'group',
            children: [{
                type: 'image',
                style: {
                    image: imgsrc,
                    x: -weatherIconSize / 2,
                    y: -weatherIconSize / 2,
                    width: weatherIconSize,
                    height: weatherIconSize
                },
                position: [point[0],57]
            }
            // , {
            //     type: 'text',
            //     style: {
            //         text: api.value(dims.minTemp) + ' - ' + api.value(dims.maxTemp) + '°',
            //         textFont: api.font({fontSize: 14}),
            //         textAlign: 'center',
            //         textVerticalAlign: 'bottom'
            //     },
            //     position: [point[0], 80]
            // }
        ]
        };
    }


    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
    }

    function open(){
        item.htmlLayer = '实时天气';
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        button.parent().addClass('current');
        getData();
        isOpen = true;
    }

    function close(){
        button.parent().removeClass('current');
        remove();
        isOpen = false;
        XHW.C.layerC.removeLayer(key);
    }

    return {
        close: close,
        open: open,
        rightRealInfo:rightRealInfo
    }

});
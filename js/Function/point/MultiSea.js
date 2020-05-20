//-----------------多点海洋数据详情
define(['Controller/Http',
        'Controller/layout',
        'Controller/DataFormat',
        'lib/echarts'], function(http, layout, format, echarts) {
    
    var Img;
    var routeSpeed = 20;
    function init(){
        Img = new Image();
        Img.src = './img/sea/surf_right.png';
        initDateDiv();

        $('#seaRouteSpeedInput').keyup(function(){
            querySea();
        });
    }

    var seaRouteHourSelect;
    function initDateDiv() {
        let time = new Date();
        unityDate(time);
        time = curDate.year + '-' + curDate.month + '-' + curDate.day;
        resetDate(time);

        $('#seaRouteDateInput').html(time);
        seaRouteHourSelect = $('#seaRouteHourSelect');
        seaRouteHourSelect.val(curDate.hour);
        seaRouteHourSelect.on('change', function(){
            curDate.hour = seaRouteHourSelect.val();
            if(curDate.hour < 10)
                curDate.hour = '0' + curDate.hour;
            querySea();
        });

        function resetDate(time) {
            laydate.render({
                elem: '#seaRouteDateInput',
                value: time,
                min: time,
                showBottom: false,
                done: function(value, date){
                    curDate.year = date.year;
                    curDate.month = date.month;
                    curDate.day = date.date;
                    if(curDate.month < 10) curDate.month = '0' + curDate.month;
                    if(curDate.day < 10) curDate.day = '0' + curDate.day;

                    querySea();
                },
            });
        }

        $('#seaRouteHourReduce').on('click', function() {
            hourUpdate(-1);
        });
        $('#seaRouteHourPlus').on('click', function() {
            hourUpdate(1);
        });

        function hourUpdate(hour) {
            curDate.hour = seaRouteHourSelect.val();
            let date = new Date(curDate.year, parseInt(curDate.month)-1, curDate.day, curDate.hour);
            date = new Date(date.getTime() + hour * 3600 * 1000);
            unityDate(date);
            time = curDate.year + '-' + curDate.month + '-' + curDate.day;
            resetDate(time);
            seaRouteHourSelect.val(curDate.hour);
            querySea();
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

    // init();
    var curPositions;
    /**
     * 查询海面单点详细信息
     * @param {*} positions 位置
     */
    function querySeaInfo(positions){
        curPositions = positions;
        //---------------------------查询数据
        querySea();
        //---------------------------显示详情
        $('.botPanelHaiYang').show().animate({'bottom':'0px'}, 200);
        // layout.showBottomMenu();
        // $('.botPanelHaiBiaoPanel').show();
    }

    // [温,盐,流U,流V, 浪向,浪高,浪周期,涌浪周期,风U,风V]

    var timeChart;  //随时间变化的图表
    var lnglats;      //位置列表
    var dataS;      //数据列表
    var arrowSize = 18;
    /**
     * 查询随位置变化的数据
     * @param {*} positions 
     */
    function querySea(){
        // https://ocean.xinhong.net/hy1Suo/spaceprofiledata/?lat=30,38,37&lng=130,145,122
        let param = {
            lng: '',
            lat: '',
            speed: ''
        };
        let speedStr = $('#seaRouteSpeedInput').val();
        if (speedStr) {
            routeSpeed = parseFloat(speedStr) * 1.852;
        }
        for(let i = 0; i < curPositions.length; i++) {
            param.lng += curPositions[i][0] + ',';
            param.lat += curPositions[i][1] + ',';
            param.speed += routeSpeed + ',';
        }
        param.year = curDate.year;
        param.month = curDate.month;
        param.hour = curDate.hour;
        param.day = curDate.day;

        clearDrawContent();
        // https://ocean.xinhong.net/hy1Suo/timelyspaceprofiledata/?lat=30,38&lng=130,145&speed=20,20
        // http.get(http.oceanUrl, '/hy1Suo/spaceprofiledata/', param, function(json){
        http.get(http.oceanUrl, '/hy1Suo/timelyspaceprofiledata/', param, function(json){
            var time = json.time.split('_');
            var date = new Date(time[0].substring(0,4), parseInt(time[0].substring(4, 6)) -1,
                                 time[0].substring(6,8), time[0].substring(8,10));
            time = new Date(date.getTime() + parseInt(time[1]) * 60 * 60 * 1000);
            time = time.getFullYear() + '年' + (time.getMonth() + 1) + '月' + time.getDate()
                        + '日' + time.getHours() + '时';
            // $('#bottomInfo_seaSurf_lnglat').html('时间:' + time);
            //-----------------------整理数据
            let timeSeries = [];
            lnglats = [];
            dataS = {
                t:[],
                salinity:[],
                flowD:[],
                flowS:[],
                waveD:[],
                waveS:[],
                w1:[],
                w2:[],
                windD:[],
                windS:[]
            };
            var tMax; var tMin;
            var saMax; var saMin;
            var fsMax; var fsMin;
            var wsMax; var wsMin;
            var waMax; var waMin;
            let highlightXAxisIndexs = [];
            for(var i = 0; i < json.data.profiledatas.length; i++) {
                if(json.data.profiledatas[i]['1']) {
                    lnglats.push(json.data.latlngs[i]);
                    let timeSerie = {
                        arriveTime: json.data.profiledatas[i]['arriveTime'],
                        isMarkPoint: json.data.profiledatas[i]['isMarkPoint'],
                        dataTime : json.data.profiledatas[i]['dataTime'],
                    };
                    if (json.data.profiledatas[i]['isMarkPoint']) {
                        highlightXAxisIndexs.push(i);
                    }
                    timeSeries.push(timeSerie);
                    var tData = json.data.profiledatas[i]['1'];
                    var fs = Math.sqrt(tData[2] * tData[2] + tData[3] * tData[3]);
                    fs = ((fs * 10) >> 0) / 10;
                    var fd = 270.0 - Math.atan2(tData[3], tData[2]) * 180.0 / Math.PI;
                    fd = fd >= 360 ? fd - 360 : fd;
                    fd = ((fd * 10) >> 0) / 10;
                    var ws = Math.sqrt(tData[8] * tData[8] + tData[9] * tData[9]);
                    ws = ((ws * 10) >> 0) / 10;
                    var wd = 270.0 - Math.atan2(tData[9], tData[8]) * 180.0 / Math.PI;
                    wd = wd >= 360 ? wd - 360 : wd;
                    wd = ((wd * 10) >> 0) / 10;

                    dataS.t.push(tData[0]);
                    tMax = tMax && tMax > tData[0] ? tMax : tData[0];
                    tMin = tMin && tMin < tData[0] ? tMin : tData[0];
                    dataS.salinity.push(tData[1]);
                    saMax = saMax && saMax > tData[1] ? saMax : tData[1];
                    saMin = saMin && saMin < tData[1] ? saMin : tData[1];
                    dataS.flowD.push(fd);
                    dataS.flowS.push(fs);
                    fsMax = fsMax && fsMax > fs ? fsMax : fs;
                    fsMin = fsMin && fsMin < fs ? fsMin : fs;
                    dataS.waveD.push(tData[4]);
                    dataS.waveS.push(tData[6]);
                    waMax = waMax && waMax > tData[6] ? waMax : tData[6];
                    waMin = waMin && waMin < tData[6] ? waMin : tData[6];
                    dataS.w1.push(tData[8]);
                    dataS.w2.push(tData[9]);
                    dataS.windD.push(wd);
                    dataS.windS.push(ws);
                    wsMax = wsMax && wsMax > ws ? wsMax : ws;
                    wsMin = wsMin && wsMin < ws ? wsMin : ws;
                }
            }
            tMax = Math.ceil(tMax) - 0.5 <= tMax ? Math.ceil(tMax) : Math.ceil(tMax) - 0.5;
            tMin = Math.floor(tMin) + 0.5 >= tMin ? Math.floor(tMin) : Math.floor(tMin) + 0.5;
            saMax = Math.ceil(saMax) - 0.5 <= saMax ? Math.ceil(saMax) : Math.ceil(saMax) - 0.5;
            saMin = Math.floor(saMin) + 0.5 >= saMin ? Math.floor(saMin) : Math.floor(saMin) + 0.5;
            fsMax = Math.ceil(fsMax) - 0.5 <= fsMax ? Math.ceil(fsMax) : Math.ceil(fsMax) - 0.5;
            fsMin = Math.floor(fsMin) + 0.5 >= fsMin ? Math.floor(fsMin) : Math.floor(fsMin) + 0.5;
            waMax = Math.ceil(waMax) - 0.5 <= waMax ? Math.ceil(waMax) : Math.ceil(waMax) - 0.5;
            waMin = Math.floor(waMin) + 0.5 >= waMin ? Math.floor(waMin) : Math.floor(waMin) + 0.5;
            wsMax = Math.ceil(wsMax) - 0.5 <= wsMax ? Math.ceil(wsMax) : Math.ceil(wsMax) - 0.5;
            wsMin = Math.floor(wsMin) + 0.5 >= wsMin ? Math.floor(wsMin) : Math.floor(wsMin) + 0.5;
            showSeaSurfOne(lnglats[0]);
            //-------------方向所用数据
            var tmpdata = [lnglats,dataS.flowS,dataS.flowD]; 
            var flowData=  tmpdata[0].map(function(col, i) {
                    return tmpdata.map(function(row) {
                    return row[i];
                    })
                });   
            var tmpdata1=[lnglats,dataS.waveS,dataS.waveD];
             var waveDdata=  tmpdata1[0].map(function(col, i) {
                    return tmpdata1.map(function(row) {
                    return row[i];
                    })
                });   
            var tmpdata2 = [lnglats,dataS.windS,dataS.windD];
            var windDdata=  tmpdata2[0].map(function(col, i) {
                    return tmpdata2.map(function(row) {
                    return row[i];
                    })
                });  
            //-------------------------气象信息
            timeChart = timeChart ? timeChart.dispose() : '';
            timeChart = echarts.init(document.getElementById('bottomInfo_seaSurf_timeChart'));

            let timeSeriesStrArr = [];
            for (let i = 0; i < timeSeries.length; i++) {
                if (!timeSeries[i].isMarkPoint)
                    timeSeriesStrArr.push({
                        value: timeSeries[i].arriveTime,
                        textStyle: {
                            color: 'black'
                        }
                    });
                else {
                    timeSeriesStrArr.push({
                        value: timeSeries[i].arriveTime,
                        textStyle: {
                            color: 'orange'
                        }
                    });
                }
            }
            let xSeriesData = [];
            for (let i = 0; i < lnglats.length; i ++ ) {
                if ($.inArray(i, highlightXAxisIndexs) != -1) {
                    xSeriesData.push({
                        value: lnglats[i],
                        textStyle: {
                            color: 'orange'
                        }
                    });
                } else {
                    xSeriesData.push(lnglats[i]);
                }

            }
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis',
                    confine: true,
                    formatter:function(params) {  
                        if (params) {
                            let relVal = params[0].name; 
                            for (var i = 0, l = params.length; i < l; i++) {
                                 relVal += '<br/>' +params[i].marker+ params[i].seriesName  + ': '+ params[i].value;  
                             }
                            return relVal;
                        }
                        } 
                },
                color: ['#dc0909', '#ff7d00', '#0396a5', '#0396a5', '#007eff', '#007eff', '#ffd401', '#ffd401'],
                legend: {
                    data:['海温','盐度','海流','流向', '海浪', '浪向', '海面风', '风向'],
                    right: 20
                },
                grid: {
                    top:70,
                    left: 120,
                    right: 80
                },
                xAxis: [{
                    data: xSeriesData,
                    boundaryGap : true,
                    axisTick:{alignWithLabel: true},
                    axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
                    axisLabel:{
                        formatter: function(value, index){
                            value = value.split(',');
                            value = format.lnglat(value[1], value[0]).split(' , ');
                            return value[0] + '\n' + value[1];
                        }
                    },
                }, {
                    data: timeSeriesStrArr,
                    boundaryGap : true,
                    axisTick: { alignWithLabel: true},
                    axisLine: { onZero: false, lineStyle:{color: '#13507f'}},
                    axisLabel:{
                        formatter: function(value, index){
                            let timeStr = value.slice(4, 6) + '月' + value.slice(6, 8) + '日';
                            timeStr = value.slice(8) + '时' + '\n' + timeStr;
                            return timeStr;
                        }
                    },
                    tooltip: {show: true}
                }],
                yAxis: [
                    {
                        name: '海温\n(℃)',
                        type: 'value',
                        max: tMax,
                        min: tMin,
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '盐度\n(%)',
                        type: 'value',
                        max: saMax,
                        min: saMin,
                        position:'left',
                        offset: 40,
                        // nameTextStyle: {padding: [0,0,20,0]},
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '海流\n(m/s)',
                        type: 'value',
                        max: fsMax,
                        min: fsMin,
                        position:'left',
                        offset: 80,
                        splitLine:{show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '海浪\n(m)',
                        type: 'value',
                        max: waMax,
                        min: waMin,
                        splitLine: {show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    },
                    {
                        name: '海面风\n(m/s)',
                        type: 'value',
                        max: wsMax,
                        min: wsMin,
                        offset: 40,
                        // nameTextStyle: {padding: [0,0,20,0]},
                        splitLine: {show:false},
                        axisLine: {lineStyle:{color: '#13507f'}},
                    }
                ],
                // dataZoom:[{
                //     type:'inside'
                // }],
                series: [{
                    name: '海温',
                    type: 'line',
                    smooth:true,
                    data: dataS.t
                },{
                    name: '盐度',
                    yAxisIndex: 1,
                    type: 'line',
                    smooth:true,
                    data: dataS.salinity
                },{
                    name: '海流',
                    yAxisIndex: 2,
                    type: 'line',
                    smooth:true,
                    data: dataS.flowS
                },{
                    name: '流向',
                    type: 'custom',
                    yAxisIndex: 2,
                    renderItem: renderArrow,
                    data: flowData,
                    tooltip: {show: false}
                },{
                    name: '海浪',
                    yAxisIndex: 3,
                    type: 'line',
                    smooth:true,
                    lineStyle:{
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#0000ff' // 0% 处的颜色
                            }, {
                                offset: 1, color: '#007eff' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        }
                    },
                    areaStyle:{
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#007eff' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'rgba(0,0,255,0)' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        }
                    },
                    data: dataS.waveS
                },{
                    name: '浪向',
                    type: 'custom',
                    yAxisIndex: 3,
                    renderItem: renderWaveArrow,
                    data: waveDdata,
                    tooltip: {show: false}
                },{
                    name: '海面风',
                    yAxisIndex: 4,
                    type: 'line',
                    smooth:true,
                    data: dataS.windS
                },{
                    name: '风向',
                    type: 'custom',
                    yAxisIndex: 4,
                    renderItem: renderArrow,
                    data: windDdata,
                    tooltip: {show: false}
                }]
            };
            timeChart.setOption(option);
            timeChart.on('mouseover', function(event){
                showSeaSurfOne(event.name);
            })
        })
    }

    function renderArrow(param, api) {
        var point = api.coord([
            api.value(0),
            api.value(1)
        ]);
        return {
            type: 'path',
            shape: {
                pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                x: -arrowSize / 2,
                y: -arrowSize / 2,
                width: arrowSize,
                height: arrowSize
            },
            rotation: (270-api.value(2))*Math.PI/180,
            // rotation: api.value(3),
            position: point,
            style: api.style({
                stroke: '#555',
                lineWidth: 1
            })
        };
    }

    function renderWaveArrow(param, api) {
        var point = api.coord([
            api.value(0),
            api.value(1)
        ]);

        return {
            type: 'path',
            shape: {
                pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                x: -arrowSize / 2,
                y: -arrowSize / 2,
                width: arrowSize,
                height: arrowSize
            },
            rotation: (api.value(2))*Math.PI/180,   // 波浪的主要行进方向与地球正北方向之间的夹角。0度从Y轴负轴方向开始，顺时针绘制
            // rotation: api.value(3),
            position: point,
            style: api.style({
                stroke: '#555',
                lineWidth: 1
            })
        };
    }

    var canvas;

    /**
     * 显示海表详情右侧单个时次
     * @param {*} lnglat 
     */
    function showSeaSurfOne(lnglat){
        //---------------显示数据对应时间
        var value = lnglat.split(',');
        $('#bottomInfo_seaSurf_time').html('经纬度：' + format.lnglat(value[1], value[0]));
        //---------------获取数据
        var index = lnglats.indexOf(lnglat);
        var data = {};
        for(var key in dataS) {
            data[key] = dataS[key][index];
        }
        //-----------------绘制图
        canvas = canvas ? canvas : $('#bottomInfo_seaSurf_canvas');
        var ctx = canvas[0].getContext('2d');
        var width = canvas.width() * window.devicePixelRatio;
        var height = canvas.height() * window.devicePixelRatio;
        canvas.attr('width', width + 'px');
        canvas.attr('height', height + 'px');
        var sideLength;
        if(width > height * 1.4) {
            sideLength = height;
        } else {
            sideLength = height * 0.6;
        }
        //-------------------画底图
        ctx.beginPath();
        ctx.drawImage(Img, 0, -1, 301, 300,
             sideLength * 0.1, sideLength * 0.1, sideLength * 0.8, sideLength * 0.8);
        //---------------------写注释
        ctx.beginPath();
        ctx.font="16px 微软雅黑";
        ctx.fillStyle = '#13507F';
        var a1 = Math.floor(Math.abs(data.windD - data.flowD));
        // var a1 = Math.abs(data.windD - data.flowD);
        a1 =  a1 > 180 ? 360 - a1 : a1;
        var a2 = Math.floor(Math.abs(data.waveD - data.flowD));
        // var a2 = Math.abs(data.waveD - data.flowD);
        a2 =  a2 > 180 ? 360 - a2 : a2;
        ctx.fillText('风流夹角：' + a1 + '°', (width-200)/2, height - 40);
        ctx.fillText('浪流夹角：' + a2 + '°', (width-200)/2, height - 20);
        ctx.beginPath();
        ctx.fillStyle = '#ff0000';
        ctx.fillText('N', sideLength / 2 - 4, 14);
        //--------------------画风
        var length = ((data.windS / 25) * (sideLength / 2 * 0.8 - 50)) + 50;
        ctx.beginPath();
        ctx.translate(sideLength / 2, sideLength / 2);
        ctx.rotate(180 * Math.PI/180);
        ctx.rotate(data.windD * Math.PI/180);
        ctx.fillStyle = '#ffd401';
        ctx.moveTo(0, 0);
        ctx.lineTo(-9, -30);
        ctx.lineTo(0, -length);
        ctx.lineTo(9, -30);
        ctx.fill();
        // ctx.drawImage(Img, 306, -1, 19, 150,
        //     -9, -length, 18, length);
        // var imgData=ctx.getImageData(0,0,sideLength,sideLength);
        // for (var i=0;i<imgData.data.length;i+=4){
        //     if(imgData.data[i+0] == 248 || imgData.data[i+1] == 174 || imgData.data[i+2] ==38){
        //         imgData.data[i+0]=255;
        //         imgData.data[i+1]=212;
        //         imgData.data[i+2]=1;
        //         imgData.data[i+3]=255;
        //     }
        // }
        // ctx.putImageData(imgData,0,0);
        ctx.rotate(-180 * Math.PI/180);
        ctx.rotate(-data.windD * Math.PI/180);
        ctx.translate(-sideLength /2, -sideLength /2);
        ctx.beginPath();
        ctx.fillStyle = '#ffd401';
        let windDTextX = sideLength /2 + length*Math.cos((data.windD + 90) * Math.PI / 180.)
        let windDTextY = sideLength /2 + length*Math.sin((data.windD + 90) * Math.PI / 180.)
        ctx.fillText('海面风：' + data.windD + '° ' + data.windS + 'm/s', (width-200)/2, height-60);
        //--------------------画流
        length = ((data.flowS / 1) * (sideLength / 2 * 0.8 - 50)) + 50;
        ctx.beginPath();
        ctx.translate(sideLength / 2, sideLength / 2);
        ctx.rotate(180 * Math.PI/180);
        ctx.rotate(data.flowD * Math.PI/180);
        ctx.fillStyle = '#0396a5';
        ctx.moveTo(0, 0);
        ctx.lineTo(-9, -30);
        ctx.lineTo(0, -length);
        ctx.lineTo(9, -30);
        ctx.fill();
        ctx.rotate(-180 * Math.PI/180);
        ctx.rotate(-data.flowD * Math.PI/180);
        ctx.translate(-sideLength /2, -sideLength /2);
        ctx.beginPath();
        ctx.fillStyle = '#0396a5';
        let flowDTextX = sideLength /2 + length*Math.cos((data.flowD + 90) * Math.PI / 180.)
        let flowDTextY = sideLength /2 + length*Math.sin((data.flowD + 90) * Math.PI / 180.)
        ctx.fillText('海流：' + data.flowD + '° ' + data.flowS + 'm/s',  (width-200)/2, height-100);
        //--------------------画浪
        var length = ((data.waveS / 6) * (sideLength / 2 * 0.8 - 50)) + 50;
        ctx.beginPath();
        ctx.translate(sideLength / 2, sideLength / 2);
        ctx.rotate(180 * Math.PI/180);
        ctx.rotate((270-data.waveD) * Math.PI/180);
        ctx.fillStyle = '#007eff';
        ctx.moveTo(0, 0);
        ctx.lineTo(-9, -30);
        ctx.lineTo(0, -length);
        ctx.lineTo(9, -30);
        ctx.fill();
        ctx.rotate(-180 * Math.PI/180);
        ctx.rotate(-(270-data.waveD) * Math.PI/180);
        ctx.translate(-sideLength /2, -sideLength /2);
        ctx.beginPath();
        ctx.fillStyle = '#007eff';
        let waveDTextX = sideLength /2 + length*Math.cos((data.waveD + 90) * Math.PI / 180.)
        let waveDTextY = sideLength /2 + length*Math.sin((data.waveD + 90) * Math.PI / 180.)
        ctx.fillText('海浪：' + data.waveD + '° ' + data.waveS + 'm', (width-200)/2, height-80);
        //---------------------画原点
        ctx.beginPath();
        ctx.translate(sideLength / 2, sideLength / 2);
        ctx.drawImage(Img, 343, 271, 29, 29,
            -29/2 , -29/2, 29, 29);
        ctx.translate(-sideLength /2, -sideLength /2);
    }

    function clearDrawContent(){
        
        if (timeChart && timeChart.dispose) {
            timeChart.dispose();
        }
        if (canvas) {
            var ctx = canvas[0].getContext('2d');
            var width = canvas.width() * window.devicePixelRatio;
            var height = canvas.height() * window.devicePixelRatio;
            ctx.clearRect(0, 0, width, height);
        }
    }

    return {
        querySeaInfo: querySeaInfo,
        resetDate: initDateDiv
    }

});
//-----------------海面数据详情
define(['Controller/Http',
        'Controller/layout',
        'Controller/DataFormat',
        'lib/echarts'], function(http, layout, format, echarts) {
    
    var Img;
    function init(){
        Img = new Image();
        Img.src = './img/sea/surf_right.png';
    }
    init();
    
    /**
     * 查询海面单点详细信息
     * @param {*} lnglat 位置
     */
    function querySeaSurfInfo(lnglat){
        //---------------------------显示当前位置
        $('#bottomInfo_seaSurf_lnglat').html('经纬度:' + format.lnglat(lnglat[0], lnglat[1]));
        //---------------------------查询数据
        querySeaSurfTime(lnglat);
        //---------------------------显示详情
        layout.showBottomMenu();
        $('.botPanelHaiBiaoPanel').show();
    }

    // [温,盐,流U,流V, 浪向,浪高,浪周期,涌浪周期,风U,风V]

    var timeChart;  //随时间变化的图表
    var timeS;      //时间列表
    var dataS;      //数据列表
    var arrowSize = 18;
    /**
     * 查询海表随时间变化的数据
     * @param {*} lnglat 
     */
    function querySeaSurfTime(lnglat){
        // https://ocean.xinhong.net/hy1Suo/timeprofiledata/?lat=30&lng=130=
        var time = XHW.silderTime;
        var param = {
            lng: lnglat[0],
            lat: lnglat[1],
            year: time.year,
            month: time.month,
            day: time.day,
            hour: time.hour
        }
        http.get(http.oceanUrl, '/hy1Suo/timeprofiledata/', param, function(json){
            //-----------------------整理数据 
            timeS = [];
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
            for(var i = 0; i < json.data.profiledatas.length; i++) {
                if(json.data.profiledatas[i]['1']) {
                    var key = json.data.times[i];
                    var year = key.substring(0,4) + '年';
                    var month = key.substring(4,6) + '月';
                    var day = key.substring(6,8) + '日';
                    var hour = key.substring(8,10) + '时';
                    timeS.push(year + month + day + hour);
                    // TEMP SALT U V th tp hs tz windx windy
                    // 温 盐 uu vv 浪向 浪周期 浪高 周期 纬向风 经向风
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
            showSeaSurfOne(timeS[0]);

            //-------------方向所用数据
            var tmpdata = [timeS,dataS.flowS,dataS.flowD]; 
            var flowData=  tmpdata[0].map(function(col, i) {
                    return tmpdata.map(function(row) {
                    return row[i];
                    })
                });   
            var tmpdata1=[timeS,dataS.waveS,dataS.waveD];
             var waveDdata=  tmpdata1[0].map(function(col, i) {
                    return tmpdata1.map(function(row) {
                    return row[i];
                    })
                });   
            var tmpdata2 = [timeS,dataS.windS,dataS.windD];
            var windDdata=  tmpdata2[0].map(function(col, i) {
                    return tmpdata2.map(function(row) {
                    return row[i];
                    })
                });   

            //-------------------------气象信息
            timeChart = timeChart ? timeChart.dispose() : '';
            timeChart = echarts.init(document.getElementById('bottomInfo_seaSurf_timeChart2'));
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis',
                    confine: true
                },
                color: ['#dc0909', '#ff7d00', '#0396a5', '#0396a5', '#007eff', '#007eff', '#ffd401', '#ffd401'],
                legend: {
                    data:['海温','盐度','海流','流向', '海浪', '浪向', '海面风', '风向']
                },
                grid: {
                    left: 120,
                    right: 80
                },
                xAxis: {
                    data: timeS,
                    boundaryGap : true,
                    axisTick:{alignWithLabel: true},
                    axisLine: {onZero: false, lineStyle:{color: '#13507f'}},
                    axisLabel:{
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
                dataZoom:[
                //     {
                //     type:'slider',
                //     height: 20,
                //     bottom: 5,
                // },
                    {
                    type:'inside'
                }],
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
            rotation: (api.value(2))*Math.PI/180,   // 波浪的主要行进方向与地球正北方向之间的夹角。
                                                            // 0度从Y轴负轴方向开始，顺时针绘制
                                                            // echarts似乎时逆时针方向绘制
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
     * @param {*} time 
     */
    function showSeaSurfOne(time){
        //---------------显示数据对应时间
        $('#bottomInfo_seaSurf_time').html('时间：' + time.split('月')[1]);
        //---------------获取数据
        var index = timeS.indexOf(time);
        var data = {};
        for(var key in dataS) {
            data[key] = dataS[key][index];
        }
        //-----------------绘制图
        canvas = canvas ? canvas : $('#bottomInfo_seaSurf_canvas2');
        var ctx = canvas[0].getContext('2d');
        var width = canvas.width() * window.devicePixelRatio;
        var height = canvas.height() * window.devicePixelRatio;
        canvas.attr('width', width + 'px');
        canvas.attr('height', height + 'px');
        var sideLength;
        var textHight, textLeft;
        if(width > height * 1.4) {
        sideLength = height;
        textLeft = sideLength - 10;
        textHight = 80;
        } else {
        sideLength = height * 0.6;
        textLeft = 10;
        textHight = height * 0.65;
        }
        //-------------------画底图
        ctx.beginPath();
        ctx.drawImage(Img, 0, -1, 301, 301,
        sideLength * 0.1, sideLength * 0.1, sideLength * 0.8, sideLength * 0.8);
        //---------------------写注释
        ctx.beginPath();
        ctx.font="16px 微软雅黑";
        ctx.fillStyle = '#13507F';
        var a1 = Math.floor(Math.abs(data.windD - data.flowD));
        // var a1 = Math.abs(data.windD - data.flowD);
        a1 = a1 > 180 ? 360 - a1 : a1;
        var a2 = Math.floor(Math.abs(data.waveD - data.flowD));
        // var a2 = Math.abs(data.waveD - data.flowD);
        a2 = a2 > 180 ? 360 - a2 : a2;
        ctx.fillText('风流夹角：' + a1 + '°', textLeft, textHight + 60);
        ctx.fillText('浪流夹角：' + a2 + '°', textLeft, textHight + 80);
        ctx.beginPath();
        ctx.fillStyle = '#0396a5';
        ctx.fillText('海流：' + data.flowD + '° ' + data.flowS + 'm/s', textLeft, textHight);
        ctx.beginPath();
        ctx.fillStyle = '#007eff';
        ctx.fillText('海浪：' + data.waveD + '° ' + data.waveS + 'm', textLeft, textHight + 20);
        ctx.beginPath();
        ctx.fillStyle = '#ffd401';
        ctx.fillText('海面风：' + data.windD + '° ' + data.windS + 'm/s', textLeft, textHight + 40);
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
        //---------------------画原点
        ctx.beginPath();
        ctx.translate(sideLength / 2, sideLength / 2);
        ctx.drawImage(Img, 343, 271, 29, 29,
            -29/2 , -29/2, 29, 29);
        ctx.translate(-sideLength /2, -sideLength /2);
    }

    return {
        querySeaSurfInfo: querySeaSurfInfo
    }

});
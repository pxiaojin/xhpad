//-----------------城镇/气象站详情
define(['Controller/Http',
    'Controller/layout',
    'Controller/DataFormat',
    'Controller/CrossSection',
    'lib/echarts'], function (http, layout, format, cross, echarts) {
        var Code;
        var Img;
        function init() {
            Img = new Image();
            Img.src = './img/wind/windy.png';

            // //时间轴变化监听
            timeBar.addCallback(function () {
                if (layout.getRightMenu() && $('#right_info_station').is(':visible'))
                    queryStationInfo(Code);
            });
        }
        init();

        /**
         * 查询城镇单点详细信息
         * @param {*} code 
         * @param {*} name 
         */
        function queryStationInfo(code) {
            Code = code;
            //---------------------------查询数据
            queryStationNow(code);
            queryStationForecast(code);
            queryStationForecast7(code);
            hour72(code);
            queryStationStrongConvective(code);
            drawTimeCrossSection(code);
            queryTLogP(code, name);
            //---------------------------显示详情
            // layout.showRightMenu();
            // $('#right_info_station').show();
            $('.bottompanel').stop().slideDown()
            $('.bottompanel .city_station').show().siblings().hide()
            $('.bottompanel .panelCancel').show()
        }

        /**
         * 查询气象站现在数据
         * @param {*} code 
         */
        function queryStationNow(code) {
            // https://weather.xinhong.net/stationdata_surf/datafromcode?code='+myCode
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                code: code,
                year: year,
                month: month,
                day: day,
                hour: hour
            }

            http.get(http.weatherUrl, '/stationdata_surf/datafromcode', param, function (json) {
                //-----------------------基础信息
                $('#rightInfo_station_cityName').html(format.cityName(json.station_cname));
                $('#rightInfo_station_lnglat').html('经纬度：' + format.lnglat(json.lng, json.lat));
                var time = json.time;
                $('#rightInfo_station_hour').html(format.timeDay(time.substring(0, 4), time.substring(4, 6), time.substring(6, 8))
                    + format.timeHour(time.substring(8, 10)));

                //-------------------------气象信息
                var data = json.data;
                //---------天气数据
                // $('#rightInfo_station_wthc').html(format.data('', data.WTHC));
                // $('#rightInfo_station_tt').html(format.weather(data.WTH) + ' ' + format.tt(data.TT));
                $('#rightInfo_station_tt').html(format.data('', data.WTHC) + ' ' + format.tt(data.TT));

                $('#rightInfo_station_wind').html('风：' + format.wind(data.WD, data.WS));
                $('#rightInfo_station_rn').html(format.rn(data.RN06));
                $('#rightInfo_station_pr').html(format.pr(data.PR));
                $('#rightInfo_station_rh').html(format.rh(data.RH));
                $('#rightInfo_station_vis').html(format.vis(data.VIS));
                $('#rightInfo_station_cn').html(format.cn(data.CN));
                $('#rightInfo_station_ch').html(format.ch(data.CFH));
                $('#rightInfo_station_wsMax').html(format.windMax(data.WS));

            }, function () {
                //-----------------------暂无数据
                //-----------------------基础信息
                $('#rightInfo_station_cityName').html('');
                $('#rightInfo_station_lnglat').html('经纬度：--，--');
                $('#rightInfo_station_hour').html('');
                //---------天气数据
                // $('#rightInfo_station_wthc').html(format.data('', data.WTHC));
                // $('#rightInfo_station_tt').html(format.weather(data.WTH) + ' ' + format.tt(data.TT));
                $('#rightInfo_station_tt').html('--');

                $('#rightInfo_station_wind').html('风:' + format.wind(undefined, undefined));
                $('#rightInfo_station_rn').html(format.rn(undefined));
                $('#rightInfo_station_pr').html(format.pr(undefined));
                $('#rightInfo_station_rh').html(format.rh(undefined));
                $('#rightInfo_station_vis').html(format.vis(undefined));
                $('#rightInfo_station_cn').html(format.cn(undefined));
                $('#rightInfo_station_ch').html(format.ch(undefined));
                $('#rightInfo_station_wsMax').html(format.windMax(undefined));
            })
        }

        /**
         * 获取图片地址
         * @param {*} ws 
         */
        function getImage(ws) {
            ws = (ws / 2) >> 0;
            ws = ws * 2;

            ws = ws > 72 ? 72 : ws;
            ws = ws < 1 ? 1 : ws;
            ws = ws < 10 ? '0' + ws : ws;
            return 'img/imgs/icon_ws' + ws + '@2x.png';
        }

        var timeKeys = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 54, 60, 66, 72, 84, 96, 108, 120, 132, 144, 156, 168];

        function queryStationForecast(code) {
            // 'http://weather.xinhong.net/stationdata_surf/seqdatafromcode?code='+myCode+'&elem=TT,WS,WD,RN'
            // 'https://weather.xinhong.net/stationdata_cityfc/datafromcode?code='+myCode+'&&elem=TT,RH,WW,WS,RN'

            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                code: code,
                elem: 'TT,WS,WD,RN,RH,WW',
                year: year,
                month: month,
                day: day,
                hour: hour
            }

            // http://ocean.xinhong.net:7020/cityFC3/pointsfromcode?code=54823&elem=TT,WS,WD,RN,RH,WW&year=2019&month=05&day=28&hour=20&
            // http.get(http.weatherUrl, '/stationdata_cityfc/datafromcode', param, function(json){
            http.get('http://ocean.xinhong.net:7020', '/cityFC3/pointsfromcode', param, function (json) {
                //-----------------------寻找数据容器并清空旧数据
                var data = json.data;

                var list = $('#rightInfo_station_forecast');
                list.empty();
                var html = '';
                var time = json.time;
                time = new Date(time.substring(0, 4), time.substring(4, 6) - 1, time.substring(6, 8), time.substring(8, 10));
                for (var i = 0; i < timeKeys.length; i++) {
                    var key = timeKeys[i];
                    var myTime = new Date(time.getTime() + key * 60 * 60 * 1000);
                    var date = myTime.getDate() < 10 ? '0' + myTime.getDate() : myTime.getDate();
                    var hour = myTime.getHours() < 10 ? '0' + myTime.getHours() : myTime.getHours();
                    var wind = format.wind(data.WD[key], data.WS[key]).split(' ');
                    html += '<li>' +
                        '<span style="width: 16.66%">' + date + '日' + hour + '时</span>' +
                        '<span style="width: 16.66%">' + (data.WW[key] ? data.WW[key] : '--') + '</span>' +
                        '<span style="width: 16.66%">' + format.tt(data.TT[key]) + '</span>' +
                        '<span class="fengXiangSpan" style="width: 16.66%">' +
                        '<i class="oneI">' + wind[0] + '</i>' +
                        '<i class="twoI">' + wind[1] + '</i>' +
                        '</span>' +
                        '<span style="width: 16.66%">' + format.rh(data.RH[key]) + '</span>' +
                        '<span style="width: 16.66%">' + format.rn(data.RN[key]) + '</span>' +
                        '</li>';
                }
                list.html(html);
                // $('#right_info_station .listNav li').eq(0).show();
                // $('#right_info_station .moduleDiv').eq(0).show();
            }, function () {
                // $('#right_info_station .listNav li').eq(0).hide();
                // $('#right_info_station .moduleDiv').eq(0).hide();
            })
        }
        function queryStationForecast7(code) {
            queryStationForecast7FromCityfc(code, function (cityFCData, timeStr) {
                queryStationForecast7FromNmc(code, function (nmcData) {
                    if (!cityFCData && !nmcData) {
                        $('#right_info_station .listNav li').eq(1).hide();
                        $('#right_info_station .moduleDiv').eq(1).hide();
                        return;
                    }
                    // var html = '<li class="modueOneLi">' +
                    //     '<span class="span01">时间</span>' +
                    //     '<span class="span02"">天气</span>' +
                    //     '<span class="span03"">最高温</span>' +
                    //     '<span class="span04"">最低温</span>' +
                    //     '<span class="span05"">降水</span>' +
                    //     '<span class="span06"">风</span>' +
                    //     '</li>';
                    var html = '';
                    let time = null;
                    if (timeStr) {
                        time = new Date(
                            timeStr.substring(0, 4),
                            parseInt(timeStr.substring(4, 6)) - 1,
                            timeStr.substring(6, 8),
                            timeStr.substring(8, 10));
                    } else {
                        time = new Date(
                            XHW.silderTime.year,
                            parseInt(XHW.silderTime.month) - 1,
                            XHW.silderTime.day,
                            XHW.silderTime.hour);
                    }
                    for (var i = 12; i <= 168; i += 12) {
                        var day = new Date(time.getTime() + i * 60 * 60 * 1000);
                        if (day.getHours() == parseInt(timeStr.substring(8, 10))) {
                            var month = day.getMonth() + 1 < 10 ? '0' + (day.getMonth() + 1) : day.getMonth() + 1;
                            var date = day.getDate() < 10 ? '0' + day.getDate() : day.getDate();
                            var data = (cityFCData && cityFCData[i]) ? cityFCData[i] : {};
                            let dateStr = month + '月' + date + '日';
                            let nmcDayData = nmcData ? nmcData[dateStr] : undefined;
                            html += '<li>' +
                                '<span style="width: 15%" class="span01">' + month + '月' + date + '日</span>' +
                                '<span style="width: 15%" class="span02">' + (nmcDayData ? nmcDayData.ww : format.data('', data.WW12)) + '</span>' +
                                '<span style="width: 15%" class="span03">' + (nmcDayData ? nmcDayData.maxt : format.tt(data.MXT)) + '</span>' +
                                '<span style="width: 15%" class="span04">' + (nmcDayData ? nmcDayData.mint : format.tt(data.MIT)) + '</span>' +
                                '<span style="width: 15%" class="span05">' + format.rn(data.RN12) + '</span>' +
                                '<span style="width: 20%" class="span06">' + (nmcDayData ? nmcDayData.wd : (format.data('', data.WD12) + '风')) + ','
                                + (nmcDayData ? nmcDayData.ws : format.windSpeed(data.WS12)) + '</span>' +
                                '</li>';
                        }
                    }

                    $('#rightInfo_station_fc7').html(html);
                    $('#right_info_station .listNav li').eq(1).show();
                    $('#right_info_station .moduleDiv').eq(1).show();
                })
            })
        }

        // function queryStationForecast7(code){

        function queryStationForecast7FromCityfc(code, callBack) {
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                code: code,
                elem: 'MXT',
                year: year,
                month: month,
                day: day,
                hour: hour
            }
            // http.get('http://ocean.xinhong.net:7020', '/cityFC3/pointsfromcode', param, function(json){
            http.get(http.weatherUrl, '/stationdata_cityfc/datafromcode', param, function (json) {
                if (callBack) {
                    callBack(json.data, json.time);
                }
            }, function(){
                if(callBack) {
                    callBack(undefined);
                }
            })
        }
        function queryStationForecast7FromNmc(code, callBack) {
            // 小于10前面加'0'
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                stationCode: code,
                year: year,
                month: month,
                day: day,
                hour: hour
            }
            // http.get('http://ocean.xinhong.net:7020', '/cityFC3/pointsfromcode', param, function(json){
            http.get('http://ocean.xinhong.net:7007', '/nwcfind/fc7', param, function (json) {
                if (callBack) {
                    let data = {};
                    if (json.data) {
                        for (let key in json.data) {
                            data[key.trim()] = json.data[key];
                        }
                    }
                }
            }, function () {
                if (callBack) {
                    callBack(undefined);
                }
            })
        }

        // 小于10前面加'0'
        function toTwo(time) {
            time = time + '';
            return time.length < 2 ? "0" + time : time;
        }

        /**
         * 向前72小时数据
         * @param {*} code
         */
        function hour72ForNmc(code, callback) {
            var dataS = {};
            var keyS = [];
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                stationCode: code,
                year: year,
                month: month,
                day: day,
                hour: hour
            }
            //http://ocean.xinhong.net:7007/nmcfind/real?stationCode=57303
            http.get('http://ocean.xinhong.net:7007', '/nmcfind/real', param, function (json) {
                if (!json.data) {
                    if (callback)
                        callback(false)
                } else {
                    for (var key in json.data) {
                        var year = key.substring(0, 4) + '年';
                        var month = key.substring(4, 6) + '月';
                        var day = key.substring(6, 8) + '日';
                        var hour = key.substring(8, 10) + '时';
                        keyS.push(year + month + day + hour);
                        dataS[year + month + day + hour] = json.data[key];
                    }
                }
            }, function () {
                if (callBack) {
                    callBack(undefined);
                }
            })

        }

        // /**
        //  * 查询站点7天预报
        //  * @param {*} code 
        //  */
        // function queryStationForecast7(code){
        //     // https://weather.xinhong.net/stationdata_cityfc/datafromlatlng?lat=32&lng=118&elem=MXT,RN24
        //     var param = {
        //         code: code,
        //         elem: 'MXT',
        //         year: XHW.silderTime.year,
        //         month: XHW.silderTime.month,
        //         day: XHW.silderTime.day,
        //         hour: XHW.silderTime.hour
        //     }
        //     // http.get('http://ocean.xinhong.net:7020', '/cityFC3/pointsfromcode', param, function(json){
        //     http.get(http.weatherUrl, '/stationdata_cityfc/datafromcode', param, function(json){
        //         if(!json.data) {
        //             $('#right_info_station .listNav li').eq(1).hide();
        //             $('#right_info_station .moduleDiv').eq(1).hide();
        //             return;
        //         }
        //         var html = '<li class="modueOneLi">' +
        //                         '<span class="span01">时间</span>' +
        //                         '<span class="span02"">天气</span>' +
        //                         '<span class="span03"">最高温</span>' +
        //                         '<span class="span04"">最低温</span>' +
        //                         '<span class="span05"">降水</span>' +
        //                         '<span class="span06"">风</span>' +
        //                     '</li>';
        //         var time = json.time;
        //         time = new Date(time.substring(0,4), parseInt(time.substring(4, 6)) -1, time.substring(6,8), time.substring(8,10));
        //         for(var i = 12; i <= 168; i += 12) {
        //             var day = new Date(time.getTime() + i * 60 * 60 * 1000);
        //             if(day.getHours() == parseInt(json.time.substring(8, 10))) {
        //                 var month = day.getMonth() + 1 < 10 ? '0' + (day.getMonth() + 1) : day.getMonth() + 1;
        //                 var date = day.getDate() < 10 ? '0' + day.getDate() : day.getDate();
        //                 var data = json.data[i] ? json.data[i] : {};
        //                 html += '<li>' +
        //                             '<span class="span01">' + month + '月' + date + '日</span>' +
        //                             '<span class="span02">' + format.data('', data.WW12) + '</span>' +
        //                             '<span class="span03">' + format.tt(data.MXT) + '</span>' +
        //                             '<span class="span04">' + format.tt(data.MIT) + '</span>' +
        //                             '<span class="span05">' + format.rn(data.RN12) + '</span>' +
        //                             '<span class="span06">' + format.data('', data.WD12) + '风' 
        //                                         + format.windSpeed(data.WS12) + '</span>' +
        //                         '</li>';
        //             }
        //         }
        //         $('#rightInfo_station_fc7').html(html);
        //         $('#right_info_station .listNav li').eq(1).show();
        //         $('#right_info_station .moduleDiv').eq(1).show();
        //     }, function(){
        //         $('#right_info_station .listNav li').eq(1).hide();
        //         $('#right_info_station .moduleDiv').eq(1).hide();
        //     })
        // }

        var myChart;
        function hour72(code) {
            $('#rightInfo_station_mxt').html(undefined);
            $('#rightInfo_station_mit').html(undefined);
            $('#rightInfo_station_mean_pr').html(undefined);
            // 先用新接口
            hour72ForNmc(code, function (hasData) {
                // 没有数据用老接口
                if (!hasData) {
                    hour72ForSeqdata(code);
                }
            });
        }

        /**
         * 向前72小时数据
         * @param {*} code
         */
        function hour72ForSeqdata(code) {
            // https://weather.xinhong.net/stationdata_surf/seqdatafromcode?code=54511&elem=RH,TT,PR&
            var dataS = {};
            var keyS = [];
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                code: code,
                elem: 'RH,TT,PR',
                year: year,
                month: month,
                day: day,
                hour: hour
            }
            http.get(http.weatherUrl, '/stationdata_surf/seqdatafromcode', param, function (json) {
                if (!json.data) {
                    $('#right_info_station .listNav li').eq(2).hide();
                    $('#right_info_station .moduleDiv').eq(2).hide();
                }
                for (var key in json.data) {
                    var year = key.substring(0, 4) + '年';
                    var month = key.substring(4, 6) + '月';
                    var day = key.substring(6, 8) + '日';
                    var hour = key.substring(8, 10) + '时';
                    keyS.push(year + month + day + hour);
                    dataS[year + month + day + hour] = json.data[key];
                }
                param.day = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).getDate();
                http.get(http.weatherUrl, '/stationdata_surf/seqdatafromcode', param, function (json) {
                    if (!json.data) {
                        $('#right_info_station .listNav li').eq(2).hide();
                        $('#right_info_station .moduleDiv').eq(2).hide();
                    }
                    for (var key in json.data) {
                        var year = key.substring(0, 4) + '年';
                        var month = key.substring(4, 6) + '月';
                        var day = key.substring(6, 8) + '日';
                        var hour = key.substring(8, 10) + '时';
                        keyS.push(year + month + day + hour);
                        dataS[year + month + day + hour] = json.data[key];
                    }
                    keyS.sort();
                    keyS.splice(0, keyS.length - 24);
                    var value = {
                        tt: [],
                        rh: [],
                        pr: []
                    }

                    for (var i = 0; i < keyS.length; i++) {
                        value.tt.push(dataS[keyS[i]].TT);
                        value.rh.push(dataS[keyS[i]].RH);
                        value.pr.push(dataS[keyS[i]].PR);
                    }
                    if (value.pr) {
                        let sum_pr = 0;
                        for (let i = 0; i < value.pr.length; i++) {
                            sum_pr += value.pr[i];
                        }
                        let mean_pr = sum_pr / value.pr.length;
                        $('#rightInfo_station_mean_pr').html(format.pr(mean_pr));
                    }

                    let maxTT = Math.max.apply(Math, value.tt);
                    let minTT = Math.min.apply(Math, value.tt);
                    let maxPr = Math.max.apply(Math, value.pr);
                    let minPr = Math.min.apply(Math, value.pr);
                    $('#rightInfo_station_mxt').html(format.tt(maxTT));
                    $('#rightInfo_station_mit').html(format.tt(minTT));

                    myChart = myChart ? myChart.dispose() : '';
                    myChart = echarts.init(document.getElementById('rightInfo_station_chart'));
                    var option = {
                        title: {
                            text: ''
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params) {
                                if (params) {
                                    let relVal = params[0].name;
                                    //alert(JSON.stringify(params))
                                    for (var i = 0, l = params.length; i < l; i++) {
                                        let unit = '';
                                        // switch (i) {
                                        //     case 0: unit = '℃';break;
                                        //     case 1: unit = '%';break;
                                        //     case 2: unit = 'hPa';break;
                                        // }
                                        switch (params[i].seriesName) {
                                            case "气温": unit = '℃'; break;
                                            case "相对湿度": unit = '%'; break;
                                            case "海平面气压": unit = 'hPa'; break;
                                        }
                                        relVal += '<br/>' + params[i].marker + params[i].seriesName + ': ' + params[i].value + unit;
                                    }
                                    return relVal;
                                }
                            }
                        },
                        color: ['#dc0909', 'rgba(50, 205, 50, 1)', '#0396a5'],
                        legend: {
                            data: ["气温", "相对湿度", "海平面气压"]
                        },
                        grid: {
                            left: 90,
                        },
                        xAxis: {
                            data: keyS,
                            boundaryGap: true,
                            axisTick: { alignWithLabel: true },
                            axisLine: { onZero: false, lineStyle: { color: '#13507f' } },
                            axisLabel: {
                                formatter: function (value, index) {
                                    value = value.split('月')[1];
                                    value = value.split('日');
                                    var time = value[1];
                                    if (index == 0 || time == '02时') {    //如果是第一条数据或换天的数据
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
                                splitLine: { show: false },
                                axisLine: { lineStyle: { color: '#13507f' } },
                            }, {
                                name: '相对湿度(%)',
                                max: 100,
                                min: 0,
                                type: 'value',
                                splitLine: { show: false },
                                axisLine: { lineStyle: { color: '#13507f' } },
                            }, {
                                name: '海平面气压\n(hPa)',
                                type: 'value',
                                max: maxPr + 5,
                                min: minPr - 5,
                                position: 'left',
                                offset: 40,
                                nameTextStyle: { padding: [0, 30, -10, 0] },
                                splitLine: { show: false },
                                axisLine: { lineStyle: { color: '#13507f' } },
                            }
                        ],
                        dataZoom: [/*{
                        type:'slider',
                        height: 20,
                        bottom: 5,
                    },*/{
                                type: 'inside'
                            }],
                        series: [
                            {
                                name: '气温',
                                type: 'line',
                                smooth: true,
                                data: value.tt
                            }, {
                                name: '相对湿度',
                                yAxisIndex: 1,
                                type: 'line',
                                smooth: true,
                                lineStyle: {
                                    color: 'rgba(50, 205, 50, 1)',
                                    width: 1,
                                },
                                areaStyle: {
                                    color: {
                                        type: 'linear',
                                        x: 0,
                                        y: 0,
                                        x2: 0,
                                        y2: 1,
                                        colorStops: [{
                                            offset: 0, color: 'rgba(100, 255, 100, 1)' // 0% 处的颜色
                                        }, {
                                            offset: 1, color: 'rgba(50, 255, 50, 0)' // 100% 处的颜色
                                        }],
                                        globalCoord: false
                                    }
                                },
                                data: value.rh
                            }, {
                                name: '海平面气压',
                                yAxisIndex: 2,
                                type: 'line',
                                smooth: true,
                                data: value.pr
                            }
                        ]
                    };
                    myChart.setOption(option);
                    $('#right_info_station .listNav li').eq(2).show();
                    $('#right_info_station .moduleDiv').eq(2).show();
                }, function () {
                    //-------------------------数据请求失败
                    $('#right_info_station .listNav li').eq(2).hide();
                    $('#right_info_station .moduleDiv').eq(2).hide();
                })
            }, function () {
                //--------------------------数据请求失败
                $('#right_info_station .listNav li').eq(2).hide();
                $('#right_info_station .moduleDiv').eq(2).hide();
            })
        }

        var hPas = [100, 200, 300, 400, 500, 700, 850, 925];
        /**
         * 绘制时间剖面图       todo 后续完成
         * @param {*} code 
         */
        function drawTimeCrossSection(code) {
            // http://weather1.xinhong.net/stationdata_high/timeprofilefromcode?code='+myCode
            var param = {
                code: code
            }
            http.get(http.weatherUrl, '/stationdata_high/timeprofilefromcode', param, function (json) {
                if (json.data) {
                    $('#right_info_station .listNav li').eq(3).show();
                    $('#right_info_station .moduleDiv').eq(3).show();
                    var list = [], data = [];
                    for (var key in json.data) {
                        list.push(key);
                        data.push(json.data[key]);
                    }
                    list.sort();
                    // drawCrossSection(list, data);
                } else {
                    $('#right_info_station .listNav li').eq(3).hide();
                    $('#right_info_station .moduleDiv').eq(3).hide();
                }
            }, function () {
                $('#right_info_station .listNav li').eq(3).hide();
                $('#right_info_station .moduleDiv').eq(3).hide();
            });
        }

        /**
         * 绘制剖面图
         * @param {*} type 
         */
        function drawCrossSection(keys, data) {
            // var type= $('input:radio[name="rightInfo_multi_radio"]:checked').val();
            var canvasL = $('#rightInfo_station_crossL');
            var canvasR = $('#rightInfo_station_crossR');

            //------------------获取高度
            var devicePixelRatio = window.devicePixelRatio || 1;
            var height = canvasR.height() * devicePixelRatio;
            //------------------设置左侧气压canvas像素比
            canvasL.attr('width', canvasL.width() * devicePixelRatio + 'px');
            canvasL.attr('height', height + 'px');
            //-----------------计算并设置右侧数据展示canvas宽度及像素比
            var xi = 50 * devicePixelRatio;    //预设单个数据所占x宽度
            var yi = (height - xi) / hPas.length;   //预设单个数据所占y高度
            var width = canvasR.width() * devicePixelRatio;
            width = keys.length > 0 ? keys.length * xi : width;
            canvasR.css('width', width / devicePixelRatio + 'px');
            canvasR.attr('width', width + 'px');
            canvasR.attr('height', height + 'px');
            //------------------风羽图片大小
            var imgY = 16 * devicePixelRatio;
            var imgX = imgY / 2;
            //-----------------获取绘画对象
            var ctxL = canvasL[0].getContext('2d');
            var ctxR = canvasR[0].getContext('2d');
            //-----------------绘制横纵轴
            ctxL.beginPath();
            ctxL.strokeStyle = '#13507f';
            ctxL.moveTo(xi, 0);
            ctxL.lineTo(xi, yi * hPas.length + 1);
            ctxL.lineTo(xi + 30, yi * hPas.length + 1);
            ctxL.stroke();
            ctxR.beginPath();
            ctxR.strokeStyle = '#13507f';
            ctxR.moveTo(0, yi * hPas.length + 1);
            ctxR.lineTo(width, yi * hPas.length + 1);
            ctxR.stroke();
            //-----------------遍历数据 经纬度
            for (var i = 0; i < keys.length; i++) {
                var x = xi * i;     //单个数据的左边界
                var key = keys[i];
                //-------------------遍历数据 气压层次
                for (var j = 0; j < hPas.length; j++) {
                    var y = yi * j;     //单个数据的上边界
                    if (i == 0) {
                        //---------------遍历第一组数据，同时填充纵坐标
                        drawAlignRightText2(ctxL, '#13507f', hPas[j], x + xi - 10 * devicePixelRatio, y + yi / 2 + 5 * devicePixelRatio);
                    }
                    var hPa = '0' + hPas[j];
                    var td = data[i][hPa];
                    if (!td) continue;
                    //-----------------填充湿度/积冰/颠簸
                    // switch(type) {  //----------根据类型和值获取颜色
                    //     case 'RH':
                    //         ctxR.fillStyle = getRHColor(dataS.RH[i][j]); 
                    //         break;
                    //     case 'TURB':
                    //         ctxR.fillStyle = getTRUBColor(dataS.TURB[i][j]); 
                    //         break;
                    //     case 'ICE':
                    //         ctxR.fillStyle = getICEColor(dataS.ICE[i][j]);
                    //         break;
                    // }
                    ctxR.fillStyle = getRHColor(td.RH);
                    ctxR.fillRect(x, y, xi, yi);
                    //-----------------填充风羽
                    var ws = td.WS;
                    var wd = td.WD;

                    ctxR.translate(x + xi / 2, y + yi / 2);
                    ctxR.rotate(wd * Math.PI / 180);
                    ctxR.drawImage(Img, getWindImageX(ws), getWindImageY(ws, false), 15, 31,
                        0, -imgY, imgX, imgY);
                    ctxR.rotate(-wd * Math.PI / 180);
                    ctxR.translate(-(x + xi / 2), -(y + yi / 2));

                    //-----------------填充温度
                    drawAlignRightText(ctxR, '#c23531', ((td.TT * 10) >> 0) / 10, x + xi / 2, y + yi / 2 + 5);
                }
                var day = key.substring(4, 6) + '/' + key.substring(6, 8);
                var hour = key.substring(8, 10) + '时';
                drawAlignRightText(ctxR, '#13507f', hour, x + xi / 2, height - 30 * devicePixelRatio);
                drawAlignRightText(ctxR, '#13507f', day, x + xi / 2, height - 10 * devicePixelRatio);
            }
        }

        /**
         * 绘制水平居中文字的方法
         * @param ctx
         * @param rgb
         * @param str
         * @param x
         * @param y
         */
        function drawAlignRightText(ctx, rgb, str, x, y) {
            ctx.font = window.devicePixelRatio * 10 + "px 微软雅黑 New";
            ctx.fillStyle = rgb;
            ctx.fillText(str, x - ctx.measureText(str).width / 2, y);
        }

        /**
         * 绘制右边距对齐的文字
         * @param ctx
         * @param rgb
         * @param str
         * @param x
         * @param y
         */
        function drawAlignRightText2(ctx, rgb, str, x, y) {
            ctx.font = window.devicePixelRatio * 10 + "px 微软雅黑 New";
            ctx.fillStyle = rgb;
            ctx.fillText(str, x - ctx.measureText(str).width, y);
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
         * 查询强对流指数
         * @param {*} code
         */
        function queryStationStrongConvective(code) {
            // http://weather.xinhong.net/stationdata_high/indexfromcode?code=
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                code: code,
                year: year,
                month: month,
                day: day,
                hour: hour
            }

            http.get(http.weatherUrl, '/stationdata_high/indexfromcode', param, function (json) {
                var data = json.data;
                if (data) {
                    $('#rightInfo_station_scSSI').html(format.data1('', data.SSI));
                    $('#rightInfo_station_scK').html(format.data1('', data.K));
                    $('#rightInfo_station_scSW').html(format.data1('', data.SW));
                    $('#rightInfo_station_scRI').html(format.data1('', data.RI8550));
                    $('#rightInfo_station_scCI').html(format.data1('', data.CI));
                    $('#rightInfo_station_scS53').html(format.data1('', data.WindShearWS5030));
                    $('#rightInfo_station_scD53').html(format.data1('', data.WindShearWD5030));
                    $('#rightInfo_station_scS73').html(format.data1('', data.WindShearWS7030));
                    $('#rightInfo_station_scD73').html(format.data1('', data.WindShearWD7030));
                    $('#right_info_station .listNav li').eq(4).show();
                    $('#right_info_station .moduleDiv').eq(4).show();
                } else {
                    $('#right_info_station .listNav li').eq(4).hide();
                    $('#right_info_station .moduleDiv').eq(4).hide();
                }
            }, function () {
                $('#right_info_station .listNav li').eq(4).hide();
                $('#right_info_station .moduleDiv').eq(4).hide();
            })
        }

        function queryTLogP(myCode, name) {
            // https://weather.xinhong.net/stationdata_high/tlogpimageurl?key=XXXXXXX&code=54511&cname=北京&month=12&day=25&year=2018&hour=14
            var param = {
                code: myCode,
                name: name
            }
            http.get(http.weatherUrl, '/stationdata_high/tlogpimageurl', param, function (json) {
                if (!json.data) {
                    $('#right_info_station .listNav li').eq(5).hide();
                    $('#right_info_station .moduleDiv').eq(5).hide();
                }
                var url = http.imgUrl + json.data.url;
                $('#rightInfo_station_tlogp').attr('src', url);
                $('#right_info_station .listNav li').eq(5).show();
                $('#right_info_station .moduleDiv').eq(5).show();
            }, function () {
                $('#right_info_station .listNav li').eq(5).hide();
                $('#right_info_station .moduleDiv').eq(5).hide();
            });
        }

        return {
            queryStationInfo: queryStationInfo
        }

    });
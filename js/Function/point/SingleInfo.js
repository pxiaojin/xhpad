//-----------------任意经纬度单点详情
define(['Controller/Http',
    'Controller/layout',
    'Controller/DataFormat',
    // 'Function/tool/ProfileChart',
    'Function/Search',
    'lib/echarts'], function (http, layout, format, search, echarts) {

        var nlnglat;
        var Img;
        var myChart;
        function init() {
            Img = new Image();
            Img.src = './img/wind/windy.png';

            timeBar.addCallback(function () {
                if (layout.getRightMenu() && $('#right_info_Single').is(':visible'))
                    querySingleInfo(nlnglat);
            });
            $('input:radio[name="point_profileChart_multi_radio"]').parent().click(function () {
                $('input:radio[name="point_profileChart_multi_radio"]').parent().removeClass('current');
                $(this).addClass('current');
                var mysrc = $(this).attr('mysrc');
                $(this).parent().parent().siblings('img').attr('src', mysrc);
                udpateTimeProfileChart();
            });
        }
        init();

        /**
         * 查询任意点详细信息
         * @param {*} lnglat 
         */
        function querySingleInfo(lnglat) {
            nlnglat = lnglat;
            //---------------------------查询数据
            querySingleNow(lnglat);
            querySingleHimawari8l2(lnglat);
            //---------------------------时序图
            drawTimeCrossSection(lnglat[1], lnglat[0]);
            
            //---------------------------显示详情
            // layout.showRightMenu();
            // $('#right_info_Single').show();
            $('.bottompanel').stop().slideDown()
            $('.bottompanel .posi_wea').show().siblings().hide()
            $('.bottompanel .panelCancel').show()
        }
        /**
         * 查询单点现在数据
         * @param {*} lnglat 
         */
        function querySingleNow(lnglat) {
            //  闪烁图标
            search.viewAnimate(Number(lnglat[0]), Number(lnglat[1]));
            // http://weather1.xinhong.net/gfs/pointdata?lat=39.9&lng=116.26&year=2019&month=01&day=17&hour=07
            // var time = XHW.silderTime;
            // var param = {
            //     lng:lnglat[0],
            //     lat:lnglat[1],
            //     year: time.year,
            //     month: time.month,
            //     day: time.day,
            //     hour: time.hour
            // }
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                lng: lnglat[0],
                lat: lnglat[1],
                year: year,
                month: month,
                day: day,
                hour: hour
            }

            let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
            let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
            // let url =http.weatherUrl;
            // let paramsURL = '/gfs';
            paramsURL += '/pointdata';

            http.get(url, paramsURL, param, function (json) {
                //----------------------------地点时间
                $('#rightInfo_single_lnglat').html(format.data('', format.lnglat(lnglat[0], lnglat[1])));
                var time = json.time.split('_');
                var QBtime = new Date(time[0].substring(0, 4), parseInt(time[0].substring(4, 6)) - 1,
                    time[0].substring(6, 8), time[0].substring(8, 10));
                $('#rightInfo_single_qb').html(format.data('', QBtime.getDate(), '日') +
                    format.data('', QBtime.getHours(), '时'));
                $('#rightInfo_single_vti').html(format.data('+', time[1]));
                QBtime = new Date(QBtime.getTime() + (parseInt(time[1]) * 60 * 60 * 1000));
                $('#rightInfo_single_now').html(format.data('', QBtime.getDate(), '日') +
                    format.data('', QBtime.getHours(), '时'));
                //----------------------------基础信息
                // var info = json.data[XHW.config.datasource]['9999'];
                let sourceType = XHW.config.datasource;
                if (sourceType == 'ecmf' || sourceType == 'ECMF')
                    sourceType = 'EC';
                var info = json.data[sourceType] && json.data[sourceType]['9999'] ? json.data[sourceType]['9999'] : {};
                $('#rightInfo_single_tt').html(format.tt(info.TT));
                var u = info.UU;
                var v = info.VV;
                var ws = Math.sqrt(u * u + v * v);
                var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                var gws = info.GWS.toFixed(1);
                $('#rightInfo_single_wind').html('风：' + format.wind(wd, ws));
                $('#rightInfo_instant_wind').html('瞬时风速: ' + gws + 'm/s');
                $('#rightInfo_single_rn06').html(format.rn(info.RN));
                $('#rightInfo_single_pr').html(format.pr(info.PR));
                $('#rightInfo_single_rh').html(format.rh(info.RH));
                // $('#rightInfo_single_vis').html(format.vis(info.VIS));            
                $('#rightInfo_single_cn').html(format.cn(info.CN));
                $('#rightInfo_single_cnl').html(format.cn(info.CNL));
                //----------------------------航空危险天气
                var danger = json.data.DANGER && json.data.DANGER['9999'] ? json.data.DANGER['9999'] : {};
                if (danger.VIS) {
                    $('#rightInfo_single_vis').html(format.vis(danger.VIS * 1000));
                } else {
                    $('#rightInfo_single_vis').html(format.vis(info.VIS));
                };
                $('#rightInfo_single_Dcbh').html(format.ch(danger.CBH));   //云底高  
                $('#rightInfo_single_Dcth').html(format.ch(danger.CTH));   //云顶高 
                //   ts 雷暴 CAPE 对流有效位能 li 抬升指数 sun 光照时间
                $('#rightInfo_single_ts').html(format.ts(danger.TS * 100));
                $('#rightInfo_single_cape').html(format.data('', info.CAPE, 'J/kg'));
                var d850 = json.data.DANGER && json.data.DANGER['0850'] ? json.data.DANGER['0850'] : {};
                var d500 = json.data.DANGER && json.data.DANGER['0500'] ? json.data.DANGER['0500'] : {};
                var d300 = json.data.DANGER && json.data.DANGER['0300'] ? json.data.DANGER['0300'] : {};
                $('#rightInfo_single_iceL').html(format.data1('', d850.ICE));
                $('#rightInfo_single_iceH').html(format.data1('', d500.ICE));
                $('#rightInfo_single_turbL').html(format.data1('', d500.TURB));
                $('#rightInfo_single_turbH').html(format.data1('', d300.TURB));
                $('#rightInfo_single_sun').html(format.data('', info.SUN, 's'));
                $('#rightInfo_single_li').html(format.data1('', info.LI, 'K'));
                //----------------------------垂直层面
                var html = '';
                for (var i = 0; i < hPas.length; i++) {
                    var key = '0' + hPas[i];
                    var ti = json.data && json.data[sourceType] ? json.data[sourceType][key] : undefined;
                    if (!ti)
                        continue;
                    var di = json.data.DANGER && json.data.DANGER[key] ? json.data.DANGER[key] : {};
                    var u = ti.UU;
                    var v = ti.VV;
                    var ws = Math.sqrt(u * u + v * v);
                    var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                    var wind = format.wind(wd, ws).split(' ');

                    html += '<li>' +
                        '<span class="span11">' + hPas[i] + '</span>' +
                        '<span class="span12">' + format.ch(ti.HH) + '</span>' +
                        '<span class="span13">' + format.tt(ti.TT) + '</span>' +
                        '<span class="span14">' + format.rh(ti.RH) + '</span>' +
                        '<span class="fengXiangSpan span15">' +
                        '<i class="oneI">' + wind[0] + '</i>' +
                        '<i class="twoI">' + wind[1] + '</i>' +
                        '</span>' +
                        '<span  class="span16">' + format.data1('', di.ICE) + '</span>' +
                        '<span  class="span17">' + format.data1('', di.TURB) + '</span>' +
                        '<span  class="span18">' + '--' + '</span>' +
                        '</li>';
                }
                $('#rightInfo_single_list').html(html);
            }, function () { })
        }

        /**
         * 地面要素预报曲线
         * @param {*} code 
         */
        function forecast_chart(data, datasource) {
            var times = data.times;
            var profiledatas = data.profiledatas;
            let sourceType = datasource;
            if (sourceType == 'ecmf' || sourceType == 'ECMF')
                sourceType = 'EC';

            keyS = [];
            wind = [];
            var value = {
                tt: [],
                rh: [],
                pr: [],
                ws: [],
                wd: [],
                vis: []
            };
            for (var i = 0; i < times.length; i++) {
                var year = times[i].substring(0, 4) + '年';
                var month = times[i].substring(4, 6) + '月';
                var day = times[i].substring(6, 8) + '日';
                var hour = times[i].substring(8, 10) + '时';

                if (!$.isEmptyObject(profiledatas[i])) {  //判断其对象不为空
                    keyS.push(year + month + day + hour);
                    let dataS = profiledatas[i][sourceType]['9999'];
                    var u = dataS.UU;
                    var v = dataS.VV;
                    var ws = Math.sqrt(u * u + v * v);
                    var wd = 270.0 - Math.atan2(v, u) * 180.0 / Math.PI;
                    wd = wd >= 360 ? (((wd - 360) * 10) >> 0) / 10 : ((wd * 10) >> 0) / 10;
                    value.tt.push(((dataS.TT * 10) >> 0) / 10);
                    value.rh.push(((dataS.RH * 10) >> 0) / 10);
                    value.pr.push(((dataS.PR * 10) >> 0) / 10);
                    value.ws.push(((ws * 10) >> 0) / 10);
                    value.wd.push(parseInt(wd));
                    value.vis.push(parseInt(dataS.VIS / 1000));
                    var windItem = [year + month + day + hour, ((ws * 10) >> 0) / 10, parseInt(wd)];
                    wind.push(windItem);
                }
            }

            if (value.pr) {
                let sum_pr = 0;
                for (let i = 0; i < value.pr.length; i++) {
                    sum_pr += value.pr[i];
                }
                let mean_pr = sum_pr / value.pr.length;
                $('#rightInfo_single_mean_pr').html(format.pr(mean_pr));
            }

            let maxTT = Math.max.apply(Math, value.tt);
            let minTT = Math.min.apply(Math, value.tt);
            let maxPr = Math.max.apply(Math, value.pr);
            let minPr = Math.min.apply(Math, value.pr);
            $('#rightInfo_single_mxt').html(format.tt(maxTT));
            $('#rightInfo_single_mit').html(format.tt(minTT));
            // var myChart;
            myChart = myChart ? myChart.dispose() : '';
            myChart = echarts.init(document.getElementById('rightInfo_single_chart'));
            var option = {
                title: {
                    text: ''
                },
                tooltip: {
                    trigger: 'axis',
                    confine: true,
                    formatter: function (params) {
                        if (params) {
                            let relVal = params[0].name;
                            // console.log(JSON.stringify(params))
                            for (var i = 0, l = params.length; i < l; i++) {
                                let unit = '';
                                // switch (i) {
                                //     case 0: unit = '℃';break;
                                //     case 1: unit = '%';break;
                                //     case 2: unit = 'hPa';break;
                                //     case 3: unit = 'm/s';break;
                                //     case 4: unit = '°';break;
                                //     case 5: unit = 'km';break;
                                // }
                                switch (params[i].seriesName) {
                                    case "气温": unit = '℃'; break;
                                    case "相对湿度": unit = '%'; break;
                                    case "海压": unit = 'hPa'; break;
                                    case "风速": unit = 'm/s'; break;
                                    case "风向": unit = '°'; break;
                                    case "能见度": unit = 'km'; break;
                                }
                                if (params[i].seriesName == "风向") {
                                    relVal += '<br/>' + params[i].marker + params[i].seriesName + ': ' + params[i].value[2] + unit;
                                } else {
                                    relVal += '<br/>' + params[i].marker + params[i].seriesName + ': ' + params[i].value + unit;
                                }

                            }
                            return relVal;
                        }
                    }
                },
                color: ['#dc0909', 'rgba(50, 205, 50, 1)', '#0396a5', '#6C5D4C', '#6C5D4C', '#FBD66C'],
                legend: {
                    data: ["气温", "相对湿度", "海压", "风速", "风向", "能见度"],
                    textStyle: {
                        fontSize: 10,
                        color: 'white'
                    },
                    top: 8
                },
                grid: {
                    left: 90,
                    right:35
                },
                xAxis: {
                    data: keyS,
                    boundaryGap: true,
                    axisTick: { alignWithLabel: true },
                    // axisLine: { onZero: false, lineStyle: { color: '#13507f' } },
                    axisLine: { onZero: false, lineStyle: { color: 'white' } },
                    axisLabel: {
                        formatter: function (value, index) {
                            value = value.split('月')[1];
                            value = value.split('日');
                            var time = value[1];
                            if (index == 0 || time == '02时') {    //如果是第一条数据或换天的数据
                                // time = time + '\n' + value[0] + '日';
                                time = value[0] + '日' + time;
                                // time = value[0] + 'd' + time.replace(/时/,'h');
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
                        // axisLine: { lineStyle: { color: '#13507f' } },
                        axisLine: { lineStyle: { color: 'white' } },
                    }, {
                        name: '相对湿度(%)',
                        max: 100,
                        min: 0,
                        type: 'value',
                        splitLine: { show: false },
                        // axisLine: { lineStyle: { color: '#13507f' } },
                        axisLine: { lineStyle: { color: 'white' } },
                    }, {
                        name: '海压(hPa)',
                        type: 'value',
                        max: maxPr + 5,
                        min: minPr - 5,
                        position: 'left',
                        offset: 40,
                        nameTextStyle: { padding: [0, 30, 0, 0] },
                        splitLine: { show: false },
                        // axisLine: { lineStyle: { color: '#13507f' } },
                        axisLine: { lineStyle: { color: 'white' } },
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
                        name: '海压',
                        yAxisIndex: 2,
                        type: 'line',
                        smooth: true,
                        data: value.pr
                    }, {
                        name: '风速',
                        type: 'line',
                        smooth: true,
                        data: value.ws,
                    }, {
                        name: '风向',
                        type: 'custom',
                        renderItem: renderArrow,
                        data: wind
                    }, {
                        name: '能见度',
                        type: 'line',
                        smooth: true,
                        data: value.vis,
                    }
                ]
            };
            myChart.setOption(option);
            $('#right_single_station .listNav li').eq(2).show();
            $('#right_single_station .moduleDiv').eq(2).show();
        }

        var arrowSize = 24;
        function renderArrow(param, api) {
            var point = api.coord([
                api.value(0),
                api.value(1)
            ]);
            return {
                type: 'path',
                shape: {
                    pathData: 'M31 16l-15-15v9h-26v12h26v9z',
                    x: -arrowSize / 4,
                    y: -arrowSize / 4,
                    width: arrowSize / 2,
                    height: arrowSize / 2
                },
                rotation: (90 - api.value(2)) * Math.PI / 180,
                // rotation: api.value(2),
                position: point,
                style: api.style({
                    stroke: '#555',
                    lineWidth: 1
                })
            };
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

        /**
         * 查询此经纬度的葵花8卫星数据
         * @param {*} lnglat 
         */
        function querySingleHimawari8l2(lnglat) {
            // http://weather1.xinhong.net/himawari8l2/pointspacedata?
            // lat=26.31&lng=102.56&interploate=0&year=2019&month=01&day=17&hour=09
            // var time = XHW.silderTime;
            // var param = {
            //     lng:lnglat[0],
            //     lat:lnglat[1],
            //     interploate:'0',
            //     year: time.year,
            //     month: time.month,
            //     day: time.day,
            //     hour: time.hour
            // }
            var time = timeBar.getRequestTime().split('-');
            var year = time[0];
            var month = time[1];
            var day = time[2];
            var hour = time[3];
            var param = {
                lng: lnglat[0],
                lat: lnglat[1],
                interploate: '0',
                year: year,
                month: month,
                day: day,
                hour: hour
            };
            http.get(http.weatherUrl, '/himawari8l2/pointspacedata', param, function (json) {
                //-----------------------基础信息
                // CT 亮温 CP 云类 CH 云顶
                // 0 晴空 1 卷云 2 卷层云 3 深对流 4 高积云 5 高层云 6 雨层云 7 淡积云 8 层积云 9 层云 10 无法观测
                var time = json.time;
                $('#rightInfo_single_hima_time').html(format.timeDay(time.substring(0, 4),
                    time.substring(4, 6), time.substring(6, 8)) + ' ' +
                    format.timeHour(time.substring(8, 10)));
                var data = json.data.profiledatas[0];
                $('#rightInfo_single_hima_ch').html(format.ch(data.CH * 1000));
                $('#rightInfo_single_hima_ct').html(format.tt(data.CT - 273));
                var cp = data.CP == 0 ? '晴空' :
                    data.CP == 1 ? '卷云' :
                        data.CP == 2 ? '卷层云' :
                            data.CP == 3 ? '深对流' :
                                data.CP == 4 ? '高积云' :
                                    data.CP == 5 ? '高层云' :
                                        data.CP == 6 ? '雨层云' :
                                            data.CP == 7 ? '淡积云' :
                                                data.CP == 8 ? '层积云' :
                                                    data.CP == 9 ? '层云' :
                                                        data.CP == 10 ? '无法观测' :
                                                            '--'
                $('#rightInfo_single_hima_cp').html(cp);
            })
        }

        var gfshPas = ['050', 100, 200, 300, 400, 500, 600, 650, 700, 750, 800, 850, 900, 925, 950, 975];
        var ecHPas = ['050', 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 1000];
        var hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;

        /**
         * 绘制时间剖面图
         * @param {*} lat 
         * @param {*} lng 
         */
        function drawTimeCrossSection(lat, lng) {
            // https://weather.xinhong.net/gfs/timeprofiledata?lat=' + lat + '&lng=' + lng
            var param = {
                lat: lat,
                lng: lng,
            };
            let leveltype = 'height';
            let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
            let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
            paramsURL += '/timeprofiledata';
            hPas = leveltype == 'height' ? (XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas) : (XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas);

            http.get(url, paramsURL, param, function (json) {
                profileOptions = undefined;
                if (json.data) {
                    profileOptions = buildProfileOptions(json.data, hPas, XHW.config.datasource, 'DANGER');
                    $('#right_info_Single .listNav li').eq(2).show();
                    $('#right_info_Single .moduleDiv').eq(2).show();
                    $('#right_info_Single .listNav li').eq(3).show();
                    $('#right_info_Single .moduleDiv').eq(3).show();
                } else {
                    $('#right_info_Single .listNav li').eq(2).hide();
                    $('#right_info_Single .moduleDiv').eq(2).hide();
                    $('#right_info_Single .listNav li').eq(3).hide();
                    $('#right_info_Single .moduleDiv').eq(3).hide();
                }
                udpateTimeProfileChart();
                forecast_chart(json.data, XHW.config.datasource);
            }, function () {
                profileOptions = undefined;
                $('#right_info_Single .listNav li').eq(2).hide();
                $('#right_info_Single .moduleDiv').eq(2).hide();
                $('#right_info_Single .listNav li').eq(3).hide();
                $('#right_info_Single .moduleDiv').eq(3).hide();
                udpateTimeProfileChart();
            });
        }

        var profileOptions;
        var profileChart;
        function udpateTimeProfileChart() {
            let type = $('input:radio[name="point_profileChart_multi_radio"]').parent('.current').children('input')[0];
            if (type) {
                type = type.value;
                if (profileOptions && profileOptions.series) {
                    let series = profileOptions.series;
                    for (let index in series) {
                        series[index].visible = true;
                        if (series[index].key && series[index].key != type)
                            series[index].visible = false;
                    }
                }
                if (!profileChart) {
                    profileChart = new tool.ProfileChart({ left_axe: 'rightInfo_single_crossL', right_content: 'rightInfo_single_crossR' });
                }
                setTimeout(function(){
                    profileChart.resetData(profileOptions);
                },300)
                // profileChart.resetData(profileOptions);
            }

        }
        /**
         * 绘制剖面图
         * @param {*} type 
         */
        function drawCrossSection(keys, data) {
            let TT = [];
            let WS = [];
            let WD = [];
            let RH = [];
            //-----------------遍历数据 经纬度
            for (let i = 0; i < keys.length; i++) {
                TT[i] = [];
                WS[i] = [];
                WD[i] = [];
                RH[i] = [];
                //-------------------遍历数据 气压层次
                for (let j = 0; j < hPas.length; j++) {
                    let td = data[i][hPas[j]];
                    TT[i][j] = td ? td.TT : undefined;
                    WS[i][j] = td ? td.WS : undefined;
                    WD[i][j] = td ? td.WD : undefined;
                    RH[i][j] = td ? td.RH : undefined;
                }
            }
            let options = {
                fixedWidth: 50,
                xAxis: {
                    data: keys,
                    axisLabel: {
                        formatter: function (value) {

                            let day = value.substring(4, 6) + '/' + value.substring(6, 8);
                            let hour = value.substring(8, 10) + '时';
                            return hour + '\n' + day;
                        }
                    },
                },
                yAxis: {
                    data: hPas,
                    axisLine: { onZero: false, lineStyle: { color: '#13507f' } }
                },
                series: [{
                    name: '湿度',
                    type: 'fill',
                    data: RH,
                    visible: true,
                    fillColorFunc: function (value) {
                        return getRHColor(value);
                    }
                }, {
                    name: '风羽',
                    type: 'windbarb',
                    WS: WS,
                    WD: WD,
                    visible: true,
                    Img: Img
                }, {
                    name: '温度',
                    type: 'label',
                    data: TT,
                    visible: true,
                    color: '#c23531'
                }]
            };
            if (!profileChart) {
                profileChart = new tool.ProfileChart({ left_axe: 'rightInfo_single_crossL', right_content: 'rightInfo_single_crossR' });
            }
            profileChart.resetData(options);
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
         * 根据风速获取X索引
         * @param {*} ws 
         */
        function getWindImageX(ws) {
            ws = ws > 72 ? 72 : ws; //风速最大72
            ws = ws < 1 ? 1 : ws; //风速最小为0，同时0与1为同一张图片
            var index = ws < 3 ? ws - 1 :   //ws < 3时，取ws - 1张
                ((ws + 1) / 2) >> 0; // 3和4为风速4,即第三张,则取角标2  依次类推
            index = index % 10;
            return index * 16;
        }

        /**
         * 根据风速获取Y索引
         * @param {*} ws 
         * @param {*} isGray    是否获取灰色图标 
         */
        function getWindImageY(ws, isGray) {
            ws = ws > 72 ? 72 : ws; //风速最大72
            ws = ws < 1 ? 1 : ws; //风速最小为0，同时0与1为同一张图片
            var index = ws < 3 ? ws - 1 :   //ws < 3时，取ws - 1张
                ((ws + 1) / 2) >> 0; // 3和4为风速4,即第三张,则取角标2  依次类推
            index = (index / 10) >> 0;

            if (isGray) {
                return index * 32 + 128;
            }

            return index * 32;
        }

        return {
            querySingleInfo: querySingleInfo,
            udpateTimeProfileChart:udpateTimeProfileChart,
        }

    });
//-----------------城镇/气象站详情
define(['Controller/Http',
    'Controller/layout',
    'Controller/DataFormat',
    'Controller/CrossSection',
    'lib/echarts'], function (http, layout, format, cross, echarts) {

        var Img;
        function init() {
            Img = new Image();
            Img.src = './img/wind/windy.png';

            $('input:radio[name="airport_profileChart_multi_radio"]').parent().click(function () {
                $('input:radio[name="airport_profileChart_multi_radio"]').parent().removeClass('current');
                $(this).addClass('current');
                var mysrc = $(this).attr('mysrc');
                $(this).parent().parent().siblings('img').attr('src', mysrc);

                udpateTimeProfileChart();
            });
            //时间轴变化监听
            timeBar.addCallback(function () {
                if (layout.getRightMenu() && $('#right_info_station').is(':visible'))
                    queryStationInfo(Code);
            });
        }
        init();

        /**
         * 查询机场单点详细信息
         * @param {*} code      机场4字码
         * @param {*} time      天气现象对应的时间
         * @param {*} weather   天气现象（恶劣条件）
         */
        function queryAirportInfo(code, time, weather, realValue) {
            //---------------------------查询数据
            queryNow(code);
            airportMessage(code, time, weather, realValue);
            //---------------------------显示详情
            // layout.showRightMenu();
            // $('#right_info_airport').show();
            $('.bottompanel_air').stop().slideDown()
            $('.bottompanel_air .for_airport').show()
            $('.bottompanel_air .panelCancel').show()
        }

        /**
         * 查询机场详情
         * @param {*} code 
         */
        function queryNow(code) {
            //https://weather.xinhong.net/airport/infofromnameicao3icao4?param='+icao4,
            var param = {
                param: code
            }
            http.get(http.weatherUrl, '/airport/infofromnameicao3icao4', param, function (json) {
                //-----------------------基础信息
                $('#rightInfo_airport_name').html(format.airportName(json.data[0].cname)
                    + format.data('(', json.data[0].icao4, ')'));
                $('#rightInfo_airport_lnglat').html('经纬度：' + format.lnglat(json.data[0].lng, json.data[0].lat));
                //------------------------时间剖面图预报
                drawTimeCrossSection(json.data[0].lat, json.data[0].lng);
                //------------------------强对流指数
                getStationCode(json.data[0].lng, json.data[0].lat);

                //-------------------------航空危险天气
                querySingleNow([json.data[0].lng, json.data[0].lat]) ;
            }, function () {
                //查询错误
            })
        }

        function querySingleNow(lnglat) {
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
                //----------------------------航空危险天气
                let sourceType = XHW.config.datasource;
                if (sourceType == 'ecmf' || sourceType == 'ECMF')
                    sourceType = 'EC';
                var info = json.data[sourceType] && json.data[sourceType]['9999'] ? json.data[sourceType]['9999'] : {};
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
            }, function () { })
        }

        /**
         * 查询机场报文
         * @param {*} code 4字码
         * @param {*} time 报文时间
         * @param {*} weather 报文天气条件
         */
        function airportMessage(code, time, weather, realValueStr) {
            // http://weather1.xinhong.net/airportdata_surf/sigmentdatafromcode?
            // year=2019&month=01&day=22&hour=13&minute=00&code=ZBHH&sigmenttype=NONE
            var param = {
                year: time.substring(0, 4),
                month: time.substring(4, 6),
                day: time.substring(6, 8),
                hour: time.substring(8, 10),
                minute: time.substring(10, 12),
                code: code,
                sigmenttype: weather
            }
            http.get(http.weatherUrl, '/airportdata_surf/sigmentdatafromcode', param, function (json) {
                var data = json.data;
                var real = data.real ? data.real : {};
                let realValue;
                if (realValueStr && realValueStr != '适航') {
                    if (typeof realValueStr == 'string') {
                        realValue = JSON.parse(realValueStr);
                    } else {
                        realValue = realValueStr;
                    }
                }
                if (realValue) {
                    $('#rightInfo_airport_odate').html(realValue.ODATE);
                    $('#rightInfo_airport_vis').html(realValue.VISCHN);
                    $('#rightInfo_airport_cloud').html(format.data('', realValue.N1CHN, ',') +
                        format.data('', realValue.N2CHN, ',') +
                        format.data('', realValue.N3CHN, ','));
                    $('#rightInfo_airport_tt').html(realValue.TTCHN);
                    $('#rightInfo_airport_pr').html(realValue.PRCHN);
                    var rwth = format.data('', realValue.WEATHER);
                    if (rwth == '无明显变化') rwth = '无';
                    $('#rightInfo_airport_wthc').html(rwth);
                    $('#rightInfo_airport_wind').html(realValue.WDCHN + " " + realValue.WSCHN);
                    //机场报文（实况/预报）
                    $('#rightInfo_airport_msgReal').html(format.data('', realValue.METAR));
                } else {
                    $('#rightInfo_airport_odate').html(format.data('', data.odate));
                    $('#rightInfo_airport_vis').html(format.vis(real.MIVIS));
                    $('#rightInfo_airport_cloud').html(format.data('', real.NH1, ',')
                        + format.data('', real.NH2, ',') + format.data('', real.NH3));
                    $('#rightInfo_airport_tt').html(format.tt(real.TT));
                    $('#rightInfo_airport_pr').html(format.pr(real.PR));
                    var rwth = format.data('', real.WTHC);
                    if (rwth == '无明显变化') rwth = '无';
                    $('#rightInfo_airport_wthc').html(rwth);
                    $('#rightInfo_airport_wind').html(format.wind(real.WD, real.WS));
                    //机场报文（实况/预报）
                    $('#rightInfo_airport_msgReal').html(format.data('', data.msg));
                }

                //预报
                var fcst = data.fcst && data.fcst.length >= 1 ? data.fcst[data.fcst.length - 1] : { fcst: {} };
                var time1 = '', time2 = '';
                if (fcst.TIME_BG) {
                    time1 = new Date(fcst.TIME_BG.split('-').join('/'));
                    time1 = time1.getDate() + '日' + time1.getHours() + '时';
                    if (fcst.TIME_ED) {
                        time2 = new Date(fcst.TIME_ED.split('-').join('/'));
                        time2 = time2.getDate() + '日' + time2.getHours() + '时';
                    }
                }

                $('#rightInfo_airport_ftime').html(format.data('', time1) + ' —— ' + format.data('', time2));
                $('#rightInfo_airport_fvis').html(format.vis(fcst.fcst.MIVIS));
                let cloudStr = '';
                if (fcst.fcst.CN1CHN) {
                    cloudStr += fcst.fcst.CN1CHN;
                    cloudStr += ',';
                }
                if (fcst.fcst.CN2CHN) {
                    cloudStr += fcst.fcst.CN2CHN;
                    cloudStr += ',';
                }
                if (fcst.fcst.CN3CHN) {
                    cloudStr += fcst.fcst.CN3CHN;
                    cloudStr += ',';
                }
                if (cloudStr.length > 0) {
                    cloudStr = cloudStr.substring(0, cloudStr.length - 1)
                }
                $('#rightInfo_airport_fcloud').html(cloudStr);
                // let tt = format.tt(fcst.fcst.MINAT) + '(' + fcst.fcst.MINAT_TIME?fcst.fcst.MINAT_TIME:'' + ')'
                //     + "~"
                //     + format.tt(fcst.fcst.MAXAT) + '(' + fcst.fcst.MAXAT_TIME?fcst.fcst.MAXAT_TIME:'' + ')';
                let tt = format.tt(fcst.fcst.MINAT) + "~" + format.tt(fcst.fcst.MAXAT);


                $('#rightInfo_airport_ftt').html(tt);
                // $('#rightInfo_airport_fpr').html(format.pr(fcst.fcst.PR));
                var fwth = format.data('', fcst.fcst.WTHC);
                if (fwth == '无明显变化') fwth = '无';
                $('#rightInfo_airport_fwthc').html(fwth);
                $('#rightInfo_airport_fwind').html(format.wind(fcst.fcst.WD, fcst.fcst.WS));
                $('#rightInfo_airport_tmsgchn').html(format.data('', fcst.FCSTMSGCHN));

                $('#rightInfo_airport_msgFcst').html(format.data('', fcst.msg));

            });
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
            }

            let url = XHW.config.datasource == 'ECMF' ? http.ecmfUrl : http.weatherUrl;
            let paramsURL = XHW.config.datasource == 'ECMF' ? '/ecmf' : '/gfs';
            paramsURL += '/timeprofiledata';
            hPas = XHW.config.datasource == 'ECMF' ? ecHPas : gfshPas;

            http.get(url, paramsURL, param, function (json) {
                profileOptions = undefined;
                if (json.data) {
                    $('#right_info_airport .listNav li').eq(2).show();
                    $('#right_info_airport .moduleDiv').eq(2).show();
                    profileOptions = buildProfileOptions(json.data, hPas, XHW.config.datasource, 'DANGER');
                } else {
                    $('#right_info_airport .listNav li').eq(2).hide();
                    $('#right_info_airport .moduleDiv').eq(2).hide();
                }
                udpateTimeProfileChart();
            }, function () {
                profileOptions = undefined;
                $('#right_info_airport .listNav li').eq(2).hide();
                $('#right_info_airport .moduleDiv').eq(2).hide();
                udpateTimeProfileChart();
            });
        }

        var profileOptions;
        var profileChart;
        function udpateTimeProfileChart() {
            let type = $('input:radio[name="airport_profileChart_multi_radio"]').parent('.current').children('input')[0];
            if (type) {
                type = type.value
                if (profileOptions && profileOptions.series) {
                    let series = profileOptions.series;
                    for (let index in series) {
                        series[index].visible = true;
                        if (series[index].key && series[index].key != type)
                            series[index].visible = false;
                    }
                }

                if (!profileChart) {
                    profileChart = new tool.ProfileChart({ left_axe: 'rightInfo_airport_crossL', right_content: 'rightInfo_airport_crossR' });
                }
                profileChart.resetData(profileOptions);
            }
        }

        /**
         * 绘制剖面图
         * @param {*} type 
         */
        function drawCrossSection(keys, data) {
            // var type= $('input:radio[name="rightInfo_multi_radio"]:checked').val();
            var canvasL = $('#rightInfo_airport_crossL');
            var canvasR = $('#rightInfo_airport_crossR');

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
                    var td = data[i][hPas[j]];
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

        /**
         * 查询最近城镇，获取强对流指数
         * @param {*} lng 
         * @param {*} lat 
         */
        function getStationCode(lng, lat) {
            // 'http://weather.xinhong.net/station/infofromlatlng?lat=' + lat + '&lng=' + lng
            var param = {
                lat: lat,
                lng: lng
            }
            http.get(http.weatherUrl, '/station/infofromlatlng', param, function (json) {
                if (json.data && json.data.stationCode) {
                    queryStationStrongConvective(json.data.stationCode);
                } else {
                    $('#right_info_airport .listNav li').eq(3).hide();
                    $('#right_info_airport .moduleDiv').eq(3).hide();
                }
            }, function () {
                $('#right_info_airport .listNav li').eq(3).hide();
                $('#right_info_airport .moduleDiv').eq(3).hide();
            })
        }

        /**
         * 查询强对流指数
         * @param {*} code 
         */
        function queryStationStrongConvective(code) {
            // http://weather.xinhong.net/stationdata_high/indexfromcode?code=
            var param = {
                code: code
            }
            http.get(http.weatherUrl, '/stationdata_high/indexfromcode', param, function (json) {
                setStrongConverctive(json.data);
            }, function () {
                $('#right_info_airport .listNav li').eq(3).hide();
                $('#right_info_airport .moduleDiv').eq(3).hide();
            })
        }

        /**
         * 设置/显示强对流指数
         * @param {*} data 
         */
        function setStrongConverctive(data) {
            if (!data) data = {};
            $('#rightInfo_airport_scSSI').html(format.data1('', data.SSI));
            $('#rightInfo_airport_scK').html(format.data1('', data.K));
            $('#rightInfo_airport_scSW').html(format.data1('', data.SW));
            $('#rightInfo_airport_scRI').html(format.data1('', data.RI8550));
            $('#rightInfo_airport_scCI').html(format.data1('', data.CI));
            $('#rightInfo_airport_scS53').html(format.data1('', data.WindShearWS5030));
            $('#rightInfo_airport_scD53').html(format.data1('', data.WindShearWD5030));
            $('#rightInfo_airport_scS73').html(format.data1('', data.WindShearWS7030));
            $('#rightInfo_airport_scD73').html(format.data1('', data.WindShearWD7030));
            $('#right_info_airport .listNav li').eq(3).show();
            $('#right_info_airport .moduleDiv').eq(3).show();
        }

        // function queryTLogP(myCode, name){
        //     // https://weather.xinhong.net/stationdata_high/tlogpimageurl?key=XXXXXXX&code=54511&cname=北京&month=12&day=25&year=2018&hour=14
        //     $.ajax({
        //         url:'https://weather.xinhong.net/stationdata_high/tlogpimageurl?code='+myCode + '&name=' + name,       //强对流指数
        //         dataType:'json',
        //         success:function(res){
        //             console.log(res);
        //             if(res.status_code == 0) {
        //                 var url = 'https://weather.xinhong.net' + res.data.url;
        //                 $('#station_tlogp').attr('src',url); 
        //             } else {
        //                 $('#station_tlogp').attr('src','img/data/nodata.jpg'); 
        //             }
        //         },
        //         error:function(){
        //         }
        //     })
        // }

        return {
            queryAirportInfo: queryAirportInfo,
            udpateTimeProfileChart:udpateTimeProfileChart
        }

    });
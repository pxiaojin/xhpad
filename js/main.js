require.config({
    baseUrl: "js/"
});

var XHW = { //xinhong Web服务总对象
    C: {},  //控制对象集合
    F: {},  //功能对象集合
    config: {}
};
function updateSigninStatus() {
    // 初始化状态
    if (XHW && XHW.usbKey && XHW.usbKey.desc) {
        $('#signin_message').css('color', 'red');
        if (XHW.usbKey.isConnect && XHW.usbKey.isIn)
            $('#signin_message').css('color', 'green');
        $('#signin_message').html(XHW.usbKey.desc);
    }
}

function loadConfig() {
    console.info("加载完成");
    // ol.control.FullScreen.requestFullScreen(document.body);
}

function getAddressBy(lng, lat, callBack, errorBack) {
    let requestParams = {
        key: 'a56115db7cbd4b278b677ef1c81a0cfc',
        location: lng + ',' + lat,
    };
    $.ajax({
        url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
        type: 'GET',
        data: requestParams,
        success: function (res) {
            if (!res) {
                console.info("返回结果undefined");
                errorBack ? errorBack(error) : null;
                return;
            }
            if (res.status == 0) {
                console.info("查询地址失败，info=" + res.info);
            }
            let address = res.regeocode.addressComponent.city + res.regeocode.addressComponent.district;
            if (callBack) {
                callBack(address);
            }
        },
        error: function (error) {
            errorBack ? errorBack(error) : null;
        }
    });
    // geocoder.getAddress([lng, lat],
    //     callBack ? callBack(status, result) : function (status, result) {
    //         if (status === 'complete' && result.regeocode) {
    //             var address = result.regeocode.formattedAddress;
    //             console.info(address);
    //         } else {
    //             console.error('根据经纬度查询地址失败')
    //         }
    //     });
}

function appendInfoToURL(url) {
    url = appendTokenToURL(url);
    return url;
}

function appendTokenToURL(url) {
    if (XHW && XHW.userInfo) {
        let token = {
            token: XHW.userInfo.token
        }
        return appendParamToURL(url, token)
    }
    return url;
}

function appendParamToURL(url, param) {
    if (url && param) {
        let paramString = '';
        for (let key in param) {
            paramString += key;
            paramString += '=';
            paramString += param[key];
            paramString += '&';
        }
        let pattern = /.*\?.*/;
        if (url.search(pattern) != -1) {
            url += '&' + paramString;
        } else {
            url += '?' + paramString;
        }
    }
    return url;
}

require([], function () {

    XHW.config.mapType = '影像图';
    XHW.config.isoline = {};
    XHW.config.isoline.colorMode = 'singleColor';
    XHW.config.datasource = 'ECMF';
    XHW.config.fullscreen = true;

    var date = new Date()
    XHW.time = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    }

    // //时间轴初始化
    // sliderBar.init(function(time) {
    //    var nTime = new Date(time);
    //    XHW.silderTime = {
    //        year : nTime.getFullYear(),
    // 	   month : nTime.getMonth() + 1,
    // 	   day: nTime.getDate(),
    // 	   hour: nTime.getHours(),
    //    };
    //    if(XHW.silderTime.month < 10) XHW.silderTime.month = '0' + XHW.silderTime.month;
    //    if(XHW.silderTime.day < 10) XHW.silderTime.day = '0' + XHW.silderTime.day;
    //    if(XHW.silderTime.hour < 10) XHW.silderTime.hour = '0' + XHW.silderTime.hour;
    // //    $('#timeShow').html(XHW.silderTime.year + '年' +XHW.silderTime.month + '月' +XHW.silderTime.day + '日' + XHW.silderTime.hour + '时');
    // });

    var time = timeBar.getRequestTime().split('-');
    $('#top_elem .cur_t_elem').html(time[0] + '年' + time[1] + '月' + time[2] + '日' + time[3] + '时');
    timeBar.addCallback(function () {
        var time = timeBar.getRequestTime().split('-');
        $('#top_elem .cur_t_elem').html(time[0] + '年' + time[1] + '月' + time[2] + '日' + time[3] + '时');
    });

    setInterval(function () {
        var date = new Date();

        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();

        if (hour && hour < 10) hour = '0' + hour;
        if (minute && minute < 10) minute = '0' + minute;
        if (second && second < 10) second = '0' + second;
        if(second == 0) second = '00'
        if(minute == 0) minute = '00'
        $('#timeNow').html(hour + ':' + minute + ':' + second)

    }, 1000);

    let fullScreen = new ol.control.FullScreen({ 'source': document.body });
    XHW.map = new ol.Map({
        target: 'map',
        // controls: [fullScreen],
        controls: ol.control.defaults({
            attribution: false,
            // rotate: false,
            zoom: false
        }),
        interactions: ol.interaction.defaults({
            pinchRotate: false,  //禁止手指旋转
        }),
        view: new ol.View({
            // center: ol.proj.transform([105.09, 36.25], 'EPSG:4326', 'EPSG:3857'),
            zoom: 5,
            minZoom: 3
        })
    });
    // fullScreen.on('change', function(){
    //     XHW.config.fullscreen = ol.control.FullScreen.isFullScreen();
    //     console.info("全屏显示：" + XHW.config.fullscreen);
    // });
    $('#moShiQieHuang span').click(function () {
        XHW.config.datasource = $(this).html();
        for (var key in XHW.F) {
            if (XHW.F[key])
                XHW.F[key].updateSource ? XHW.F[key].updateSource() : null;
        }
    });

    // extent.containsExtent （extent1，extent2）检查一个范围是否包含另一个范围
    // extent.getArea 获取范围的大小 
    // extent.getBottomLeft获取范围的左下角坐标
    // extent.getCenter 获取范围的中心坐标
    // getInteracting （）确定用户是否正在与视图进行交互，例如平移或缩放。
    // setTimeout(function(){
    //     var extent = XHW.map.getView().calculateExtent();   
    //     extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    //     var botleft = ol.extent.getBottomLeft(extent);
    //     var topright = ol.extent.getTopRight(extent);
    //     console.log(extent);
    //     console.log(botleft,topright);
    // },3000)



    var needInitial = true;
    XHW.initialFuncs = function () {
        if (needInitial) {
            loadHtmlPages();
            loadControllers();
            loadTools();
            loadConfig();
            needInitial = false;
        }
    };

    XHW.lockFuncs = function () {
        //登录
        $('#signin').load('signin.html');
        $('#gray,#signin').show();
    };

    XHW.unlockFuncs = function () {
        if (needInitial) {
            XHW.initialFuncs();
        }
        $('#gray,#signin').stop().fadeOut(300);
    };

    XHW.updatePassword = function () {
        //登录
        $('#signin').load('passChange.html');
    };

    require(['Function/tool/meteo-math'], function () {
    });

    function loadHtmlPages() {
        $('#tool_configure').load('tool_config.html', function () {
            // 初始化滚动条样式
            scrollFun();
            //加载js
            toolConfig();
            //移动
            dragPanelMove('.PeiZhiPanel .top', '.PeiZhiPanel');
        });
        //航空剖面
        $('#botPanelHangKongDiv').load('botPanelHangKong.html', function () {
            // 初始化滚动条样式
            $("#botPanelHangKongDiv .content").mCustomScrollbar({
                axis: "x"
            });
            $("#botPanelHangKongDiv .contenty").mCustomScrollbar({
                axis: "y"
            });
            //加载js
            botPanelHangKong();

            $(window).resize(function (event) {
                botHangKongLeftWidth();
            });
        });
        //海洋航线底部面板
        $('#botPanelHaiYangDiv').load('botPanelHaiYang.html', function () {
            // 初始化滚动条样式
            scrollFun();
            //加载js
            botPanelHaiYang();
        });

        //下载
        $('#downloadDiv').load('download.html', function () {
            dragPanelMove("#downTit", "#moveBar");
        });
    }


    function loadControllers() {
        var color = '#' + Math.random().toString(16).substr(-6);
        let xbVector = new ol.layer.Vector({
            source: new ol.source.Vector({
                projection: 'EPSG:4326',
                url: './resources/geojson/China.json',
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({ //边界样式
                    color: color,
                    width: 2
                }),
            })
        });
        xbVector.setZIndex(10);
        // XHW.map.getLayers().insertAt(1, xbVector);
        require(['Controller/MapTiles',
            'Controller/Http',
            'Controller/MouseMoveAtFeature',
            'Controller/MapClick',
            'Controller/MapMove',
            'Controller/LayerControl',
            'Controller/layout',
            'Controller/MyConsole'], function (tile, http, m, click, move, l, layout, c) {

                //-----------------地图瓦片功能
                XHW.C.tile = tile;
                //------------网络请求
                XHW.C.http = http;
                //--------加载鼠标指向目标的监听
                XHW.C.mouse = m;
                //--------地图点击事件
                XHW.C.mapclick = click;
                //--------加载地图拖动/缩放的监听
                XHW.C.MapMove = move;
                //------------图层控制
                XHW.C.layerC = l;
                //-------------布局交互
                XHW.C.layout = layout;
                //--------------消息提示
                XHW.C.console = c;

                requireXHWF();
            });
    }

    //=============================功能部分========================================
    function requireXHWF() {
        // require(['Function/FunctionCtrl'], function(functionCtrl){
        //     XHW.F.functionCtrl = functionCtrl;
        // });
        require([
            'Function/point/Point',
            'Function/live/live',
            // // 'Function/gfs/gfs',
            // // 'Function/ecmf/ecmf',
            'Function/numberFC/NumberFCCtrl',
            'Function/CloudMap',
            'Function/RadarMap',
            'Function/Typhoon',
            'Function/Sea/Sea',
            // 'Function/FlashFeature',
            'Function/state/state',
            'Function/wea_warn/warn',
        // ], function(point, live, numberFC, cm, rm, t, sea, flashWarning, state,warn){
        ], function(point, live, numberFC, cm, rm, t, sea, state, warn){
            // -----------加载单点及多点功能
            point.init();
            XHW.F.point = point;
            //------------加载实况功能
            live.init();
            XHW.F.live = live;
            // // //------------加载GFS功能（模式）
            // // gfs.init();
            // // XHW.F.gfs = gfs;
            // // //------------加载ecmf功能（模式）
            // // ecmf.init();
            // // XHW.F.ecmf = ecmf;
            XHW.F.numberFC = numberFC;
            //------------加载卫星云图
            cm.init();
            XHW.F.cloud = cm;
            //------------加载雷达图
            // rm.init();
            rm.inits();
            XHW.F.radar = rm;
            //-----------加载台风功能
            XHW.F.typhoon = t;
            //-----------加载海洋功能
            sea.init();
            XHW.F.sea = sea;

            XHW.F.state = state;

            // XHW.F.flashWarning = flashWarning;

            //-----------功能加载完毕 默认开启
            // 20190603 合并为“智能预警”
            // require(['Function/RealWarning'], function(realWarning){
            //     XHW.F.realWarning = realWarning;
            // });
            // require(['Function/ForecastWarning'], function(forecastWarning){
            //     XHW.F.forecastWarning = forecastWarning;
            // });
            // require(['Function/WeatherWarning'], function(weatherWarning){
            //     XHW.F.weatherWarning = weatherWarning;
            // });

            warn.init();
            XHW.F.warn = warn;

            require(['Function/RadarWindow'], function (radarWindow) {
                XHW.F.radarWindow = radarWindow;
            });

            DB();
        });
    }
    // loadKeyValidate();
    // XHW.lockFuncs();
    XHW.unlockFuncs();

    //-------------------默认开启的功能
    function DB() {
        require(['Function/DB/DB'], function () { });
        require(['Function/DB/guanz'], function (gz) { });
    }

    function loadTools() {
        // //------------测距
        // require(['Function/tool/rang'], function(measure){
        //     XHW.F.measure = measure;
        // });
        // //------------下载数据
        // require(['Function/tool/downData'], function(downloadData){
        //     XHW.F.downloadData = downloadData;
        // });
        // // 保存地图与打印
        // require(['Function/tool/fileSaveMap'], function(){
        // });

        $("#top_delall").click(function () {
            for (let key in XHW.F) {
                closeFunction(XHW.F[key]);
            }
            XHW.F.radar.closeRadarSingle();
            $('#tog_time').hide();
            // $('.botPanelHangKong').hide();
            $('.botPanelhaiYang').hide();
            $('.single_search').hide();
            $('.bottompanel').hide();
            $('.bottompanel_air').hide();
            $('#hq_pop').hide();
            $('.airRouteList').hide();
            $('.airRoute_pop').hide();
            $('.airRoutePar_pop').hide();
            $('.civilRouteList').hide();
            $('.airRouteBtn').hide();
            $('#moShiQieHuang').hide();
            $('#showTuLi').children().hide();
            // 菜单样式清除
            $('.leftMain').removeClass('active');
            $('.erjiMenu').hide();
        });

        // $('.leftMain ul .erJiUl .erJiBtn, #real_halfHour_wea, #typhoon_button, #bt_multi').on('click',function(){
        $('.leftMain').on('touchstart', '.mainBtn', function (e) {
            var state = $('#tuCengDieJia span.current').html();
            // if(state == '覆盖'){
            for (let key in XHW.F) {
                closeFunction(XHW.F[key]);
            }
            XHW.F.radar.closeRadarSingle();
            $('#tog_time').hide();
            // $('.botPanelHangKong').hide();
            $('.botPanelhaiYang').hide();
            $('.single_search').hide();
            $('.bottompanel').hide();
            $('.bottompanel_air').hide();
            $('#hq_pop').hide();
            $('.airRouteList').hide();
            $('.airRoute_pop').hide();
            $('.airRoutePar_pop').hide();
            $('.civilRouteList').hide();
            $('.airRouteBtn').hide();
            XHW.C.layout.judgeWhetherSelect($(this));
            // }
            if ($(this).children('p').html() == '天气态势' || $(this).children('p').html() == '威胁指数' || $(this).children('p').html() == '天气预警' || $(this).children('p').html() == '位置天气') {
                $('#moShiQieHuang').show();
            } else {
                $('#moShiQieHuang').hide();
            }
            $('#showTuLi').children().hide();
        })
    }

    function closeFunction(func) {
        if (func
            && func.close) {
            func.close();
        }
    }
});
//单点鼠标操作事件
define(['Function/point/StationInfo',
        'Function/point/SingleInfo',
        'Function/point/SeaSurfaceInfo',
        'Function/point/SeaBadInfo',
        'Controller/DataFormat',
        'Function/Search'], function(stationInfo, singleInfo, seaSurfaceInfo, seaBadInfo, format,search) {
    var popup;              //单点及多点弹窗基础布局
    var popupId;
    var overlay;            //地图弹窗对象
    var nLnglat;             //当前弹窗所指向的经纬度
    var layer;
    function init(){
        popupId = 'popup_single';
        popup = '<div class="singlePoint singlePointHai" id="' + popupId + '">' + 
                    '<img src="img/layout/anchor.png" />' +
                    '<div class="singlePointDiv">' +
                    '</div>' +
                '</div>';
        //时间轴变化监听
        timeBar.addCallback(function(){
            if(overlay) {
                //更新弹窗数据
                XHW.map.removeOverlay(overlay);
                overlay = null;
                showPopup(nLnglat);
            }
        });
        $('#dotSwitch').click(function(event) {
            $(this).children().toggleClass('current');           
        });
        $('.posi_wea .panelCancel').click(function(){
            $('.bottompanel').hide();
        })

        var user_lonlat = $('#signResult').html();
        user_lonlat = user_lonlat == '' ? ['39.93','116.28'] : user_lonlat.split(',');
        var choose_site = [Number(user_lonlat[1]),Number(user_lonlat[0])];
        // singleInfo.querySingleInfo(choose_site);
        
        // XHW.C.mapclick.addCallback('map', function(lnglat){
        //     choose_site = lnglat;
        //     $('.bottompanel').css("height","auto")
        //     // 城镇天气点击
        //     if($('#city_station').hasClass('active')){
        //         recentCity(lnglat);
        //     }else{
        //         $('#popup_single').hide();
        //     }

        //     var locaUrl = 'https://restapi.amap.com/v3/geocode/regeo?output=json&location='+lnglat[0]+','+lnglat[1]+'&key=c34a51e340c6403a1f248b650fbb7052&radius=1000&extensions=all'
        //     $.ajax({
        //         type: "GET",
        //         url: locaUrl,
        //         dataType: "json",
        //         success: function (data) {
        //             var posName = data.regeocode.addressComponent;
        //             posName = posName.township ? posName.township :
        //                         posName.district ? posName.district :
        //                             posName.city ? posName.city : posName.province;

                    
        //             //  显示位置点的名字
        //             drawMark(lnglat,posName)
        //         }
        //     })

        //      // 位置天气点击
        //      if($('#pos_mixedGraph').hasClass('active')){
        //         singleInfo.querySingleInfo(lnglat);
        //         if(layer)layer.setVisible(true);
        //     }else{
        //         $('#popup_single').hide();
        //         if(layer)
        //         layer.setVisible(false);
        //     }
        // })

        $('.pos_time_profile .checkboxDiv .tog_pic').click(function(){
            $('.pos_time_profile').hide();
            $('.posi_wea .curve').show();
            singleInfo.querySingleInfo(choose_site);
        })
        $('.posi_wea .curve .togbtn').click(function(){
            $('.pos_time_profile').show();
            $('.posi_wea .curve').hide();
            singleInfo.querySingleInfo(choose_site);
        });
    }

    init();

    /**
     * 点击地图后触发，显示地图弹窗
     * @param {*} lnglat 当前点经纬度
     */
    function showPopup(lnglat){
        //--------------------获取弹窗内容（多点弹窗隐藏状态为获取普通弹窗，多点弹窗显示则表示多点选取开启，显示添加点弹窗
        var html = getWeatherPopup(lnglat);
        //--------创建弹窗布局
        $('body').append(popup);
        //--------创建地图弹窗对象
        $('#' + popupId).children('.singlePointDiv').html(html);
        var container = document.getElementById(popupId);
        overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
            element: container,
            autoPan: true,
            position: ol.proj.fromLonLat(lnglat),     //--------设置弹窗位置  值为marker位置
            positioning: 'bottom-left',         //--------默认左下角（设置下方居中无效，依靠样式自己设置）
            autoPanAnimation: {
                duration: 250   //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度. 单位为毫秒（ms）
            }
        }));
        //-------打开弹窗
        XHW.map.addOverlay(overlay);
        //-----------记录当前弹窗指向的经纬度
        nLnglat = lnglat;
        //------------添加单点点击事件
        $('#' + popupId).children('.singlePointDiv').children().eq(0).click(function(){
            singleInfo.querySingleInfo(nLnglat);
        });
        //----------------------------------popup指向事件
        $(".singlePointDiv").children().mouseover(function(){
            $(this).addClass('current');
        });
        $(".singlePointDiv").children().mouseout(function(){
            $(this).removeClass('current');
        });
    }

    /**
     * 获取单点状态弹窗
     * @param {*} lnglat 当前点经纬度
     */
    function getWeatherPopup(lnglat){
        //step1------------判断是否为海洋，如果是海洋，则显示获取海洋数据按钮
        // http://ocean.xinhong.net:81/tools/isOcean?lat=39&lng=116
        var param = {
            lng: lnglat[0],
            lat: lnglat[1]
        }
        XHW.C.http.get(XHW.C.http.oceanUrl, '/tools/isOcean', param, function(json){

        }, function(json){
            if(json.landtype == 'ocean') {
                showOcean();
            } else {
                showLand();
            }
        });
        //step2------------显示弹窗
        lnglat = format.lnglat(lnglat[0], lnglat[1]);
        return '<p class="singlePointjwd haiYang">' + lnglat + '</p>';
    }

    /**
     * 显示海洋窗口
     */
    function showOcean(){
        var html = '<p class="haiYang">海表</p>' +
                    '<p class="singlePointcs">海洋水文预报</p>';
        $('#' + popupId).children('.singlePointDiv').append(html);
        $('#' + popupId).children('.singlePointDiv').children().eq(1).click(function(){
            //海面
            seaSurfaceInfo.querySeaSurfInfo(nLnglat);
        });
        $('#' + popupId).children('.singlePointDiv').children().eq(2).click(function(){
            //水下
            seaBadInfo.querySeaBadInfo(nLnglat);
        });
        //----------------------------------popup指向事件
        $(".singlePointDiv").children().mouseover(function(){
            $(this).addClass('current');
        });
        $(".singlePointDiv").children().mouseout(function(){
            $(this).removeClass('current');
        });
        showOceanInfo();
    }

    /**
     * 显示实况部分数据
     */
    function showOceanInfo(){
        // var time = XHW.silderTime;
        if(!nLnglat) return;
        // var param = {
        //     lng: nLnglat[0],
        //     lat: nLnglat[1],
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
            lng:nLnglat[0],
            lat:nLnglat[1],
            year: year,
            month: month,
            day: day,
            hour: hour
        }
        XHW.C.http.get(XHW.C.http.oceanUrl, '/hy1Suo/timeprofiledata/', param, function(json){
            //-----------------------整理数据
            var data = json.data.profiledatas[0]['1'];
            var ws = Math.sqrt(data[8] * data[8] + data[9] * data[9]);
            ws = ((ws * 10) >> 0) / 10;
            var wd = 270.0 - Math.atan2(data[9], data[8]) * 180.0 / Math.PI;
            wd = wd >= 360 ? wd - 360 : wd;
            wd = ((wd * 10) >> 0) / 10;
            var waveD = data[4];
            var waveS = data[6];

            $('#' + popupId).children('.singlePointDiv').children().eq(1).html(' 风:' + format.wind(wd, ws) + ' 浪:' 
                        + format.data1('', waveD,'°') + ' ' + format.data1('', waveS, 'm'));
        });
    }

    /**
     * 显示陆地窗口
     */
    function showLand(){
        var html = '<p class="singlePointcs"></p>';
        $('#' + popupId).children('.singlePointDiv').append(html);
        recentCity();
    }

    /**
     * 获取最近城市
     */
    function recentCity(lnglat){
        // http://weather.xinhong.net/station/infofromlatlng?lat=34&lng=112
        var param = {
            // lng: nLnglat[0],
            // lat: nLnglat[1]
            lng: lnglat[0],
            lat: lnglat[1]
        }
        XHW.C.http.get(XHW.C.http.imgUrl, '/station/infofromlatlng', param, function(json){
            // $('#' + popupId).children('.singlePointDiv').children().eq(1).show();
            var name = json.data.cname ? json.data.cname : json.data.ename;
            name = name && name != '' ? name : json.data.stationCode;
            // $('#' + popupId).children('.singlePointDiv').children().eq(1).html(name);
            // $('#' + popupId).children('.singlePointDiv').children().eq(1).click(function(){
            //     stationInfo.queryStationInfo(json.data.stationCode, json.data.cname);
            // })
            // $('#cityName').html(name)
            stationInfo.queryStationInfo(json.data.stationCode, json.data.cname)
            //----------------------------------popup指向事件
            // $(".singlePointDiv").children().mouseover(function(){
            //     $(this).addClass('current');
            // });
            // $(".singlePointDiv").children().mouseout(function(){
            //     $(this).removeClass('current');
            // });

            //-------------------显示城市基础数据
            // var time = XHW.silderTime;
            // function toTwo(time){
            //     time = time+'';
            //     return time.length < 2 ? "0"+time : time;
            // }
            // var time = new Date();
            // var year = time.getFullYear();
            // var month = toTwo(time.getMonth() + 1);
            // var day = toTwo(time.getDate());
            // var hour = toTwo(time.getHours());
            // param = {
            //     code: json.data.stationCode,
            //     year: year,
            //     month: month,
            //     day: day,
            //     hour: hour
            // };
            // XHW.C.http.get(XHW.C.http.imgUrl, '/stationdata_surf/datafromcode', param, function(json){
            //     //-------------------------气象信息
            //     var data = json.data;
            //     //---------天气数据
            //     $('#' + popupId).children('.singlePointDiv').children().eq(1).append(' ' + format.tt(data.TT));
            //     $('#' + popupId).children('.singlePointDiv').children().eq(1).append(' 风:' + format.wind(data.WD, data.WS));
            // })
        }, function(json){
            // $('#' + popupId).children('.singlePointDiv').children().eq(1).hide();
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

    /**
     * 弹窗按钮点击事件
     * @param {*} event
     */
    function buttonEvent(event, value){
        switch(event){
            case 'high': highData(); break;
            case 'sea': seaData(); break;
            case '': break;
            case '': break;
            case '': break;
        }
        removePopup();
    }

    /**
     * 显示高空数据
     */
    function highData(){}

    /**
     * 显示海洋数据
     */
    function seaData(){}

    /**
     * 隐藏弹窗
     */
    function removePopup(){
        if(overlay) {
            XHW.map.removeOverlay(overlay);
            overlay = null;
            nLnglat = null;
        }
    }

    //  用户定位
    function drawMark(lnglat,name){
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(lnglat))
        });
        marker.setStyle(new ol.style.Style({
            // image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            //     crossOrigin: 'anonymous',
            //     src: user_pos.img,
            //     scale: 0.7,
            // })),
            text: new ol.style.Text({
                text: name,
                font: '18px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                // offsetY: 20
            })
        }));
        let source = new ol.source.Vector({
            features: [marker]
        });

        if (!layer) {
            layer = new ol.layer.Vector({

            });
            layer.setZIndex(15);
            layer.id = 'single_name';
        }
        layer.setSource(source);

        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
            XHW.map.addLayer(layer);
    }

    return {
        buttonEvent: buttonEvent
    }
});
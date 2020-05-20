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
    function init(){
        popupId = 'popup_single';
        popup = '<div class="singlePoint singlePointHai" id="' + popupId + '">' + 
                    '<img src="img/layout/anchor.png" />' +
                    '<div class="singlePointDiv">' +
                    '</div>' +
                '</div>';
        //时间轴变化监听
        // sliderBar.addCallback(function(){
        //     if(overlay) {
        //         //更新弹窗数据
        //         XHW.map.removeOverlay(overlay);
        //         overlay = null;
        //         showPopup(nLnglat);
        //     }
        // });
        $('#dotSwitch').click(function(event) {
            $(this).children().toggleClass('current');           
        });
        
        XHW.C.mapclick.addCallback('map', function(lnglat){
            if($('#posi').hasClass('active') && $('#menu_posi_wea').hasClass('active')){
                if(overlay) {          //判断当前是否有弹窗显示
                    removePopup();      //有弹窗显示时关闭弹窗
                    return;
                }
                // if($('#meteo_station').parent().hasClass('current')) return;
                // if($('#meteo_airport').parent().hasClass('current')) return;
                if($('#bt_multi').parent().hasClass('current')) return;
                //------------------没有弹窗显示 并且 没有其他地图交互功能开启时 显示弹窗
                showPopup(lnglat);  
                $('#moShiQieHuang').show();
            }else{
                $('#popup_single').hide();
                if(!$('#multi_select li').hasClass('currenterJiBtn') && !$('#meteo_station').parent().hasClass('current') && !$('#meteo_airport').parent().hasClass('current') && !$('#shuzhiyubao li').hasClass('currenterJiBtn')){
                    $('#moShiQieHuang').hide();
                }else{
                    $('#moShiQieHuang').show();
                }
            }
        })

        // 点击  显隐单站搜索框
        $('#singleStation').click(function(){
            $('.single_search').slideToggle(300);
        })

        $('.single_search .sigsearch_sub').click(function(){
            var single_lng = $('.sin_lng').val();
            var single_lat = $('.sin_lat').val();

            if(!single_lng || !single_lat){
                alert('经纬度信息不全');
                return;
            }           

            if(!Number(single_lng) || !Number(single_lat)){
                alert('经纬度只能输入数字和一个小数点');
                return;
            }

            single_lat = parseFloat(single_lat);
            single_lng = parseFloat(single_lng);
            if(-180 <= single_lng && single_lng<= 180 && -90 <= single_lat && single_lat<= 90){
                search.viewAnimate(single_lng,single_lat);
                singleInfo.querySingleInfo([single_lng,single_lat]);
            }else{
                alert('经纬度超出范围')
            }
        })

        $('#meteo_station').click(function(){
            if(overlay) removePopup();
        });

        $('#meteo_airport').click(function(){
            if(overlay) removePopup();
        });

        $('#bt_multi').click(function(){
            if(overlay) removePopup();
        });

        $('.layout_tab').click(function(){
            if(overlay) removePopup();
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
        function toTwo(time){
            time = time+'';
            return time.length < 2 ? "0"+time : time;
        }
        var time = new Date();
        var year = time.getFullYear();
        var month = toTwo(time.getMonth() + 1);
        var day = toTwo(time.getDate());
        var hour = toTwo(time.getHours());
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
    function recentCity(){
        // http://weather.xinhong.net/station/infofromlatlng?lat=34&lng=112
        var param = {
            lng: nLnglat[0],
            lat: nLnglat[1]
        }
        XHW.C.http.get(XHW.C.http.imgUrl, '/station/infofromlatlng', param, function(json){
            $('#' + popupId).children('.singlePointDiv').children().eq(1).show();
            var name = json.data.cname ? json.data.cname : json.data.ename;
            name = name && name != '' ? name : json.data.stationCode;
            $('#' + popupId).children('.singlePointDiv').children().eq(1).html(name);
            $('#' + popupId).children('.singlePointDiv').children().eq(1).click(function(){
                stationInfo.queryStationInfo(json.data.stationCode, json.data.cname);
            })
            //----------------------------------popup指向事件
            $(".singlePointDiv").children().mouseover(function(){
                $(this).addClass('current');
            });
            $(".singlePointDiv").children().mouseout(function(){
                $(this).removeClass('current');
            });

            //-------------------显示城市基础数据
            // var time = XHW.silderTime;
            function toTwo(time){
                time = time+'';
                return time.length < 2 ? "0"+time : time;
            }
            var time = new Date();
            var year = time.getFullYear();
            var month = toTwo(time.getMonth() + 1);
            var day = toTwo(time.getDate());
            var hour = toTwo(time.getHours());
            param = {
                code: json.data.stationCode,
                year: year,
                month: month,
                day: day,
                hour: hour
            };
            XHW.C.http.get(XHW.C.http.imgUrl, '/stationdata_surf/datafromcode', param, function(json){
                //-------------------------气象信息
                var data = json.data;
                //---------天气数据
                $('#' + popupId).children('.singlePointDiv').children().eq(1).append(' ' + format.tt(data.TT));
                $('#' + popupId).children('.singlePointDiv').children().eq(1).append(' 风:' + format.wind(data.WD, data.WS));
            })
        }, function(json){
            $('#' + popupId).children('.singlePointDiv').children().eq(1).hide();
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

    return {
        buttonEvent: buttonEvent 
    }
});
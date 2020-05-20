//站点 城市 气象数据
define(['Function/point/AirportInfo', 'Controller/DataFormat',
'Function/point/custom_route',
    'Function/point/civil_route',
    'Function/Search'], function(airportInfo, format, cus_route,civil_route,search) {
    var key;
    var type;
    var legend;
    var item;

    var button;     //功能开关按钮
    // var select;  // 2019-06-03 只保留使用“盲降”
    var isOpen = false;
    var layer;      //功能图层
    var data;       //机场气象数据（按分级记录，站点、站名、经纬度、天气信息）
    var airport_runway;     //机场跑道方向数据

    function init(){
        //----------------设置功能按钮及点击事件
        button = $('#meteo_airport');
        button.on('click', function(){
            if(!isOpen) {
                button.children('span').addClass('current');
                // button.css('background','rgb(45, 129, 236, 0.8)');
                $('.botPanelHangKong').hide();
                open();
            //     XHW.C.layout.judgeWhetherSelect(button);
            } else {
                button.children('span').removeClass('current');
                // button.css('background','rgb(0, 0, 0, 0.5)');
                close();
                // XHW.C.layout.judgeWhetherSelect(button);
            }
        });

          //   航线
        $('#aviation').click(function(){
            button.children('span').addClass('current');
            // button.css('background','rgb(45, 129, 236, 0.8)');
            // $('#multi_select').css('background','rgb(0, 0, 0, 0.5)');
            $('#multi_select').children('span').removeClass('current');
            open();
        })

        $('.bottompanel_air .panelCancel').click(function(){
            $('.bottompanel_air').hide();
        })

        //------------------获取机场跑道方向数据
        load_airport_runway();

        //时间轴变化监听
        timeBar.addCallback(function(){
           if(button.parent().hasClass('current')) 
               getData();
        });

        type = key = 'airport';
        legend = '<ul class="jichangUl">' + 
                '<li><img src="img/airport/airport_runway_error.png" width="15" alt="" /><span>不适航</span></li>' +
                '<li><img src="img/airport/airport_runway_gray.png" width="15" alt="" /><span>正常</span></li>' +
                '<li><img src="img/airport/airport_runway_yellow.png" width="15" alt="" /><span>能见度低</span></li>' +
                // '<li><img src="img/airport/airport_runway_red.png" width="15" alt="" /><span>雷暴</span></li>' +
                '<li><img src="img/airport/airport_runway_delay.png" width="15" alt="" /><span>缺报</span></li>' +
                '<li><img src="img/airport/airport_runway_brown.png" width="15" alt="" /><span>烟尘、沙尘、风暴</span></li>' +
                '<li><img src="img/airport/airport_runway_green.png" width="15" alt="" /><span>雨、雪、地面凝结、吹雪、积雪</span></li>' +
                '</ul>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })

        //------------鼠标指向marker的监听
        // XHW.C.mouse.addCallback(type, function(value){
        //     return getPopupHtml(value);
        // });

        XHW.C.mapclick.addCallback(type, function(value){
            //  闪烁图标
            search.viewAnimate(Number(value.lng), Number(value.lat));
            $('.botPanelHangKong').hide();
            //后续添加机场条件不满足数据
            airportInfo.queryAirportInfo(value.code, value.time, value.weather, value.realValue);
        })
    }

    init();

    function getData(){
        /**
         * step1 获取机场降落条件气象数据
         * http://weather.xinhong.net/airportdata_surf/sigmentdataindexslevel
         */
        $.ajax({
            type: "POST",
            //端口 7019 or 7029
            url: appendInfoToURL("http://ocean.xinhong.net:7019/airportStatus"),
            contentType: "application/json",
            // async: false,
            data: JSON.stringify({type:"airworth"}),
            success: function (res) {             
                
                /**
                 * step2 获取机场报文气象数据
                 * http://weather.xinhong.net/airportdata_surf/sigmentdataindexslevel
                 */
                XHW.C.http.http('/airportdata_surf/sigmentdataindexslevel', '', function(data, time){
                    time = format.jsonDate(time.substr(0, 10) + '00');
                    item.htmlLayer = time[0] + ' 机场天气实况';
                    XHW.C.layerC.updateLayerData(key, item);
                    collating(data, res.data)
                },function(){
                    let time = XHW.silderTime;
                    item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 机场天气实况' + '(无数据)';
                    XHW.C.layerC.updateLayerData(key, item);
                })
            },
            error: function (message) {
                
            },
            dataType:"json"
        }); 

        
    }

    /**
     * 整理数据
     * @param {*} rawData 
     * @param {*} wData 
     */
    function collating(rawData, wData){
        data = {};
        // for(var key in rawData) {
        for(var i = 0; i < rawData.length; i++){
            // ZYYJ_20190112140000_NONE_129.45_42.882_延吉/朝阳川_2
            // var keys = rawData[key].split('_');
            var keys = rawData[i].split('_');
            data[keys[0]] = {       //四字码
                time:keys[1],       //时间
                weather:keys[2],    //天气条件
                lng:keys[3],        //经度
                lat:keys[4],        //维度
                name:keys[5],       //机场名
                level:keys[6],      //分级
                ILS:wData['ILS']?wData['ILS'][keys[0]]:0,             //盲降
                NDB:wData['NDB']?wData['NDB'][keys[0]]:0,             //NDB条件
                VF:wData['VF']?wData['VF'][keys[0]]:0               //目视条件
            }
            
        }

        drawStationMarkers();
    }

    /**
     * 显示城镇气象信息
     */
    function drawStationMarkers(){
        var elem = 'ILS'; // 盲降 //select.val();
        var level = 7;      //获取显示层级（目前不分层级，全部显示）
        var markers = [];
        for(var key in data) {
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[key].lng), parseFloat(data[key].lat)]))
            });

            marker.type = type;
            marker.value = {
                code: key,
                name: data[key].name,
                lng: data[key].lng,
                lat: data[key].lat,
                time: data[key].time,
                weather: data[key].weather,
                realValue: data[key].ILS?data[key].ILS.status:
                            data[key].NDB?data[key].NDB.status:
                            data[key].VF?data[key].VF.status:undefined,
                error:''
            };
            let odate = undefined;//2019-06-18 13:00
            if(data[key][elem]) {
                if(data[key][elem].status){
                    if (data[key][elem].status == "适航") {
                        marker.value.error = '';
                    } else {
                        if(typeof(data[key][elem].status) == 'string') {
                            data[key][elem].status =  $.parseJSON(data[key][elem].status);
                        }
                        if(data[key][elem].status['CODE'] == "适航") {
                            marker.value.error = '';
                        } else {
                            marker.value.error = data[key][elem].status['CODE'];
                        }
                    }
                    odate = data[key][elem].status['ODATE']
                }
            }
            var wea , vis;
            if(data[key][elem]){
                wea = data[key][elem].status['WEATHER'];
                vis = data[key][elem].status['VISCHN'].split('米')[0];
            }else{
                wea = null;
                vis = null;
            }
            // var url = colorair(data[key].weather, data[key][elem]);
            // 返回结果为： [colorURI, statusCODE]
            // statusCODE == 1 为适航或者''
            var url = colorair(wea, vis, data[key][elem]);
            // url[1] = url[1] == -1 ? 0 : getRunway(key);
            let runway = getRunway(key);
            
            if (key == 'RORS') {
                console.info();
            }
            let delayURI = 'delay';
            if (odate){
                let odateTime = new Date(
                    odate.substring(0, 4), 
                    parseInt(odate.substring(5, 7)) - 1,
                    odate.substring(8, 10),
                    odate.substring(11, 13),
                    odate.substring(14, 16)).getTime();
                if (new Date().getTime() - odateTime < 1.5*60*60*1000) { //延迟时间时间在1.5小时内算有效
                    delayURI = null;
                }
            } else {
                if(data[key].time) {
                    let odateTime = new Date(
                        data[key].time.substring(0, 4), 
                        parseInt(data[key].time.substring(4, 6)) - 1,
                        data[key].time.substring(6, 8),
                        data[key].time.substring(8, 10),
                        data[key].time.substring(10, 12)).getTime();
                    if (new Date().getTime() - odateTime < 1.5*60*60*1000) { //延迟时间时间在1.5小时内算有效
                        delayURI = null;
                    }
                }
            }

            var airport_runway_url = 'img/airport/airport_runway_' + url[0] + '.png';
            if (!runway || runway == 0 || runway == 999) { // 无跑道方向
                airport_runway_url= 'img/airport/airport_' + url[0] + '.png';
            }
            if (delayURI) {
                airport_runway_url= 'img/airport/airport_runway_' + delayURI + '.png';
            }
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: airport_runway_url,
                    scale: 0.2,
                    rotation: runway
                })),                                          
            }));

            markers.push(marker);
        }

        //step6------------------将所有marker加入同一个图层
        let source = new ol.source.Vector({
            features: markers
        });

        if (!layer) {
            layer = new ol.layer.Vector({
            
            });
            layer.setZIndex(15);
            layer.id = type;
        }
        layer.setSource(source);
        
        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layer);
        if(!isOpen) {
            close();
        }
    }

    /**
     * 根据气象数据判断机场是否适合降落
     * @param {*} weather 
     * @param {*} land 
     */
    function colorair(wea,vis,land) {       
        var color = null;   
        var r = 0;
        if(land) {
            if(land.status['CODE'] == '适航' || land.status['CODE'] == '') {
                // color = getColorStr(weather);
                color = getWeaColor(wea,vis);
                r = 1;
            } else {
                color = 'error';
                r = -1;
            }
        }
        
        if(color==null){
            // color = 'gray';
            // color = getColorStr(weather);
            color = getWeaColor(wea,vis);
            r = 1;
        };
        return [color, r];    
    };
 
    /**
     * 根据气象数据获取机场图标
     * @param {*} weather 
     */
    // function getColorStr(weather) {
    //     if (weather == 'SOOT'){
    //         return 'brown';
    //     } else if (weather == 'FOG') {
    //         return 'yellow';
    //     } else if (weather == '-RAIN') {
    //         return 'green';
    //     } else if (weather == 'THUNDER') {
    //         return 'red';
    //     }  else {
    //         return 'gray';
    //     }
    // }

    function getWeaColor(wea,vis){ 
        if(wea == undefined) {
            return 'gray';
        }else{
            if(wea.indexOf('雾') == 0 || wea.indexOf('霾') != -1){
                return 'yellow';
            }else if(wea.indexOf('沙') != -1 || wea.indexOf('尘') != -1 || wea.indexOf('烟') != -1){
                return 'brown';
            }else if(wea.indexOf('雷') != -1 || wea.indexOf('雹') != -1){
                return 'red';
            }else if(wea.indexOf('雨') != -1){
                return 'green';
            }else{
                return 'gray';
            }
        }
    }

    /**
     * 
     * @param {*} icao4 
     */
    function getRunway(icao4) {
        if (airport_runway == undefined){
            return 0;
        }
        var runway = airport_runway[icao4];
        return runway;
    }

    /**
     * 加载机场跑道方向数据
     */
    function load_airport_runway(){
        $.ajaxSetup({
            async : false
        });
        $.ajax({
            type: "GET",
            url: "js/Function/point/airport_runway.js",
            dataType: "json",
            sync: false,
            success: function (data) {
                airport_runway = data;
            },
            error: function () {

            }
        });
        $.ajaxSetup({
            async : true
        });
    }

    /**
     * 根据值返回浮动框
     * @param {*} value 
     */
    function getPopupHtml(value){
        var lng = value['lng'];
        var lat = value['lat'];
        var name = value['name'];
        var station = value['code'];
        var error = value['error'];
        name = format.airportName(name);
        var html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                        + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                    +'<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + station + ")" + '</h1>'
                    +'<h2 style="font-size:12px;margin:5px 0;">' + format.lnglat(lng, lat) + '</h2>'
                    +'<h2 style="font-size:12px;margin:5px 0;">' + error + '</h2>'
                +'</div>';
        return html;
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
    }

    function open(){
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        // select.parent().css('display', 'inline-block');

        getData();
        isOpen = true;
        XHW.C.layout.judgeWhetherSelect(button);
        $('.tuLi .tuLiAir').show();
    }

    function close(){
        XHW.C.layerC.removeLayer(key);

        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        // select.parent().hide();
        $('#right_info_airport').hide();
        $('#AIPORT').hide();
        $('.bottompanel_air').hide();
        isOpen = false;
        remove();
        XHW.C.layout.judgeWhetherSelect(button);
    }

    return {
        open: open,
        close: close
    }
});
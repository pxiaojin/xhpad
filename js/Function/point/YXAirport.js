//站点 城市 气象数据
define(['Function/point/AirportInfo', 'Controller/DataFormat'], function(airportInfo, format) {
    var key;
    var type;
    var legend;
    var item;

    var button;     //功能开关按钮
    // var select;  // 2019-06-03 只保留使用“盲降”
    var isOpen = false;
    var layer;      //功能图层
    var celebrate_layer;  
    var data;       //机场气象数据（按分级记录，站点、站名、经纬度、天气信息）
    var airport_runway;     //机场跑道方向数据

    
    function init(){
        //----------------设置功能按钮及点击事件
        button = $('#meteo_airport');
        button.click(function(){
            if(!isOpen) {
                open();
                // $('#moShiQieHuang').show();
            } else {
                close();
                // if(!$('#multi_select li').hasClass('currenterJiBtn') && !$('#meteo_station').parent().hasClass('current') && !$('#shuzhiyubao li').hasClass('currenterJiBtn')){
                //     $('#moShiQieHuang').hide();
                // }else{
                //     $('#moShiQieHuang').show();
                // }
            }
        });
        
        // select = $('#meteo_airport_select');
        // select.change(function(){
        //     if(isOpen) drawStationMarkers();
        // });

        //------------------获取机场跑道方向数据
        load_airport_runway();

        //层级缩放监听 机场目前不需要层级缩放
        // XHW.C.MapMove.addZoomCallback(function(){
        //     if(isOpen) getData();
        // });

        //时间轴变化监听
        //sliderBar.addCallback(function(){
        //    if(button.parent().hasClass('current')) 
        //        getData();
        //});

        type = key = 'airport';
        legend = '<ul class="jichangUl">' + 
                '<li><img src="img/airport/airport_runway_error.png" width="15" alt="" /><span>不适航</span></li>' +
                '<li><img src="img/airport/airport_runway_gray.png" width="15" alt="" /><span>正常</span></li>' +
                '<li><img src="img/airport/airport_runway_yellow.png" width="15" alt="" /><span>能见度低</span></li>' +
                '<li><img src="img/airport/airport_runway_red.png" width="15" alt="" /><span>雷暴</span></li>' +
                '<li><img src="img/airport/airport_runway_delay.png" width="15" alt="" /><span>缺报</span></li>' +
                '<li><img src="img/airport/airport_runway_brown.png" width="15" alt="" /><span>烟尘、沙尘、风暴</span></li>' +
                '<li><img src="img/airport/airport_runway_green.png" width="15" alt="" /><span>雨、雪、地面凝结、吹雪、积雪</span></li>' +
                '</ul>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })

        //------------鼠标指向marker的监听
        XHW.C.mouse.addCallback(type, function(value){            
            return getPopupHtml(value);
        });

        XHW.C.mapclick.addCallback(type, function(value){
            //后续添加机场条件不满足数据
            airportInfo.queryAirportInfo(value.code, value.time, value.weather, value.realValue);
            setTimeout(function(){
                $('#rightInfo_airport_name').html(format.airportName(value.name));
                $('#rightInfo_airport_lnglat').html('经纬度：' + format.lnglat(value.lng, value.lat));
            },500)           
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
                    item.htmlLayer = time.month + '月' + time.day + '日 ' + time.hour + '时 ' + ' 机场天气实况' + '(无数据)';
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
        for(var key in rawData) {
            // ZYYJ_20190112140000_NONE_129.45_42.882_延吉/朝阳川_2
            var keys = rawData[key].split('_');
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
            if(marker.value.code == 'ZBCF' || marker.value.code == 'ZBDT'){
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                        crossOrigin: 'anonymous',
                        src: 'img/airport/red_flag.jpg',
                        scale: 0.1,
                    })),                                          
                }));
            }else{
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                        crossOrigin: 'anonymous',
                        src: airport_runway_url,
                        scale: 0.3,
                        rotation: runway
                    })),                                          
                }));
            }
            markers.push(marker);        
        }

        var celebrate_marks = [];
        var celebrate_ar = [
            {name: '塘山机场', lat: '39.71', lng: '118.00', code:'ZBTJ', time:data['ZBTJ'].time, weather: data['ZBTJ'].weather,
                    realValue: data['ZBTJ'].ILS?data['ZBTJ'].ILS.status:
                                data['ZBTJ'].NDB?data['ZBTJ'].NDB.status:
                                data['ZBTJ'].VF?data['ZBTJ'].VF.status:undefined,},
            {name: '羊村机场', lat: '39.37', lng: '117.09', code:'ZBAA', time:data['ZBAA'].time, weather: data['ZBAA'].weather,
            realValue: data['ZBAA'].ILS?data['ZBAA'].ILS.status:
                        data['ZBAA'].NDB?data['ZBAA'].NDB.status:
                        data['ZBAA'].VF?data['ZBAA'].VF.status:undefined,},
            {name: '桶州机场', lat: '40.08', lng: '116.58', code:'ZBAA', time:data['ZBAA'].time, weather: data['ZBAA'].weather,
            realValue: data['ZBAA'].ILS?data['ZBAA'].ILS.status:
                        data['ZBAA'].NDB?data['ZBAA'].NDB.status:
                        data['ZBAA'].VF?data['ZBAA'].VF.status:undefined,},
            {name: '尊化机场', lat: '40.23', lng: '117.85', code:'ZBAA', time:data['ZBAA'].time, weather: data['ZBAA'].weather,
            realValue: data['ZBAA'].ILS?data['ZBAA'].ILS.status:
                        data['ZBAA'].NDB?data['ZBAA'].NDB.status:
                        data['ZBAA'].VF?data['ZBAA'].VF.status:undefined,},
            {name: '沧州机场', lat: '38.23', lng: '116.73', code:'ZBTJ', time:data['ZBTJ'].time, weather: data['ZBTJ'].weather,
            realValue: data['ZBTJ'].ILS?data['ZBTJ'].ILS.status:
                        data['ZBTJ'].NDB?data['ZBTJ'].NDB.status:
                        data['ZBTJ'].VF?data['ZBTJ'].VF.status:undefined,},
            {name: '衫海关机场', lat: '39.97', lng: '119.73', code:'ZYJZ', time:data['ZYJZ'].time, weather: data['ZYJZ'].weather,
            realValue: data['ZYJZ'].ILS?data['ZYJZ'].ILS.status:
                        data['ZYJZ'].NDB?data['ZYJZ'].NDB.status:
                        data['ZYJZ'].VF?data['ZYJZ'].VF.status:undefined,},
            {name: '南衫机场', lat: '39.83', lng: '119.48', code:'ZBTJ', time:data['ZBTJ'].time, weather: data['ZBTJ'].weather,
            realValue: data['ZBTJ'].ILS?data['ZBTJ'].ILS.status:
                        data['ZBTJ'].NDB?data['ZBTJ'].NDB.status:
                        data['ZBTJ'].VF?data['ZBTJ'].VF.status:undefined,}];
        for(var j = 0; j < celebrate_ar.length; j++){
            var cele_marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(celebrate_ar[j].lng), parseFloat(celebrate_ar[j].lat)]))
            });
            cele_marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: 'img/airport/red_flag.jpg',
                    scale: 0.1,
                })),                                          
            }));
            cele_marker.type = type;
            cele_marker.value = celebrate_ar[j];
            celebrate_marks.push(cele_marker);           
        }  

        let celebrate_source = new ol.source.Vector({
            features: celebrate_marks
        });

        if (!celebrate_layer) {
            celebrate_layer = new ol.layer.Vector({
            
            });
            celebrate_layer.setZIndex(15);
            celebrate_layer.id = type;
        }
        celebrate_layer.setSource(celebrate_source);
        
        if ($.inArray(celebrate_layer, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(celebrate_layer);

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

        var html;
        // var ar = ['塘山机场','羊村机场','桶州机场','尊化机场','沧州机场','衫海关机场','南衫机场'];
        // for(let j = 0; j < ar.length; j++){
            if(value['name'] == '塘山机场' || value['name'] == '羊村机场' || value['name'] == '桶州机场' || 
            value['name'] == '尊化机场' || value['name'] == '沧州机场' || 
            value['name'] == '衫海关机场' || value['name'] == '南衫机场'){
                html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                    + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                +'<h1 style="font-size:12px;margin:5px 0;">' + name + '</h1>'
                +'<h2 style="font-size:12px;margin:5px 0;">' + format.lnglat(lng, lat) + '</h2>'
            +'</div>';
            }else{
                html = '<div style="position:absolute;left:-30px;bottom:12px;' 
                        + 'background:rgba(0,0,0,0.5);padding:2px;border-radius:2px;color:#ffffff;width: max-content">'
                    +'<h1 style="font-size:12px;margin:5px 0;">' + name + "(" + station + ")" + '</h1>'
                    +'<h2 style="font-size:12px;margin:5px 0;">' + format.lnglat(lng, lat) + '</h2>'
                    +'<h2 style="font-size:12px;margin:5px 0;">' + error + '</h2>'
                +'</div>';
            }     
        // }   
        return html;
    }

    /**
     * 删除图层
     */
    function remove(){
        XHW.map.removeLayer(layer);
        XHW.map.removeLayer(celebrate_layer);
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
    }

    function close(){
        XHW.C.layerC.removeLayer(key);

        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
        // select.parent().hide();

        isOpen = false;
        remove();
    }

    return {
        open: open,
        close: close
    }
});
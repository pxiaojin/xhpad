define(['Controller/Http','Function/numberFC/FloatSelector','Function/wea_warn/warn_drawgeojson'], function(http, floatSelector,draw) {
    var key_wind;
    var key_bot_tem;
    var legend;
    var item;
    var isOpen;
    var isOpen_parent;
    var bigWindLayer;
    var bottomTemLayer;
    var button;
    var currentVal;

    function init(){
        button = $('#weather_warning_select .warnBottomTem');
        // select = $('#sea_flow_select');
        button.click(function(){
            if (!isOpen) {
                open();            
            } else {
                close();                              
            }
        });

        // $('#weather_warning').click(function(){
        //     if(!(5 <= XHW.silderTime.month <= 9)){
        //         if (!isOpen_parent) {
        //             open();
        //             isOpen_parent = true;            
        //         } else {
        //             close();
        //             isOpen_parent = false;                             
        //         }
        //     }           
        // })

        $('#moShiQieHuang').click(function(){
            if(isOpen) requestData();
        })

        $('#tog_time span').click(function(){
            $(this).addClass('current').siblings().removeClass('current');
            currentVal = $(this).attr("data-value");
            if(isOpen) requestData();
        })

        timeBar.addCallback(function(){
            if(isOpen) requestData();
        });


        key_wind = 'WSR5YJ';
        key_bot_tem = 'MDTYJ';
        currentVal = '24';
        legend = '<p class="tuCengP">大风降温区</p>' + 
                '<img src="img/warn_legend/24h_bt.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>℃</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('大风降温区', legend, function(){
            close();
        })
    }

    function requestData(){
        var time = timeBar.getRequestTime().split('-');
        var timeparam = '&year=' + time[0]
            + '&month=' + time[1]
            + '&day=' + time[2]
            + '&hour=' + time[3];
        let datatype = XHW.config.datasource.toLowerCase();
        var baseurl,url_wind,url_tem;
        if(datatype == 'gfs'){
            baseurl = http.weatherUrl;
            url_wind = baseurl + '/' + datatype + '/polygondata?level=9999&elem=WSR5' + timeparam;
            url_tem = baseurl + '/' + datatype + '/polygondata?level=9999&elem=MDT' + currentVal + timeparam;
        }else{
            baseurl = http.ecmfUrl;
            url_wind = baseurl + '/' + datatype + '/polygondata?level=9999&elem=' + key_wind + timeparam;
            url_tem = baseurl + '/' + datatype + '/polygondata?level=9999&elem=' + key_bot_tem + currentVal + timeparam;
        };

        $.ajax({
            url: appendInfoToURL(url_tem),
            dataType:'json',
            success:function(json){      
                if(json.status_code != 0){
                    item.htmlLayer = ' 大风降温区(无数据)';
                    XHW.C.layerC.updateLayerData(key_bot_tem, item);
                    return;
                }            
                var datatime = json.time;
                var month = datatime.substring(4,6);
                var day = datatime.substring(6,8);
                var hour = datatime.substring(8,10);
                let data = json.data;
                if (data) {
                    drawBot_temGeoJsonInfo(key_bot_tem, data);
                    item.htmlLayer = Number(month) + '月' + Number(day) + '日 ' + hour + ':00 ' + ' 大风降温区';
                    if(currentVal == 24){
                        item.legend = '<p class="tuCengP">大风降温区</p>' + 
                                    '<img src="img/warn_legend/24h_bt.png" alt="" />' +
                                    '<p>' +
                                        '<span>单位</span>' +
                                        '<span>℃</span>' +
                                    '</p>';
                    }else{
                        item.legend = '<p class="tuCengP">大风降温区</p>' + 
                                    '<img src="img/warn_legend/48h_bt.png" alt="" />' +
                                    '<p>' +
                                        '<span>单位</span>' +
                                        '<span>℃</span>' +
                                    '</p>';
                    }
                    XHW.C.layerC.updateLayerData(key_bot_tem, item);
                };
                $.ajax({
                    url: appendInfoToURL(url_wind),
                    dataType:'json',
                    success:function(json_wind){     
                        if(json_wind.status_code != 0){
                            return;
                        }                          
                        let dataW = json_wind.data;
                        if (dataW) {
                            drawWindGeoJsonInfo(key_wind, dataW, bigWindLayer);                   
                        }
                    }
                });
            },
            error: function(error){
                item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 大风降温区' + '(无数据)';
                XHW.C.layerC.updateLayerData(key_bot_tem, item);
                remove();
            }
        });
    }

    function drawBot_temGeoJsonInfo(key, resultgeojson) {
        if (!resultgeojson)
            return;
        var resfeatures = draw.buildFeatures(key, resultgeojson);
        if (!resfeatures){
            return;
        }
        let source = new ol.source.Vector({
            features: resfeatures,
        });
        if (!bottomTemLayer) {
            bottomTemLayer = new ol.layer.Vector({
                title: '预报区域预警',
                source: source,
            });
            XHW.map.addLayer(bottomTemLayer);
            bottomTemLayer.id = key_bot_tem;
        } else {
            bottomTemLayer.setSource(source);
        }
    }

    function drawWindGeoJsonInfo(key, resultgeojson) {
        if (!resultgeojson)
            return;
        var resfeatures = draw.buildFeatures(key, resultgeojson);
        if (!resfeatures){
            return;
        }
        let source = new ol.source.Vector({
            features: resfeatures,
        });
        if (!bigWindLayer) {
            bigWindLayer = new ol.layer.Vector({
                title: '预报区域预警',
                source: source,
            });
            XHW.map.addLayer(bigWindLayer);
            bigWindLayer.id = key_wind;
        } else {
            bigWindLayer.setSource(source);
        }
    }

    function remove(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key_bot_tem);

        if(bigWindLayer){
            XHW.map.removeLayer(bigWindLayer);
            bigWindLayer = null;
        }
        if(bottomTemLayer){
            XHW.map.removeLayer(bottomTemLayer);
            bottomTemLayer = null;
        }
    }

    function close(){
        remove();
        isOpen = false;
        $('#tog_time').hide();
        button.removeClass('currentBlue');   
        if(!$('#weather_warning_select').children().hasClass('currentBlue')){
            $('#weather_warning').parent().removeClass('currenterJiBtn');  
            $('#weather_warning').prev().attr('src',$('#weather_warning').prev().attr('mysrcpri'));
        }
        if(!$('#forecastUl li').hasClass('currenterJiBtn')){
            $('#forecastUl').parent().removeClass('current');
        }
    }

    function open(){  
        $('#tog_time').show();
        requestData();
        XHW.C.layerC.addLayer(key_bot_tem, item); 
        // $('#moShiQieHuang').show();
        button.addClass('currentBlue');   
        $('#weather_warning').parent().parent().parent().addClass('current');
        $('#weather_warning').parent().addClass('currenterJiBtn');  
        $('#weather_warning').prev().attr('src',$('#weather_warning').prev().attr('mysrc'));
        isOpen = true;
    }

    init();

    return {
        close: close,
        open: open
    }
});
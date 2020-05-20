define(['Controller/Http','Function/numberFC/FloatSelector','Function/wea_warn/warn_drawgeojson'], function(http, floatSelector,draw) {
    var key;
    var legend;
    var item;
    var isOpen;
    var geoJsonLayer;
    var button;

    function init(){
        key = 'WSRYJ';
        button = $('.warnBigWind');
        // select = $('#sea_flow_select');
        button.click(function(){
            if (!isOpen) {
                open();           
            } else {
                close();                             
            }
        });

        // 默认首次打开状态
        // open();  

        $('#moShiQieHuang').click(function(){
            if(isOpen) requestData();
        })

        $('.threatLevel .buttonDiv .sub').click(function(){
            if(isOpen) requestData();
        })

        timeBar.addCallback(function(){
            if(isOpen) requestData();
        });

        
        legend = '<p class="tuCengP">大风区</p>' + 
                '<img src="img/warn_legend/bWind.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>m/s</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('大风区', legend, function(){
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
        var baseurl,yjLevel,url;
        if(XHW.config.wind_lev != undefined){
            var wind_lev;
            if(XHW.config.wind_lev.indexOf(',') == 0){
                wind_lev = XHW.config.wind_lev.substring(1);
            }else{
                wind_lev = XHW.config.wind_lev;
            }
            yjLevel = '&YJLevel=' + wind_lev + ',1000';
            if(yjLevel == '&YJLevel=,1000'){yjLevel = ''}
        }else{
            yjLevel = '';
        }
        if(datatype == 'gfs'){
            baseurl = http.weatherUrl;
            url = baseurl + '/' + datatype + '/polygondata?level=9999&elem=WSR' + timeparam + yjLevel;
        }else{
            baseurl = http.ecmfUrl;
            url = baseurl + '/' + datatype + '/polygondata?level=9999&elem=' + key + timeparam + yjLevel;
        };
        $.ajax({
            url: appendInfoToURL(url),
            dataType:'json',
            success:function(json){          
                if(json.status_code != 0){
                    item.htmlLayer = ' 大风区(无数据)';
                    XHW.C.layerC.updateLayerData(key, item);
                    return;
                }       
                var datatime = json.time;
                var month = datatime.substring(4,6);
                var day = datatime.substring(6,8);
                var hour = datatime.substring(8,10);

                let data = json.data;
                if (data) {
                    drawGeoJsonInfo(key, data);
                    item.htmlLayer = Number(month) + '月' + Number(day) + '日 ' + hour + ':00 ' + ' 大风区';
                    XHW.C.layerC.updateLayerData(key, item);
                }
                $('#showTuLi .tuLiBigwind').show();
            },
            error: function(error){
                time = XHW.silderTime;
                item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 大风区' + '(无数据)';
                XHW.C.layerC.updateLayerData(key, item);
                remove();
            }
        });
    }

    function drawGeoJsonInfo(key, resultgeojson) {
        if (!resultgeojson)
            return;
        var resfeatures = draw.buildFeatures(key, resultgeojson);
        if (!resfeatures){
            return;
        }
        let source = new ol.source.Vector({
            features: resfeatures,
        });
        if (!geoJsonLayer) {
            geoJsonLayer = new ol.layer.Vector({
                title: '预报区域预警',
                source: source,
            });
            XHW.map.addLayer(geoJsonLayer);
            geoJsonLayer.id = key;
        } else {
            geoJsonLayer.setSource(source);
        }
    }

    function remove() {
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        if (geoJsonLayer) {
            XHW.map.removeLayer(geoJsonLayer);
            geoJsonLayer = null;
        }
    }

    function close(){
        remove();
        $('#showTuLi .tuLiBigwind').hide();
        button.removeClass('currentBlue');   
        if(!$('#weather_warning_select').children().hasClass('currentBlue')){
            $('#weather_warning').parent().removeClass('currenterJiBtn');  
            $('#weather_warning').prev().attr('src',$('#weather_warning').prev().attr('mysrcpri'));
        }
        if(!$('#forecastUl li').hasClass('currenterJiBtn')){
            $('#forecastUl').parent().removeClass('current');
        }
        isOpen = false;
    }

    function open(){
        requestData();
        // XHW.C.layerC.addLayer(key, item); 
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
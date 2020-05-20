//ecmf 积冰
define(['Controller/DataFormat'], function(format) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layer;     //图层
    var button;     //按钮
    var select;     //选择框

    function init(){
        button = $('#ecmf_ice');
        select = $('#ecmf_ice_select');
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        select.change(function(){
            if(isOpen) getData();
        });

        timeBar.addCallback(function(){
            if(isOpen) getData();
        });

        key = 'ecmf_ice';
        legend = '<p class="tuCengP">积冰</p>' + 
                '<img src="img/legend/ice.png" alt="" />';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){    //TODO, 之后更改写法（传递时间，elem固定
        var level = select.val();

        var time = XHW.silderTime;
      
        var param = '&level=' + level + '&year=' + time.year 
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;
        // http://weather.xinhong.net/ecmf/isosurfacedata?level=0500&elem=ICE&year=2019&month=01&day=08&hour=09
        XHW.C.http.Http(XHW.C.http.ecmfUrl, '/ecmf/isosurfacedata?elem=ICE' + param, function(data, time){
            time = format.jsonDate(time);
            item.htmlLayer = //time[0] + ' 发布 ' + 
                    time[1] + ' ' + select.find("option:selected").text() + '积冰';
            XHW.C.layerC.updateLayerData(key, item);
           
            drawecmfIce(data);
        })
    }

    //========================================================================绘制拼接图片部分
    function drawecmfIce(data){
        var slat = data.elat;
        var slng = data.slng;
        var elat = data.slat;
        var elng = data.elng;
                
        //贴图方式为左上角至右下角
        var start = ol.proj.fromLonLat([slng, elat]);
        var end = ol.proj.fromLonLat([elng , slat]);
        var extent = [start[0], start[1], end[0], end[1]];

        var tlayer = new ol.layer.Image({
            source: new ol.source.ImageStatic({
                url: XHW.C.http.ecmfImgUrl + data.url + '.mkt.png',
                imageExtent: extent
            })
        });
        tlayer.setZIndex(1);
        XHW.map.addLayer(tlayer);

        //------------------判断当前是否有旧图层，有则替换
        if(layer){
            remove();
        }
        layer = tlayer;
        //------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }
    //===========================================================绘制结束

    function remove(){
        if(layer) {
            XHW.map.removeLayer(layer);
            layer = null;
        }
    }

    function open(){
        item.htmlLayer = '积冰';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
		XHW.C.layout.judgeWhetherSelect(button);
        select.parent().css('display', 'inline-block'); //选中时展示层次选择框

        getData();
        isOpen = true;
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(button);
        select.parent().hide();

        remove();
        isOpen = false;
    }

    init();

    return {
        close: close
    }
});
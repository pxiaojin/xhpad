//海水温度
define(['Controller/DataFormat', 'Function/numberFC/FloatSelector'], function(format, floatSelector) {
    
    var key;
    var legend;
    var item;
    var isOpen;
    var layers = [];
    var button;     //功能开关
    // var select;     //层次选择框

    function init(){
        button = $('#seat');
        // select = $('#sea_tt_select');

        button.click(function(){
            if(!isOpen) {
                layers = [];
                open();
            } else {
                close();
            }
        });

        // sliderBar.addCallback(function(){
        //     if(isOpen) getData();
        // });

        // select.change(function(){
        //     if(isOpen) getData(layers);
        // });
        floatSelector.on('sea_tt_select', 'click', function(){
            remove();
            open();
        });

        key = 'sea_T';
        legend = '<p class="tuCengP">海温</p>' + 
                '<img src="img/legend/seat.png" alt="" />' +
                '<p>' +
                    '<span>单位</span>' +
                    '<span>℃</span>' +
                '</p>';
        item = XHW.C.layerC.createItem('', legend, function(){
            close();
        })
    }

    function getData(){
        var level = floatSelector.getValue('sea_tt_select');
        // var level = select.val().split('m')[0];
        // level = level < 10 ? '000' + level : '00' + level;
        var time = XHW.silderTime;
        var param = '&depth=' + level.split('m')[0] + '&year=' + time.year 
        + '&month=' + time.month + '&day=' + time.day +'&hour=' + time.hour;

        XHW.C.http.oceanHttp('/hy1Suo/img', '?eles=TT' + param, function(data, time){
            time = format.jsonDate(time);
            item.htmlLayer = // time[0] + ' 发布 ' + 
                    time[1] + ' ' + floatSelector.getValueDesc('sea_tt_select') + '海温';
            XHW.C.layerC.updateLayerData(key, item);
            drawSeaT(data);
        },function(){
            item.htmlLayer = Number(time.month) + '月' + Number(time.day) + '日 ' + time.hour + ':00 ' + ' 海温' + '(无数据)';
            XHW.C.layerC.updateLayerData(key, item);
            remove();
        })
    }

    function drawSeaT(data){
        var slat = data.elat;
        var slng = data.slng;
        var elat = data.slat;
        var elng = data.elng;
        var xD = Math.abs(elng - slng) / data.col;
        var yD = Math.abs(elat - slat) / data.row;
        var tlayer;

        for(var i = 0; i < data.files.length; i++){
            //！！！图片排列方式为从地图左上角至右下角
            var x = data.files[i].split('_')[1].split('.')[0];
            var y = data.files[i].split('_')[0];

            //贴图方式为左下角至右上角
            var start = ol.proj.fromLonLat([slng + x * xD, slat - (parseInt(y) + 1) * yD]);
            var end = ol.proj.fromLonLat([slng + (parseInt(x) + 1) * xD, slat - y * yD]);
            var extent = [start[0], start[1], end[0], end[1]];
            // console.log((slng + x * xD) + '  ' + (slat - (parseInt(y) + 1) * yD) + '  ' + (slng + (parseInt(x) + 1) * xD) + ' ' + (slat - y * yD));
           
            // tLayers.push(new ol.layer.Image({
            //     source: new ol.source.ImageStatic({
            //         url: XHW.C.http.oceanUrl + data.url + data.files[i] + '.mkt',
            //         imageExtent: extent
            //     })
            // }));

            // tLayers[i].setZIndex(1);
            // XHW.map.addLayer(tLayers[i]);

            let source = new ol.source.ImageStatic({
                url: XHW.C.http.oceanUrl + data.url + data.files[i] + '.mkt',
                    imageExtent: extent
            });
            if (layers.length <= data.files.length){
                tlayer = new ol.layer.Image({
            
                });
                tlayer.setZIndex(1);
                tlayer.id = key; 
                tlayer.setSource(source);
                layers.push(tlayer);
            }else{
                layers[i].setSource(source);  
            };                   
            
            if (layers.length <= data.files.length){
                XHW.map.addLayer(tlayer);
            };
        }

        //step9------------------判断是否功能是否已经关闭，已关闭则删除图层（防止延时导致功能关闭图层保留现象
        if(!isOpen) {
            close();
        }
    }

    function remove(){
        if(layers && layers != []){
            for(var i in layers) {
                XHW.map.removeLayer(layers[i]);
            }
            layers = [];
        }       
    }

    function open(){
        // item.htmlLayer = '海温';
        //---------添加图层控制
        var b = XHW.C.layerC.addLayer(key, item);
        if(!b) {
            close();
            return;
        }
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        // select.parent().css('display', 'inline-block');//选中时展示层次选择框
        // floatSelector.open('sea_tt_select');
		XHW.C.layout.judgeWhetherSelect(button);

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
        floatSelector.close('sea_tt_select');
        // select.parent().hide();

        isOpen = false;
        remove(layers);
    }

    /**
     * 当时间轴或层次发生变化时
     * TODO 更换param
     */
    function update(){
        if(!isOpen) return; //当前功能未开启则不执行
        getData()
    }

    init();

    return {
        update : update,
        close: close
    };
});
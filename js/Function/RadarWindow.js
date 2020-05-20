define(['Function/tool/playlistWindow',
    'Controller/Http'], function(PlaylistWindow, http){
    
    var eventBtn = 'radar-list_btn';
    // $('#' + eventBtn).click(function () {

    //     if ($(this).parent().hasClass('currenterJiBtn')) {
    //         close();
    //         XHW.C.layout.judgeWhetherSelect($('#' + eventBtn));
    //     } else {
    //         open();
    //         $(this).parent().addClass('currenterJiBtn');
    //         $(this).prev().attr('src',$(this).prev().attr('mysrc'));
    //         XHW.C.layout.judgeWhetherSelect($('#' + eventBtn));
    //     }
    // });

    // sliderBar.addCallback(function () {
    //     if ($('#' + eventBtn).parent().hasClass('currenterJiBtn'))
    //         open();
    // });
    $('.radar-list_btn').on('click', function(e) {
        $('.time').hide();
        $('#radar-list .swiper-containerRadar').show();
        if(!$(this).hasClass('current')) {
            close()
        } else {
            open()
        }
    })

    $('#radar-list').click(function (e) {
        // $(this).parent().hide()
        if ($('#' + eventBtn).parent().hasClass('current')){
            open();
        }
            
    })

    var listId = 'radar-list';
    var realListWindow = new PlaylistWindow(listId);

    function open() {
        requestDataList(function(datas, selectIndex){
            realListWindow.open(
                datas,
                {
                    close: function(){
                        onWindowClose();
                    },
                    showIndex: function(index){
                        drawGeoJsonInfo(datas[index]);
                    },
                }, selectIndex);
        });
       
    }

    //http://ocean.xinhong.net:81/images/newradarfcmap/20190705/QPFRef_201907051230.png
    
    function requestDataList(call) {
        requestFCDataList(function(fcDatas, selectIndex){
            if (fcDatas && fcDatas.length > 15) {
                call(fcDatas, selectIndex);
            } else {
                requestRealDataList(function(realDatas){
                    call(realDatas, 0);
                })
            }
        });
    }

        function requestFCDataList(call) {
            $.ajax({
                url: appendInfoToURL('http://ocean.xinhong.net' + '/images/newradarfcmap/RADAR_QPFRef.index'),
                dataType: 'text',
                success: function (datas) {
                    datas = datas.split(/[\s\n]/)
                    let itemList = [];
                    var curdate = new Date().getTime();
                    let selectIndex = 0;
                    if (datas) {
                        for (let i = datas.length - 1; i >= 0; i--) {
                            if (datas[i] && datas[i] != '') {
                                let items = datas[i].split(':');
                                let dateStr = items[0];
                                let imgUri = items[1];
                                let item = {};

                                let odateTime = new Date(
                                    dateStr.substring(0, 4),
                                    parseInt(dateStr.substring(4, 6)) - 1,
                                    dateStr.substring(6, 8),
                                    dateStr.substring(8, 10),
                                    dateStr.substring(10, 12)).getTime();

                                if (curdate - odateTime > 240 * 60 * 1000) {
                                    continue;
                                }
                                item.desc = //dateStr.substring(4, 6) + '月' 
                                    // dateStr.substring(6, 8) + '日'+ " " + 
                                    dateStr.substring(8, 10)
                                    + ":" + dateStr.substring(10, 12);
                                if (curdate - odateTime < 16 * 60 * 1000) {
                                    item.color = '#000';
                                    // item.desc += '(临近)';
                                } else {
                                    selectIndex = i;
                                    // item.desc += '(实况)';
                                }
                                item.url = 'http://ocean.xinhong.net/images/newradarfcmap/' + dateStr.substr(0, 8) + '/' + imgUri;
                                item.date = dateStr;
                                item.extent = ol.proj.transformExtent([
                                    73.44630749105424, 10.160640206803123,
                                    135.09, 53.56064020680312], 'EPSG:4326', 'EPSG:3857');
                                itemList.push(item);
                            }
                        }

                    }
                    if (call) {
                        call(itemList, selectIndex);
                    }
                },
                error: function (error) {
                }
            });
        }

        function requestRealDataList(call) {
            $.ajax({
                url: appendInfoToURL('http://ocean.xinhong.net' + '/images/newradarmap/RADAR_ACHN_QREF.index'),
                dataType: 'text',
                success: function (datas) {
                    datas = datas.split(/[\s\n]/);
                    let itemList = [];
                    var curdate = new Date().getTime();
                    if (datas) {
                        for (let i = datas.length - 1; i >= 0; i--) {
                            if (datas[i] && datas[i] != '') {
                                let items = datas[i].split(':');
                                let dateStr = items[0];
                                let imgUri = items[1];
                                let item = {};

                                let odateTime = new Date(
                                    dateStr.substring(0, 4),
                                    parseInt(dateStr.substring(4, 6)) - 1,
                                    dateStr.substring(6, 8),
                                    dateStr.substring(8, 10),
                                    dateStr.substring(10, 12)).getTime();
                                if (curdate - odateTime > 240 * 60 * 1000) {
                                    continue;
                                }
                                item.desc = //dateStr.substring(4, 6) + '月' 
                                    // dateStr.substring(6, 8) + '日'+ " " +
                                     dateStr.substring(8, 10)
                                    + ":" + dateStr.substring(10, 12);
                                // item.desc += '(实况)';
                                item.url = 'http://ocean.xinhong.net/images/newradarmap/' + dateStr.substr(0, 8) + '/' + imgUri;
                                item.date = dateStr;
                                item.time = odateTime;
                                item.extent = ol.proj.transformExtent([
                                    69.8291015625, 12.168225677390112,
                                    140.1416015625, 54.34214886448342], 'EPSG:4326', 'EPSG:3857');
                                itemList.push(item);
                            }
                        }
                    }
                    if (call) {
                        call(itemList);
                    }
                },
                error: function (error) {
                }
            });
        }

    function close() {
        realListWindow.close();
        onWindowClose();
    }

        function onWindowClose() {
            if (geoJsonLayer) {
                XHW.map.removeLayer(geoJsonLayer);
                geoJsonLayer = null;
            }
            $('#' + eventBtn).parent().removeClass('current');
            $('#' + eventBtn).prev().attr('src', $('#' + eventBtn).prev().attr('mysrcpri'));
        }

    var geoJsonLayer;

    /**
    * APIMethod: createAnimationLayer
    * 创建动画图层（）.
    */
    function drawGeoJsonInfo(item) {
        
        if (geoJsonLayer == null) {
            geoJsonLayer = new ol.layer.Image({
                opacity: 0.5
            });
            geoJsonLayer.id='Radar-image';
            XHW.map.addLayer(geoJsonLayer);
        }
        let title = item.desc;
        let url = item.url;
        let extent = item.extent;
        let source = new ol.source.ImageStatic({
            crossOrigin: 'anonymous',  
            url: url,
            imageExtent: extent
        });
        geoJsonLayer.set('title', title);
        geoJsonLayer.title = title;
        geoJsonLayer.setSource(source);
    }

    return {
        open: open,
        close: close
    }
});
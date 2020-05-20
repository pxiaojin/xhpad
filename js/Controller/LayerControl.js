//图层控制类        注意，并不是真正的图层控制，而是记录当前开启图层的功能
define([], function() {
    var controlPanel;
    var controlLegend;
    var layerList;      //功能列表()
    var MAX = 20;

    function init(){
        controlPanel = $('#control_layer');
        controlLegend = $('#control_legend');
        layerList = {};
    }

    init();

    /**
     * 添加图层
     * @param {*} item 
     * @return boolean  true代表添加成功  false代表添加失败，需要关闭功能
     */
    function addLayer(key, item){
        var count = 0;
        for(var i in layerList) {
            count++
        }
        if(count >= MAX) {
            XHW.C.console.showLog('图层叠加层数达到上限');
            return false;
        }
        layerList[key] = item;
        showLayerList();
        return true;
    }

    // /**
    //  * 创建图层控制对象
    //  * @param {*} name 
    //  * @param {*} time 
    //  * @param {*} level 
    //  * @param {*} closeFunction 
    //  */
    // function createItem(name, time, level, closeFunction){
    //     return {
    //         name: name,
    //         time: time,
    //         level: level,
    //         close: closeFunction
    //     }
    // }

    /**
     * 创建图层控制对象
     * @param {*} htmlLayer     图层控制布局
     * @param {*} htmlLegend    图例布局
     * @param {*} closeFunction 关闭回调
     */
    function createItem(htmlLayer, htmlLegend, closeFunction){
        return {
            htmlLayer: htmlLayer,
            htmlLegend: htmlLegend,
            close: closeFunction
        }
    }

    // 设置图层的隐藏和显示
    function hideLayer(obj,key){       
        if($(obj).hasClass('current')){
            collectLayer(key,true);
        }else{
            collectLayer(key,false);
        }                     
    }

    // 遍历图层，查找符合id的图层
    function collectLayer(key,booleanVal){
        var layerList = XHW.map.getLayers();
        layerList.forEach(function(layer) {
            if (layer.id == key){                
                layer.setVisible(booleanVal);
            }
        });
    }

    /**
     * 删除图层
     * @param {*} key 要删除的图层名
     */
    function removeLayer(key){
        if(layerList[key]) {
            delete layerList[key];
            showLayerList();
        }
    }

    function remove(key) {
        if(layerList[key]) {
            layerList[key].close ? layerList[key].close() : null;
            removeLayer(key)
        }
    }

    // /**
    //  * 更新图层数据
    //  * @param {*} key  图层功能名
    //  * @param {*} item  图层控制对象
    //  */
    // function updateLayerData(key, item){
    //     if(layerList[key]) {
    //         layerList[key] = item;
    //         var time = layerList[key].time.split('_');
    //         var date = '', date1 = '', vti = '';
    //         if(time && time[0]) {
    //             date = new Date(time[0].substring(0, 4), time[0].substring(4, 6),
    //                             time[0].substring(6, 8), time[0].substring(8, 10));
    //             if(time[1]) {
    //                 date1 = new Date(date.getTime() + parseInt(time[1]) * 60 * 60 * 1000);
    //                 date1 = date1.getDate() + '日' + date1.getHours() + '时';
    //                 vti = '发布';
    //             }
    //             date = date.getDate() + '日' + date.getHours() + '时';
    //         }

    //         $('#lc_' + key).children().eq(1).html(date);
    //         $('#lc_' + key).children().eq(2).html(vti);
    //         $('#lc_' + key).children().eq(3).html(date1);
    //         $('#lc_' + key).children(':last').html(item.level);
    //     }
    // }

    /**
     * 更新图层数据
     * @param {*} key  图层功能名
     * @param {*} item  图层控制对象
     */
    function updateLayerData(key, item){
        if(layerList[key]) {
            layerList[key] = item;
            $('#lc_' + key).html(layerList[key].htmlLayer);
            $('#le_' + key).html(layerList[key].htmlLegend);
            if(layerList[key].htmlLegend && layerList[key].htmlLegend != '') {
                $('#le_' + key).show();
            } else {
                $('#le_' + key).hide();
            }
        }
        //  获取图层显隐状态，设置图例眼睛的显隐样式
        var layers = XHW.map.getLayers();
        layers.forEach(function(layer) {
            if (layer.id == key){                
                var state = layer.getVisible();
                if(state == false){
                    $('#lc_' + key).siblings($('.tuLiEye')).addClass('current');
                }else{
                    $('#lc_' + key).siblings($('.tuLiEye')).removeClass('current');
                }
            }
        });
    }

    /**
     * 刷新图层控制列表
     */
    function showLayerList(){
        controlPanel.empty();
        controlLegend.empty();
        var html = '', htmle = '';
        for(var key in layerList) {
            html += '<li>' +
                        '<p id="lc_' + key + '">' + layerList[key].htmlLayer + '</p>' +
                        '<p class="tuLiDel" onclick="XHW.C.layerC.remove(\'' + key + '\')"></p>'+
                        '<p class="tuLiEye" data-value="' + key + '" onclick="XHW.C.layerC.hideLayer(this,\'' + key + '\')"></p>'+
                    '</li>';
            var dis = 'none';
            if(layerList[key].htmlLegend && layerList[key].htmlLegend != '') {
                dis = 'block';
            }
            htmle += '<li id="le_' + key + '" style="display:' + dis + '">' + layerList[key].htmlLegend + '</li>';
        }
        if(html == '') {
            //图例收起
            $('.tuLi').stop().animate({'right':'0px'},200);
            $('.tuLiRetract').addClass('current');
            $('.tuLiRetract').hide();
        } else {
            //图例展开 并且默认选中图层控制
            $('.tuLi').stop().animate({'right':'580px'},200);
            $('.tuLiRetract').removeClass('current');
            $('.tuCengLi').addClass('current').siblings().removeClass('current');
            $('.tuLiBotB').addClass('current').next().removeClass('current');
            $('.tuLiRetract').show();
        }
        controlPanel.html(html);
        controlLegend.html(htmle);
    for (var key in layerList) {
        // var getLayers = XHW.map.getLayers();
        // getLayers.forEach(function(layer) {
        // if (layer.id == key){ 
        //     console.log(key)               
        //     hasCurrent = layer.getVisible() ? '' : 'current';
        // }
        var layers = XHW.map.getLayers();
        layers.forEach(function (layer) {
            if (layer.id == key) {
                var state = layer.getVisible();
                if (state == false) {
                    $('#lc_' + key).siblings($('.tuLiEye')).addClass('current');
                } else {
                    $('#lc_' + key).siblings($('.tuLiEye')).removeClass('current');
                }
            }

        });

        // console.log(layer)
        }
    }
    function wei() {
        $('#control_layer').on('click', '.tuLiEye', function (event) {
            // $(this).stop().toggleClass('current');
            var toggle = Boolean;
            if ($(event.target).hasClass('current')) {
                $(this).stop().removeClass('current')
                toggle = true;
            } else {
                $(this).stop().addClass('current')
                toggle = false;
            }

            // console.log(event.target)
            var targetStr = event.target.dataset.value
            // collectLayer(targetStr,toggle)
            // console.log(targetStr)
            // console.log(this)
            // 需要告诉layer中state状态已发生改变layer.setVisible(booleanVal)
            // 如何获取layer对象
            var layers = XHW.map.getLayers();
            layers.forEach(function (layer) {
                if (layer.id == targetStr) {
                    layer.setVisible(toggle);
                    // console.log(layer.getVisible())
                }
            });
            // showLayerList();
        });
    }
    wei();

    return layerControl = {
        addLayer: addLayer,
        removeLayer: removeLayer,
        hideLayer: hideLayer,
        updateLayerData: updateLayerData,
        createItem: createItem,
        remove: remove
    }
});

  
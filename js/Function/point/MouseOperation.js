//单点及多点的鼠标操作事件
define([], function() {
    var isOpen;             //功能是否已开启
    var button;
    var popup;              //单点及多点弹窗基础布局
    var overlay;            //地图弹窗对象
    var nLnglat;             //当前弹窗所指向的经纬度

    var multipointMenu;     //多点功能菜单
    var nlnglats;    //空间剖面图点数组
    var layer;      //显示已被选中的多点选择点的图层
    var type;       //功能对象
    function init(){
        button = $('#point_mo');
        popup = '<div id="popup_mouseOperation" style="background:#ffffff"></div>';
        isOpen = false;
        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        XHW.C.mapclick.addCallback('map', function(lnglat){
            if(isOpen) {                //判断功能是否开启
                if(!overlay) {          //判断当前是否有弹窗显示
                    showPopup(lnglat);  //没有弹窗显示则显示弹窗
                } else {
                    removePopup();      //有弹窗显示时关闭弹窗
                }
            }
        })

        $('body').append('<div id="menu_mouseOperation" style="display:none;position:absolute;left:200px;top:120px;background:#ffffff"><div>');
        multipointMenu = $('#menu_mouseOperation');
        type = 'multipoint';
    }

    init();

    /**
     * 点击地图后触发，显示地图弹窗
     * @param {*} lnglat 当前点经纬度
     */
    function showPopup(lnglat){
        //--------------------获取弹窗内容（多点弹窗隐藏状态为获取普通弹窗，多点弹窗显示则表示多点选取开启，显示添加点弹窗
        var html = multipointMenu.is(':hidden') ? getWeatherPopup(lnglat) : getMultipointPopup(lnglat);
        //--------创建弹窗布局
        $('body').append(popup);
        //--------创建地图弹窗对象
        var container = document.getElementById('popup_mouseOperation');
        container.innerHTML = html;
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
    }

    /**
     * 获取单点状态弹窗
     * @param {*} lnglat 当前点经纬度
     */
    function getWeatherPopup(lnglat){
        var hdms = ol.coordinate.toStringHDMS(lnglat);                          // hdms 为（27° 15′ 17″ N 111° 10′ 54″ E）格式
        //step1------------判断是否为海洋，如果是海洋，则显示获取海洋数据按钮
        isSea();
        //step2------------显示弹窗——添加多点/单点数据/（海洋数据）
        return '<h1>' + hdms + '</h1>' +
               '<div onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'high\'' + ')">高空数据</div>' +
               '<div style="display:none" onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'sea\'' + ')">海洋数据</div>' +
               '<div onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'multipointC\'' + ')">选中为多点剖面起始点</div>';
    }

    /**
     * 判断所点位置是否在海洋
     */
    function isSea(){
        // XHW.C.http.http();
    }

    /**
     * 获取多点功能添加点弹窗
     * @param {*} lnglat 当前点经纬度
     */
    function getMultipointPopup(lnglat){
        var hdms = ol.coordinate.toStringHDMS(lnglat);                          // hdms 为（27° 15′ 17″ N 111° 10′ 54″ E）格式
        return '<h1>' + hdms + '</h1>' +
               '<div onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'multipointA\'' + ')">添加为多点剖面途经点</div>' +
               '<div onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'spatialProfile\'' + ')">绘制多点剖面图</div>';
    }

    /**
     * 弹窗按钮点击事件
     * @param {*} event
     */
    function buttonEvent(event, value){
        switch(event){
            case 'high': highData(); break;
            case 'sea': seaData(); break;
            case 'multipointC': createMultipoint(); break;
            case 'multipointA': addMultipoint(); break;
            case 'multipointR': removeMultipoint(value); break;
            case 'multipointU': updateMultipoint(value); break;
            case 'spatialProfile': spatialProfile(); break;
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
     * 创建多点剖面图路径
     */
    function createMultipoint(){
        if(layer || nlnglats) {
            removeMultipoint();
        }
        nlnglats = [];
        nlnglats.push(nLnglat);
        showMultipointMenu();
        multipointMenu.show();
    }

    /**
     * 添加多点剖面图途经点
     */
    function addMultipoint(){
        nlnglats.push(nLnglat);
        showMultipointMenu();
    }

    /**
     * 删除多点剖面图途经点
     * @param {*} value 要删除的点的数据(value为空时全部删除)
     */
    function removeMultipoint(value){
        if(value) {
            //删除单个点
            showMultipointMenu();
        } else {
            //全部删除
            XHW.map.removeLayer(layer);
            layer = null;
            nlnglats = null;
            multipointMenu.empty();
            multipointMenu.hide();
        }
    }

    /**
     * 修改多点剖面图途经点
     * @param {*} value 
     */
    function updateMultipoint(value){
        showMultipointMenu();
    }

    /**
     * 显示多点剖面图路径
     */
    function showMultipoint(){
        var markers = [];
        var lnglats = [];
        //-----------step1--------------遍历数据
        for(var i = 0; i < nlnglats.length; i++) {
            var lnglat = ol.proj.fromLonLat(nlnglats[i]);
            //--------step2-------------画点
            var marker = new ol.Feature({
                geometry:new ol.geom.Point(lnglat), 
            });
            //----------step3------------给marker加入标记
            marker.type = type;
            marker.value = {
                id: i
            }
            //-----------step4-------------调整marker的样式
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({                                                                            
                        color: '#ff0000'                                        
                    }), 
                    fill: new ol.style.Fill({
                        color: '#ff0000'
                    })
                })
            }));
            //-----------step5------------把marker加入数组
            markers.push(marker);
            lnglats.push(lnglat);
        }

        //---------step6--------画线以及设置线的样式
        var line = new ol.Feature({
            geometry: new ol.geom.LineString(lnglats)
        });
        line.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'yellow'
            }),
        }));

        //----------step7-----------把marker和线放到同一组数据中
        var feature = markers;
        feature.push(line);

        //-------step8--------删除旧图层，替换新的图层
        if(layer){
            XHW.map.removeLayer(layer);
        }
        layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: feature
            })
        });
        XHW.map.addLayer(layer);
    }

    /**
     * 填充多点剖面图途经点的菜单
     */
    function showMultipointMenu(){
        var html = '';
        for(var i = 0; i < nlnglats.length; i++){
            html += '<div><h3>第' + i + '点</h3><p>lng:</p><input type="text" value="' + nlnglats[i][0] + '"/><p>lat:</p><input type="text" value="' + nlnglats[i][1] + '"/></div>';
        }
        html += '<div onclick="XHW.F.point.sub().mo.buttonEvent(' + '\'multipointR\'' + ')">删除</div>'
        multipointMenu.html(html);
        showMultipoint();
    }

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


    function open(){
        isOpen = true;
        button.parent().addClass();
    }

    function close(){
        isOpen = false;
        button.parent().removeClass();
    }

    return {
        buttonEvent: buttonEvent 
    }
});
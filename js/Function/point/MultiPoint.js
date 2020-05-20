//多点鼠标操作事件
define(['Function/point/Profile',
    'Function/point/civil_route',
    'Function/point/custom_route',
    'Controller/DataFormat'], function(multiAviation,civil_route,custom_route,format) {
    var select;
    var popupId;
    var overlay;            //地图弹窗对象
    var nLnglat;             //当前弹窗所指向的经纬度
    var nlnglats;    //空间剖面图点数组
    var layer;      //显示已被选中的多点选择点的图层
    var type;       //功能对象
    function init(){
        $('#multi_select').click(function(){
            if(!$(this).children('span').hasClass('current')){
                $('.airRouteBtn').hide();
                $('.airRouteList').hide();
                $('.civilRouteList').hide();
                $('.airRoute_pop').hide();
                $('.botPanelHangKong').hide();
                $(this).children('span').removeClass('current');
                $(this).css('background','none');
                removeMultipoint();     
                multiAviation.removePopup();
                civil_route.removeAllLayer();
                custom_route.removeAllLayer();
            }else{
                $(this).children('span').addClass('current');
                // $(this).css('background','rgb(7, 70, 137)');
                $('.airRouteBtn').show();
                $('.civilRouteList').show();
                $('.bottompanel_air').hide();
                $('.airRouteBtn .guding').addClass('cur');
                $('.airRouteBtn .zidingyi').removeClass('cur2');
                $('.civilRouteBtn .guding').addClass('cur');
                $('.civilRouteBtn .zidingyi').removeClass('cur2');
            }   
        })
      
        // // 自定义航线
        select = $('.airRouteBtn .zidingyi');
        // select.click(function(event) {
        //     $(this).addClass('cur2');
        //     $('.airRouteBtn .guding').removeClass('cur');
        //     $('.airRouteList').show();
        //     $('.airRouteList p').removeClass('curr');
        //     $('.civilRouteList').hide();
        //     $('.botPanelHangKong').hide();
        //     civil_route.removeAllLayer();
        //     custom_route.removeAllLayer();
        //     multiAviation.removePopup();
        // });
        //
        // // 固定航线
        // $('.airRouteBtn .guding').click(function(event) {
        //     $(this).addClass('cur');
        //     $('.airRouteBtn .zidingyi').removeClass('cur2');
        //     $('.airRouteList').hide();
        //     $('.botPanelHangKong').hide();
        //     $('.civilRouteList').show();
        //     $('.civilRouteList p').removeClass('curr');
        //     removeMultipoint();
        //     custom_route.removeAllLayer();
        //     civil_route.removeAllLayer();
        // });

        // 固定航线
        $('.airRouteList .civilRouteBtn .guding').click(function(event) {
            $('.civilRouteList .civilRouteBtn .guding').addClass('cur');
            $('.civilRouteList .civilRouteBtn .zidingyi').removeClass('cur2');
            $('.airRouteList .civilRouteBtn .guding').removeClass('cur');
            $('.airRouteList .civilRouteBtn .zidingyi').removeClass('cur2');
            $('.airRouteList').hide();
            $('.botPanelHangKong').hide();
            $('.civilRouteList').show();
            $('.civilRouteList p').removeClass('curr');
            removeMultipoint();
            custom_route.removeAllLayer();
            civil_route.removeAllLayer();
        });

        //自定义航线
        $(".civilRouteList .civilRouteBtn .zidingyi").click(function(event) {
            $('.airRouteList .civilRouteBtn .zidingyi').addClass('cur2');
            $('.airRouteList .civilRouteBtn .guding').removeClass('cur');
            $('.civilRouteList .civilRouteBtn .zidingyi').removeClass('cur2');
            $('.civilRouteList .civilRouteBtn .guding').removeClass('cur');
            $('.airRouteList').show();
            $('.airRouteList p').removeClass('curr');
            $('.civilRouteList').hide();
            $('.botPanelHangKong').hide();
            civil_route.removeAllLayer();
            custom_route.removeAllLayer();
            multiAviation.removePopup();
        });

        $('.airRoute_pop .airRoute_pop_btn').click(function(){
            removeMultipoint();
        })

        //-------------------------弹窗
        popupId = 'popup_multi';
        popup = '<div class="singlePoint singlePointHai" id="' + popupId + '"></div>';

        // $('.botHangKongRight .ok').on('click', function(){
        //     updateMultipoint();
        //     if(isOpen) {
        //         queryProfile();
        //     }
        // });

        //-----------------------------地图点击事件 
        XHW.C.mapclick.addCallback('map', function(lnglat){
            if(select.hasClass('cur2') && $('#aviation').hasClass('active')) {
                mapClick(lnglat);     
            }
        })

        // XHW.C.mapclick.addCallback('danger_routePoint', function(value){
        //     console.log(value)
        //     gethtml(value)
        // })
        XHW.C.mouse.addCallback('danger_routePoint', function (value) {
            var html = '<div style="background:white;color：black;border:3px solid #31BEF4;"><p>' + value.lonlat +'</p>' + value.info +'</div>';
            return html;
        });

        function gethtml(value){
            var html = '<div style="background:white;color：black;border:3px solid #31BEF4;"><p>' + value.lonlat +'</p>' + value.info +'</div>';
            return html;
        }

        var lastClickTime = 0;
        var clickTimer;
        $('#map').on('click', (event) => {
            var nowTime = new Date().getTime();
            if (nowTime - lastClickTime < 300) {
                /*双击*/
                lastClickTime = 0;
                clickTimer && clearTimeout(clickTimer);
                if(select.hasClass('cur2') && $('#aviation').hasClass('active')) {
                    $('.airRoute_pop').show();
                    // multiAviation.queryAviationInfo(nlnglats, locationNameMap);
                    // queryProfile();
                } 
                
            } else {
                /*单击*/
                lastClickTime = nowTime;
                // clickTimer = setTimeout(() => {
                //     alert('单击');
                // }, 400);
            }
        });

        type = 'multipoint';
        $('.botPanelHangKong .delHangKong').click(function(event) {
            close();
        });
        $('.botPanelHaiYang .delHangKong').click(function(event) {
            close();
        });
    }

    init();

    function queryProfile() {
        if(nlnglats && nlnglats.length > 1) {
            multiAviation.queryAviationInfo(nlnglats, locationNameMap);
        }else{
            alert('航线点数不能小于2个')
        }
    }

    /**
     * 地图点击事件
     * @param {*} lnglat 
     */
    function mapClick(lnglat){
        // if(select.children('.currenterJiBtn').children('a').html() == '海洋航线') {
        //     var param = {
        //         lng: lnglat[0],
        //         lat: lnglat[1]
        //     }
        //     XHW.C.http.get(XHW.C.http.oceanUrl, '/tools/isOcean', param, function(json){
        //     }, function(json){
        //         if(json.landtype == 'ocean') {
        //             nLnglat = lnglat;
        //             XHW.F.point.sub().multi.buttonEvent(!nlnglats || nlnglats.length == 0?'create':'add');
        //         } else {
        //             //提示无法点击
        //         }
        //     });
        // } else {
            nLnglat = lnglat;
            XHW.F.point.sub().multi.buttonEvent(!nlnglats || nlnglats.length == 0?'create':'add');
        // }
    }

    /**
     * 弹窗按钮点击事件
     * @param {*} event
     */
    function buttonEvent(event, value){
        switch(event){
            case 'create': createMultipoint(); break;
            case 'add': addMultipoint(); break;
            case 'insert': insertMultipoint(value); break;
            case 'remove': removeMultipoint(value); break;
            case 'update': updateMultipoint(value); break;
        }
        removePopup();
    }

    /**
     * 创建多点剖面图路径
     */
    function createMultipoint(lnglat){
        lnglat = lnglat ? lnglat : nLnglat;
        if(layer || nlnglats) {
            removeMultipoint();
        }
        nlnglats = [];
        nlnglats.push(lnglat);
        showMultipointMenu();
        // $('#' + multipointMenu).show();
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
        if(value || value == 0) {
            if (nlnglats.length <= 2) {
                window.alert('请至少选择两个航路点');
                return;
            }
            //删除单个点
            nlnglats.splice(value, 1);
            if(nlnglats.length == 0) {
                removeMultipoint();
                return;
            }
            showMultipointMenu();
        } else {
            //全部删除
            XHW.map.removeLayer(layer);
            layer = null;
            nlnglats = null;
            // $('#multi_point_list').empty();
            $('.botPanelRightTu .listDiv ul').empty();
            // $('#' + multipointMenu).hide();
            removePopup();
        }
    }
    /**
     * 删除多点剖面图途经点
     * @param {*} value 要删除的点的数据(value为空时全部删除)
     */
    function insertMultipoint(value){
        if(nlnglats.length > 1) {

            if(nlnglats.length - 1 <= value) {
                let coordinate1 = nlnglats[nlnglats.length - 2];
                let coordinate2 = nlnglats[nlnglats.length - 1];
                let lon = (coordinate1[0] + coordinate2[0])/2;
                let lat = (coordinate1[1] + coordinate2[1])/2;
                let coordinate = [lon, lat];
                nlnglats.splice(value, 0, coordinate);
            } else {
                let coordinate1 = nlnglats[value];
                let coordinate2 = nlnglats[value + 1];
                let lon = (coordinate1[0] + coordinate2[0])/2;
                let lat = (coordinate1[1] + coordinate2[1])/2;
                let coordinate = [lon, lat];
                nlnglats.splice(value, 0, coordinate);
            }
            showMultipointMenu();
        }
    }
    /**
     * 修改多点剖面图途经点
     * @param {*} value 
     */
    function updateMultipoint(value){
        let lis = null;
        if(select.children('.currenterJiBtn').children('a').html() == '海洋航线') {
            lis = $('.botPanelHaiYang .botPanelRightTu .listDiv ul').children('li');
        } else {
            lis = $('.botPanelHangKong .botPanelRightTu .listDiv ul').children('li');
        }
        
        if (lis.length > 0) {
            nlnglats = [];
            for (let i = 0; i < lis.length; i++) {
                if ($(lis[i]).children('input')[0]) {
                    let lonStr = $(lis[i]).children('input')[1].value;
                    let latStr = $(lis[i]).children('input')[0].value;
                    let lon = lonStr.substring(0, lonStr.length - 1);
                    if (lonStr.substring(lonStr.length - 1) == 'W')  {
                        lon = -lon;
                    }
                    let lat = latStr.substring(0, latStr.length - 1);
                    if (latStr.substring(latStr.length - 1) == 'S')  {
                        lat = -lat;
                    }
                    lnglat = [parseFloat(lon), parseFloat(lat)];
                    nlnglats.push(lnglat);
                }
            }
        }

        showMultipoint();
    }

    /**
     * 填充多点剖面图途经点的菜单
     */
    function showMultipointMenu(){
        var html = '';
        let temp = '<div class="airRoute_pop_focus">'+
                        '<input type="text" class="pop_lng" value="{lon}">'+
                        '<input type="text" class="pop_lat" value="{lat}">'+
                        '<input type="text" class="pop_height" value="">'+
                        '<div class="addSpan" onclick="XHW.F.point.sub().multi.buttonEvent(' + '\'insert\'' + ', {index})"><img src="img/guanzhu_pop/add_min.png" height="23" width="25" alt=""></div>'+
                        '<div class="delSpan" onclick="XHW.F.point.sub().multi.buttonEvent(' + '\'remove\'' + ', {index})"><img src="img/guanzhu_pop/del.png" height="23" width="25" alt=""></div>'+
                    '</div>'
        for(let i = 0; i < nlnglats.length; i++){
            let latlng = format.lnglat(nlnglats[i][0], nlnglats[i][1]).split(' , ');
            let latlngHtml = temp.replace('{lon}', latlng[1]);
            latlngHtml = latlngHtml.replace('{lat}', latlng[0]);
            latlngHtml = latlngHtml.replace('{index}', i+'');
            latlngHtml = latlngHtml.replace('{index}', i+'');
            html += latlngHtml;
        }

        $('.airRoute_pop_con .airRoute_pop_main').html(html);
        // $('.botPanelHangKong .botPanelRightTu .listDiv ul').html(html);
        // $('.botPanelHaiYang .botPanelRightTu .listDiv ul').html(html);

        showMultipoint();
    }

    /**
     * 显示多点剖面图路径
     */
    function showMultipoint(){
        let markers = [];
        let lnglats = [];
        //-----------step1--------------遍历数据
        for(let i = 0; i < nlnglats.length; i++) {
            let lnglat = ol.proj.fromLonLat(nlnglats[i]);
            //--------step2-------------画点
            let marker = new ol.Feature({
                geometry:new ol.geom.Point(lnglat), 
            });
            //----------step3------------给marker加入标记
            marker.type = type;
            marker.value = {
                id: i
            };
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
                }),
                text: new ol.style.Text({
                    text: format.lnglat(nlnglats[i][0], nlnglats[i][1])+'',
                    fill: new ol.style.Fill({
                        color: '#fff'
                    }),
                    textBaseline: 'top',
                    offsetY: -25,
                    padding: [5,5,5,5],
                    backgroundFill: new ol.style.Fill({
                        color: '#666'
                    })
                })
            }));
            //-----------step5------------把marker加入数组
            markers.push(marker);
            lnglats.push(lnglat);
        }

        //---------step6--------画线以及设置线的样式
        let line = new ol.Feature({
            geometry: new ol.geom.LineString(lnglats)
        });
        line.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 3,
                color: 'yellow'
            }),
        }));

        //----------step7-----------把marker和线放到同一组数据中
        let feature = markers;
        feature.push(line);

        //-------step8--------删除旧图层，替换新的图层
        if(!layer || $.inArray(layer, XHW.map.getLayers().getArray()) == -1){
            layer = new ol.layer.Vector();
            layer.setZIndex(15);
            XHW.map.addLayer(layer);
        }
        let source = new ol.source.Vector({
            features: feature
        });
        layer.setSource(source);

        // if(select.children('.currenterJiBtn').children('a').html() != '海洋航线') {
            initNearstLocationName();
        // }
    }

    const locationNameMap = {};
    function initNearstLocationName() {
        if (nlnglats) {
            for (let i = 0; i < nlnglats.length; i++) {
                if (locationNameMap.hasOwnProperty(nlnglats[i][0] + ',' + nlnglats[i][1])) {
                    continue;
                }
                getAddressBy(nlnglats[i][0], nlnglats[i][1], function(address){
                    locationNameMap[nlnglats[i][0] + ',' + nlnglats[i][1]] = address&&address!=''?address:'unknown';
                }, function(error){
                    locationNameMap[nlnglats[i][0] + ',' + nlnglats[i][1]] = 'unknown';
                });
            }
        }
    }

    /**
     * 隐藏弹窗
     */
    function removePopup(){
        $('.ol-overlaycontainer-stopevent #lengthLabel').parent().remove(); //长度信息
        if(overlay) {
            XHW.map.removeOverlay(overlay);
            overlay = null;
            nLnglat = null;
        }
    }

    function close(){
        $('.ol-overlaycontainer-stopevent #lengthLabel').parent().remove(); //长度信息
        removePopup();
        removeMultipoint();
        
        // $('.botPanelHangKong').stop().animate({'bottom':'-500px'}, 200);
        $('.botPanelHangKong').hide();
        $('#botPanelHaiYangDiv .botPanelHaiYang').stop().animate({'bottom':'-500px'}, 200);

        // $('.airRouteBtn').hide();
        // $('.airRouteList').hide();
        // $('.civilRouteList').hide();
        // $('.airRoute_pop').hide();
        // $('#multi_select').css('background','none');
        // $('#multi_select').children('span').removeClass('current');
    }

    return {
        buttonEvent: buttonEvent,
        removeMultipoint:removeMultipoint,
        close: close
    }
});
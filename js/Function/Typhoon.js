//台风实现
define([], function () {
    var button;
    var selectSource;
    var selectYear;

    var type = 'typhoon';
    var typhoon;    //数据集合
    var layers;     //图层组
    var forecastLayers;     //台风预报图层组
    var rangeLayers;     //风圈图层组
    var timeOut;    //延时动画ID组

    var item;
    var legend;

    var proinfo_key;
    var animationTime = 50; //动画时间间隔(毫秒)

    /**
     * 初始化 设置按钮事件
     */
    function init() {
        //-------------------初始化按钮
        button = $('#typhoon_button');
        button.click(function (event) {
            if (!button.parent().hasClass('current')) {
                open();
                $('.tuLiTyphoon').show();
                $('.taiFeng1').show();
            } else {
                close();
                $('.tuLiTyphoon').hide()
            }
        });
        $('.taiFeng1 .del').click(function (e) {
            close()
        })

        legend = '<ul class="jichangUl">' +
            '<li><img src="img/typhoon/tropicalDepress.png" width="15" alt="" /><span>热带低压</span></li>' +
            '<li><img src="img/typhoon/tropicalStorm.png" width="15" alt="" /><span>热带风暴</span></li>' +
            '<li><img src="img/typhoon/sTropicalStorm.png" width="15" alt="" /><span>强热带风暴</span></li>' +
            '<li><img src="img/typhoon/typhoon.png" width="15" alt="" /><span>台风</span></li>' +
            '<li><img src="img/typhoon/sTyphoon.png" width="15" alt="" /><span>强台风</span></li>' +
            '<li><img src="img/typhoon/ssTyphoon.png" width="15" alt="" /><span>超强台风</span></li>' +
            '</ul>';
        item = XHW.C.layerC.createItem('热带气旋', legend, function () {
            close();
        })

        $('.taiFeng1 .taiFengDel').click(function (event) {
            close();
        });

        $('.taiFeng2 .taiFengDel').click(function (event) {
            $('.taiFeng2').hide();
        });

        //----------------------初始化选择框
        selectSource = $('#typhoon_select_source');
        selectYear = $('#typhoon_select_year');
        //---- 设置可选择年份，设置初始年份
        //---------step1 清空列表
        selectYear.empty();
        //---------step2 获取系统时间 获取当前年份
        var year = new Date().getFullYear();
        //---------step3 循环10 添加年份
        for (var length = year - 20; year > length; year--) {
            selectYear.append('<option value=' + year + '>' + year + '</option>');
        }
        //---------step4 设置选项变更监听
        selectSource.change(function () {
            if (button.parent().hasClass('current')) {  //判断当前功能是否开启
                removeAll();
                getTyphoon();
            }
        });

        selectYear.change(function () {
            if (button.parent().hasClass('current')) {  //
                removeAll();
                getTyphoon();
            }
        });

        //----------------------初始化数组
        layers = [];
        forecastLayers = [];
        rangeLayers = [];
        timeOut = [];

        //----------------------注册鼠标移动到本功能marker上时的事件
        XHW.C.mouse.addCallback(type, function (value) {
            return getPopupHtml(value.id, value.count);
        });

        //----------------------注册marker的鼠标点击事件
        XHW.C.mapclick.addCallback(type, function (value) {
            drawRange(value.id, value.count);
            return getPopupHtml(value.id, value.count)
            // drawTyphoonForecast(value.id, value.count, markers)
        })
        /**
         * 点击事件
         * 注意：此方法连续点击同一目标不会多次触发
         * 例： 点击marker1时响应，点击marker2时响应
         *      点击marker1时响应，再次点击marker1时不响应
         *      点击marker1时响应，点击地图后再次点击marker1时响应
         *      点击地图时响应，再次点击地图时不响应（整个地图视为同一目标，且默认视为已点击地图）
         */
        // var selectSingleClick = new ol.interaction.Select();
        // XHW.map.addInteraction(selectSingleClick);
        // selectSingleClick.on('select', function(e) {
        //     var select = e.selected;
        //     if(select.length > 0 && select[0].type == 'typhoon') {
        //         var index = select[0].id;
        //         var count = select[0].count;
        //     }
        // });
    }
    init();

    var isHistory = false;
    /**
     * 获取台风数据
     */
    function getTyphoon() {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var mi = date.getMinutes();

        // 设置年份
        // TODO
        if (selectYear.val() == y /* && selectSource.val() == 'BABJ' */) {
            isHistory = false;
            var param = '?year=' + y + '&month=' + toTwo(m) + '&day=' + toTwo(d)
                + '&hour=' + toTwo(h) + '&minute=' + toTwo(mi) + '&daynum=180&isshowfinish=true'
                + '&source=' + selectSource.val();
            XHW.C.http.http('/typhdata', param, function (data) {
                typhoon = data.reverse();       //反转数组，把最新的台风放到数组最前
                if (typhoon) {
                    let tempTyphs = [];
                    for (var i = 0; i < typhoon.length; i++) {

                        if (typhoon[i].id && typhoon[i].id.indexOf(selectSource.val()) == -1) {
                            continue;
                        }
                        tempTyphs.push(typhoon[i]);
                    }
                    typhoon = tempTyphs;
                    showTyphoonList();
                }
            }, function () {
                let param = {
                    source: selectSource.val(),
                    year: selectYear.val(),
                };
                callHistory(param);
            })
        } else {
            let param = {
                source: selectSource.val(),
                year: selectYear.val(),
            };
            callHistory(param);
        }
    }

    function callHistory(param) {
        isHistory = true;
        XHW.C.http.get(XHW.C.http.weatherUrl, '/typh/yearTyphoonsID', param, function (json) {
            typhoon = json.data;
            showTyphoonList();
        }, function () {
            typhoon = [];
            showTyphoonList();
        })
    }

    /**
     * 开启台风
     */
    function open() {
        XHW.C.layerC.addLayer(type, item);
        button.parent().addClass('current');
        //---------step1 默认选中'BABJ'（第一条）
        selectSource.children().eq(0).attr('selected', 'selected');
        //---------step1 默认选中'RJTD'（BABJ 数据有误）
        // selectSource.children().eq(1).attr('selected', 'selected');
        //---------step2 默认选中最新年份（第一条）
        selectYear.children().eq(0).attr('selected', 'selected');
        XHW.C.layout.fenBianLv();
        //todo  现在进行测试 选中2015
        // selectYear.children().eq(4).attr('selected', 'selected');
        getTyphoon();
    }

    /**
     * 关闭功能
     */
    function close() {
        XHW.C.layerC.removeLayer(type);
        removeAll();
        button.parent().removeClass('current');
        $('.taiFeng1').hide();
        $('.taiFeng2').hide();
    }

    /**
     * 显示台风列表及设置列表选中
     */
    function showTyphoonList() {
        $('.taiFeng1 .bottomF').empty();
        for (let i = 0; i < typhoon.length; i++) {
            var data = typhoon[i];
            var html = '';

            // 默认显示前两项台风
            if (i < 2) {
                html += '<p><span style="width:15%;"><input class="input" type="checkbox" checked="checked" index=' + i + ' /></span><span>'
                    + data.id + '</span><span>' + name(data.ename, data.cname) + '</span></p>';
                showTyphoon(i)
            } else {
                html += '<p><span style="width:15%;"><input class="input" type="checkbox" index=' + i + ' /></span><span>'
                    + data.id + '</span><span>' + name(data.ename, data.cname) + '</span></p>'
            }
            $('.taiFeng1 .bottomF').append(html);
        }

        $('.taiFeng1 .bottomF p input').change(function (event) {
            var index = $(this).parent().parent().index();
            if ($(this).is(':checked')) {
                if (isHistory)
                    showHistoryTyphoonData(index);
                else
                    showTyphoon(index);
            } else {
                removeTyphoon(index);
            }
        });
    }

    /**
     * 填充台风时间/气压列表
     */
    function showTyphoonPointList(index) {
        var data = typhoon[index];
        var points = data.points;
        $('.taiFeng2 .top .nianFen').html(data.id + '&nbsp&nbsp&nbsp' + name(data.ename, data.cname));
        $('.taiFeng2 .bottomF').empty();

        var htmls = [];   //-----台风历史路径点的列表（openlayers的经纬度对象）
        for (var i = 0; i < points.length; i++) {
            var oDate = points[i].odate;
            var time = oDate.split(" ");
            var timeFir = time[0].slice(5);
            var timeSec = time[1].slice(0, 5);
            var centerSLP = points[i].centerInfo.centerSLP;
            var centerWS = points[i].centerInfo.centerWS;
            htmls.push(
                '<p><span style="width:35%;">' + timeFir + '&nbsp&nbsp&nbsp'
                + timeSec + '</span><span style="width:30%;">' + centerSLP + '&nbsp hPa</span><span style="width:30%;">' + centerWS + '&nbsp m/s</span></p>');
        }
        for (var i = htmls.length - 1; i >= 0; i--) {
            $('.taiFeng2 .bottomF').append(htmls[i]);
        }
        $('.taiFeng2').stop().fadeIn(300);
    }

    /**
     * 根据索引获取台风数据
     * @param {*} index 
     */
    function showHistoryTyphoonData(index) {
        var param = {
            id: typhoon[index].id
        }
        // http://192.6.1.90:8081/typh/singleTyphoon?id=RJTD-200701
        XHW.C.http.get(XHW.C.http.weatherUrl, '/typh/singleTyphoon', param, function (json) {
            typhoon[index] = json.data;
            showTyphoon(index);
        }, function () {

        })
    }

    /**
     * 根据索引绘制台风
     * @param {} index 
     */
    function showTyphoon(index) {
        var data = typhoon[index];
        var points = data.points;

        //-----------------------step1 遍历台风所有点并填充台风时间/气压列表------------------------
        $('.taiFeng2 .top .nianFen').html(data.id+'&nbsp&nbsp&nbsp'+name(data.ename,data.cname));
        $('.taiFeng2 .bottomF').empty();

        var lnglats = [];   //-----台风历史路径点的列表（openlayers的经纬度对象）
        for (var i = 0; i < points.length; i++) {
            var point = points[i].centerInfo;
            if (!point || JSON.stringify(point) == "{}") return;
            lnglats.push(ol.proj.fromLonLat([parseFloat(point.lng), parseFloat(point.lat)]));

            var oDate = points[i].odate;
            var time = oDate.split(" ");
            var timeFir = time[0].slice(5);
            var timeSec = time[1].slice(0,5);
            var centerSLP = point.centerSLP;
            $('.taiFeng2 .bottomF').append(
                '<p><span style="width:48%;">' + timeFir + '&nbsp&nbsp&nbsp' 
                + timeSec + '</span><span style="width:52%;">' + centerSLP + '&nbsp hPa</span></p>');
        }
        $('.taiFeng2').stop().fadeIn(300);
        showTyphoonPointList(index);


        var markers = [];   //-----marker点集合（包括台风名）

        //-----------------------step2 标注台风名称------------------------
        markFeatu = new ol.Feature({
            geometry: new ol.geom.Point(lnglats[0])
        });
        markFeatu.setStyle(new ol.style.Style({
            text: new ol.style.Text({
                textAlign: "center",
                textBaseline: "middle",
                font: '14px Normal Arial',
                text: name(data.ename, data.cname),
                fill: new ol.style.Fill({    //文字填充色
                    color: 'red',
                }),
                offsetX: 0,
                offsetY: 15,
                //标签的背景填充
                // backgroundStroke:new ol.style.Stroke({
                //     color:'#3D89D4',
                //     width:10,
                // }),
                // backgroundFill:new ol.style.Fill({
                //     color:'#3D89D4',
                // }),
            }),
        }));
        markers.push(markFeatu);

        //-----------------------step3 绘制台风路径------------------------
        drawTyphoon(index, 0, markers, lnglats);

        //-----------------------step4 地图转到最后一点------------------------
        XHW.map.getView().animate({ center: lnglats[lnglats.length - 1], zoom: 5 });
    }

    /**
     * 绘制台风，加入延时效果
     * @param {*} index
     * @param {*} count
     */
    function drawTyphoon(index, count, markers, lnglats) {
        timeOut[index] = setTimeout(function () {
            //---------step1---------判断是否超出界限
            if (count < lnglats.length) {
                //--------step*-------风圈独立绘制
                drawRange(index, count, lnglats[count]);

                //--------step2-------------画点
                var marker = new ol.Feature({
                    geometry: new ol.geom.Point(lnglats[count]),
                });
                //----------step3------------给marker加入标记
                marker.type = type;
                marker.value = {
                    id: index,
                    count: count
                }
                //-----------step4-------------调整marker的样式
                if (count < lnglats.length - 1) {
                    var color = getTyphoonPointColor(typhoon[index].points[count].centerInfo.centerWS);
                    marker.setStyle(new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: color
                            }),
                            fill: new ol.style.Fill({
                                color: color
                            })
                        })
                    }));
                } else {        //最后一个点样式不同
                    marker.setStyle(new ol.style.Style({
                        image: new ol.style.Icon({
                            rotation: Math.PI * 2,
                            // anchor: 'anonymous',
                            duration: 2000,
                            src: 'img/tf1.gif'
                        })
                    }));
                }
                //-----------step5------------把marker加入数组
                markers.push(marker);
                //---------step6--------画线以及设置线的样式
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(lnglats.slice(0, count + 1))
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
                if (layers[index]) {
                    XHW.map.removeLayer(layers[index]);
                }
                layers[index] = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: feature
                    })
                });
                layers[index].setZIndex(15);
                layers[index].id = type;
                XHW.map.addLayer(layers[index]);

                //-------step9--------绘制下一个点
                drawTyphoon(index, ++count, markers, lnglats);
            } else {
                //-------------------超出界限则停止绘制并置空延时任务ID(历史台风绘制完成)
                timeOut[index] = null;
                // markers = [];
                lnglats = [lnglats[count - 1]];
                //-------------------查询当前台风是否消亡 TODO 此部分之后可以提出单独方法
                if (!typhoon[index].isfinished) {    //未消亡(当前台风有预报)
                    var points = typhoon[index].points[count - 1].foreInfo;
                    points = (JSON.stringify(points) != '{}') ? points :
                        (JSON.stringify(typhoon[index].points[count - 2].foreInfo) != '{}') ? typhoon[index].points[count - 2].foreInfo :
                            typhoon[index].points[count - 3].foreInfo;
                    if (!points) return;
                    proinfo_key = [];
                    for (var key in points) {
                        proinfo_key.push(key);
                        var point = points[key];
                        lnglats.push(ol.proj.fromLonLat([parseFloat(point.lng), parseFloat(point.lat)]));
                    }
                    drawTyphoonForecast(index, 1, markers, lnglats);
                }
            }
        }, animationTime)
    }

    /**
     * 绘制台风预报路径  TODO 此功能没有进行测试
     * @param {*} index 
     * @param {*} count 
     * @param {*} markers 
     * @param {*} lnglats 
     */
    function drawTyphoonForecast(index, count, markers, lnglats) {
        timeOut[index] = setTimeout(function () {
            //---------step1---------判断是否超出界限
            if (count < lnglats.length) {
                //--------step*-------预报台风不绘制风圈
                //--------step2-------------画点
                var marker = new ol.Feature({
                    geometry: new ol.geom.Point(lnglats[count]),
                });
                //----------step3------------给marker加入标记
                marker.type = type;
                marker.value = {
                    id: index,
                    count: '_' + count
                }
                //-----------step4-------------调整marker的样式       

                var foreInfo = typhoon[index].points[typhoon[index].points.length - 1].foreInfo;
                foreInfo = (JSON.stringify(foreInfo) != '{}') ? foreInfo :
                    (JSON.stringify(typhoon[index].points[typhoon[index].points.length - 2].foreInfo) != '{}') ? typhoon[index].points[typhoon[index].points.length - 2].foreInfo :
                        typhoon[index].points[typhoon[index].points.length - 3].foreInfo;

                var key = proinfo_key[count];
                var ws = foreInfo[key]['centerWS'];
                var color = getTyphoonPointColor(ws);
                marker.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: color
                        }),
                        fill: new ol.style.Fill({
                            color: color
                        })
                    })
                }));

                //-----------step5------------把marker加入数组
                markers.push(marker);
                //---------step6--------画线以及设置线的样式
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(lnglats.slice(0, count + 1))
                });
                line.setStyle(new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        lineDash: [1, 2, 3, 4, 5, 6],
                        width: 2,
                        color: 'red',
                    }),
                }));

                //----------step7-----------把marker和线放到同一组数据中
                var feature = markers;
                feature.push(line);

                //-------step8--------删除旧图层，替换新的图层
                if (forecastLayers[index]) {
                    XHW.map.removeLayer(forecastLayers[index]);
                }
                forecastLayers[index] = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: feature
                    })
                });
                forecastLayers[index].setZIndex(15);
                forecastLayers[index].id = type;
                XHW.map.addLayer(forecastLayers[index]);

                //  如果是最后一个预报路径点返回
                if (proinfo_key.length - 1 == count) return;

                //-------step9--------绘制下一个点
                drawTyphoonForecast(index, ++count, markers, lnglats);
            } else {
                //-------------------超出界限则停止绘制并置空延时任务ID(预测台风绘制完成)
                timeOut[index] = null;
            }
        }, animationTime)
    }

    /**
     * 根据索引删除台风
     * @param {*} index 
     */
    function removeTyphoon(index) {
        //----------------取消台风绘制延时任务（如果绘制未完成）
        clearTimeout(timeOut[index]);
        timeOut[index] = null;
        //----------------删除台风图层
        XHW.map.removeLayer(layers[index]);
        layers[index] = null;
        //----------------删除风圈图层
        for (var i in rangeLayers[index]) {
            XHW.map.removeLayer(rangeLayers[index][i]);
        }
        rangeLayers[index] = null;

        //----------------删除预报路径图层
        XHW.map.removeLayer(forecastLayers[index]);
        forecastLayers[index] = null;

    }

    /**
     * 
     */
    function removeAll() {
        for (var i in layers) {
            removeTyphoon(i);
        }
    }

    /**
     * 根据风速获取台风点的颜色
     * @param {*} centerWS 
     */
    function getTyphoonPointColor(centerWS) {
        var color = centerWS > 54 ? '#ff0000' :    //大于54米/秒   红色
            centerWS > 49 ? '#ff00ff' :    //大于49米/秒   紫色
                centerWS > 29 ? '#ff8000' :    //大于29米/秒   橙色
                    centerWS > 25 ? '#ffff00' :    //大于25米/秒   黄色
                        centerWS > 15 ? '#0000ff' :    //大于15米/秒   蓝色
                            '#00ff00';    //其他风速      绿色

        return color;
    }

    /**
     * 根据索引绘制风圈半径
     * @param {*} index 
     * @param {*} count 
     * @param {*} lnglat 
     */
    function drawRange(index, count, lnglat) {
        var point = typhoon[index].points[count];
        // XHW.map.removeLayer(rangeLayers[index][0]);
        // XHW.map.removeLayer(rangeLayers[index][1]);
        // XHW.map.removeLayer(rangeLayers[index][2]);
        for (var i in rangeLayers[index]) {
            XHW.map.removeLayer(rangeLayers[index][i]);
        }
        if (!lnglat) {
            lnglat = ol.proj.fromLonLat([parseFloat(point.centerInfo.lng),
            parseFloat(point.centerInfo.lat)]);
        }
        rangeLayers[index] = [];
        if (point.r30 && point.r30[0] != null) {      //绿色 r30
            var range = oLRange(lnglat, point.r30[0].radius, point.r30[1].radius
                , point.r30[2].radius, point.r30[3].radius);
            rangeLayers[index][0] = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: range
                }),
                style: getRangeStyle('rgba(50,187,76,0.4)', '#35BB40')
            });
            rangeLayers[index][0].setZIndex(13);
            rangeLayers[index][0].id = type;
            XHW.map.addLayer(rangeLayers[index][0]);
        }
        if (point.r50 && point.r50[0] != null) {      //黄色 r50
            var range = oLRange(lnglat, point.r50[0].radius, point.r50[1].radius
                , point.r50[2].radius, point.r50[3].radius);
            rangeLayers[index][1] = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: range
                }),
                style: getRangeStyle('rgba(216,210,44,0.4)', '#E1D31F')
            });
            rangeLayers[index][1].setZIndex(13);
            rangeLayers[index][1].id = type;
            XHW.map.addLayer(rangeLayers[index][1]);
        }
        if (point.r70 && point.r70[0] != null) {      //红色 r70
            var range = oLRange(lnglat, point.r70[0].radius, point.r70[1].radius
                , point.r70[2].radius, point.r70[3].radius);
            rangeLayers[index][2] = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: range
                }),
                style: getRangeStyle('rgba(228,54,36, 0.4)', '#FD0002')
            });
            rangeLayers[index][2].setZIndex(13);
            rangeLayers[index][2].id = type;
            XHW.map.addLayer(rangeLayers[index][2]);
        }
    }

    /**
     * 获取台风风圈的openlayers地图对象
     * @param {ol.proj.lonlat} lnglat    openlayers地图的经纬度对象
     * @param {int} EN        东北风圈半径
     * @param {int} ES        东南风圈半径
     * @param {int} WS        西南风圈半径
     * @param {int} WN        西北风圈半径
     */
    function oLRange(lnglat, EN, ES, WS, WN) {
        EN = EN * 14 * 100;
        ES = ES * 14 * 100;
        WS = WS * 14 * 100;
        WN = WN * 14 * 100;
        var wktformat = new ol.format.WKT();
        var wkt = "POLYGON((";
        var wkt0 = "";
        var _interval = 1;

        for (var i = 0; i < 360 / _interval; i++) {
            var _r = 0;
            var _ang = i * _interval;
            if (_ang > 0 && _ang <= 90) {
                _r = EN;
            } else if (_ang > 90 && _ang <= 180) {
                _r = WN;
            } else if (_ang > 180 && _ang <= 270) {
                _r = WS;
            } else {
                _r = ES;
            }
            var x = lnglat[0] + _r * Math.cos(_ang * 3.14 / 180);
            var y = lnglat[1] + _r * Math.sin(_ang * 3.14 / 180);
            wkt = wkt + "" + x + " " + y + ", ";
            if (i === 0) {
                wkt0 = "" + x + " " + y + "";
            }
        }
        wkt = wkt + wkt0 + "))";
        return [wktformat.readFeature(wkt)
            , wktformat.readFeature("POINT(" + lnglat[0] + " " + lnglat[1] + ")")];
    }

    /**
     * 获取风圈样式
     * @param {*} fillColor 
     * @param {*} imageColor 
     */
    function getRangeStyle(fillColor, strokeColor) {
        return new ol.style.Style({
            fill: new ol.style.Fill({ color: fillColor }),
            stroke: new ol.style.Stroke({ color: strokeColor, width: 2 }),
        });
    };

    // 数字小于10，前面加“0”
    function toTwo(time) {
        return time < 10 ? "0" + time : time;
    };

    // 台风名   有中文名用中文名，没有中文名用英文名
    function name(ename, cname) {
        if (cname) {
            return cname;
        } else {
            return ename;
        }
    };

    /**
     * 根据索引和计数，获取台风弹窗布局
     * @param {*} index 
     * @param {*} count 
     */
    function getPopupHtml(index, count) {
        var ename = typhoon[index].ename;
        var cname = typhoon[index].cname;
        var data, odate, centerWsKmh, centerWsKnot, pastWsKmh, pastWsKnot, lat, lng, centerSLP, pastWD, timestr;
        if (!isNaN(count)) {
            data = typhoon[index].points[count];
            odate = data.odate;
            centerWsKmh = toDecimal(data.centerInfo.centerWS, 1);
            centerWsKnot = toDecimal(mToKnot(data.centerInfo.centerWS), 1);
            pastWsKmh = toDecimal(data.centerInfo.pastWS, 1);
            pastWsKnot = toDecimal(mToKnot(data.centerInfo.pastWS), 1);

            lat = data.centerInfo.lat;
            lng = data.centerInfo.lng;
            centerSLP = data.centerInfo.centerSLP;
            pastWD = data.centerInfo.pastWD;
            timestr = '观测时间:';
        } else {
            var fore_count = count.split('_')[1] - 1;
            var fore_key = proinfo_key[fore_count];
            var foreInfo = typhoon[index].points[typhoon[index].points.length - 1].foreInfo;
            data = (JSON.stringify(foreInfo) != '{}') ? typhoon[index].points[typhoon[index].points.length - 1] :
                (JSON.stringify(typhoon[index].points[typhoon[index].points.length - 2].foreInfo) != '{}') ? typhoon[index].points[typhoon[index].points.length - 2] :
                    typhoon[index].points[typhoon[index].points.length - 3];
            var time_ms = new Date(data.odate).getTime();
            var hour_ms = fore_key * 60 * 60 * 1000;
            odate = time_ms + hour_ms;
            odate = formatTime(odate, 'Y-M-D h:m:s');
            centerWsKmh = toDecimal(data.foreInfo[fore_key].centerWS, 1);
            centerWsKnot = toDecimal(mToKnot(data.foreInfo[fore_key].centerWS), 1);
            pastWsKmh = toDecimal(data.foreInfo[fore_key].pastWS, 1);
            pastWsKnot = toDecimal(mToKnot(data.foreInfo[fore_key].pastWS), 1);

            lat = data.foreInfo[fore_key].lat;
            lng = data.foreInfo[fore_key].lng;
            centerSLP = data.foreInfo[fore_key].centerSLP;
            pastWD = data.foreInfo[fore_key].pastWD;
            timestr = '预报时间:';
        }



        var html = '<div id="typhoonLayout" style="font-size:0.12rem;background:rgba(0,0,0,0.5);padding:0.1rem;border-radius:0.03rem;color:#ffffff;position:absolute;left:0.03rem;bottom:0.03rem;width:auto;min-width:1.78rem;">'
            + '<h1>' + ename + '&nbsp&nbsp&nbsp&nbsp' + (cname ? ("(" + cname + ")") : '') + '</h1>'
            + '<h3 style="font-size:12px;margin:5px 0;">' + timestr + odate.substring(0, 13) + '时</h3>'
            // + '<h3 style="font-size:12px;margin:5px 0;">最大风速：' + data.centerInfo.centerWS + '米/秒</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">平均风速：' + centerWsKmh + 'm/s(' + centerWsKnot + '节)</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">中心位置：' + lat + "N  / " + lng + 'E</h3>'
            + '<h3 style="font-size:12px;margin:5px 0;">中心气压：' + centerSLP + '百帕</h3>';

        if (pastWD && pastWsKmh) {
            html += '<h3 style="font-size:12px;margin:5px 0;">移动方向：' + typhoonDirection(pastWD) + '</h3>'
                + '<h3 style="font-size:12px;margin:5px 0;">移动速度：' + pastWsKmh + 'm/s(' + pastWsKnot + '节)</h3>';
        }

        if (timestr == '观测时间:') {
            if (data.r30 && data.r30[0] != null) {
                html += '<h3>7级风：' + data.r30[0].radius + '&nbsp&nbsp' + data.r30[1].radius
                    + '&nbsp&nbsp' + data.r30[2].radius + '&nbsp&nbsp' + data.r30[3].radius + '</h3>'
            }

            if (data.r50 && data.r50[0] != null) {
                html += '<h3>10级风：' + data.r50[0].radius + '&nbsp&nbsp' + data.r50[1].radius
                    + '&nbsp&nbsp' + data.r50[2].radius + '&nbsp&nbsp' + data.r50[3].radius + '</h3>'
            }

            if (data.r70 && data.r70[0] != null) {
                html += '<h3>12级风：' + data.r70[0].radius + '&nbsp&nbsp' + data.r70[1].radius
                    + '&nbsp&nbsp' + data.r70[2].radius + '&nbsp&nbsp' + data.r70[3].radius + '</h3>'
            };
        }
        html += '</div>';
        return html;
    }

    /**
     * 根据风速获取中文角度描述
     * @param {*} wd 
     */
    function typhoonDirection(wd) {
        var direction = wd > 360 ? wd - 360 : wd;
        direction = ((direction + 22.5) / 45) >> 0;
        direction = direction >= 8 ? '北' :
            direction >= 7 ? '西北' :
                direction >= 6 ? '西' :
                    direction >= 5 ? '西南' :
                        direction >= 4 ? '南' :
                            direction >= 3 ? '东南' :
                                direction >= 2 ? '东' :
                                    direction >= 1 ? '东北' : '北';
        return direction;
    }

    // 格式化日期，如月、日、时、分、秒保证为2位数
    function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n;
    }
    //  时间戳转换为固定时间格式         formatTime(1545903266795, 'Y-M-D h:m:s')
    function formatTime(number, format) {
        let time = new Date(number)
        let newArr = []
        let formatArr = ['Y', 'M', 'D', 'h', 'm', 's']
        newArr.push(time.getFullYear())
        newArr.push(formatNumber(time.getMonth() + 1))
        newArr.push(formatNumber(time.getDate()))

        newArr.push(formatNumber(time.getHours()))
        newArr.push(formatNumber(time.getMinutes()))
        newArr.push(formatNumber(time.getSeconds()))

        for (let i in newArr) {
            format = format.replace(formatArr[i], newArr[i])
        }
        return format;
    }

    return {
        init: init,
        getTyphoon: getTyphoon,
        getPopupHtml: getPopupHtml,
        close: close
    }
});
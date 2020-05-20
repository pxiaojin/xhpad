define([], function() {
    //格式
    var vector;
    var vectors = [];
    var format = 'image/png';
    // var bounds = [73.441277, 18.159829,
    //     135.08693, 53.561771];//范围
    

    //添加比例尺控件
    // var scaleLineControl = new ol.control.ScaleLine({
    //     units: 'metric',
    //     target: 'scalebar',
    //     className: 'ol-scale-line'
    // });
    // map.addControl(scaleLineControl);

    //实例化鼠标位置控件
    var mousePositionControl = new ol.control.MousePosition({
        coodrdinateFormat: ol.coordinate.createStringXY(4),//坐标格式
        //地图投影坐标系
        projection: new ol.proj.Projection({
            code: 'EPSG:4326',//投影编码
            units: 'degrees',
            axisOrientation: 'neu'
        }),
        //className:'tip',
        target: document.getElementById('tip'),//显示鼠标位置信息的目标容器
        undefinedHTML: ' '//未定义坐标标记
    });

    //添加鼠标位置控件
    XHW.map.addControl(mousePositionControl);

    //实例化鹰眼控件 
    // var overviewMapControl = new ol.control.OverviewMap({
    //     //在鹰眼中相同坐标系下不通数据源的图层
    //     layers: [
    //         new ol.layer.Tile({
    //             source: new ol.source.OSM({
    //                 'url': 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
    //             })
    //         })
    //     ],
    //     collapseLabel: '\u00BB',
    //     lable: '\u00AB',
    //     collapsed: false,
    // });
    //添加鹰眼
    // XHW.map.addControl(overviewMapControl);

    //创建一个WGS84球体对象
    var wgs84Sphere = new ol.Sphere(6378137);
    //创建一个当前要绘制的对象
    var sketch = new ol.Feature();
    //创建一个帮助提示框对象
    var helpTooltipElement;
    //创建一个帮助提示信息对象
    var helpTooltip;
    //创建一个测量提示框对象
    var measureTooltipElement;
    //创建一个测量提示信息对象
    var measureTooltip;
    //继续绘制多边形的提示信息
    var continuePolygonMsg = '单击以继续绘制多边形，鼠标左键双击结束';
    //继续绘制线段的提示信息
    var continueLineMsg = '单击以继续绘制多边形，鼠标左键双击结束';

    //鼠标移动触发的函数
    var pointerMoveHandler = function (evt) {
        //Indicates if the map is currently being dragged. 
        //Only set for POINTERDRAG and POINTERMOVE events. Default is false.
        //如果是平移地图则直接结束
        if (evt.dragging) {
            return;
        }
        //帮助提示信息
        var helpMsg = '单击开始，鼠标左键双击结束';

        if (sketch) {
            //获取绘图对象的几何要素
            var geom = sketch.getGeometry();
            //如果当前绘制的几何要素是多线段，则将绘制提示信息设置为多线段绘制提示信息
            if (geom instanceof ol.geom.Polygon) {
                helpMsg = continuePolygonMsg;
            } else if (geom instanceof ol.geom.LineString) {
                helpMsg = continueLineMsg;
            }
        }
        //设置帮助提示要素的内标签为帮助提示信息
        helpTooltipElement.innerHTML = helpMsg;
        //设置帮助提示信息的位置
        helpTooltip.setPosition(evt.coordinate);
        //移除帮助提示要素的隐藏样式
        $(helpTooltipElement).removeClass('hidden');

        
        var lonlat = ol.proj.transform( evt.coordinate ,'EPSG:3857' ,'EPSG:4326');
        var lon = Math.floor(lonlat[0] * 100) / 100 ;
        var lat = Math.floor(lonlat[1] * 100) / 100 ;
        lonlat = lon+'E,'+lat+'N';
        // console.log(lonlat)
        $('#menu .ol_lonlat').html(lonlat);
    };

    //触发pointermove事件
    // XHW.map.on('pointermove', pointerMoveHandler);

    //当鼠标移除地图视图的时为帮助提示要素添加隐藏样式
    $(XHW.map.getViewport()).on('mouseout', function () {
        $(helpTooltipElement).addClass('hidden');
    });

    //获取大地测量复选框
    var geodesicCheckbox = document.getElementById('geodesic');
    //获取类型
    var typeSelect = document.getElementById('type');
    //定义一个交互式绘图对象
    var draw;

    //添加交互式绘图对象的函数
    function addInteraction() {
        //触发pointermove事件
        XHW.map.on('pointermove', pointerMoveHandler);
        
        var source=new ol.source.Vector();
        vector = new ol.layer.Vector({
            source: source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#e21e0a',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255,0,0,0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });
        
        vector.setZIndex(10);
        //将矢量图层添加到地图中
        XHW.map.addLayer(vector);
        vectors.push(vector);
        // 获取当前选择的绘制类型
        var type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
        //创建一个交互式绘图对象
        draw = new ol.interaction.Draw({
            //绘制的数据源
            source: source,
            //绘制类型
            type: type,
            //样式
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,0,0,0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0,0,0,0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255,255,255,0.2)'
                    })
                })
            })
        });
        //将交互绘图对象添加到地图中
        XHW.map.addInteraction(draw);

        //创建测量提示框
        createMeasureTooltip();
        //创建帮助提示框
        createHelpTooltip();

        //定义一个事件监听
        var listener;
        //定义一个控制鼠标点击次数的变量
        var count = 0;
        //绘制开始事件
        draw.on('drawstart', function (evt) {
            //The feature being drawn.
            sketch = evt.feature;
            //提示框的坐标
            var tooltipCoord = evt.coordinate;
            //监听几何要素的change事件
            //Increases the revision counter and dispatches a 'change' event.

            listener = sketch.getGeometry().on('change', function (evt) {
                //The event target.
                //获取绘制的几何对象
                var geom = evt.target;
                //定义一个输出对象，用于记录面积和长度
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    XHW.map.removeEventListener('singleclick');
                    XHW.map.removeEventListener('dblclick');
                    //输出多边形的面积
                    output = formatArea(geom);
                    //获取多变形内部点的坐标
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    //输出多线段的长度
                    output = formatLength(geom);
                    //获取多线段的最后一个点的坐标
                    tooltipCoord = geom.getLastCoordinate();
                }

                //设置测量提示框的内标签为最终输出结果
                measureTooltipElement.innerHTML = output;
                //设置测量提示信息的位置坐标
                measureTooltip.setPosition(tooltipCoord);
            });

            //地图单击事件
            XHW.map.on('singleclick', function (evt) {
                //设置测量提示信息的位置坐标，用来确定鼠标点击后测量提示框的位置
                measureTooltip.setPosition(evt.coordinate);
                //如果是第一次点击，则设置测量提示框的文本内容为起点
                if (count == 0) {
                    measureTooltipElement.innerHTML = "起点";
                }
                //根据鼠标点击位置生成一个点
                var point = new ol.geom.Point(evt.coordinate);
                //将该点要素添加到矢量数据源中
                source.addFeature(new ol.Feature(point));
                //更改测量提示框的样式，使测量提示框可见
                measureTooltipElement.className = 'tooltip tooltip-static';
                //创建测量提示框
                createMeasureTooltip();
                //点击次数增加
                count++;
            });

            //地图双击事件
            XHW.map.on('dblclick', function (evt) {
                var point = new ol.geom.Point(evt.coordinate);
                source.addFeature(new ol.Feature(point));
            });
        }, this);
        //绘制结束事件
        draw.on('drawend', function (evt) {
            count = 0;
            //设置测量提示框的样式
            measureTooltipElement.className = 'tooltip tooltip-static';
            //设置偏移量
            measureTooltip.setOffset([0, -7]);
            //清空绘制要素
            sketch = null;
            //清空测量提示要素
            measureTooltipElement = null;
            //创建测量提示框
            createMeasureTooltip();
            //移除事件监听
            ol.Observable.unByKey(listener);
            //移除地图单击事件
            XHW.map.removeEventListener('singleclick');
        }, this);
    }
    //创建帮助提示框
    function createHelpTooltip() {
        //如果已经存在帮助提示框则移除
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        //创建帮助提示要素的div
        helpTooltipElement = document.createElement('div');
        //设置帮助提示要素的样式
        helpTooltipElement.className = 'tooltip hidden';
        //创建一个帮助提示的覆盖标注
        helpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        //将帮助提示的覆盖标注添加到地图中
        XHW.map.addOverlay(helpTooltip);
    }
    //创建测量提示框
    function createMeasureTooltip() {
        //创建测量提示框的div
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.setAttribute('id', 'lengthLabel');
        //设置测量提示要素的样式
        measureTooltipElement.className = 'tooltip tooltip-measure';
        //创建一个测量提示的覆盖标注
        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        //将测量提示的覆盖标注添加到地图中
        XHW.map.addOverlay(measureTooltip);
    }
    //测量类型发生改变时触发事件
    typeSelect.onchange = function () {
        //移除之前的绘制对象
        XHW.map.removeInteraction(draw);
        //重新进行绘制
        addInteraction();
    };

    //格式化测量长度
    var formatLength = function (line) {
        //定义长度变量
        var length;
        //如果大地测量复选框被勾选，则计算球面距离
        if (geodesicCheckbox.checked) {
            //获取坐标串
            var coordinates = line.getCoordinates();
            //初始长度为0
            length = 0;
            //获取源数据的坐标系
            var sourceProj = XHW.map.getView().getProjection();
            //进行点的坐标转换
            for (var i = 0; i < coordinates.length - 1; i++) {
                //第一个点
                var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
                //第二个点
                var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                //获取转换后的球面距离
                //Returns the distance from c1 to c2 using the haversine formula.
                length += wgs84Sphere.haversineDistance(c1, c2);
            }
        } else {
            //计算平面距离
            length = Math.round(line.getLength() * 100) / 100;
        }
        //定义输出变量
        var output;
        //如果长度大于1000，则使用km单位，否则使用m单位
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km'; //换算成KM单位
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm'; //m为单位
        }
        return output;
    };

    //格式化测量面积
    var formatArea = function (polygon) {
        //定义面积变量
        var area;
        //如果大地测量复选框被勾选，则计算球面面积
        if (geodesicCheckbox.checked) {
            //获取初始坐标系
            var sourceProj = XHW.map.getView().getProjection();
            var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
            //获取多边形的坐标系
            var coordinates = geom.getLinearRing(0).getCoordinates();
            //获取球面面积
            area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        } else {
            //获取平面面积
            area = polygon.getArea();
        }
        //定义输出变量
        var output;
        //当面积大于10000时，转换为平方千米，否则为平方米
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    };
    //添加交互绘图对象
    // addInteraction();


    $('#removes').click(function(){
        close();
    })
    $('#format').click(function(){
        close();
        addInteraction();
        $('#menu').show();
        // $('.ol-mouse-position').show();  //经纬度信息     
        $('#menu .ol_lonlat').show();         
        $(helpTooltipElement).show();//移除帮助提示要素的隐藏样式
        $('.ol-overlaycontainer-stopevent #lengthLabel').show();
    })
    function close() {
            $('#menu').hide();
            $('.ol-overlaycontainer-stopevent #lengthLabel').parent().remove(); //长度信息
            // $('.ol-overlaycontainer-stopevent #lengthLabel').hide();
            // $('.ol-overlaycontainer-stopevent').empty();
            $('.ol-mouse-position').hide();  //经纬度           
            if (helpTooltipElement)
                $(helpTooltipElement).hide();//移除帮助提示要素的隐藏样式
            for(var key in vectors){
                XHW.map.removeLayer(vectors[key]);              
            };
            XHW.map.removeInteraction(draw); 
    }

    return {
        close: close
    }
});
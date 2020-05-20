 var MapSelection = {
    // 复选框选种值
    drawSource: null,
    rectangleDrawer: null,
    map: null,
    layer: null,
    area: null,
    // 画矩形
    mapSection: function(map, type, callback, closeOnDrawEnd) {
        //设置maxPoints及geometryFunction
        MapSelection.map = map;
        var maxPoints, geometryFunction;
        if (type == 'Polyline') {
            maxPoints = 100;
        } else {
            maxPoints = 2;
        }
        geometryFunction = function (coordinates, geometry) {
            if (!geometry) {
                clearDrawContent();
                if (type == 'Polyline') {
                    geometry = new ol.geom.LineString();
                } else {
                    geometry = new ol.geom.Polygon();
                }
            }
            if (type == 'Polyline') {
                geometry.setCoordinates(coordinates);
            } else {
                //设置起始点及终止点
                let start = coordinates[0];
                let end = coordinates[1];

                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                end = ol.proj.transform(end, 'EPSG:3857', 'EPSG:4326');
                lngOne = Math.floor(start[0] * 100) / 100;
                latTwo = Math.floor(start[1] * 100) / 100;
                lngTwo = Math.floor(end[0] * 100) / 100;
                latOne = Math.floor(end[1] * 100) / 100;
                var slngg = lngOne;
                var slatt = latOne;
                if (lngOne >= lngTwo) {
                    lngOne = lngTwo;
                    lngTwo = slngg;
                }
                if (latOne >= latTwo) {
                    latOne = latTwo;
                    latTwo = slatt;
                }
                var area = {};
                area.slng = lngOne;
                area.elng = lngTwo;
                area.slat = latOne;
                area.elat = latTwo;
                MapSelection.area = area;
            }
            return geometry;
        };

        clearDrawContent = function() {
            if (MapSelection.drawSource && MapSelection.drawSource.clear) {
                MapSelection.drawSource.clear();
            }
        };
        //新建source和layer
        if (!MapSelection.drawSource) {
            MapSelection.drawSource = new ol.source.Vector({
                wrapX: false,
            });
        }
        MapSelection.layer = new ol.layer.Vector({
            source: MapSelection.drawSource
        });

        //新建绘制长方形interaction
        MapSelection.rectangleDrawer = new ol.interaction.Draw({
            source: MapSelection.drawSource,
            type: "LineString",
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });
        
        //绘制结束事件
        MapSelection.rectangleDrawer.on('drawend', function (evt) {
            if (callback) {
                if (type == 'Polyline') {
                    callback(MapSelection.getGeometry());
                } else {
                    callback(MapSelection.area);
                }
            }
            if (closeOnDrawEnd) {
                MapSelection. close();
            }
        }, this);
        MapSelection.map.addLayer(MapSelection.layer);
        MapSelection.map.addInteraction(MapSelection.rectangleDrawer);
    },
    close: function(){
        if (MapSelection.layer && MapSelection.map)
            MapSelection.map.removeLayer(MapSelection.layer); 
        if (MapSelection.rectangleDrawer && MapSelection.map)
            MapSelection.map.removeInteraction(MapSelection.rectangleDrawer);   
    }
 };
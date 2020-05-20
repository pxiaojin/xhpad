define([
], function() {
    const baseURL = 'http://124.254.45.86:8280/geoserver/xinhongecmf/wms',

    var tiledLayer;
    function open() {
        if (!tiledLayer) {
            tiledLayer = new ol.layer.Tile();
            XHW.map.addLayer(tiledLayer);
        }
        var source = buildSource();
        tiledLayer.setSource(source);
    }

    function buildSource() {
        return new ol.source.TileWMS({
            url: baseURL,
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                tiled: true,
               "LAYERS": 'xinhongecmf:XHEC_G_TT_9999_2019060600180',
               "exceptions": 'application/vnd.ogc.se_inimage',
               tilesOrigin: -180 + "," + -90.125
            }
          });
    }

    function close() {
        if (tiledLayer){
            XHW.map.removeLayer(tiledLayer);
        }
        tiledLayer = null;
    }

    return {
        open: open,
        close: close
    }
});
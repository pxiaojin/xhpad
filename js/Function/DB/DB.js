//DB效果
define(['Function/Search','Function/point/SingleInfo'], function(search,singleInfo) {
    function init(){
        //-------------------定位
        // var lonlat = $('#signResult').attr('value').split(',');
        // var lng = lonlat[1];
        // var lat = lonlat[0];
        var user_lonlat = $('#signResult').html();
            user_lonlat = user_lonlat == '' ? ['39.93','116.28'] : user_lonlat.split(',');
        var user_pos = {
            pos:[Number(user_lonlat[1]),Number(user_lonlat[0])],
            // pos:[lng, lat],
            img:'./img/position.png',
        }
        XHW.map.getView().animate(
            {center: ol.proj.transform(user_pos.pos, 'EPSG:4326', 'EPSG:3857'), zoom: 8});
        
        drawMark(user_pos);

        $('#top_usepos .cur_site,#pos_mixedGraph').click(function(){
            drawMark(user_pos);
            //  闪烁图标

            search.viewAnimate(Number(user_pos.pos[0]), Number(user_pos.pos[1]));
            XHW.map.getView().animate(
                {center: ol.proj.transform(user_pos.pos, 'EPSG:4326', 'EPSG:3857'), zoom: 6});
        })

    }  

    //  用户定位
    function drawMark(user_pos){
        var layer;
        var marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(user_pos.pos))
        });
        marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                crossOrigin: 'anonymous',
                src: user_pos.img,
                scale: 0.2,
            })),
            // text: new ol.style.Text({
            //     text: data[i].name,
            //     fill: new ol.style.Fill({
            //         color: '#000'
            //     }),
            //     offsetY: 20
            // })
        }));
        let source = new ol.source.Vector({
            features: [marker]
        });

        if (!layer) {
            layer = new ol.layer.Vector({

            });
            layer.setZIndex(15);
            layer.id = 'pos_mark';
        }
        layer.setSource(source);

        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
            XHW.map.addLayer(layer);
    }

    init();
});
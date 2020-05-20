define([], function() {
    function buildFeatures(type, resultgeojson) {
        var resfeatures = [];
        var features = resultgeojson;
        if (!features) {
            return;
        }
        for (var i = 0; i < features.length; i++){
            var feature = features[i];
            var properties = feature.properties;
            var coordinates = feature.geometry.coordinates;
            let polygonArr = [];
            var lnglats = [];
            for(var j = 0; j < coordinates.length; j++) {
                if (coordinates[j].length > 2){
                    for(var k = 0; k < coordinates[j].length; k++) {
                        lnglats.push(ol.proj.fromLonLat([coordinates[j][k][0], coordinates[j][k][1]]));
                    }
                    polygonArr.push(lnglats);
                    lnglats = [];
                } else {
                    lnglats.push(ol.proj.fromLonLat([coordinates[j][0], coordinates[j][1]]));
                }
            }
            if (lnglats && lnglats.length > 0){
                polygonArr.push(lnglats);
            }
            var resfeature = new ol.Feature({
                geometry: new ol.geom.Polygon(polygonArr),
                //geometry: new ol.geom.LineString(lnglats),'rgba(255, 130, 130, 0.35)'
            });
            var line_r = properties.lineColor.r;
            var line_g = properties.lineColor.g;
            var line_b = properties.lineColor.b;
            var fill_r = properties.fillColor.r;
            var fill_g = properties.fillColor.g;
            var fill_b = properties.fillColor.b;
            var alpha = properties.opacity;
            var linecolor = 'rgba(' + line_r + ', ' + line_g + ', ' + line_b + ', ' + alpha + ')' ;
            var fillcolor = 'rgba(' + fill_r + ', ' + fill_g + ', ' + fill_b + ', ' + alpha + ')' ;
            let style = new ol.style.Style({
                // stroke: new ol.style.Stroke({
                //     width: 1,
                //     color: linecolor
                // }),
                fill:new ol.style.Fill({
                    color: fillcolor
                }),
                text: buildWarningText(getTypeDesc(type) + ":" + getTypeValueDesc(type, properties.sLevel, properties.eLevel),linecolor)
            });
            resfeature.setStyle(style);
            resfeatures.push(resfeature);
        }
        return resfeatures;
    }

    function getTypeDesc(type) {
        switch(type){
            case 'MXTYJ': return '高温区';
            case 'WSRYJ': return '大风区';
            case 'WSR5YJ': return '大风区';
            case 'MDTYJ': return '降温区';
            case 'TS': return '雷暴落区';
            case 'VISYJ': return '恶劣能见度';
            case 'bigWave': return '大浪区';
            case 'RN24YJ': return '强降水区';
        }
        return '';
    }

    function getTypeValueDesc(type, svalue, evalue) {
        if (type && svalue && evalue) {
            
            switch(type){
                case 'VISYJ': 
                    if (evalue > 100) {
                        evalue = evalue/1000;
                    }
                    return '≤' + evalue + '公里'; 
                case 'MXTYJ': return '≥' + svalue + '℃';
                case 'WSR5YJ': return '≥' + svalue  + 'm/s';
                case 'WSRYJ': return '≥' + svalue  + 'm/s';
                case 'MDTYJ': return '≤' + evalue  + '℃';              
                case 'TS': return '≥' + (svalue*100) + '%';
                // case 'bigWave': return '≥' + svalue + 'm';
                case 'RN24YJ': return '≥' + svalue + 'mm';
            }
        }else{
            return '';
        }
    }

    function buildWarningText(text, backrground) {
        let textColor = 'black';
        return new ol.style.Text({
            font: 'BOLD 8px 微软雅黑',
            text: text,
            fill: new ol.style.Fill({    //文字填充色
                color: textColor,
            }),
            placement:'line',
            // stroke: new ol.style.Stroke({
            //     color: background,
            //     lineCap: 'round',
            //     lineJoin: 'round',
            //     width: 4,
            // }),
            rotation:0,
            scale: 0.8,
            maxAngle: Math.PI / 12,
            textBaseline: 'middle',
        });
    }
   
    return {
        buildFeatures:buildFeatures,
    }
});
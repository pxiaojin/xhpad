define([], function() {
    const elem_base_config = {
        'RH': {lineDeepColor: '#10A80A', lineLightColor: '#10A80A', textColor: '#fff', zIndex: 5, 'unit': '%'},
        'TURB': {zIndex: 1},
        'ICE': {zIndex: 1},
        'TS': {zIndex: 1},
        'RN': {zIndex: 1, 'unit': 'mm'},
        'RN6': {zIndex: 1, 'unit': 'mm'},
        'RN12': {zIndex: 1, 'unit': 'mm'},
        'RN24': {zIndex: 1, 'unit': 'mm'},
        'RAIN06': {zIndex: 1, 'unit': 'mm'},
        'RAIN12': {zIndex: 1, 'unit': 'mm'},
        'RAIN24': {zIndex: 1, 'unit': 'mm'},
        'ybrn': {zIndex: 1, 'unit': 'mm'},
        'VIS': {zIndex: 1, 'unit': 'km'},
        'CII': {zIndex: 1},
        'CLOUD': {zIndex: 1},
        'CBH' : {'unit': 'm'},
        'CTH' : {'unit': 'm'},
        'TT':{lineDeepColor: '#FF0000', lineLightColor: '#FF0000', textColor: '#fff', zIndex: 5, 'unit': '℃'},
        'HH':{lineDeepColor: '#000000', lineLightColor: '#2222FF', textColor: '#fff', zIndex: 5, 'unit': 'm'},
        'PR':{lineDeepColor: '#000000', lineLightColor: '#2222FF', textColor: '#fff', zIndex: 5, 'unit': 'hPa'}};

    function buildIsolinesSource(elem, data) {

        let feature = [];
        let DefaultColor = getDefaultColor(elem);
        let textColor = getLineTextColor(elem);
        for(let i = 0; i < data.lines.length; i++) {
            let lineData = data.lines[i];
            let lnglats = smoothIsoline(lineData);
            if (!lnglats || lnglats.length <= 0)
                continue;
            let color = DefaultColor ? DefaultColor : "#" + ((1 << 24) + (lineData.lineColor.r << 16)     //颜色转为16进制
                + (lineData.lineColor.g << 8) + lineData.lineColor.b).toString(16).slice(1);
            let textBackgroundColor = color ;
            let line = new ol.Feature({
                geometry: new ol.geom.LineString(lnglats)
            });
            line.setStyle(buildIsolineStyle(lineData.val + '', lineData.lineWidth, color, textColor, textBackgroundColor));

            feature.push(line);
        }
        return new ol.source.Vector({
            features: feature
        });
    }

    function buildImagesSource(imgUrl, elem, data){
        let slat = data.elat;
        let slng = data.slng;
        let elat = data.slat;
        let elng = data.elng;
        let xD = Math.abs(elng - slng) / data.col;
        let yD = Math.abs(elat - slat) / data.row;
        let sources = [];

        for(let i = 0; i < data.files.length; i++){
            //！！！图片排列方式为从地图左上角至右下角
            let x = data.files[i].split('_')[1].split('.')[0];
            let y = data.files[i].split('_')[0];

            //贴图方式为左下角至右上角
            let start = ol.proj.fromLonLat([slng + x * xD, slat - (parseInt(y) + 1) * yD]);
            let end = ol.proj.fromLonLat([slng + (parseInt(x) + 1) * xD, slat - y * yD]);
            let extent = [start[0], start[1], end[0], end[1]];

            sources.push(new ol.source.ImageStatic({
                url: imgUrl + data.url + data.files[i] + '.mkt',
                imageExtent: extent
            }));
        }
        return sources;
    }

    function buildImageSource(imgUrl, elem, data){
        let slat = data.elat;
        let slng = data.slng;
        let elat = data.slat;
        let elng = data.elng;

        //贴图方式为左上角至右下角
        let start = ol.proj.fromLonLat([slng, elat]);
        let end = ol.proj.fromLonLat([elng , slat]);
        let extent = [start[0], start[1], end[0], end[1]];

        return new ol.source.ImageStatic({
            url: imgUrl + data.url + '.mkt.png',
            imageExtent: extent
        });
    }

    function getZIndexOf(elem) {
        if (elem_base_config[elem])
            return elem_base_config[elem].zIndex;
        else return 1;
    }
    function getDefaultColor(elem) {
        if($('#isolineConfigColorMode p .current').next().html() != '多色') {
            if($('#config_map p .current').next().html() == '影像图') {
                return elem_base_config[elem].lineLightColor;
            } else {
                return elem_base_config[elem].lineDeepColor;
            }
        }
    }

    function getLineTextColor(elem) {
        return elem_base_config[elem].textColor;
    }

    function buildLegendHtml(elem, elemName){
        let html = '<p class="tuCengP">' + elemName + '</p>' +
            '<img src="img/legend/' + elem.toLowerCase() + '.png" alt="" />';

        if (elem_base_config[elem] && elem_base_config[elem].unit){
            html +=  '<p>' +
            '<span>单位</span>' +
            '<span>' + elem_base_config[elem].unit + '</span>' +
            '</p>';
        }
        return html;
    }

    return {
        getZIndexOf: getZIndexOf,
        buildIsolinesSource: buildIsolinesSource,
        buildImageSource:buildImageSource,
        buildImagesSource: buildImagesSource,
        buildLegendHtml: buildLegendHtml

    }
});

function buildLineMarkTextStyle(textVal, color, backgroundColor, start, end) {

    let rotation = 0;
    if (start && start) {
        var dx = start[0] - end[0];
        var dy = start[1] - end[1];
        rotation = Math.atan2(dy, dx);
        // let p3 = [];
        // p3.push(p1[0]||p1.x);
        // p3.push(p2[1]||p2.y);
        // rotation = Math.PI/180 * getAngleFrom3Pts(p1, p2, p3);
    }
    
    return new ol.style.Style({
        text: new ol.style.Text({
            textAlign: "center",
            font: '8px sans-serif',
            text: textVal + '',
            fill: new ol.style.Fill({    //文字填充色
                color: color,
            }),
            backgroundFill: new ol.style.Fill({    //文字填充色
                color: backgroundColor,
            }),
            backgroundStroke: new ol.style.Stroke({
                color:backgroundColor,
                lineCap: 'round',
                lineJoin: 'round',
                width: 4,
            }),
            scale: 0.8,
            rotation:rotation
        }),
    })
}

function buildIsolineStyle(text, lineWidth, lineColor, textColor, textBackgroundColor) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: lineWidth,
            color: lineColor
        }),
        text: new ol.style.Text({
            font: 'BOLD 8px sans-serif',
            text: text,
            fill: new ol.style.Fill({    //文字填充色
                color: textColor,
            }),
            placement:'line',
            stroke: new ol.style.Stroke({
                color:textBackgroundColor,
                lineCap: 'round',
                lineJoin: 'round',
                width: 4,
            }),
            rotation:0,
            scale: 1,
            maxAngle: Math.PI / 12,
            textBaseline: 'middle',
        })
    });
}


function buildPlottingText(text, textColor, textBackgroundColor) {
    return new ol.style.Text({
        font: 'BOLD 8px 微软雅黑',
        text: text,
        fill: new ol.style.Fill({    //文字填充色
            color: textColor,
        }),
        placement:'line',
        stroke: new ol.style.Stroke({
            color:textBackgroundColor,
            lineCap: 'round',
            lineJoin: 'round',
            width: 4,
        }),
        rotation:0,
        scale: 0.8,
        maxAngle: Math.PI / 12,
        textBaseline: 'middle',
    });
}
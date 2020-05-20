define([], function(){

    function buildSource(resGeojson,option) {
        if (!resGeojson)
            return
        var features = resGeojson.features;
        var colorBar = resGeojson.colorbar;
        if (!features)
            return;
        var source = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(resGeojson, {featureProjection: ol.proj.get("EPSG:3857")}),
        })
        source.styleFunction = styleFunction;


        if(option.type == 'area'){
            var canvas = document.getElementById(option.elem);
            // canvas.width = 420;
            canvas.height = 25;
            var context = canvas.getContext("2d");

            context.font = "12px bold 黑体";
            // 设置颜色
            context.fillStyle = "white";
            // 设置水平对齐方式
            context.textAlign = "center";
            // 设置垂直对齐方式
            context.textBaseline = "middle";
            context.fillText(option.name , canvas.width / 12, 10);
            for(let i = 0; i < colorBar.color.length; i++){
                let legendWidth = ((canvas.width / 7) * 5) / colorBar.color.length;
                let left = canvas.width / 6 + i * legendWidth;
                // var text = i === 0 ? '' : colorBar.levels[i]; 
                var text;
                if(option.elem == 'KI' || option.elem == 'VWS500' || option.elem == 'VWS700' || option.elem == 'PS' || 
                option.elem == 'CT24H' || option.elem == 'CP3H' || option.elem == 'CP24H'){
                    text = colorBar.levels[i];
                }else{
                    if(i === 0 || ((option.elem == 'TT' || option.elem == 'DI' || option.elem == 'VO' || option.elem == 'WSS') && i%2 !== 1)){
                        text = '';
                    }else{
                        text = colorBar.levels[i];
                    }
                }
                // if(option.elem == 'TT' && i%2 !== 1)text = '';
                createRect(option.elem,context,left,3,legendWidth,10,colorBar.color[i],"black",1,text);       
            }
            context.fillText(unit(option.elem) , (canvas.width / 14) * 13, 10);
        }  
        return source;
    }
    var styleFunction = function(feature) {
        let style = styles[feature.getGeometry().getType()];
        if (style.getFill()){
            if(feature.get('fill')){
                var opacity = feature.get('fill-opacity')+'' ? feature.get('fill-opacity')+'' : '0.3';
                style.getFill().setColor(colorRgb(feature.get('fill'),opacity))
            }else{
                style.getFill().setColor('rgba(0,0,0,0.3)')
            }         
        }        
        if (style.getStroke()) {
            if (feature.get('stroke'))
                style.getStroke().setColor(feature.get('stroke'));
            if (feature.get('stroke-width'))
                style.getStroke().setWidth(feature.get('stroke-width'));
            if (feature.get('stroke-style')) {
                if(feature.get('stroke-style') == 'DOT') // 点虚线
                    style.getStroke().setLineDash([2,2]);
                else if(feature.get('stroke-style') == 'DASH') // 虚线
                    style.getStroke().setLineDash([10,10]);
                else if(feature.get('stroke-style') == 'DASHDOT') // 
                    style.getStroke().setLineDash([20,5,3,5]);
                else if(feature.get('stroke-style') == 'DASHDOUBLEDOT')
                    style.getStroke().setLineDash([20,5,3,5,3]);
                else {
                    style.getStroke().setLineDash(null);
                }
            }
        }
        if(style.getText()) {
            if (feature.get('name')) 
                style.getText().setText(feature.get('name')+'');
            if (style.getText().getFill() && feature.get('stroke'))
                style.getText().getFill().setColor(feature.get('stroke'));
            if (feature.get('level'))
                style.getText().setText(feature.get('level')+'');
        }
        if(style.getImage() && style.getImage().getStroke() && feature.get('image-color')) {
            style.getImage().getStroke().setColor(feature.get('image-color'));
        }
        return style
    }

    var styles = {
        'LineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 255, 0)',
                width: 1
            }),
            text: new ol.style.Text({
                font: 'BOLD 8px sans-serif',
                fill: new ol.style.Fill({    //文字填充色
                    color: '#fff',
                }),
                placement:'line',
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    lineCap: 'round',
                    lineJoin: 'round',
                    width: 4,
                }),
                rotation:0,
                scale: 1,
                maxAngle: Math.PI / 12,
                textBaseline: 'middle',
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'green',
                width: 1
            })
        }),
        'MultiPolygon': new ol.style.Style({
            // stroke: new ol.style.Stroke({
            //     color: 'yellow',
            //     width: 1
            // }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.1)'
            })
        }),
        'Polygon': new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'magenta',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'magenta'
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'magenta'
                })
            })
        }),
        'Circle': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.2)'
            })
        }),
        'Point' : new ol.style.Style({
            image : new ol.style.Circle({
                stroke: new ol.style.Stroke({
                    color: 'magenta',
                    width: 2
                }),
            }),
            text: new ol.style.Text({
                font: '18px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000',
                    width: 3
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 3
                })
            })
        })
    };

    //  颜色 十六进制转rgba
    function colorRgb(str,strOpacity){
        var sColor = str.toLowerCase();
        //十六进制颜色值的正则表达式
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 如果是16进制颜色
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i=1; i<4; i+=1) {
                    sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));    
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i=1; i<7; i+=2) {
                sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));    
            }
            return "rgba(" + sColorChange.join(",") + "," + strOpacity + ")";
        }
        console.log(sColor)
        return sColor;
    };

    /**
     * 
     * @param {*} context  
     * @param {*} sx 左上角x坐标
     * @param {*} sy 左上角y坐标
     * @param {*} width 宽
     * @param {*} height 高
     * @param {*} fillColor  填充色
     * @param {*} strokeColor  边界色
     * @param {*} lineW    线宽
     * @param {*} text     文字内容
     */

    function createRect(elem,context,sx,sy,width,height,fillColor,strokeColor,lineW,text){
        context.lineWidth = lineW;

        context.beginPath();
        context.rect(sx, sy, width, height);
        context.closePath();
        context.fillStyle = 'rgba(' + fillColor + ')';
        context.strokeStyle = strokeColor;
        context.fill();
        context.stroke();

        context.font = "12px bold 黑体";
        // 设置颜色
        context.fillStyle = "white";
        // 设置水平对齐方式
        context.textAlign = "center";
        // 设置垂直对齐方式
        context.textBaseline = "middle";
        // 绘制文字（参数：要写的字，x坐标，y坐标）
        // context.fillText(text, sx+21, sy+25);
        text = text == undefined ? '' : text;
        // if(type == 'bch' || type == 'live_wind' || type == 'nyyb' || type == 'growth_fc' || type == 'growth_real' || type == 'qxzh'){
        //     context.fillText(text, sx+(width/2), sy+25);
        // }else{           
            context.fillText(text, sx, sy+15);
        // }
    }

    function unit(type) {
        if (type) {           
            switch(type){
                case 'TEMP':
                case 'TT': return  '(℃)';
                case 'RN': return  '(mm)';
                case 'RH': return  '(%)';
                case 'VIS': return  '(km)';
                case 'WSS': return  '(m/s)';
                // case 'DB': return  '(级)';
                // case 'JB': return  '(级)';
                // case 'DI': return  '(℃)';
                // case 'VO': return  '级';
                // case 'PS': return  '(℃)';
                // case 'KI': return  '级';
                // case 'VS': return  '(℃)';
                // case 'VWS700': return  '级';
                // case 'VWS500': return  '级';
                default : return '';
            }
        }else{
            return '';
        }
    }

    return {
        buildSource: buildSource,
        styleFunction: styleFunction
    }
})
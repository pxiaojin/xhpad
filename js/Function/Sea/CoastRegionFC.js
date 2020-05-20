


define(['Function/numberFC/FloatSelector'], function(floatSelector) {

    var key;
    var legend;
    var item;
    var isOpen;
    var layerFC;     //图层
    var layerW;
    var button;      //按钮
    var dataS;       //中央海区数据
    var datatype;

    function xf_drawCoastRegion() {

        //线样式
        var featureStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 2
            })
        });

        //渤海
        var newFeatures = [];

        var polylineCoords=[];
        polylineCoords.push([121.13,38.77]);
        polylineCoords.push([120.81,37.87]);

        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords)),
                style:featureStyle
        }
        ));


        //黄海北部
        var polylineCoords1=[];
        polylineCoords1.push([122.60,37.22]);
        polylineCoords1.push( [126.52,37.22]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords1)),
                style:featureStyle
            }
        ));

        //黄海中部
        var polylineCoords2=[];
        polylineCoords2.push([130,35]);
        polylineCoords2.push([119.24,35]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords2)),
                style:featureStyle
            }
        ));

        var polylineCoords3 = [];
        polylineCoords3.push( [130,35]);
        polylineCoords3.push( [130,25]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords3)),
                style:featureStyle
            }
        ));

        var polylineCoords4 =[];
        polylineCoords4.push( [125,35]);
        polylineCoords4.push( [125,18.48]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords4)),
                style:featureStyle
            }
        ));

        var polylineCoords5 = [];
        polylineCoords5.push( [125,33]);
        polylineCoords5.push( [120.76,33]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords5)),
                style:featureStyle
            }
        ));


        var polylineCoords6= [];
        polylineCoords6.push( [130,30]);
        polylineCoords6.push( [122,30]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords6)),
                style:featureStyle
            }
        ));

        var polylineCoords7= [];
        polylineCoords7.push( [130,25]);
        polylineCoords7.push( [125,25]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords7)),
                style:featureStyle
            }
        ));

        var polylineCoords8 = [];
        polylineCoords8.push( [121.59,25]);
        polylineCoords8.push( [120,27]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords8)),
                style:featureStyle
            }
        ));

        var polylineCoords9 =[];
        polylineCoords9.push( [125,27.8]);
        polylineCoords9.push( [121.59,25]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords9)),
                style:featureStyle
            }
        ));

        var polylineCoords10=[];
        polylineCoords10.push( [116.68,23]);
        polylineCoords10.push( [120,22.27]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords10)),
                style:featureStyle
            }
        ));

        var polylineCoords11=[];
        polylineCoords11.push( [125,22.27]);
        polylineCoords11.push( [120,22.27]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords11)),
                style:featureStyle
            }
        ));

        var polylineCoords12=[];
        polylineCoords12.push( [120,10]);
        polylineCoords12.push( [120,22.27]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords12)),
                style:featureStyle
            }
        ));

        var polylineCoords13=[];
        polylineCoords13.push( [120,18.48]);
        polylineCoords13.push( [125,18.48]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords13)),
                style:featureStyle
            }
        ));

        var polylineCoords14=[];
        polylineCoords14.push( [120,20]);
        polylineCoords14.push( [110,20]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords14)),
                style:featureStyle
            }
        ));

        var polylineCoords15 = [];
        polylineCoords15.push( [115,22.60]);
        polylineCoords15.push([115,10]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords15)),
                style:featureStyle
            }
        ));

        var polylineCoords16 = [];
        polylineCoords16.push( [120,15]);
        polylineCoords16.push( [108.87,15]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords16)),
                style:featureStyle
            }
        ));


        var polylineCoords17=[];
        polylineCoords17.push( [110,18.23]);
        polylineCoords17.push( [110,15]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords17)),
                style:featureStyle
            }
        ));

        var polylineCoords18=[];
        polylineCoords18.push( [105,10]);
        polylineCoords18.push( [120,10]);
        newFeatures.push(new ol.Feature({
                geometry:new ol.geom.LineString(convertFromlatlngtocooord(polylineCoords18)),
                style:featureStyle
            }
        ));


    var numberPoints=[];
    numberPoints.push([120,39]);
    numberPoints.push([123,38]);
    numberPoints.push([123,36.25]);
    numberPoints.push([122.5,33.75]);
    numberPoints.push([123,31.25]);
    numberPoints.push([122.5,28]);
    numberPoints.push([120,24.5]);

    numberPoints.push([0,0]);
    numberPoints.push([117,22]);
    numberPoints.push([112.5,21.5]);
    numberPoints.push([108,19]);
    numberPoints.push([112.5,17.5]);
    numberPoints.push([117.5,17.5]);
    numberPoints.push([117.5,12.5]);
    numberPoints.push([112.5,12.5]);
    numberPoints.push([123,24]);
    numberPoints.push([122.5,20]);
    numberPoints.push([0,0]);
    numberPoints.push([127.5,32.5]);
    numberPoints.push([127.5,27.5]);




        for(var i = 0; i < numberPoints.length; i++) {
            var numberStyle = new ol.style.Style({
                text: new ol.style.Text({
                    textAlign: "center",
                    text: ''+(i+1),
                    fill: new ol.style.Fill({    //文字填充色
                        color: 'brown',
                    }),
                }),
            });
            newFeatures.push(new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat(numberPoints[i])),
                style:numberStyle
            }))
        }

        // var layer = new ol.layer.Vector({
        //     source: new ol.source.Vector({
        //         features: newFeatures
        //     })
        // });
        
        // layer.setZIndex(10);
        // XHW.map.addLayer(layer);
        let source = new ol.source.Vector({
            features: newFeatures
        });

        if (!layerFC) {
            layerFC = new ol.layer.Vector({
                
            });
            layerFC.setZIndex(10);
            layerFC.id = key;
        }
        layerFC.setSource(source);
        
        if ($.inArray(layerFC, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerFC);
    }

    //获取海洋点预报数据
    function getCoastRegionFCInfo(lnglat) {
        var param = {
            lat:lnglat[1],
            lng:lnglat[0]
        }

        XHW.C.http.get(XHW.C.http.oceanUrl,'/CoastRegionFC/info', param, function(result){
            // item.htmlLayer = '海区资料显示';
            // XHW.C.layerC.updateLayerData(key, item);
            var  data = result.data;
            if (data == null && data == "" && typeof(data) == "undefined") {
                console.log('海洋预报请求失败   https://weather.xinhong.net/CoastRegionFC/info?lat=31.261310746514027&lng=124.152717590332');
            }
            else {
                showFCAlert(data,result.time);
                // time = format.jsonDate(time);
                // item.htmlLayer =  time[1] + ' 海平面气压';
                // XHW.C.layerC.updateLayerData(key, item);
            }
        },function(){
            // item.htmlLayer = '海区资料显示(无数据)';
            // XHW.C.layerC.updateLayerData(key, item);
            // remove();
        })
    }

    var lastClickPixel;
    // XHW.map.on('click', function(e) {
    //     if (isOpen) {
    //         $('#dotSwitch').children().removeClass('current');
    //         //----------------ol地图坐标转换为经纬度
    //         let lnglat = ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');    //lnglat 为 [lng, lat] 格式
    //         lastClickPixel = XHW.map.getEventPixel(e.originalEvent);
            
    //         getCoastRegionFCInfo(lnglat);
    //     }
    // });

    //绘制海洋点预报
    function showFCAlert(data,time) {
        var objDiv = document.getElementById("Sea_FC");
        objDiv.style.visibility = "visible";
        $('.haiQuYuBao').stop().fadeIn(200);

        $("#seaAreaName").html(data.fc24.name + "海洋环境预报");
        $("#seaAreaFCDate").html(time.substr(0, 4) + "年" + time.substr(4, 2) + "月" + time.substr(6, 2) + "日");
        if (data.fc24) {
        $("#seaAreaFCWaveH").html(data.fc24.wh + "m");
        $("#seaAreaFCYongH").html(data.fc24.swh + "m");
        $("#seaAreaFCTT").html(data.fc24.temp + "°C");
        $("#seaAreaFCWaveS").html(data.fc24.cursp0 + "m/s");
        $("#seaAreaFCWaveSimg").html(data.fc24.curdir0);
        $("#seaAreaFCWaveSmax").html(data.fc24.cursp1 + "m/s");
        $("#seaAreaFCWaveSimgmax").html(data.fc24.curdir1);
        }

        if (data.fc48){
            $("#seaAreaFCWaveH48").html(data.fc48.wh+"m");
            $("#seaAreaFCYongH48").html(data.fc48.swh+"m");
            $("#seaAreaFCTT48").html(data.fc48.temp+"°C");
            $("#seaAreaFCWaveS48").html(data.fc48.cursp0+"m/s");
            $("#seaAreaFCWaveSimg48").html(data.fc48.curdir0);
            $("#seaAreaFCWaveSmax48").html(data.fc48.cursp1+"m/s");
            $("#seaAreaFCWaveSimgmax48").html(data.fc48.curdir1);
        }


        var oceanName = data.fc24.name;
        var oceanText = '<p>巴士海峡和菲北海峡是西北太平洋的大浪区之一。受季风的影响，大风大浪频率终年较高。在盛行东北浪的冬季，6级以上的大风频率高达37.5%-40%，大浪频率50%-60%，大涌频率70%，平均波高均在2米以上（11月和12月更高达2.6-3.2米），最大波高9.5米。相对于冬季，海峡夏季的海浪要小一些（台风期除外），但大浪大涌的频率仍有20%和30%-40%，平均波高1.5米，最大达6-7米。水深1000~2000米，在海峡中部有两个不大的浅水区，水深小于200米。另外，巴林塘附近水深仅34-200米，底质为泥。海峡涨潮流向西或西北，落潮流向东或东北，岛屿附近流速较快。 </p>\n' +
            '\t    <p> 西南风时，有较强的北向流。巴士、巴林塘和巴布延海峡，不仅是日本、美国石油航线和日本输入战略物资的必经之地，也是俄罗斯太平洋舰队和其远东地区南北航线的重要通道。海峡正面宽、水深大，适于舰船和潜艇水下活动。巴士海峡地处北回归线以南，属热带海洋性季风气候，海洋气象特征突出地表现为高温多雨，季风盛行，雷雨较多，台风影响频繁，是西北太平洋的大浪区之一。受季风的影响，大风大浪频率终年较高。</p>';
        if(oceanName.indexOf("北部湾")!=-1){
            oceanName = "北部湾";
            oceanText = '<p> 北部湾地处热带和亚热带，冬季受大陆冷空气的影响，多东北风，海面气温约20℃；夏季，风从热带海洋上来，多西南风，海面气温高达30℃，时常受到台风的袭击，一般每年约有5次台风经过这里。</p>\n' +
                '\t    <p>北部湾三面为陆地环抱，水深在10-60米，海底比较单纯，从湾顶向湾口逐渐下降，海底较平坦，从陆地带来的泥沙沉积在上面。属于新生代的大型沉积盆地，沉积层厚达数千米，蕴藏丰富的石油和天然气资源。 </p>\n' +
                '\t    <p>北部湾的海流，在冬季沿反时针方向转，外海的水沿湾的东侧北上，湾内的水顺着湾的西边南下，形成一个环流；夏季，因西南季风的推动，海流形成一个方向相反的环流。北部湾1天内只有一次潮水涨落，叫全日潮。涨落的潮差，从湾口向湾顶逐步增大，在北海附近海域，最大潮差可达7米。潮流大体上沿着海岸方向，一来一去地流淌，这叫往复流。年平均水温高达24.5℃。 </p>';
        }
    else if (oceanName.indexOf("渤海")!=-1){
            oceanName = "渤海";
            oceanText = '<p> 渤海是中国内海，基本上为大陆环抱。黄海为一半封闭的浅海，在长江口至济州岛一线与东海相接。渤海为大陆环抱，受陆地影响最强，表现为温带季风气候特点。10月至次年3月，偏北的冬季风强劲，气候寒冷，渤海沿岸12—3月有浮冰。春季4—5月南北风交替，气旋大风增多，气温升高快。夏季风6月开始至9月初结束，盛行风向东南，风力较弱。7—8月温度高，雨水多，偶有热带气旋影响，其路径有时沿黄海北上，有时为登陆北上的台风东移经过渤海。热带气旋最大风速30米/秒。9月开始北风频率升高，多晴好天气；4—7月有雾发生。</p>\n' +
                '\t    <p>渤海冬季风表现为单一的偏北气流，为西北风。寒冷少雨，1—2月甚至出现冰冻。冷空气进入黄海和东海后逐渐变性，特别是达到黑潮水域，由于海面热量和水汽供应充分，形成多云、大风、降雨天气。冷空气到达南海北部，使海面气温降低，风速增大；从气温年较差图上可以看出，气温年较差为25—29℃。</p>\n' +
                '\t    <p>冬季亚洲大陆为强大的冷高压控制，高压中心在蒙古境内。1月，气压高于1035.0百帕。日本以东为阿留申低压，南海至澳大利亚也是一低压区。中国近海等压线几乎与海岸线平行，且比较密集。在这种气压形势下，多北风和西北风，盛行风向频率达60%。渤海西南和东南风增多，西南季风开始在赤道附近出现，5月推进，6月遍及整个近海。7月，亚洲大陆转为低压控制，中心在印度北部。副热带高压继续加强北移，在这种东高西低的气压形势下，盛行东南风，但盛行风向频率较低。10月，大陆高压已经建立，副热带高压减弱南撤。渤海至台湾海峡北风频率9月份已开始升高，10月盛行偏北风区域推至10°N。南海北部东北风盛行风向频率可达80%。<p>\n' +
                '\t    <p>产生和维持季风的大气活动中心的变化过程基本上决定了海区冬夏季风的变化特征。这种变化决定了海区不同季节的天气气候特点。冬季，冷高压为气候的主要控制系统，中国近海大风多，北部海域比较寒冷；夏季大陆上印度低压和海洋上副热带高压最为发展，但气压梯度较弱，故夏季风力较小；春、秋季是大气活动中心消长取代时期，季风也处在转换时期，只是夏季风向冬季风向转换较快，而冬季风向夏季风的转换稍慢。</p>\n' +
                '\t    <p>中国近海为季风控制，冬季风强而稳定，平均风速高于夏季风，过渡季节风向多变，平均风速较小。辽东湾南部、渤海中部、渤海海峡至成山头外海冬季平均风速大于近岸，12月平均风速最大为6—7米/秒，6级以上大风频率为15%—18%。春季平均风速降至4—5米/秒，6级以上大风频率为5%左右。夏季平均风速进一步降至4米/秒，6级以上大风频率仅为2%—4%。10月初因冷空气开始活动风力增大，平均风速达6—7米/秒，大风频率升至9%—10%。夏季渤海层积云和积云频率相当。东海往南，积云占绝对优势，初夏6—7月东海为梅雨季节，雨层云和碎雨云也常见。秋季，云状与8月相比变化不大，10月之后，渐渐呈现冬季形势。</p>\n' +
                '\t    <p>太阳辐射是海洋上空所有物理过程包括各种天气系统产生和运动的根本动力，是空气和海水增温的主要能源，因而是海洋气候形成的基本因子。太阳总辐射的分布主要受太阳高度角、云量、云状等因素的影响。年平均太阳总辐射的分布形势是：赤道附近出现最高值，由赤道向北降低；10—20°N之间总辐射变化较小，渤海比东海略高，这是因为云量偏少的原因。 </p>';
        }
    else if (oceanName.indexOf("东海")!=-1){
            oceanName = "东海";
            oceanText = '<p> 东海南至台湾海峡，东面在琉球群岛处与太平洋相连。冬季风表现为单一的偏北气流，多北风。由于副热带高压影响，多晴朗少云天气。但此时正值台风季节，每次台风活动，往往给海上带来大风暴雨、巨浪狂涛。中国近海为西太平洋边缘海，气候要素分布呈现由大陆向大洋的过渡特点。特别是冬季，大陆的影响在近岸很强，向远海逐渐减弱。从气温年较差图上可以看出，东海近岸为15—22℃。</p>\n' +
                '\t    <p>中国近海为季风控制，冬季风强而稳定，平均风速高于夏季风，过渡季节风向多变，平均风速较小。东海冬夏季风速差异尤为显著。冬季济州岛南部至台湾海峡一线平均风速8—9米/秒。台湾海峡是著名大风区。春季全区风力减弱较快。</p>\n' +
                '\t    <p>东海表现为亚热带季风气候，冬季风盛期为10—4月（台湾海峡持续到5月），风向偏北，大风较多。黑潮提供充足的热量和水汽，为气团变性、气旋发展提供了环境条件，故大部海区云量多、阴雨天频率高。由于黑潮及沿岸冷流的影响，气温和水温分布出现近海中最强的温度梯度。3—6月西部近岸区陆续进入雾季，黑潮区基本无雾。夏季风盛行期为6—8月，风向偏南，风力较弱。6—10月为热带气旋影响季节，达到台风强度者占热带气旋的比例较高。台风中心最大风速极值东部海区为70—85米/秒，西部近岸为40—50米/秒.东海降水受极锋和热带气旋影响，一年中有两个极值，5—6月为梅雨期，9—10月为秋雨期。热带气旋也带来较强的降水。<p>\n' +
                '\t    <p>产生和维持季风的大气活动中心的变化过程基本上决定了海区冬夏季风的变化特征。这种变化决定了海区不同季节的天气气候特点。冬季，冷高压为气候的主要控制系统，中国近海大风多，北部海域比较寒冷；夏季大陆上印度低压和海洋上副热带高压最为发展，但气压梯度较弱，故夏季风力较小；春、秋季是大气活动中心消长取代时期，季风也处在转换时期，只是夏季风向冬季风向转换较快，而冬季风向夏季风的转换稍慢。</p>\n' +
                '\t    <p>我国近海平均波高基本特点是冬季高，夏季（或者春秋季）较低；开阔洋面及南海东北部高，大陆附近、封闭或半封闭的内海、海湾水域低；各月大浪区与大风区基本吻合，浪高极值出现在台风、寒潮等天气过程中。</p>\n' +
                '\t    <p>太阳辐射是海洋上空所有物理过程包括各种天气系统产生和运动的根本动力，是空气和海水增温的主要能源，因而是海洋气候形成的基本因子。太阳总辐射的分布主要受太阳高度角、云量、云状等因素的影响。年平均太阳总辐射的分布形势是：赤道附近出现最高值，由赤道向北降低；10—20°N之间总辐射变化较小，东海中部及黑潮区出现最低值。1月份太阳总辐射：东海出现低值区，位置恰与台湾岛至日本九州之间的多云带相吻合。东海仍维持一低值区，中心在台湾海峡至浙江省外海；冬季亚洲大陆为强大的冷高压控制，高压中心在蒙古境内。1月，气压高于1035.0百帕。日本以东为阿留申低压，南海至澳大利亚也是一低压区。中国近海等压线几乎与海岸线平行，且比较密集。东海盛行北风，台湾岛周围至南海转为东北风。4月，大陆高压仍然存在，但强度大大减弱；7月，亚洲大陆转为低压控制，中心在印度北部。副热带高压继续加强北移，东海盛行南风、东南风，盛行风向。10月，大陆高压已经建立，副热带高压减弱南撤。 </p>';
        }
    else if (oceanName.indexOf("黄海")!=-1){
            oceanName = "黄海";
            oceanText = '<p> 黄海为半封闭海区，中部与近岸区气候有所差别。北部与西北部沿岸为温带季风气候，中部和南部属亚热带季风气候。冬季风盛行于10—4月，夏季风为6—8月，5、9月为转换季节。冬季黄海东部由于黑潮分支的影响，气温和水温高于西侧；开阔海面上的平均风速及大风频率高于近岸。4月南风频率增高，雾季随之开始，一直持续到7月。7—8月黄海进入雨季，年降水量南多北少。热带气旋影响也集中在7—9月。</p>\n' +
                '\t    <p>黄海北部寒冷少雨，1—2月甚至出现冰冻。冷空气进入黄海和东海后逐渐变性，特别是达到黑潮水域，由于海面热量和水汽供应充分，形成多云、大风、降雨天气。冷空气到达南海北部，使海面气温降低，风速增大。</p>\n' +
                '\t    <p>中国近海为西太平洋边缘海，气候要素分布呈现由大陆向大洋的过渡特点。特别是冬季，大陆的影响在近岸很强，向远海逐渐减弱。从气温年较差图上可以看出，黄海气温年较差为20—25℃。<p>\n' +
                '\t    <p>太阳辐射是海洋上空所有物理过程包括各种天气系统产生和运动的根本动力，是空气和海水增温的主要能源，因而是海洋气候形成的基本因子。太阳总辐射的分布主要受太阳高度角、云量、云状等因素的影响。年平均太阳总辐射的分布形势是：赤道附近出现最高值，由赤道向北降低；黄海西部比东海略高，这是因为云量偏少的原因。</p>\n' +
                '\t    <p>黄海冬季亚洲大陆为强大的冷高压控制，高压中心在蒙古境内。1月，气压高于1035.0百帕。日本以东为阿留申低压，南海至澳大利亚也是一低压区。中国近海等压线几乎与海岸线平行，且比较密集。在这种气压形势下，黄海多北风和西北风。4月，大陆高压仍然存在，但强度大大减弱；西太平洋副热带高压加强北移，黄海北部、日本海气压升高，且出现大于1015.0百帕高值区。黄海西南和东南风增多，西南季风开始在赤道附近出现，5月推进，6月遍及整个近海。7月，亚洲大陆转为低压控制，中心在印度北部。副热带高压继续加强北移，在这种东高西低的气压形势下，黄海盛行东南风，但盛行风向频率较低。10月，大陆高压已经建立，副热带高压减弱南撤。</p>\n' +
                '\t    <p>产生和维持季风的大气活动中心的变化过程基本上决定了海区冬夏季风的变化特征。这种变化决定了海区不同季节的天气气候特点。冬季，冷高压为气候的主要控制系统，中国近海大风多，北部海域比较寒冷；夏季大陆上印度低压和海洋上副热带高压最为发展，但气压梯度较弱，故夏季风力较小；春、秋季是大气活动中心消长取代时期，季风也处在转换时期，只是夏季风向冬季风向转换较快，而冬季风向夏季风的转换稍慢。 </p>\n' +
                '\t    <p>黄海冬季除了朝鲜半岛近岸能见度稍差外，其余地区能见度较好，能见度良好。4—5月朝鲜半岛沿海及黄海东南部因雾影响，能见度稍差。6—7月黄海近岸多雾，7月黄海中部、东南部及渤海西部能见度较好。8月，整个海区能见度转好。9—10月能见度最好。</p>\n' +
                '\t    <p>由于中国近海南北狭长，各地距岸远近不同，空气中水汽含量有异，使得降水量分布出现南北差异悬殊、季节分布不均、年际变化显著等特征。年雨量的基本分布形势为南方多于北方，东面多于西面，沿岸多于海域中部。</p>\n' +
                '\t    <p>中国近海由于紧靠欧亚大陆，温度分布又受大陆影响很强；海潮暖流与沿岸流之间的温度差异，加强了近岸与远海之间的温度梯度。冬季由于来自大陆的寒冷气流影响，北部海区比同纬度大洋低。由于海陆热力差异显著，黑潮暖流与沿岸冷流之间水温高低不同，造成等温线基本沿岸线分布，呈西南—东北走向的等温线十分密集。温度梯度最大处在台湾海峡附近，岛屿东西两侧。黄海沿岸升温较快。夏季，太阳总辐射量南北差异最小，温度梯度最弱，黄海东岸的冷水涌升区出现较低值。秋季气温分布形势与夏季相似，但梯度增大，尤其是黄海近岸降温较快。</p>';
        }
    else if (oceanName.indexOf("南海")!=-1){
            oceanName = "南海";
            oceanText = '<p>南海具有比较广阔的水面，西临中南半岛和马来半岛，东至菲律宾群岛，南达加里曼丹岛和苏门答腊岛。南海海域辽阔，南部属赤道季风气候，全年高温，雨量年变化小。中部为热带季风区，11—4月盛行东北季风，风向稳定，风力平均4—5级。北方冷空气爆发侵入南海，北部出现低温、阴雨、多雾天气；中部受高压影响，常少云少雨。5月中旬至9月中旬盛行西南季风，风向不如冬季风稳定，风力亦较弱。7—8月热带辐合带推至南海北部，洋面对流旺盛，常有暴雨或大暴雨。南海热带气旋以6—11月发生较多。</p> \n' +
                '\t    <p>南海冬季风表现为单一的偏北气流，多东北风。南海中部以南气温变化不明显；但当强冷空气南下时，往往使中部和南部对流加强，降水量增多。夏季风气流比较复杂，南海中部和南部为西南季风，南海北部及以北海域为偏东风，两股气流在南海北部辐合，形成一条近于东西向的热带辐合带。随着季风潮的爆发，海上对流加强，云量增多。</p> \n' +
                '\t    <p>中国近海为西太平洋边缘海，气候要素分布呈现由大陆向大洋的过渡特点。特别是冬季，大陆的影响在近岸很强，向远海逐渐减弱。巴士海峡西面波浪最大，由此向南波浪减弱较快。4月南海海况最好。6—8月南海中部狭长区平均波高在西南季风影响下有所增强。9月出现相对减弱，10月波浪复又加强。南海台风浪可达10—15米。</p> \n' +
                '\t    <p>由于中国近海南北狭长，各地距岸远近不同，空气中水汽含量有异，使得降水量分布出现南北差异悬殊、季节分布不均、年际变化显著等特征。年雨量的基本分布形势为南方多于北方，东面多于西面，沿岸多于海域中部。南海温度高，湿度大，对流发展强，南部沿岸为全区之冠，年雨量达2200—3000毫米。</p> \n' +
                '\t    <p>南海低能见度主要出现在北部沿海水域，中部和南部良好能见度频率全年均在95%以上。1—4月北部湾低能见度频率稍高，尤其是2—3月频率可达7%—15%，这时正是北部湾蒙雨季节，3月最佳能见度频率仅有15%。同期广东沿海较差能见度也常出现，良好能见度频率为80%—95%。5月以后南海大部水域能见度较好，只有吕宋岛西面6—8月因降水和低云影响，低能见度频率为1%—3%。</p> ';
        }
    else if (oceanName.indexOf("台湾海峡")!=-1){
            oceanText = ' <p>台湾海峡季风交替明显，频繁的偏北风非常强劲。每年10～4月东北风为主；6～8月西南风为主。每年强烈的台风伴随暴雨，造成潮水位变化剧烈，对沿岸侵蚀很强烈。</p>\n' +
                '\t    <p>台湾海峡属南亚热带、北热带季风气候。中部气温平均最高28.1℃，最低15.9℃。西北部受大陆影响，气温年差较大；东南部受海洋影响，年差和日差较小。10月至翌年3月多东北季风，风力达4～5级，有时6级以上；5～9月多西南季风，风力3级左右。7～9月多热带气旋，每年受热带风暴和台风影响平均5～6次，中心通过平均2次。阴雨天较多，但降水量较两岸少，年降水量800～1500毫米；东北季风期、西南季风期多，秋季较少。海峡中雾日较少，澎湖列岛年平均3～4天；两侧近岸雾日较多，东山岛、马祖列岛和高雄一带，每年超过30天，其余在20天以下。</p>\n' +
                '\t    <p>受黑潮影响，水温较高，盐度和透明度也较大。年平均表层水温17～23℃，1～3月水温最低，平均12～22℃；7月最高，平均26～29℃、平均盐度33‰，西北侧30‰～31‰，东南侧为33‰～34‰。透明度东部大于西部，平均3～15米。水色东部蓝色，西部蓝绿色，河口或气候不良时呈绿黄色。</p>\n' +
                '\t    <p>福建沿岸、澎湖列岛和海口泊地以北台湾西岸为正规半日潮；海口泊地以南台湾西岸为不正规半日潮；其中冈山至枋寮段为不正规全日潮。潮差西部大于东部，西部金门岛以北为4～6米，往南显著减小；东部中间大于两端，后龙港达4.2米，海口泊地和淡水港为2.6米，海口泊地以南为0.6米，澎湖列岛1.2～2.2米。后龙港至海坛岛一线以北，涨潮流向西南，落潮流向东北，流速0.5～2节；以南流向与上述相反。流速在澎湖列岛附近较大，东南部可达3.5节。</p>\n' +
                '\t    <p>海峡为东海风浪较大地区。涌浪多于风浪，以4级浪最多，占全部海浪42%，5级占28%，大于5级的占8%。东北季风季节，以东北-北向浪为主。西南季风季节以西南-南向浪为主。在冬季寒潮和夏季热带气旋影响下，可形成8～9级浪。洋流为北上的黑潮西分支和南海暖流及南下的浙闽沿岸流所控制，并受季风影响。夏季沿岸流停止南下，整个海峡为西南季风流和黑潮西分支结合的东北流，流速一般0.6节，澎湖水道达2.3节。冬季受东北季风影响的沿岸流南下，西部和中部为西南流，流速约0.5节；东部的东北流减弱，当东北风强劲时，表层甚至改变为西南流。</p>';
        }
    else{
            //什么都不做
        }
        $("#Sea_detailTitle").html(oceanName);;
        $("#Sea_detailContent").html(oceanText);


        // {
        //     "status_code": 0
        //     "delay": 0,
        //     "data": {
        //     "fc24": {
        //         "wh": "2.0-1.0",
        //             "curdir1": "东北",
        //             "temp": "7.6-23.4",
        //             "cursp1": "1.8",
        //             "swh": "3.0-1.5",
        //             "cursp0": "0.3",
        //             "curdir0": "北东北",
        //             "name": "东海西南部",
        //             "id": "6"
        //     },
        //     "fc48": {
        //         "wh": "1.0",
        //             "curdir1": "东东北",
        //             "temp": "7.7-23.4",
        //             "cursp1": "1.6",
        //             "swh": "2.0",
        //             "cursp0": "0.3",
        //             "curdir0": "东北",
        //             "name": "东海西南部",
        //             "id": "6"
        //     }
        // },
        //     "status_msg": "查询成功",
        //     "time": "20190218"
        // }

    }


    function hidePopup() {//关闭层
        var objDiv = document.getElementById("Sea_FC");
        objDiv.style.visibility = "hidden";

        $('.haiQuYuBaoJianJie').stop().fadeOut(200);
    }

    function convertFromlatlngtocooord(coordinates) {
        var  lnglats = [];
        for(var i = 0; i < coordinates.length; i++) {
            lnglats.push(ol.proj.fromLonLat(coordinates[i]));
        }
        return lnglats;
    }


    function init(){
        
        button = $('#seaFC');

        button.click(function(){
            if(!isOpen) {
                open();
            } else {
                close();
            }
        });

        $('#Sea_FC').click(function(e) {
            $(this).parent().hide()
        })
        $('.JianJieDel').click(function(e) {
            $(this).parent().hide()
        })
        
        floatSelector.on('sea_area_select', 'click', function(){
            open();
        });

        type = key = 'Sea_FC';
        item = XHW.C.layerC.createItem('海区预报', '', function(){
            close();
        })

        
    }

    //------------鼠标指向marker的监听
    XHW.C.mapclick.addCallback('Sea_FC', function(value){
        // if($('#sea_area_select .nme').has('currentBlue'))
        if(isOpen){
            return getPopupHtml(value);
        }
            
    });

    //===========================================================绘制结束



    // --------------绘制中央海区 NMEFC

    function nmefc_data(){
        dataS =[];
        var keyword = ['0_24','0_48','0_72','1_24','1_48','1_72'];       
        var timestamp=new Date().getTime();
        for(let i = 0; i < keyword.length; i++){
            let baseurl = 'http://typhoon.nmc.cn/weatherservice/diamond8/view/' + keyword[i] + '.json?t=';
            let cb = '&callback=diamond8_view_' + keyword[i] + '_json';
            let keyname = 'diamond8_view_' + keyword[i] + '_json';
            $.ajax({
                url: baseurl + timestamp + cb,
                dataType:'text',     //  类型不能写json
                async: false,
                success:function(json){                   
                    var json = json.split(keyname)[1];
                    var data = eval('(' + json + ')');
                    dataS.push(data);          
                }
            })  
        };   
    }
    function draw_nmefc(){
        var data_24 = dataS[0].diamond8List.concat(dataS[3].diamond8List);
        var data_48 = dataS[1].diamond8List.concat(dataS[4].diamond8List);
        var data_72 = dataS[2].diamond8List.concat(dataS[5].diamond8List);

        var markers = [];
        for(var i = 0; i < data_24.length; i++) {
            var station_24 = data_24[i];
            var station_48 = data_48[i];
            var station_72 = data_72[i];
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(station_24.longitude), parseFloat(station_24.latitude)]))
            })

            // marker.type = 'seaArea';
            marker.type = 'Sea_FC';
            marker.value = {
                msg: station_24.msg,
                lng: station_24.longitude,
                lat: station_24.latitude,
                name: station_24.stationName,
                vis_24_1: station_24.visibility1,
                vis_24_2: station_24.visibility2,
                vis_48_1: station_48.visibility1,
                vis_48_2: station_48.visibility2,
                vis_72_1: station_72.visibility1,
                vis_72_2: station_72.visibility2,
                ws_24_1: station_24.windSpeed1,
                ws_24_2: station_24.windSpeed2,
                ws_48_1: station_48.windSpeed1,
                ws_48_2: station_48.windSpeed2,
                ws_72_1: station_72.windSpeed1,
                ws_72_2: station_72.windSpeed2,
                wd_24_1: station_24.windDirection1,
                wd_24_2: station_24.windDirection2,
                wd_48_1: station_48.windDirection1,
                wd_48_2: station_48.windDirection2,
                wd_72_1: station_72.windDirection1,
                wd_72_2: station_72.windDirection2,
                ww_24_1: station_24.weatherPhenomena1,
                ww_24_2: station_24.weatherPhenomena2,
                ww_48_1: station_48.weatherPhenomena1,
                ww_48_2: station_48.weatherPhenomena2,
                ww_72_1: station_72.weatherPhenomena1,
                ww_72_2: station_72.weatherPhenomena2,
                wcode_24: station_24.weatherPhenomenaCode,
            };
            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: 'img/halfhour_icon/cww' + marker.value.wcode_24 +'.png',
                    scale: 0.2,
                })),                                          
            }));

            markers.push(marker);          
        }

        let source = new ol.source.Vector({
            features: markers
        });

        if (!layerW) {
            layerW = new ol.layer.Vector({
            
            });
            layerW.setZIndex(15);
            layerW.id = key;
        }
        layerW.setSource(source);
        
        if ($.inArray(layerW, XHW.map.getLayers().getArray()) == -1)
        XHW.map.addLayer(layerW);
    }
    
    function getPopupHtml(value){       
        var dataTime = value.msg.split('日')[0] + '日';
        var popup_title = value.name + '天气预报&nbsp;&nbsp;' + dataTime;
        var vis_24 = value.vis_24_1 == value.vis_24_2 ? value.vis_24_1 +'km' : value.vis_24_1 +'&nbsp;转&nbsp;' + value.vis_24_2 +'km';
        var vis_48 = value.vis_48_1 == value.vis_48_2 ? value.vis_48_1 +'km' : value.vis_48_1 +'&nbsp;转&nbsp;' + value.vis_48_2 +'km';
        var vis_72 = value.vis_72_1 == value.vis_72_2 ? value.vis_72_1 +'km' : value.vis_72_1 +'&nbsp;转&nbsp;' + value.vis_72_2 +'km';
        var ws_24 = value.ws_24_1 == value.ws_24_2 ? value.ws_24_1 + '级' : value.ws_24_1 +'转' + value.ws_24_2 + '级';
        var ws_48 = value.ws_48_1 == value.ws_48_2 ? value.ws_48_1 + '级' : value.ws_48_1 +'转' + value.ws_48_2 + '级';
        var ws_72 = value.ws_72_1 == value.ws_72_2 ? value.ws_72_1 + '级' : value.ws_72_1 +'转' + value.ws_72_2 + '级';
        var wd_24 = value.wd_24_1 == value.wd_24_2 ? value.wd_24_1 : value.wd_24_1 +'转' + value.wd_24_2;
        var wd_48 = value.wd_48_1 == value.wd_48_2 ? value.wd_48_1 : value.wd_48_1 +'转' + value.wd_48_2;
        var wd_72 = value.wd_72_1 == value.wd_72_2 ? value.wd_72_1 : value.wd_72_1 +'转' + value.wd_72_2;
        var ww_24 = value.ww_24_1 == value.ww_24_2 ? value.ww_24_1 : value.ww_24_1 +'&nbsp;转&nbsp;' + value.ww_24_2;
        var ww_48 = value.ww_48_1 == value.ww_48_2 ? value.ww_48_1 : value.ww_48_1 +'&nbsp;转&nbsp;' + value.ww_48_2;
        var ww_72 = value.ww_72_1 == value.ww_72_2 ? value.ww_72_1 : value.ww_72_1 +'&nbsp;转&nbsp;' + value.ww_72_2;

        var html = '<div id="popup_zyhq">'
                        +'<h1>' + popup_title + '</h1>'
                        +'<div><p class="aging_title">24时预报</p>'
                        // + '<p><span>天气现象：' + ww_24 + '</span><span>风力:' + ws_24 + '</span><span>风向：'
                        + '<p><span>天气现象：' + ww_24 + '</span><span>风：' + ws_24 + '&nbsp;&nbsp;'
                        + wd_24 + '</span><span>能见度：' + vis_24 + '</span></p></div>'
                        +'<div><p class="aging_title">48时预报</p>'
                        + '<p><span>天气现象：' + ww_48 + '</span><span>风：' + ws_48 + '&nbsp;&nbsp;'
                        + wd_48 + '</span><span>能见度：' + vis_48 + '</span></p></div>'
                        +'<div><p class="aging_title">72时预报</p>'
                        + '<p><span>天气现象：' + ww_72 + '</span><span>风：' + ws_72 + '&nbsp;&nbsp;'
                        + wd_72 + '</span><span>能见度：' + vis_72 + '</span></p></div>'
                    +'</div>';
        // return html;
        $('#hq_pop').html(html);
        $('#hq_pop').show();
    }
    //---------------中央海区绘制结束

    function remove(){
        if(layerFC) {
            XHW.map.removeLayer(layerFC);
            layerFC = null;
        }
        if(layerW) {
            XHW.map.removeLayer(layerW);
            layerW = null;
        }
    }

    function open(){
        //---------添加按钮选中样式
        button.parent().addClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrc'));
        XHW.C.layout.judgeWhetherSelect(button);
        datatype = floatSelector.getValue('sea_area_select');
        // if(datatype == 'NMC'){
            xf_drawCoastRegion();
        // }else{
            nmefc_data();
            setTimeout(function(){draw_nmefc();},600)            
        // }       

        isOpen = true;
    }

    function close(){
        //---------删除图层控制
        XHW.C.layerC.removeLayer(key);

        //---------取消按钮选中样式
        button.parent().removeClass('currenterJiBtn');
        button.prev().attr('src',button.prev().attr('mysrcpri'));
		XHW.C.layout.judgeWhetherSelect(button);
        $('#hq_pop').hide();
        remove();
        isOpen = false;
        hidePopup();
    }

    init();

    return {
        close: close
    }
});

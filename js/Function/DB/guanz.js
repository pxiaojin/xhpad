define(['Function/point/SingleInfo','Function/Search'], function(singleInfo,search) {
    var layer;
    function init(){
        // 默认显示关注位置
        getFocus();

        $('#top_site').click(function(){
            if($(this).children().hasClass('current')){
                $(this).children().removeClass('current');
                $('.guanzhu_pop').hide();           
                // if(layer)layer.setVisible(false);
            }else{
                $(this).children().addClass('current')
                $('.guanzhu_pop').show();
                if(layer)layer.setVisible(true);
            }
        })

        $('.guanzhu_pop .guanzhu_pop_del').click(function(){
            $('#top_site').children().removeClass('current');
            $('.guanzhu_pop').hide();   
        })

        $('.leftMain').on('touchstart', '.mainBtn', function (e) {
            if($('#pos_mixedGraph').hasClass('active')){
                if(layer)layer.setVisible(true);
            }else{
                if(layer)layer.setVisible(false);
            }
        })

        $('.edit .edit_btn').click(function(){
            add()
        })

        // $('.guanzhu_pop .gzmain .focus .bians').click(function(){
        $('body').delegate('.guanzhu_pop .gzmain .focus .bians','click',function(){
            var self = $(this);
            togbtn(self)
        })
        // $('.guanzhu_pop .gzmain .focus .trAd').click(function(){
        $('body').delegate('.guanzhu_pop .gzmain .focus .trAd','click',function(){
            var self = $(this);
            var userid = self.attr('key');
            edit(self,userid);
            getFocus();
        })
        // $('.guanzhu_pop .gzmain .focus .trRem').click(function(){
        $('body').delegate('.guanzhu_pop .gzmain .focus .trRem','click',function(){
            var self = $(this);
            guanzhu_userid = self.attr('key');
            $('#alertBox').show();
            // var userid = self.attr('key');
            // remove(userid);
        })

        //  是否删除确认
        $('#alertSure').click(function(){
            if(!$('.guanzhu_pop').is(':hidden')){
                if(guanzhu_userid){
                    remove(guanzhu_userid);
                    $('#alertBox').hide();
                }else{
                    alert('删除失败')
                }  
            }                 
        })
        $('#alertErorr').click(function(){
            $('#alertBox').hide();
        })

        XHW.C.mapclick.addCallback('guanzhuMark', function (value) {
            singleInfo.querySingleInfo([value.lng,value.lat]);
        })
    }

    //  删除
    function remove(i){
        var userid = {
            'id': i,
        }
        $.ajax({
            type: "post",
            contentType: 'application/json; charset=UTF-8',
            url: XHW.C.http.userUrl + "delfavourite",
            data: JSON.stringify(userid),
            dataType: "json",
            success: function (data) {
                console.log(data)
                getFocus();
            }
        })
    }

    // 添加
    function add(){
        var single_lng = $('.edit_lng').val();
        var single_lat = $('.edit_lat').val();
        var single_name = $('.edit_name').val();

        if(!single_lng || !single_lat){
            alert('经纬度信息不全');
            return;
        }           

        if(!Number(single_lng) || !Number(single_lat)){
            alert('经纬度只能输入数字和一个小数点');
            return;
        }

        single_lat = parseFloat(single_lat);
        single_lng = parseFloat(single_lng);
        if(-180 <= single_lng && single_lng<= 180 && -90 <= single_lat && single_lat<= 90){
             //  关注位置信息
            var siteinfo = {
                uid: '101',
                lat: single_lat+'',
                lng: single_lng+'',
                name: single_name
            };
            $.ajax({
                type: "post",
                contentType: 'application/json; charset=UTF-8',
                url: XHW.C.http.userUrl + "addfavourite",
                data: JSON.stringify(siteinfo),
                dataType: "json",
                success: function (data) {
                    getFocus();
                    search.viewAnimate(single_lng,single_lat);

                    //  输入框置空
                    $('.edit_lng').val('');
                    $('.edit_lat').val('');
                    $('.edit_name').val('');
                }
            })
            // search.viewAnimate(single_lng,single_lat);
            // singleInfo.querySingleInfo([single_lng,single_lat]);
        }else{
            alert('经纬度超出范围')
        }      
    }

    // 编辑
    function edit(self,i){  
        var single_lng = $(self).parent().children('.guanzhu_lng').val();
        var single_lat = $(self).parent().children('.guanzhu_lat').val();
        var single_name = $(self).parent().children('.guanzhu_name').val();

        if(!single_lng || !single_lat){
            alert('经纬度信息不全');
            return;
        }           

        if(!Number(single_lng) || !Number(single_lat)){
            alert('经纬度只能输入数字和一个小数点');
            return;
        }

        single_lat = parseFloat(single_lat);
        single_lng = parseFloat(single_lng);
        if(-180 <= single_lng && single_lng<= 180 && -90 <= single_lat && single_lat<= 90){
             //  关注位置信息
            var siteinfo = {
                'id': i,
                'lat': single_lat,
                'lng': single_lng,
                'name': single_name
            };
            $.ajax({
                type: "post",
                contentType: 'application/json; charset=UTF-8',
                url: XHW.C.http.userUrl + "updatefavourite",
                data: JSON.stringify(siteinfo),
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    getFocus()
                }
            })
        }else{
            alert('经纬度超出范围')
        } 
    }

    //  切换编辑按钮
    function togbtn (dom){
        $(dom).hide();
        $(dom).next().show();
        $(dom).parent().children('input').attr('disabled',false);
    }

    //  获取用户信息
    function getFocus(){
        // http://ocean.xinhong.net:7011/getfavourite
        // {"uid":"101"}
        var userid = {
            uid: '101'
        }
        $.ajax({
            type: "get",
            contentType: 'application/json; charset=UTF-8',
            url: XHW.C.http.userUrl + "getfavourite",
            data: userid,
            dataType: "json",
            success: function (data) {
                getHtml(data)
            }
        })

        if(layer)layer.setVisible(true);
    }

    //   添加dom节点
    function getHtml(data){
        var data = data.data;
        $('.guanzhu_pop .gzmain').empty();
        for(let i = 0; i < data.length; i++){
            var html = '<div class="focus clearfix">'+
                            '<input type="text" class="guanzhu_name" value="'+data[i].name+'" disabled>'+
                            '<input type="text" class="guanzhu_lng" value="'+data[i].lng+'" disabled>'+
                            '<input type="text" class="guanzhu_lat" value="'+data[i].lat+'" disabled>'+
                            '<div class="bians"><img src="img/guanzhu_pop/edit.png" alt=""></div>'+
                            '<div class="trAd" key='+data[i].id+'><img src="img/guanzhu_pop/add_min.png" alt=""></div>'+
                            '<div class="trRem" key='+data[i].id+'><img src="img/guanzhu_pop/del.png" alt=""></div>'+
                        '</div>';
            $('.guanzhu_pop .gzmain').append(html);
        }

        var markers = [];
        for (var i = 0; i < data.length; i++) {
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(data[i].lng), parseFloat(data[i].lat)]))
            })

            marker.type = 'guanzhuMark';
            marker.value = {
                name: data[i].name,
                lng: data[i].lng,
                lat: data[i].lat
            }

            marker.setStyle(new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    crossOrigin: 'anonymous',
                    src: './img/map_point.png',
                    scale: 1,
                })),
                text: new ol.style.Text({
                    text: data[i].name,
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    offsetY: 20
                })
            }));

            markers.push(marker);
        }

        let source = new ol.source.Vector({
            features: markers
        });

        if (!layer) {
            layer = new ol.layer.Vector({

            });
            layer.setZIndex(15);
            layer.id = 'guanzhuMark';
        }
        layer.setSource(source);

        if ($.inArray(layer, XHW.map.getLayers().getArray()) == -1)
            XHW.map.addLayer(layer);
    }

    
    init();


    return {
        init: init,
    }
});
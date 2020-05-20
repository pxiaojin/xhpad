var timeBar = {};  // 时间轴上选中的时间参数

// 增加回调函数
var functionS = [];
timeBar.addCallback = function(fc){
    functionS.push(fc);
};
  //  获取时间参数
function gettimebar(){ 
    timeBar['year'] = $('.spindle .swiper-wrapper>div.cur').attr('keyy');
    timeBar['month'] = $('.spindle .swiper-wrapper>div.cur').attr('keym');
    timeBar['day'] = $('.spindle .swiper-wrapper>div.cur').attr('keyd');
    timeBar['hour'] = $('.spindle .swiper-wrapper>div.cur').attr('keyh');
    timeBar['getRequestTime'] = function(e) {
        return timeBar.year + '-' + timeBar.month + '-' + timeBar.day + '-' + timeBar.hour
    }
}
//   加载时间轴样式
function time_bar(){
    effect = 0
    var swiper = new Swiper('.swiper-containerFc', {
        loop: false,
        speed: 2500,
        slidesPerView: 15,
        slidesPerGroup : 5,
        slideToClickedSlide: true,
        watchSlidesProgress : true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        observer:true,//修改swiper自己或子元素时，自动初始化swiper 
        observeParents:true//修改swiper的父元素时，自动初始化swiper 
        });
    var swiperFio = new Swiper('.swiper-containerFio', {
        loop: false,
        speed: 2500,
        slidesPerView: 15,
        slidesPerGroup : 5,
        slideToClickedSlide: true,
        watchSlidesProgress : true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        observer:true,//修改swiper自己或子元素时，自动初始化swiper 
        observeParents:true//修改swiper的父元素时，自动初始化swiper 
        });

    // var swiper2 = new Swiper('.swiper-containerGfs', {
    //     loop: false,
    //     speed: 2500,
    //     slidesPerView: 15,
    //     slidesPerGroup : 10,
    //     slideToClickedSlide: true,
    //     watchSlidesProgress : true,
    //     resistanceRatio : 0,
    //     // longSwipes: true,
    //     shortSwipes : true,
    //     observer:true,//修改swiper自己或子元素时，自动初始化swiper 
    //     observeParents:true//修改swiper的父元素时，自动初始化swiper 
    //     });

    var swiper3 = new Swiper('.swiper-containerReal', {
        loop: false,
        speed: 2500,
        noSwiping: true,
        slidesPerView: 8,
        //   spaceBetween: 30,
        watchSlidesProgress : true,
        observer:true,//修改swiper自己或子元素时，自动初始化swiper 
        observeParents:true//修改swiper的父元素时，自动初始化swiper 
        });

    // var radar_list_index = $('#radar-list .swiper-containerRadar .swiper-wrapper').children().length;
    var swiper_radar = new Swiper('#radar-list .swiper-containerRadar', {
        // initialSlide :radar_list_index,
        loop: false,
        speed: 2500,
        slidesPerView: 'auto',
        slidesPerGroup : 15,
        slideToClickedSlide: true,
        watchSlidesProgress : true,
        observer:true,//修改swiper自己或子元素时，自动初始化swiper 
        observeParents:true//修改swiper的父元素时，自动初始化swiper 
        });

    var swiper_cloud = new Swiper('#cloud_source_list .swiper-containerCloud', {
        // initialSlide :radar_list_index,
        loop: false,
        speed: 2500,
        slidesPerView: 'auto',
        slidesPerGroup : 15,
        slideToClickedSlide: true,
        watchSlidesProgress : true,
        observer:true,//修改swiper自己或子元素时，自动初始化swiper 
        observeParents:true//修改swiper的父元素时，自动初始化swiper 
        });
}

function init(){ 
    // 给时间轴赋值
    getTime()
    //   加载时间轴样式
    time_bar();

    //  判断数据有无
    isSource();
    setInterval(function(){
        var parentEl = $('.swiper-wrapper>div.cur').parent().parent();
        var keyy = $('.swiper-wrapper>div.cur').attr('keyy');
        var keym = $('.swiper-wrapper>div.cur').attr('keym');
        var keyd = $('.swiper-wrapper>div.cur').attr('keyd');
        var keyh = $('.swiper-wrapper>div.cur').attr('keyh');

        getTime();
        time_bar();
        isSource();
        setTimeout(function () {
            // 刷新后仍旧延续之前的状态
            parentEl.children().children().each(function(index){
                if($(this).attr('keyy') == keyy && $(this).attr('keym') == keym && $(this).attr('keyd') == keyd && $(this).attr('keyh') == keyh){
                    // $(this).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
                    $(this).addClass('cur').css('background','#D6CE40');
                    return;
                }
            })
        },300);

    },60*1000)

    // $('#moShiQieHuang span').click(function () {
    //     if($(this).html() == 'ECMF' && !$('#sea_mixedGraph').hasClass('active')){
    //         $('.swiper-containerFc').show();
    //         $('.swiper-containerGfs').hide();
    //         $('.swiper-containerFio').hide();
    //         // $('.swiper-containerFc .swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
    //         // $('.swiper-containerFc .swiper-slide').eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
    //         $('.swiper-containerFc .swiper-slide').removeClass('cur').css('background','#AA4159');
    //         $('.swiper-containerFc .swiper-slide').eq(0).addClass('cur').css('background','#D6CE40');
    //         $(".time_swiper_childs[tag='false']").css('background','gray');
    //         timeBar['year'] = $('.swiper-containerFc .swiper-wrapper>div.cur').attr('keyy');
    //         timeBar['month'] = $('.swiper-containerFc .swiper-wrapper>div.cur').attr('keym');
    //         timeBar['day'] = $('.swiper-containerFc .swiper-wrapper>div.cur').attr('keyd');
    //         timeBar['hour'] = $('.swiper-containerFc .swiper-wrapper>div.cur').attr('keyh');
    //         timeBar['getRequestTime'] = function(e) {
    //             return timeBar.year + '-' + timeBar.month + '-' + timeBar.day + '-' + timeBar.hour
    //         }
    //     }else if($(this).html() == 'GFS' && !$('#sea_mixedGraph').hasClass('active')){
    //         $('.swiper-containerFc').hide();
    //         $('.swiper-containerGfs').show();
    //         $('.swiper-containerFio').hide();
    //         // $('.swiper-containerGfs .swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
    //         // $('.swiper-containerGfs .swiper-slide').eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
    //         $('.swiper-containerGfs .swiper-slide').removeClass('cur').css('background','#AA4159');
    //         $('.swiper-containerGfs .swiper-slide').eq(0).addClass('cur').css('background','#D6CE40');
    //         $(".time_swiper_childs[tag='false']").css('background','gray');
    //         timeBar['year'] = $('.swiper-containerGfs .swiper-wrapper>div.cur').attr('keyy');
    //         timeBar['month'] = $('.swiper-containerGfs .swiper-wrapper>div.cur').attr('keym');
    //         timeBar['day'] = $('.swiper-containerGfs .swiper-wrapper>div.cur').attr('keyd');
    //         timeBar['hour'] = $('.swiper-containerGfs .swiper-wrapper>div.cur').attr('keyh');
    //         timeBar['getRequestTime'] = function(e) {
    //             return timeBar.year + '-' + timeBar.month + '-' + timeBar.day + '-' + timeBar.hour
    //         }
    //     }
    //     // var parentEl = $('.swiper-wrapper>div.cur').parent().parent();
    //     // var keyy = $('.swiper-wrapper>div.cur').attr('keyy');
    //     // var keym = $('.swiper-wrapper>div.cur').attr('keym');
    //     // var keyd = $('.swiper-wrapper>div.cur').attr('keyd');
    //     // var keyh = $('.swiper-wrapper>div.cur').attr('keyh');


    //     // // 刷新后仍旧延续之前的状态
    //     // parentEl.children().children().each(function(index){
    //     //     if($(this).attr('keyy') == keyy && $(this).attr('keym') == keym && $(this).attr('keyd') == keyd && $(this).attr('keyh') == keyh){
    //     //         $(this).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")'); 
    //     //     }
    //     // })
    // });
    $('#sea_mixedGraph').click(function () {
        $('.time').show();
        $('.swiper-containerFc').hide();
        $('.swiper-containerGfs').hide();
        $('.swiper-containerFio').show();
        $('.swiper-containerReal').show();
        // $('.swiper-containerFio .swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
        // $('.swiper-containerFio .swiper-slide').eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        $('.swiper-containerFio .swiper-slide').removeClass('cur').css('background','#AA4159');
        $('.swiper-containerFio .swiper-slide').eq(0).addClass('cur').css('background','#D6CE40');
        $(".time_swiper_childs[tag='false']").css('background','gray');
        gettimebar()
    });
    $('#real_mixedGraph').click(function () {
        $('.time').show();
        $('.swiper-containerFc').show();
        $('.swiper-containerGfs').hide();
        $('.swiper-containerFio').hide();
        $('.swiper-containerReal').show();
        // $('.swiper-containerFio .swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
        // $('.swiper-containerFio .swiper-slide').eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        $('.swiper-containerFio .swiper-slide').removeClass('cur').css('background','#AA4159');
        $('.swiper-containerFio .swiper-slide').eq(0).addClass('cur').css('background','#D6CE40');
        $(".time_swiper_childs[tag='false']").css('background','gray');
        gettimebar()
    });

    // $('.swiper-containerFc .swiper-slide').eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
    setTimeout(function () {
        $('.swiper-containerFc .swiper-slide').eq(0).css('background','#D6CE40');
    },200)
    $('.swiper-containerFc .swiper-slide').eq(0).addClass('cur');
    //  获取时间参数
     gettimebar();
    // $('.swiper-slide').click(function(){
    $("body").on('click', '.time_swiper_childs',function(){
        if($(this).attr('tag') == 'false')return
        // $('.time_swiper_childs').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
        // $(this).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        $('.swiper-containerFio .time_swiper_childs').removeClass('cur').css('background','#AA4159');
        $('.swiper-containerFc .time_swiper_childs').removeClass('cur').css('background','#AA4159');
        $('.swiper-containerGfs .time_swiper_childs').removeClass('cur').css('background','#AA4159');
        $('.swiper-containerReal .time_swiper_childs').removeClass('cur').css('background','#d4571a');
        $(".time_swiper_childs[tag='false']").css('background','gray');
        $(this).addClass('cur').css('background','#D6CE40');
        timeBar['year'] = $(this).attr('keyy');
        timeBar['month'] = $(this).attr('keym');
        timeBar['day'] = $(this).attr('keyd');
        timeBar['hour'] = $(this).attr('keyh');
        timeBar['getRequestTime'] = function(e) {
            return timeBar.year + '-' + timeBar.month + '-' + timeBar.day + '-' + timeBar.hour
        }
        for(var i in functionS) {
            functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
        }      
    })
    $('.swiper-button-next').click(function(){   
        // var self = $('#moShiQieHuang span.current').html() == 'ECMF' ? $('.swiper-containerFc .swiper-slide') : $('.swiper-containerGfs .swiper-slide');
        var self = $('.swiper-containerFc').is(':hidden') == false ? $('.swiper-containerFc .swiper-slide') :
                        $('.swiper-containerGfs').is(':hidden') == false ? $('.swiper-containerGfs .swiper-slide') :
                            $('.swiper-containerFio').is(':hidden') == false ? $('.swiper-containerFio .swiper-slide') : '';
        // var selfcur = $('#moShiQieHuang span.current').html() == 'ECMF' ? $('.swiper-containerFc .swiper-wrapper>div.cur') : $('.swiper-containerGfs .swiper-wrapper>div.cur');
        var selfcur = $('.swiper-containerFc').is(':hidden') == false ? $('.swiper-containerFc  .swiper-wrapper>div.cur') :
                        $('.swiper-containerGfs').is(':hidden') == false ? $('.swiper-containerGfs  .swiper-wrapper>div.cur') :
                            $('.swiper-containerFio').is(':hidden') == false ? $('.swiper-containerFio  .swiper-wrapper>div.cur') : '';
        if(self.hasClass('cur')){
            $('.swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
            selfcur.next().addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        }else{
            $('.swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
            self.eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        }
        gettimebar();
        for(var i in functionS) {
            functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
        }                     
    })
    $('.swiper-button-prev').click(function(){
        // var self = $('#moShiQieHuang span.current').html() == 'ECMF' ? $('.swiper-containerFc .swiper-slide') : $('.swiper-containerGfs .swiper-slide');
        // var selfcur = $('#moShiQieHuang span.current').html() == 'ECMF' ? $('.swiper-containerFc .swiper-wrapper>div.cur') : $('.swiper-containerGfs .swiper-wrapper>div.cur');
        var self = $('.swiper-containerFc').is(':hidden') == false ? $('.swiper-containerFc .swiper-slide') :
                        $('.swiper-containerGfs').is(':hidden') == false ? $('.swiper-containerGfs .swiper-slide') :
                            $('.swiper-containerFio').is(':hidden') == false ? $('.swiper-containerFio .swiper-slide') : '';
        var selfcur = $('.swiper-containerFc').is(':hidden') == false ? $('.swiper-containerFc  .swiper-wrapper>div.cur') :
                        $('.swiper-containerGfs').is(':hidden') == false ? $('.swiper-containerGfs  .swiper-wrapper>div.cur') :
                            $('.swiper-containerFio').is(':hidden') == false ? $('.swiper-containerFio  .swiper-wrapper>div.cur') : '';
        if(self.hasClass('cur')){
            $('.swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
            selfcur.prev().addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        }else{
            $('.swiper-slide').removeClass('cur').children('.li_img').css('background-image','url("img/airport/airport_brown.png")');
            self.eq(0).addClass('cur').children('.li_img').css('background-image','url("img/airport/airport_gray.png")');
        }
        gettimebar();
        for(var i in functionS) {
            functionS[i] ? functionS[i](timeBar.getRequestTime()) : null;
        }     
    })
}

init()
function getTime(){
    var tarr = [2,5,8,11,14,17,20,23];
    
    var nowTime = new Date();
    // var nowYear = nowTime.getFullYear();
    // var nowMonth = nowTime.getMonth() + 1;
    // var nowDay = nowTime.getDate();
    var nowHour = nowTime.getHours();
    for(var i = 0; i < tarr.length; i++){
        if(nowHour == tarr[i] || nowHour+1 == tarr[i] || nowHour-1 == tarr[i]){
            nowTime.setHours(tarr[i]); break;
        }
    }
    
    //   添加ec预报时间 和 fio海洋时间
    $('.swiper-containerFc .swiper-wrapper').empty();
    for(var i = 0; i < 24; i++){
        var fcTime = new Date(nowTime.getTime() + (i+1) * 3 * 60 * 60 * 1000);
        var fcYear = fcTime.getFullYear();
        var fcMonth = toTwo(fcTime.getMonth() + 1);
        var fcDay = toTwo(fcTime.getDate());
        var fcHour = toTwo(fcTime.getHours());
        var showTime = fcHour == '02' ? fcDay+'日' : fcHour+'';
        var html =  '<div class="swiper-slide time_swiper_childs" keyy="'+fcYear+'" keym='+fcMonth+' keyd='+fcDay+' keyh="'+fcHour+'">'+
                        // '<span class="li_img"></span>'+
                        '<span class="li_time">'+showTime+'</span>'+
                    '</div>';
        $('.swiper-containerFc .swiper-wrapper').append(html);
        $('.swiper-containerFio .swiper-wrapper').append(html);
    }

    //   添加gfs预报时间
    $('.swiper-containerGfs .swiper-wrapper').empty();
    for(var i = 0; i < 72; i++){
        var fcTime = new Date(nowTime.getTime() + (i+1) * 60 * 60 * 1000);
        var fcYear = fcTime.getFullYear();
        var fcMonth = toTwo(fcTime.getMonth() + 1);
        var fcDay = toTwo(fcTime.getDate());
        var fcHour = toTwo(fcTime.getHours());
        var showTime = fcHour == '01' ? fcDay+'日': fcHour+'';
        var html =  '<div class="swiper-slide time_swiper_childs" keyy="'+fcYear+'" keym='+fcMonth+' keyd='+fcDay+' keyh="'+fcHour+'">'+
                        // '<span class="li_img"></span>'+
                        '<span class="li_time">'+showTime+'</span>'+
                    '</div>';
        $('.swiper-containerGfs .swiper-wrapper').append(html);
        $('.swiper-containerGfs .swiper-slide').css('width','54.8px');
    }

    //   添加实况时间
    $('.swiper-containerReal .swiper-wrapper').empty();
    for(var i = 8; i > 0; i--){
        var realTime = new Date(nowTime.getTime() - (i-1) * 3 * 60 * 60 * 1000);
        var realYear = realTime.getFullYear();
        var realMonth = toTwo(realTime.getMonth() + 1);
        var realDay = toTwo(realTime.getDate());
        var realHour = toTwo(realTime.getHours());
        var showTime = realHour == '02' ? realDay+'日' : realHour+'';
        var html =  '<div class="swiper-slide time_swiper_childs" keyy="'+realYear+'" keym='+realMonth+' keyd='+realDay+' keyh="'+realHour+'">'+
                        // '<span class="li_img"></span>'+
                        '<span class="li_time">'+showTime+'</span>'+
                    '</div>';
        $('.swiper-containerReal .swiper-wrapper').append(html);
    }
}

// 小于10前面加'0'
function toTwo(time){
    time = time+'';
   return time.length < 2 ? "0"+time : time;
} 

function isSource(){
    var param1 = '/real/dataexist';
    var param2 = '/ecmf/dataexist';
    // var param3 = '/gfs/dataexist';
    var param4 = '/fio/dataexist';
    // var paramAr = [param1,param2,param3,param4];
    var paramAr = [param1,param2,param4];

    var elem1 = '.time .swiper-containerReal .swiper-slide';
    var elem2 = '.time .swiper-containerFc .swiper-slide';
    // var elem3 = '.time .swiper-containerGfs .swiper-slide';
    var elem4 = '.time .swiper-containerFio .swiper-slide';
    // var elemAr = [elem1,elem2,elem3,elem4];
    var elemAr = [elem1,elem2,elem4];
    var url = 'http://ocean.xinhong.net:7012';

    for(let i = 0; i < paramAr.length; i++){
        $.ajax({
            url: url + paramAr[i],
            dataType:'json',
            success:function(json){
                if(json.status_code != 0) {
                    console.log('数据错误');
                    return;
                }
                var data = json.data;
                $(elemAr[i]).each(function(index){
                    var elem_time1 = $(this).attr('keyy');
                    var elem_time2 = $(this).attr('keym');
                    var elem_time3 = $(this).attr('keyd');
                    var elem_time4 = $(this).attr('keyh');
                    var elem_time = elem_time1 + elem_time2 + elem_time3 + elem_time4;
                    if (i<1){
                        if(data[elem_time] == 'true'){
                            $(this).css('background','#d4571a');
                        }else{
                            $(this).css('background','gray');
                            $(this).attr('tag','false');
                        }
                    }else {
                        if(data[elem_time] == 'true'){
                            $(this).css('background','#AA4159');
                        }else{
                            $(this).css('background','gray');
                            $(this).attr('tag','false');
                        }
                    }
                });
            }
        })
    }
}
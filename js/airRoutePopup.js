$(function(){
    // 固定航线、自定义航线按钮
    $('.airRouteBtn .guding').click(function(event) {
        $(this).addClass('cur');
        $('.airRouteBtn .zidingyi').removeClass('cur2');

        // 自定义航线弹框隐藏
        $('.airRoute_pop').hide();
    });

    // 自定义航线弹框
    $('.airRoute_pop .airRoute_pop_del').click(function(event) {
        $('.airRoute_pop').hide();
    });

    // 航线详情框
    $('.airRoutePar_pop .airRoutePar_pop_del').click(function(event) {
        $('.airRoutePar_pop').hide();
    });



})
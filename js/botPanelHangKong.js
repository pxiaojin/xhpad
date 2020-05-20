function botHangKongLeftWidth(){
    let totalWidth = $('.botPanelHangKong').width();
    let rightPanel = $('.botPanelHangKong .botHangKongRight');
    let rightWidth = rightPanel.outerWidth();
    if (rightWidth > 490) {
        rightWidth = 490;
        rightPanel.css('width', rightWidth + 'px');
    }

    let leftWidth = totalWidth - rightWidth - 10;
    let leftPanel = $('.botPanelHangKong .botHangKongLeft');
    leftPanel.css('width', leftWidth);

    $('.botPanelHangKong .botHangKongLeft .botPanelScroll .botPanelLeftTu').css('width', leftWidth - $('#ProfileChart_yAxis').outerWidth());
}

function botPanelHangKong(){
    botHangKongLeftWidth();
    $('.botPanelHangKong .inputStye').click(function(event) {
        $('.botPanelHangKong .inputStye').removeClass('current');
        $(this).addClass('current');

        var myHtml = $(this).siblings('span').html();
        var mysrc = $(this).attr('mysrc');
        $('.botPanelHangKong .tuLiDiv .text').html(myHtml);
        $('.botPanelHangKong .tuLiDiv img').attr('src',mysrc);
    });

    $('.botPanelHangKong .delHangKong').click(function(event) {
        $('.botPanelHangKong').stop().animate({'bottom':'-500px'}, 200);
    });

}

$(window).resize(function(event) {
    botHangKongLeftWidth();
});

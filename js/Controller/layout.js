/**
 * 页面布局交互
 */
define([], function() {
    function init(){
        
        //-------------------------------------顶部工具及配置--------------------------------------------
        // 工具二级显示
        $('.header .toolDiv .toolGongJu').click(function(event) {
            $(this).siblings('ul').stop().slideToggle(200);//工具二级显示
            $('.PeiZhiPanel').stop().fadeOut(200);//配置面板收起
        });
    
        //配置弹出框显示
        $('.header .toolDiv .toolSheZhi').click(function(event) {
            $('.PeiZhiPanel').stop().fadeIn(200); //配置弹出框显示
            $('.header .toolDiv .toolGongJu').siblings('ul').stop().slideUp(200);//工具二级收起
        });
    
    
        //配置弹出框的input样式
        $('.PeiZhiPanel .diTuXuanKuang input').click(function(event) {
            let parent1 = this.parentNode;
            let parent = parent1.parentNode;
            if (parent && parent.id == 'isolineConfigColorMode') {
                if ($(this).hasClass('current'))
                    return;
                $('#isolineConfigColorMode input').removeClass('current');
                $(this).addClass('current');//换图片
                XHW.config.isoline.colorMode = ($(this).val());
            } else {
                $(this).toggleClass('current');//换图片
            }
        });
    
        //----------------------------------------左侧要素菜单---------------------------------------
        $('.layout_tab').click(function(){
            if($(this).parent().hasClass('current2')) {  //判断当前一级菜单是否开启
                // close 已被开启 进行关闭
                $(this).parent().removeClass('current2');
                $(this).parent().children('.erJiUl,.rgbaDiv').stop().slideUp(50);
            } else {
                // open 当前关闭 进行开启（关闭其他二级菜单为功能的功能）
                // $('.layout_tab').parent().removeClass('current2');
                $(this).parent().addClass('current2');
                $(this).parent().children('.erJiUl,.rgbaDiv').hide();
                $(this).parent().children('.erJiUl,.rgbaDiv').stop().slideDown(50);
            }
        });
        
        //左侧要素位置
        // function leftMainHeight(){
        //     var winH = $(window).height();//window 高
        //     var diH = 380 + 20;//底部面板的高度
        //     var headerH  = 100;//搜索框高
        //     var myH  = winH - diH - headerH ; //左侧要素最大高
            
        //     var dibu = $('.botPanelhaiYang').css('bottom');//底部面板的bottom 刷新时为-500px
        //     if(dibu == 0){
        //         $('.leftMain').css({'bottom':''+diH+'px','max-height':''+myH+'px'});//左侧要素bottom的位置和最大高度
        //     }else{
        //         $('.leftMain').css('bottom','40px');//左侧要素bottom为原始值
        //     }
            
        // };
        //function leftMainHeight(){
            // var winH = $(window).height();//window 高
            // var diH = 380 + 20;//底部面板的高度
            // var headerH  = 100;//搜索框高
            // var myH  = winH - diH - headerH ; //左侧要素最大高
            
            // var dibu = $('.botPanelhaiYang').css('bottom');//底部面板的bottom 刷新时为-500px
            // if(dibu == 0){
            //     $('.leftMain').css({'bottom':''+diH+'px','max-height':''+myH+'px'});//左侧要素bottom的位置和最大高度
            // }else{
            //     $('.leftMain').css('top','390px');//左侧要素bottom为原始值
            // }
            
        //}; 
        //leftMainHeight();

        //-----------------------------选择框更换内容---------------------------
        $('select').change(function(event) {
            var myVal = $(this).children('option:selected').text();
            $(this).closest('div').find('.selectA').html(myVal);
        });
        //------------------------------图层及图例菜单--------------------------
        $('.tuLi .tuLiTop li a').click(function(event) {
            $(this).parent().addClass('current').siblings('').removeClass('current');
            $('.tuLi .tuLiBot').removeClass('current');
            $('.tuLi .tuLiBot').eq($(this).parent().index()).addClass('current');
        });

        $('.tuLiRetract').click(function(event) {//图例的弹出及收回
            if($(this).hasClass('current')){
                $(this).removeClass('current');
                $('.tuLi').stop().animate({'right':'580px'},200);
            }else{
                $(this).addClass('current');
                $('.tuLi').stop().animate({'right':'0px'},200);
            }
        });

        //----------------------------------------右侧及底部侧拉窗--------------------------------------------
        //右侧面板消失
        $('.panelDel').click(function(event) {
            hideRightMenu();
            
        });

        // 点击del底部面板消失
        $('.botPanelhaiYang .delHaiYang').click(function(event) {
            hideBottomMenu();
        });
        //右侧面板tab标签
        //---------------城镇
        $('#right_info_station .listNav li a').click(function(){
            var index = $(this).parent().parent().children().index($(this).parent());
            var top = $('#right_info_station .moduleDiv').eq(index).position().top;
            // for(var i = 0; i < index; i++) {
            //     top += $('#right_info_station .moduleDiv').eq(i).outerHeight();
            // }
            // $('#right_info_station .scrollTop').scrollTop(top);
            $('#right_info_station .scrollTop').mCustomScrollbar("scrollTo",top,{
                scrollInertia:500
             });
        });

        //----------------------机场
        $('#right_info_airport .listNav li a').click(function(){
            var index = $(this).parent().parent().children().index($(this).parent());
            var top = $('#right_info_airport .moduleDiv').eq(index).position().top;
            $('#right_info_airport .scrollTop').mCustomScrollbar("scrollTo",top,{
                scrollInertia:500
             });
        });

        //------------------------gfs单点
        $('#right_info_Single .listNav li a').click(function(){
            var index = $(this).parent().parent().children().index($(this).parent());
            var top = $('#right_info_Single .moduleDiv').eq(index).position().top;
            $('#right_info_Single .scrollTop').mCustomScrollbar("scrollTo",top,{
                scrollInertia:500
             });
        });

        //-----------------------gfs多点
        $('#right_info_multi .listNav li a').click(function(){
            var index = $(this).parent().parent().children().index($(this).parent());
            var top = $('#right_info_multi .moduleDiv').eq(index).position().top;
            $('#right_info_multi .scrollTop').mCustomScrollbar("scrollTo",top,{
                scrollInertia:500
             });
        });


    }

    init();
    
    var rightMenu;
    // 右侧展示区 弹出
    function showRightMenu(){
        hideBottomMenu();
        $('.rightPanel').hide();
        var rightPanelW = 550;
        // $('.panelDel').stop().animate({'right':''+(rightPanelW - 10)+'px'},200);
        $('.slibarDiv').stop().animate({'right':''+rightPanelW+'px'},200);
        rightMenu = true;

        // 时间轴
        $('#slibarUpBtn,#timeInput,#bar,#slibarTop,#scale,#slibarTop').addClass('current');
        $('.slibarPlayBtn').addClass('hasRightPanel');
        // sliderBar.setA(10);
        // var a = $('#slider').css('left').split('px')[0];
        // a = parseInt(a);
        // var b = a - 20;
        
        // $('#slider').css('left',''+b+'px');
        // console.log(a);
        // console.log(b);
        $('.tuLiRetract').addClass('current');
        $('.tuLi').stop().animate({'right':'0','bottom':'45px'},200);
        $('.tuLiRetract').stop().animate({'bottom':'47px'},200);


        //右上角模式切换位置
        // var rightTopTabR = rightPanelW +20;
        // $('#rightTopTab').stop().animate({'right':''+rightTopTabR+'px'},200);
    }

    function getRightMenu(){
        return rightMenu;
    }

    /**
     * 隐藏右侧面板
     */
    function hideRightMenu(){
        // $('.panelDel').stop().animate({'right':'-50px'},200);
        $('.slibarDiv').stop().animate({'right':'0'},200);
        rightMenu = false;
        // 时间轴
        $('#slibarUpBtn,#timeInput,#bar,#slibarTop,#scale,#slibarTop').removeClass('current');
        $('.slibarPlayBtn').removeClass('hasRightPanel');
        // sliderBar.setA(28);
    }

    /**
     * 底部详情区 弹出
     */
    function showBottomMenu(){
        hideRightMenu();
        //单点海洋左侧宽度
        function botHaiBiaoLeftWidth(){
            var winW = $(window).width();
            var botHaiBiaoLeftW = $('.botPanelhaiYang .botHaiBiaoRight').width();
            $('.botPanelhaiYang .botHaiBiaoLeft').width(winW - botHaiBiaoLeftW -10 );
        }
        botHaiBiaoLeftWidth();
        $(window).resize(function(event) {
             botHaiBiaoLeftWidth();
        });
        $('.botPanelHaiBiao').hide();
        $('.botPanelhaiYang').show();
        $('.botPanelhaiYang').stop().animate({'bottom':'0'},200);

        //图例
        $('.tuLiRetract').addClass('current');
        $('.tuLi').stop().animate({'right':'0','bottom':'45px'},200);
        $('.tuLiRetract').stop().animate({'bottom':'47px'},200);

    }

    /**
     * 隐藏底部面板
     */
    function hideBottomMenu(){
        $('.botPanelhaiYang').stop().animate({'bottom':'-500px'},200);
        $('.botPanelhaiYang').hide();
    }

    /**
     * 
     * 判断一级菜单中是否有二级菜单被选中
     * @param {*} button 
     */
    function judgeWhetherSelect(button){
        button.parent().parent().parent().removeClass('current');
        button.parent().parent().children().each(function(){
            if($(this).hasClass('currenterJiBtn')) {
                $(this).parent().parent().addClass('current');
                return false;
            }
        });
    }
    
    // 分辨率调整各框位置
    function fenBianLv(){
        var windowWidth= $(window).width();
        var windowHeight = $(window).height();
        if(windowWidth <= 1300 || windowHeight < 800){
            // $('#cloud_source_list').css({'left':'20px',' top':'100px'});
            $('#radar_data_list').css({'left':'20px',' top':'320px'});//雷达
            $('.taiFeng1').css({'left':'3px',' top':'100px'});//台风
            $('.taiFeng2').css({'left':'20px',' top':'360px'});//台风
            $('.tides').css({'left':'20px',' top':'360px'});//潮汐
        }else{
            // $('#cloud_source_list').css({'left':'20px',' top':'590px'});
            $('#radar_data_list').css({'left':'20px',' top':'560px'});//雷达
            $('.taiFeng1').css({'left':'3px',' top':'250px'});//台风
            $('.taiFeng2').css({'left':'20px',' top':'520px'});//台风
            $('.tides').css({'left':'20px',' top':'520px'});//潮汐
        }
    }

    return {
        fenBianLv: fenBianLv,
        showRightMenu: showRightMenu,
        getRightMenu: getRightMenu,
        showBottomMenu: showBottomMenu,
        judgeWhetherSelect: judgeWhetherSelect,
    }
});

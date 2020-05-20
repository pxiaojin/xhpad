define(['Function/tool/playlistWindow',
    'Function/tool/imagePlay'], function(PlaylistWindow, imagePlay){

    var playlistWindow = new PlaylistWindow('himawari8-list');
    $('#himawari8-img').click(function(){
        if($(this).parent().hasClass('currenterJiBtn')) {
            close();
            XHW.C.layout.judgeWhetherSelect($(this));
        } else {
            var dataList = requestDataList();
            playlistWindow.open(
                dataList,
                {
                    close: function(){
                        imagePlay.close();
                        $('#himawari8-img').parent().removeClass('currenterJiBtn');
                        $('#himawari8-img').prev().attr('src',$('#himawari8-img').prev().attr('mysrcpri'));
                    },
                    showIndex: function(index){
                        imagePlay.showImg('himawari8-img-div', dataList[index].url)
                    }
                });
            $(this).parent().addClass('currenterJiBtn');
            $(this).prev().attr('src',$(this).prev().attr('mysrc'));
            XHW.C.layout.judgeWhetherSelect($(this));
        }
    });
    $('#himawari8-list .del').click(function(e) {
        $(this).parent().hide()
    })

    function requestDataList() {

        // $.ajax({
        //     url: 'http://ocean.xinhong.net:81/images/cwbtwhimawari8/cwbtw_himawari8_s0p.index',//'http://ocean.xinhong.net:8000/xhweatherfcsys/landhydrology/allStationsData',
        //     dataType: 'json',
        //     success: function (res) {
        //
        //     }
        // });
        var dataList = [];
        // 最近3小时
        let hours = 3;
        var curdate = new Date();
        let minute = curdate.getMinutes();
        // 十分钟一次,但是原网站每天的早上10：40云图， 最早的云图可能在20分钟之前
        curdate = new Date(curdate.getTime()
            - minute%10 * 60 * 1000
            - 20*60*1000
            - hours * 60 * 60 * 1000);
        let i = 0;
        while(i < hours * 6) {
            curdate = new Date(curdate.getTime() + 10 * 60  * 1000);
            let data = {};
            data.desc = curdate.format('MM月dd日 hh:mm');
            //移除10：40的元素
            if (data.desc.indexOf('10:40')!=-1){
                i++;
                continue;
            }
            let dateDir = curdate.format('yyyyMMdd');
            let dateFilename = curdate.format('yyyy-MM-dd-hh-mm');
            data.url = 'http://ocean.xinhong.net:81/'
                + 'images/cwbtwhimawari8/'
                + dateDir + '/cwbtw_himawari8_s0p-' + dateFilename + '.jpg';
            dataList.push(data);
            i++;
        }

        return dataList;
    }

    function close() {
        $('#himawari8-img').parent().removeClass('currenterJiBtn');
        $('#himawari8-img').prev().attr('src',$('#himawari8-img').prev().attr('mysrcpri'));
        playlistWindow.close();
        imagePlay.close();
    }

    return {
        close: close
    }
});
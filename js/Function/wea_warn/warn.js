//海洋总功能类
define([], function() {
    var warn = {};
    var isOpen;

    function init(){
        require(['Function/wea_warn/highTem'], function(tem){
            warn.tem = tem;  
        })
        require(['Function/wea_warn/bottomTem_wind'], function(bot_tem){
            warn.bot_tem = bot_tem;  
        })
        require(['Function/wea_warn/bigWind'], function(bigWind){
            warn.bigWind = bigWind;  
        })
        require(['Function/wea_warn/bigWave'], function(bigWave){
            warn.bigWave = bigWave;  
        })
        require(['Function/wea_warn/badVis'], function(badVis){
            warn.badVis = badVis;  
        })
        require(['Function/wea_warn/heavyRain'], function(heavyRain){
            warn.heavyRain = heavyRain; 
        })
        require(['Function/wea_warn/TS'], function(ts){
            warn.ts = ts; 
        })

        $('#weather_warning').click(function(){
            if (!isOpen) {
                // open();       
                open('ts');
                open('heavyRain');      
            } else {
                close();                             
            }        
        })
    }   

    function close(type){
        if(type) {
            if(warn[type])
            warn[type].close ? warn[type].close() : null;
        } else {
            for(var key in warn) {
                warn[key].close ? warn[key].close() : null;
            }
        }
        isOpen = false;
    }

    function open(type){
        if(type) {
            if(warn[type])
            warn[type].open ? warn[type].open() : null;
        } else {
            for(var key in warn) {console.log(key)
                warn[key].open ? warn[key].open() : null;
            }
        }
        isOpen = true;
    }
    
    return {
        init: init,
        close: close
    }
});
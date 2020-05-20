define([
    'lib/plotting/plotting',
    'lib/plotting/index',
    'lib/plotting/smooth',
    'lib/plotting/MilStdDraw'
], function(m, index, s, drawer) {
    
    function init(){
       
    }

    
    init();
    function close() {
        resetState();
        resetHuizhi();
    }

    return {
        close: close
    }

});
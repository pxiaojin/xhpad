define(['Function/ForecastWarning'], function(forecast) {
    var eventBtn = 'warnBigWave';
    var isOpen;
    function init(){
        $('.' + eventBtn).click(function () {
            if (isOpen) {
                close();               
            } else {
                openFC();                                              
            }
        });

        timeBar.addCallback(function(){
            if(isOpen) openFC();
        });

        $('.threatLevel .buttonDiv .sub').click(function(){
            if(isOpen) openFC();
        })
    }
    init();

    function openFC() {
        if (forecast)
            forecast.open();
        // $('#moShiQieHuang').show();
        $('.' + eventBtn).addClass('currentBlue');   
        $('#weather_warning').parent().parent().parent().addClass('current');
        $('#weather_warning').parent().addClass('currenterJiBtn');  
        $('#weather_warning').prev().attr('src',$('#weather_warning').prev().attr('mysrc'));
        isOpen = true;
    }

    function closeFCWarning(){
        if (forecast)
            forecast.close();
    }

    function close() {
        $('.' + eventBtn).removeClass('currentBlue');   
        if(!$('#weather_warning_select').children().hasClass('currentBlue')){
            $('#weather_warning').parent().removeClass('currenterJiBtn');  
            $('#weather_warning').prev().attr('src',$('#weather_warning').prev().attr('mysrcpri'));
        }
        if(!$('#forecastUl li').hasClass('currenterJiBtn')){
            $('#forecastUl').parent().removeClass('current');
        }
        closeFCWarning();
        isOpen = false;
    }

    return {
        close: close,
        open: openFC
    }
});
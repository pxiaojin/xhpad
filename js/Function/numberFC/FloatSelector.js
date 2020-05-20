define([], function(){
    function on(selectorId, type, callBack, params) {
        let selector = $('#' + selectorId);
        if (selector) {
            if (callBack) {
                $('#' + selectorId + ' p').on(type, function(event) {
                    callBack(params);
                });
            }
        }
    }

    function open(selectorId) {
        let selector = $('#' + selectorId);
        if (selector) {
            selector.show();
        }
    }
    function getValue(selectorId){
        let selector = $('#' + selectorId);
        if (selector) {
            let currentBlue = selector.children('.currentBlue');
            currentBlue = currentBlue ? currentBlue[0] : undefined;
            if (!currentBlue) {
                currentBlue = selector.children();
                currentBlue = currentBlue ? currentBlue[0] : undefined;
            }
            return currentBlue ? currentBlue.getAttribute('data-value') : undefined;
        }
    }

    function getValueDesc(selectorId) {
        let selector = $('#' + selectorId);
        if (selector) {
            let currentBlue = selector.children('.currentBlue');
            currentBlue = currentBlue ? currentBlue[0] : undefined;
            if (!currentBlue) {
                currentBlue = selector.children();
                currentBlue = currentBlue ? currentBlue[0] : undefined;
            }
            return currentBlue ? currentBlue.innerText : undefined;
        }
    }

    function close(selectorId) {
        let selector = $('#' + selectorId);
        if (selector) {
            selector.hide();
        }
    }
    return {
        on: on,
        open: open,
        getValue: getValue,
        getValueDesc: getValueDesc,
        close:close
    }
});
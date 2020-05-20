// 浮标拖拽
function dragPanelMove(downDiv, moveDiv) {
    downDiv.addEventListener('touchstart', function (e) {
        var isMove = true
        var div_x = e.touches[0].pageX - moveDiv.offsetLeft
        var div_y = e.touches[0].pageY - moveDiv.offsetTop

        downDiv.addEventListener('touchmove', function (e) {
            var oEvent = e || event;
            var move_l = oEvent.touches[0].pageX - div_x
            var move_t = oEvent.touches[0].pageY - div_y

            if (move_l < 0) {
                move_l = 0
            } else if (move_l > document.documentElement.clientWidth - moveDiv.offsetWidth) {
                move_l = document.documentElement.clientWidth - moveDiv.offsetWidth
            }
            if (move_t < 0) {
                move_t = 0
            } else if (move_t > document.documentElement.clientHeight - moveDiv.clientHeight) {
                move_t = document.documentElement.clientHeight - moveDiv.offsetHeight
            }

            if (isMove) {
                moveDiv.style.left = move_l + 'px'
                moveDiv.style.top = move_t + 'px'
            }
        })
        downDiv.addEventListener('touchend', function (e) {
            isMove = false
        })
    })
}

var softKey;
function loadKeyValidate() {
    XHW.usbKey = {};
    //如果是IE10及以下浏览器，则跳过不处理
    if(navigator.userAgent.indexOf("MSIE")>0 && !navigator.userAgent.indexOf("opera") > -1)
        return Handle_IE10();
    try {
        softKey=new SoftKey6W();
        softKey.Socket_UK.onopen = function() {
            XHW.usbKey.isConnect = 1;
            XHW.usbKey.desc = "加密锁客户端服务已安装！";
            if (updateSigninStatus)
                updateSigninStatus();
            // //这里调用ResetOrder将计数清零，这样，消息处理处就会收到0序号的消息，通过计数及序号的方式，从而生产流程
            softKey.ResetOrder();
        };

        var ID_1, ID_2;
        //在使用事件插拨时，注意，一定不要关掉Sockey，否则无法监测事件插拨
        softKey.Socket_UK.onmessage =function got_packet(Msg) {
            let usbKeyData = JSON.parse(Msg.data);
            if(usbKeyData.type=="PnpEvent") {//如果是插拨事件处理消息
                if(usbKeyData.IsIn) {
                    XHW.usbKey.isIn = true;
                    softKey.ResetOrder();
                } else {
                    XHW.usbKey.isIn = false;
                    XHW.usbKey.desc = "加密锁已被拨出，自动返回登录界面";
                    XHW.lockFuncs();
                    if (updateSigninStatus)
                        updateSigninStatus();
                }
            }
            if(usbKeyData.type == "Process") {
                if(usbKeyData.LastError != 0) {
                    let mes = usbKeyData.order;
                    switch (usbKeyData.order) {
                        case 0: mes = "未发现加密锁";break;
                        case 1: mes = "未发现加密锁";break;
                        case 2: mes = "加密锁序列号获取失败";break;
                        case 3: mes = "加密锁序列号获取失败";break;
                        case 4: mes = "加密锁中存储的用户名获取失败";break;
                        case 5: mes = "加密锁中存储的用户名获取失败";break;
                        case 6: mes = "加密锁中存储的用户名获取失败";break;
                        case 7: mes = "加密锁中存储的用户名获取失败";break;
                        case 8: mes = "加密锁中存储的密码获取失败";break;
                        case 9: mes = "加密锁中存储的密码获取失败";break;
                        case 10: mes = "加密锁中存储的密码获取失败";break;

                    }
                    handleKeyDataError(mes, usbKeyData.LastError.toString());
                    return false;
                }
                switch(usbKeyData.order) {
                    case 0:
                        softKey.FindPort(0); //发送命令取UK的路径
                        break;//!!!!!重要提示，如果在调试中，发现代码不对，一定要注意，是不是少了break,这个少了是很常见的错误
                    case 1:
                        DevicePath=usbKeyData.return_value;//获得返回的UK的路径
                        softKey.GetID_1(DevicePath); //发送命令取ID_2
                        XHW.usbKey.isIn = true;
                        if (updateSigninStatus)
                            updateSigninStatus();
                        break;
                    case 2: {
                        ID_1 = usbKeyData.return_value;//获得返回的UK的ID_1
                        softKey.GetID_2(DevicePath); //发送命令取ID_2
                        break;
                    }
                    case 3: {
                        ID_2 = usbKeyData.return_value;//获得返回的UK的ID_2
                        // frmlogin.name.value=toHex(ID_1)+toHex(ID_2);
                        // $.cookie('ukey', toHex(ID_1)+toHex(ID_2), {path: '/' });
                        XHW.usbKey.keyId = keyToHex(ID_1)+keyToHex(ID_2);
                        //为了方便阅读，这里调用了一句继续下一行的计算的命令
                        // 因为在这个消息中没有调用我们的函数，所以要调用这个
                        softKey.ContinueOrder();
                        break;
                    }
                    case 4: {
                        //获取设置在锁中的用户名
                        //先从地址0读取字符串的长度,使用默认的读密码"FFFFFFFF","FFFFFFFF"
                        addr=0;
                        //发送命令取UK地址0的数据
                        softKey.YRead(addr,1,"ffffffff","ffffffff",DevicePath);
                        break;
                    }
                    case 5: {
                        //发送命令从数据缓冲区中数据
                        softKey.GetBuf(0);
                        break;
                    }
                    case 6: {
                        //获得返回的数据缓冲区中数据
                        mylen = usbKeyData.return_value;
                        //再从地址1读取相应的长度的字符串，,使用默认的读密码"FFFFFFFF","FFFFFFFF"
                        addr = 1;
                        //发送命令从UK地址1中取字符串
                        softKey.YReadString(addr, mylen, "ffffffff", "ffffffff", DevicePath);
                        break;
                    }
                    case 7: {
                        let username = usbKeyData.return_value;
                        if (username &&
                            username.length < 20 && username.length > 5) {
                            frmlogin.name.value=username;
                            XHW.usbKey.desc = "发现加密锁,自动填充用户名";
                        } else{
                            XHW.usbKey.desc = "发现加密锁，请输入用户名和密码";
                        }
                        if (updateSigninStatus)
                            updateSigninStatus();
                        //获到设置在锁中的用户密码,
                        //先从地址20读取字符串的长度,使用默认的读密码"FFFFFFFF","FFFFFFFF"
                        addr=20;
                        //发送命令取UK地址20的数据
                        softKey.YRead(addr,1,"ffffffff","ffffffff",DevicePath);
                        break;
                    }
                    case 8: {
                        //发送命令从数据缓冲区中数据
                        softKey.GetBuf(0);
                        break;
                    }
                    case 9: {
                        //获得返回的数据缓冲区中数据
                        mylen = usbKeyData.return_value;
                        //再从地址21读取相应的长度的字符串，,使用默认的读密码"FFFFFFFF","FFFFFFFF"
                        addr=21;
                        //发送命令从UK地址21中取字符串
                        softKey.YReadString(addr,mylen,"ffffffff", "ffffffff", DevicePath);
                        break;
                    }
                    case 10: {
                        // frmlogin.password.value=usbKeyData.return_value;//获得返回的UK中地址21的字符串
                        //!!!!!注意，这里一定要主动提交，
                        //  frmlogin.submit ();
                        //所有工作处理完成后，关掉Socket
                        break;
                    }
                }
            }
        };
        softKey.Socket_UK.onclose = function() {
            XHW.usbKey.desc = "加密锁服务关闭";
            XHW.usbKey.isConnect = null;
            if (updateSigninStatus)
                updateSigninStatus();
        };
    } catch(e) {
        alert(e.name + ": " + e.message);
        return false;
    }
}

function handleKeyDataError(type, errorCode) {

    XHW.usbKey.desc = type ;//+ '，错误码为：' + errorCode;
    if (updateSigninStatus)
        updateSigninStatus();
}

function isKeyConnect() {
    if (!softKey) {
        loadKeyValidate();
    }
    //判断是否安装了服务程序，如果没有安装提示用户安装
    let usbKeyIsConnetct = XHW.usbKey.isConnect;
    if(!usbKeyIsConnetct || Number(usbKeyIsConnetct)==0) {
        // window.alert ( "未能连接服务程序，请确定服务程序是否安装。");
        XHW.usbKey.desc = "未能连接加密锁服务程序，请确定服务程序是否安装。";
        return false;
    }
    let usbKeyIsIn = XHW.usbKey.isIn;
    if(!usbKeyIsIn || usbKeyIsIn == 'false')
    {
        XHW.usbKey.desc = "未发现加密锁，请插入加密锁。";
        return false;
    }
    return true;
}

function keyToHex( n ) {
    let digitArray = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
    let result = '';
    let start = true;

    for (let i=32; i>0; ) {
        i -= 4;
        let digit = ( n >> i ) & 0xf;

        if (!start || digit != 0) {
            start = false;
            result += digitArray[digit];
        }
    }
    return ( result == '' ? '0' : result );
}

function Handle_IE10() {
    try {
        var DevicePath, mylen, ret;
        //创建控件

        softKey = new ActiveXObject("Syunew6A.s_simnew6");

        DevicePath = softKey.FindPort(0);//'来查找加密锁，0是指查找默认端口的锁
        if (softKey.LastError != 0) {
            XHW.usbKey.desc = "未发现加密锁，请插入加密锁";
            if (updateSigninStatus)
                updateSigninStatus();
            return false;
        } else {
            //'读取锁的ID
            if (softKey.LastError != 0) {
                XHW.usbKey.desc = "获取用户名错误，错误码是" + softKey.LastError.toString();
                if (updateSigninStatus)
                    updateSigninStatus();
                return false;
            }
            //获取设置在锁中的用户名
            //先从地址0读取字符串的长度,使用默认的读密码"FFFFFFFF","FFFFFFFF"
            ret = softKey.YRead(0, 1, "ffffffff", "ffffffff", DevicePath);
            mylen = softKey.GetBuf(0);
            //再从地址1读取相应的长度的字符串，,使用默认的读密码"FFFFFFFF","FFFFFFFF"
            if (softKey.LastError != 0) {
                XHW.usbKey.desc = "Err to GetUserName,ErrCode is:" + softKey.LastError.toString();
                if (updateSigninStatus)
                    updateSigninStatus();
                return false;

            }
            return true;
        }
    } catch (e) {
        XHW.usbKey.desc = e.name + ": " + e.message + "。可能是没有安装相应的控件或插件";
        if (updateSigninStatus)
            updateSigninStatus();
        return false;
    }
}
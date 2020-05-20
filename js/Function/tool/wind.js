/**
 * Created by Administrator on 14-10-9.
 */

/**
 * 绘制风标
 */

define(function(require){

    var _img=require("./img");
    // var imgs={};
    // for (var key in _img) {
    //     var image = new Image();
    //     image.src=_img[key];
    //     imgs[key] = image;
    // }
            
    //移动原点后  整个坐标系都要随之改变
    //以某点旋转后，该点会被设为原点
    //故  基础点全部减去旋转点坐标

    var scale=1;
    //旋转后的参数
    var baseX=30*scale;//风杆 长线横坐标  |
    var endY=30*scale;
    var longX=10*scale;  //长划   4m/s;
    var shortX = 5*scale; //短划   2m/s;
    var beginY=2-endY; //长杆的末坐标X
    var baseSpace=4*scale;//各个标记中间的间隔
    var signIndex=0; //第几个符号
    var width=64*scale;
    var height=64*scale;

   var r={};



    function init(scale){
        baseX=30*scale;//风杆 长线横坐标  |
        endY=30*scale;
        longX=10*scale;  //长划   4m/s;
        shortX = 5*scale; //短划   2m/s;
        beginY=2-endY; //长杆的末坐标X
        baseSpace=4*scale;//各个标记中间的间隔
        signIndex=0; //第几个符号

        width=64*scale;
        height=64*scale;

    }

    /**
     *
     * 绘制风向符号
     * @param speed 风速
     * @param angle 角度
     * @param _width
     * @param _baseX
     * @param radius 是否需要画圆  圆的半径
     * @returns {HTMLElement} canvas对象
     */
    r.drawWind=function(speed,angle,color,radius){
        //init(2);
        var r=radius||0; //圆的半径;
        speed=Math.round(speed);
        var canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext( '2d' );

        context.strokeStyle=color||"rgba(62,142,62,1)";
        context.fillStyle=color||"rgba(62,142,62,1)";
        //  var  __baseX=_baseX||baseX;
         context.lineWidth=2;
        //旋转
        context.translate(canvas.width/2,canvas.height/2);
        var  __baseX=0;
        var _endY=0;
        context.rotate((angle*Math.PI)/180);

        //画圆
        context.beginPath();
        context.arc(0,0, r,0,360,true);
        context.closePath();
        context.stroke();

        if(speed>0){
            //延长风向杆
            /*  if(speed>=25) {
             endY+=10;
             }*/
            //context.lineWidth=1;
            context.moveTo(__baseX,beginY);
            context.lineTo(__baseX,_endY-r);
            context.stroke();
            //context.fillStyle="rgba(0,0,0,1)";

            var temp=speed;
            if(speed>2){
                temp+=1;
            }

            var triangleSolidNum=parseInt(temp/50);//实心三角形数量  50m/s
            drawSolidTriangle(context,triangleSolidNum,__baseX);

            temp=temp-triangleSolidNum*50;
            var triangleHollowNum=parseInt(temp/20);//空心三角形数量    20m/s
            drawHollowTriangle(context,triangleHollowNum,__baseX);

            temp=temp-triangleHollowNum*20;
            var longLineNum=parseInt((temp)/4);//长划数量
            drawLongLine(context,longLineNum,__baseX);

            temp=temp-longLineNum*4;

            if(temp>=2){
                drawShortLine(context,__baseX);
            }

        }
        //document.getElementById(divId).appendChild(canvas);
        signIndex=0;
        return canvas;
    }

    /**
     * 高空等压面填图
     * @param obj 数据对象风速
     *         angle 角度
     *         station
     *         lat
     *         lon
     * @return {HTMLElement} canvas对象
     */
    r.drawGKWind=function(obj,radius){
        init(1.5);
        var canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;

        var context = canvas.getContext( '2d' );
        if(obj.WS!=null){
        //  var _ex=10;  //文字x偏移量
        //   var _ey=-7;  //文字y偏移量
        //区域划分
        var grid=[{x:25,y:15},{x:30,y:15},{x:40,y:15},{x:25,y:38},{x:30,y:38},{x:40,y:38},{x:25,y:50},{x:30,y:50},{x:40,y:50}];
        var  speed=Math.round(obj.WS||0);
        var angle=obj.WD||0;

        var r=radius||0; //圆的半径;
        speed=Math.round(speed);

        context.strokeStyle="rgba(180,80,80,1)";

        //  context.lineWidth=2;
        context.save();
        //旋转
        context.translate(canvas.width/2,canvas.height/2);
        var  __baseX=0;
        var _endY=0;
        context.rotate((angle*Math.PI)/180);

        //画圆
        context.beginPath();
        context.arc(0,0, r,0,2*Math.PI,true);
        context.closePath();
        context.stroke();

        if(speed>0){

            context.moveTo(__baseX,beginY);
            context.lineTo(__baseX,_endY-r);
            context.stroke();

            var temp=speed;
            if(speed>2){
                temp+=1;
            }

            var triangleSolidNum=parseInt(temp/50);//实心三角形数量  50m/s
            drawSolidTriangle(context,triangleSolidNum,__baseX);

            temp=temp-triangleSolidNum*50;
            var triangleHollowNum=parseInt(temp/20);//空心三角形数量    20m/s
            drawHollowTriangle(context,triangleHollowNum,__baseX);

            temp=temp-triangleHollowNum*20;
            var longLineNum=parseInt((temp)/4);//长划数量
            drawLongLine(context,longLineNum,__baseX);

            temp=temp-longLineNum*4;

            if(temp>=2){
                drawShortLine(context,__baseX);
            }

        }
        context.restore();


        context.font="10pt ";
        context.fillStyle = "rgba(0,0,0,1)";
        context.textAlign="right";
        var at=obj.AT==""?"":obj.AT*10;
        var td="";
        if(obj.AT!=""&&obj.TD!=""){
            td=obj.AT-obj.TD;
            td=td.toFixed(1);
        }

        context.fillText(at||"",grid[3].x*scale+(scale-1)*15,grid[3].y*scale-(scale-1)*4);
        context.fillText(td||"",grid[6].x*scale+(scale-1)*15,grid[6].y*scale-(scale-1)*4);

        context.textAlign="left";
        context.stroke();
       // var wgph=parseInt(obj.wgph);
       // context.fillText(wgph||"",grid[5].x*scale-(scale-1)*8,grid[5].y*scale-(scale-1)*4);
        signIndex=0;
        }
        return canvas;

    }


    /**
     * 绘制地面航空实况图
     // |--------|--------|--------|
     // |  DT24  |   CH   |  DP24  |
     // |--------|--------|--------|
     // |   AT   |   CM   |  SLP   |
     // |--------|--------|--------|
     // | WEATHER|  N(WS) |  DP03  |
     // |--------|--------|--------|
     // |  VIS   |   CL   |NH W1 W2|
     // |--------|--------|--------|--------|
     // |   TD   |   H    | RAIN06 | RAIN01 |
     // |--------|--------|--------|--------|
     * @param obj
     * @param radius
     */
    r.drawDMWind=function(obj,radius){
        init(1.5);
        var canvas = document.createElement( 'canvas' );
        canvas.width = width;
        canvas.height = height;
        var wwColor;
        var context = canvas.getContext( '2d' );
        if(obj.WS!=null){
        var obj=doDatas(obj);
        var  speed=Math.round(obj.WS||0);
        var angle=obj.WD||0;

        var r=radius||0; //圆的半径;
        speed=Math.round(speed);

        var imgColor={};
        var textColor={};
        if(obj["allColor"]==null||"default"==obj["allColor"]["flag"]){
            context.strokeStyle="rgba(0,0,0,1)";
            wwColor=obj["wwColor"];

            imgColor["r"]=0;
            imgColor["g"]=0;
            imgColor["b"]=0;
            imgColor["a"]=1;

            textColor["r"]=0;
            textColor["g"]=0;
            textColor["b"]=0;
            textColor["a"]=1;
        }else{
            context.strokeStyle="rgba("+obj["allColor"].r+","+obj["allColor"].g+","+obj["allColor"].b+",1)";
            textColor=obj["allColor"];
            imgColor=obj["allColor"];
            wwColor=obj["allColor"];

        }
        //  context.lineWidth=2;
        context.save();
        //旋转
        context.translate(canvas.width/2,canvas.height/2);
        var  __baseX=0;
        var _endY=0;
        context.rotate((angle*Math.PI)/180);

        if (!obj.N) {
            obj.N = '00';
        }
        // //画圆
        // context.beginPath();
        // context.arc(0,0, r,0,Math.PI*2,false);
        // context.closePath();
        // context.stroke();

        if(speed>0){

            context.moveTo(__baseX,beginY);
            context.lineTo(__baseX,_endY-r);
            context.stroke();

            var temp=speed;
            if(speed>2){
                temp+=1;
            }

            var triangleSolidNum=parseInt(temp/50);//实心三角形数量  50m/s
            drawSolidTriangle(context,triangleSolidNum,__baseX);

            temp=temp-triangleSolidNum*50;
            var triangleHollowNum=parseInt(temp/20);//空心三角形数量    20m/s
            drawHollowTriangle(context,triangleHollowNum,__baseX);

            temp=temp-triangleHollowNum*20;
            var longLineNum=parseInt((temp)/4);//长划数量
            drawLongLine(context,longLineNum,__baseX);

            temp=temp-longLineNum*4;

            if(temp>=2){
                drawShortLine(context,__baseX);
            }

        }
        context.restore();

       // context.font="10pt Andalus";



        // 左一列
        var x1=34;
        context.textAlign="right";
        drawText(context,obj["DT24"],x1,18,textColor);
        drawText(context,obj["AT"],x1,36,textColor);
        drawDM_Weather(context,obj["WEATHER"],18,40,imgColor);
        drawText(context,obj["VIS"],x1,70,textColor)
        drawText(context,obj["TD"],x1,85,textColor);

        //左二列
        var x2=47;
        context.textAlign="center";
        drawDM_CH(context,obj["CH"],36,0,imgColor);
        drawDM_CM(context,obj["CM"],36,36,imgColor);
        drawDM_N(context,obj["N"],42,42,imgColor);
        drawDM_CL(context,obj["CL"],36,54,imgColor);
        //  drawText(context,obj["h"],x2,64)

        //左三列
        var x3=60;
        context.textAlign="left";
        drawText(context,obj["DP24"],x3,18,textColor);
        drawText(context,obj["SLP"],x3,36,textColor);
        drawText(context,obj["DP03"],x3,50,textColor);
        drawText(context,obj["NH"],x3,70,textColor);
        drawText(context,obj["RAIN06"],x3,85,textColor);


        // drawText(context,obj["RAIN01"],72,91,textColor);
        signIndex=0;
        }
        //this.setColor(canvas,0,255,0,1);
        return canvas;

    };

    /**
     * 绘制军队地面风标
     // |--------|--------|--------|--------|
     // |        |   N1   |   C1   |   H1   |
     // |--------|--------|--------|--------|
     // |   AT   |   N2   |   C2   |   H2   |
     // |--------|--------|--------|--------|
     // | WEATHER|        |        |  SLP   |
     // |--------|--------|--------|--------|
     // |   VIS  |        |  N(WS) | RAIN06 |
     // |--------|--------|--------|--------|
     // |   TD   |   N3   |   C3   |   H3   |
     // |--------|--------|--------|--------|
     // |        |   N4   |   C4   |   H4   |
     // |--------|--------|--------|--------|
     // |        |   N5   |   C5   |   H5   |
     // |--------|--------|--------|--------|
     * @param obj
     * @param radius
     * @returns {HTMLElement}
     */
    r.drawJDDMWind=function(obj,radius){
        init(1.5);
        var canvas = document.createElement( 'canvas' );
        canvas.width = width*1.3;
        canvas.height = height;
        var context = canvas.getContext( '2d' );
        if(obj.ws!=null){
        var  speed=Math.round(obj.ws||0);
        var angle=obj.wd||0;

        var r=radius||0; //圆的半径;
        speed=Math.round(speed);
            context.strokeStyle="rgba(0,0,0,1)";
            textColor="rgba(0,0,0,1)";
            imgColor="rgba(0,0,0,1)";
        //  context.lineWidth=2;
        context.save();
        //旋转
        context.translate(width/2,height/2);
        var  __baseX=0;
        var _endY=0;
        context.rotate((angle*Math.PI)/180);
        //画圆
        context.beginPath();
        context.arc(0,0, r,0,Math.PI*2,true);
        context.closePath();
        context.stroke();

        if(speed>0){

            context.moveTo(__baseX,beginY);
            context.lineTo(__baseX,_endY-r);
            context.stroke();

            var temp=speed;
            if(speed>2){
                temp+=1;
            }

            var triangleSolidNum=parseInt(temp/50);//实心三角形数量  50m/s
            drawSolidTriangle(context,triangleSolidNum,__baseX);

            temp=temp-triangleSolidNum*50;
            var triangleHollowNum=parseInt(temp/20);//空心三角形数量    20m/s
            drawHollowTriangle(context,triangleHollowNum,__baseX);

            temp=temp-triangleHollowNum*20;
            var longLineNum=parseInt((temp)/4);//长划数量
            drawLongLine(context,longLineNum,__baseX);

            temp=temp-longLineNum*4;

            if(temp>=2){
                drawShortLine(context,__baseX);
            }

        }
        context.restore();

        context.font="7pt Andalus";
        context.fillStyle = "rgba(0,0,0,1)";

        // 左一列
        var x1=0;
        context.textAlign="right";
        drawDM_Weather(context,obj["weather"],3,24,imgColor);
        drawJD_Text(context,obj["at"],x1,13,textColor);

        drawJD_Text(context,obj["vis"],x1,45,textColor)
        drawJD_Text(context,obj["td"],x1,60,textColor);

        //左二列
        var x2=18;
        //context.textAlign="left";
        drawJD_Text(context,obj["n1"],x2,0,textColor);
        drawJD_Text(context,obj["n2"],x2,13,textColor);
        drawJD_Text(context,obj["n3"],x2,54,textColor);
        drawJD_Text(context,obj["n4"],x2,66,textColor);
        drawJD_Text(context,obj["n5"],x2,81,textColor);

        //左三列
        var x3=42;
        //context.textAlign="right";
        drawDM_C(context,obj["c1"],x3,0,imgColor);
        drawDM_C(context,obj["c2"],x3,13,imgColor);
        drawDM_N(context,obj["n"],x3,42,imgColor);
        drawDM_C(context,obj["c3"],x3,60,imgColor);
        drawDM_C(context,obj["c4"],x3,75,imgColor);
        drawDM_C(context,obj["c5"],x3,90,imgColor);

        var x4=60;
        context.textAlign="left";
        drawJD_Text(context,obj["h1"],x4,0,textColor);
        drawJD_Text(context,obj["h2"],x4,13,textColor);
        drawJD_Text(context,obj["slp"],x4,27,textColor);
        drawJD_Text(context,obj["rain06"],x4,40,textColor);
        drawJD_Text(context,obj["h3"],x4,54,textColor);
        drawJD_Text(context,obj["h4"],x4,66,textColor);
        drawJD_Text(context,obj["h5"],x4,81,textColor);

        signIndex=0;
        //this.setColor(canvas,255,0,0,1);
        }
        return canvas;
    }


    /**
     * 绘制实心三角形  表示50m/s
     * @param context canvas的context
     * @param num 数量
     */
    function drawSolidTriangle(context,num,__baseX){
        context.beginPath();

        for(var i=0;i<num;i++){
            context.moveTo(__baseX,beginY+signIndex*baseSpace);
            context.lineTo(__baseX+longX,beginY+signIndex*baseSpace);
            signIndex+=2;
            context.lineTo(__baseX,beginY+signIndex*baseSpace);
        }
        context.closePath();
        context.fill();
    }

    /**
     * 绘制空心三角形  表示20m/s
     * @param context
     * @param num
     */
    function drawHollowTriangle(context,num,__baseX){
        for(var i=0;i<num;i++){
            context.moveTo(__baseX,beginY+signIndex*baseSpace);
            context.lineTo(__baseX+longX,beginY+signIndex*baseSpace);
            signIndex+=2;
            context.lineTo(__baseX,beginY+signIndex*baseSpace);
        }
        context.stroke();
    }

    /**
     * 绘制长线  表示4m/s
     * @param context
     * @param num
     */
    function drawLongLine(context,num,__baseX){
        for(var i=0;i<num;i++){
            context.moveTo(__baseX,beginY+signIndex*baseSpace);
            context.lineTo(__baseX+longX,beginY+signIndex*baseSpace);
            signIndex++;
        }
        context.stroke();
    }

    /**
     * 绘制短线  表示2m/s
     * @param context
     * @param num
     */
    function drawShortLine(context,__baseX){
        if(signIndex==0){
            signIndex++;
        }
        context.moveTo(__baseX,beginY+signIndex*baseSpace);
        context.lineTo(__baseX+shortX,beginY+signIndex*baseSpace);
        context.stroke();
    }

    function drawImgColor(context,x,y,color,img,iw,ih){
        var imgd = context.getImageData(x,y,iw||img.width,ih||img.height);
        var pix = imgd.data;
        for(var i=0,n=pix.length;i<n;i+=4)
        {
            pix[i] = color.r ; //红
            pix[i+1] = color.g; //绿
            pix[i+2] = color.b; //蓝
            //  pix[i+3] = pix[i+3]; //alpha
        }
        context.putImageData(imgd,x,y);
    }

    /**
     * 绘制地面云量
     * @param content
     * @param n
     * @param x
     * @param y
     */
    function drawDM_N(context,n,x,y,color){
        
        if(n && _img[n+".png"]){
            drawImage(context, n+".png", x, y, 15, 15, color);
            // var img= new Image();
            // img.src = _img[n+".png"];
            // img.src = _img[n+".png"];
            // if (img.complete) {
            //     context.drawImage(img,x,y,15,15);
            //     drawImgColor(context,x,y,color,this,15,15);
            // } else {
            //     img.onload=function(){
            //         context.drawImage(img,x,y,15,15);
            //         drawImgColor(context,x,y,color,this,15,15);
            //     }
            //     img.onerror = function() {
            //         console.log('canvas图片加载失败！');
            //     }
            // }
        }
    }
    imgs = {};
    function drawImage(context, key, x, y, width, heiht, color) {
        if(key && _img[key]){
            if(!imgs[key]) {
                imgs[key] = new Image();
                imgs[key].src = _img[key];
            }
            if (imgs[key].complete) {
                context.drawImage(imgs[key],x,y,15,15);
                drawImgColor(context,x,y,color,this,15,15);
            } else {
                imgs[key].onload=function(){
                    context.drawImage(imgs[key],x,y,15,15);
                    drawImgColor(context,x,y,color,this,15,15);
                }
                imgs[key].onerror = function() {
                    console.log('canvas图片加载失败！');
                }
            }
        }
    }

    /**
     * 填充文字
     * @param content
     * @param text
     * @param x
     * @param y
     */
    function  drawText(context,text,x,y,color){
        context.fillStyle="rgba("+color.r+","+color.g+","+color.b+","+color.a+")";
        if(text){
            context.fillText(text,x,y);
            context.stroke();
        }
    }

    /**
     * 绘制现在天气
     * @param context
     * @param weather
     * @param x
     * @param y
     */
    function drawDM_Weather(context,weather,x,y,color){
        if(weather && _img[weather+".png"]){
            drawImage(context, weather +".png", x, y, 15, 15, color);
            // var img= new Image();
            // // context.drawImage(img,x,y,15,15);
            // // drawImgColor(context,x,y,color,this,15,15);
            // img.src = _img[weather+".png"];
            // if (img.complete) {
            //     context.drawImage(img,x,y,15,15);
            //     drawImgColor(context,x,y,color,this,15,15);
            // } else {

            //     img.onload=function(){
            //         context.drawImage(img,x,y,15,15);
            //         drawImgColor(context,x,y,color,this,15,15);
            //     }
            //     img.onerror = function() {
            //         console.log('canvas图片加载失败！');
            //     }
            // }

        }
    }

    /**********************JD地面填图***********************/
    /**
     * 绘制云状图片
     * @param context
     * @param c
     * @param x
     * @param y
     */
    function drawDM_C(context,c,x,y,color){
        if(c!="" && _img[c+".png"]){
            var img= new Image();
            img.src = _img[c+".png"];
            context.drawImage(img,x,y,15,15);
            drawImgColor(context,x,y,color,this,15,15);
            // img.onload=function(){
            // }
            setTimeout("",100);
        }
    }

    /**
     * 绘制高云量图片
     * @param context
     * @param c
     * @param x
     * @param y
     */
    function drawDM_CH(context,c,x,y,color){
        if(c && _img["ch"+c+".png"]){
            var img= new Image();
            img.onload=function(){
                context.drawImage(img,x,y,15,15);
                drawImgColor(context,x,y,color,this,15,15);
            }
            img.src = _img["ch"+c+".png"];
            // context.drawImage(img,x,y,15,15);
            // drawImgColor(context,x,y,color,this,15,15);
        
        }
    }

    /**
     * 绘制高云量图片
     * @param context
     * @param c
     * @param x
     * @param y
     */
    function drawDM_CM(context,c,x,y,color){
        if(c && _img["cm"+c+".png"]){
            var img= new Image();
            img.src = _img["cm"+c+".png"];
            context.drawImage(img,x,y,15,15);
            drawImgColor(context,x,y,color,this,15,15);
            // img.onload=function(){
            //     context.drawImage(img,x,y,15,15);
            //     drawImgColor(context,x,y,color,this,15,15);
            // }

        }
    }

    /**
     * 绘制高云量图片
     * @param context
     * @param c
     * @param x
     * @param y
     */
    function drawDM_CL(context,c,x,y,color){
        if(c && _img["cl"+c+".png"]){
            var img= new Image();
            img.src = _img["cl"+c+".png"];
            context.drawImage(img,x,y,15,15);
            drawImgColor(context,x,y,color,this,15,15);
            // img.onload=function(){
            //     context.drawImage(img,x,y,15,15);
            //     drawImgColor(context,x,y,color,this,15,15);
            // }
        }
    }

    //字符串处理
    function strFormat(s,l,f){
        if (!s) return;
        var  v="";
        if(!f){
            v="0000"+Math.abs(s).toString()
            v= v.substring(v.length-l, v.length);
        }else{
            v= s.toString();
            v= v.substr(v.indexOf(".")-l, v.indexOf(".")+f+1);
        }
        return v;
    }

    function strSplice(s, l) {
        if (!s) return;
        var  v="";
        v = s.toString();
        v = v.substring(0, l <= v.length ? l : v.length);
        return v;
    }

    /**
     * 军队填图填充文字  --缩放
     * @param content
     * @param text
     * @param x
     * @param y
     */
    function  drawJD_Text(content,text,x,y,color){
        var canvas = document.createElement( 'canvas' );
        canvas.width = 50;
        canvas.height = 18;

        var context = canvas.getContext( '2d' );
        context.textAlign="right";
        context.font="17pt Andalus";
        context.fillStyle="rgba("+color.r+","+color.g+","+color.b+","+color.a+")";
        if(text!=""&&text!=null){
            context.fillText(text,50,18);
            content.stroke();
        }
        var img=new Image();
        img.src=canvas.toDataURL("image/png");
        content.drawImage(img,x,y,20,9);

    }

    /**
     * 数据格式化处理
     * @param obj
     * @returns {{}}
     */
    function doDatas(obj){
        var ss={};
        for(var i in obj){
            if(obj[i]=="") {
                ss[i]=obj[i];
                continue;
            }
            var da=obj[i];
           // console.log(i+" - "+obj[i]);
            switch(i){
                case 'AT':
                case 'TD':
                // case 'DP03':
                    ss[i]=strSplice(da*10,4);
                    break;
                // case 'SLP':
                //     ss[i]=strFormat(da*10,3);
                //     ss[i]=ss[i].substr(ss[i].length-1,ss[i].length);
                //     break;
                case 'N':
                case 'W1':
                case 'W2':
                    ss[i]=strFormat(da,2)
                    break;
                case 'DP24':
                case 'DT24':
                    ss[i]=strSplice(da,4);
                    break;
                case 'RAIN01':
                case 'RAIN02':
                case 'RAIN03':
                case 'RAIN06':
                case 'RAIN09':
                case 'RAIN12':
                case 'RAIN15':
                case 'RAIN24':
                    if(Math.abs(da-0.01)<10e-5){
                        ss[i]="T";
                    }else  if(da<1){
                        ss[i]= strSplice(da,1,1);
                    }else {
                        ss[i]=parseInt(da);
                    }
                    break;
                case 'H':
                    var p=parseInt(da);
                    if(p==16832){
                        break;
                    }
                    if(p>=0&&p<50){
                        ss[i]=0
                    }else if(p>=50&&p<100){
                        ss[i]=50
                    }else if(p>=100&&p<200){
                        ss[i]=100
                    }else if(p>=200&&p<300){
                        ss[i]=200
                    }else if(p>=30&&p<600){
                        ss[i]=300
                    }else if(p>=600&&p<1000){
                        ss[i]=600
                    }else if(p>=1000&&p<1500){
                        ss[i]=1000
                    }else if(p>=1500&&p<2000){
                        ss[i]=1500
                    }else if(p>=2000&&p<2600){
                        ss[i]=2000
                    }else {
                        break;
                    }

                    if(p==0){
                        ss[i]="<30";
                    }
                    break;
                case 'CL':
                case 'CM':
                case 'CH':
                    var CM = parseInt(da);
                    if (CM == 60 || CM == 61 || CM == 62)
                    {
                        break;
                    }
                    else if (CM >= 10 && CM < 20)
                    {
                        CM = CM - 10;
                    }
                    else if (CM >= 20 && CM < 30)
                    {
                        CM = CM - 20;
                    }
                    else if (CM >= 30 && CM < 40)
                    {
                        CM = CM - 30;
                    }
                    else
                    {
                        break;
                    }

                    if (CM != 0){

                        ss[i]=CM
                    }
                    break;
                case 'VIS':
                    var VIS = parseFloat(da);
                    VIS = VIS / 1000.0;
                    VIS = Math.round(VIS * 10) / 10.0;
                    if (Math.abs(VIS - parseInt(VIS)) < 10e-5)
                    {
                        if (Math.abs(VIS - 0) < 10e-5)
                        {
                            ss[i] = "<0.1";
                        }
                        else
                        {
                            ss[i] = parseFloat(da)/1000;//strFormat(VIS,1);
                        }
                    }
                    else
                    {
                        ss[i] =  parseFloat(da)/1000;//strFormat(VIS,2,1);
                    }
                    break;
                case 'WEATHER':
                    var d=parseInt(da);
                    if(d<4){
                        break;
                    }else if(d==100||d==102|d==103){
                        break;
                    }else if(d>100){
                        d=d-100;
                    }else if(d<100){
                        //do nothing
                    }else {
                        break;
                    }
                    if(d==93||d==94||d==95||d==97){
                        d=d+10;
                    }
                    ss[i]= strFormat(d,3);
                    break;
                default :
                    ss[i]=da;
            }
           // //console.info(ss[i]);
        }
        return ss;
    }


    return r;

});
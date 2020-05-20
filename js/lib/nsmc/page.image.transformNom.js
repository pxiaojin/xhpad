var  PI =3.1415926535898 ;
var SIZE =11120;//10992  11120
var lon0 = -15;//地球椭球长轴所在经度
var a = 6378137;//赤道长半轴
var b = 6378066;//位于75度经度的赤道短半轴    
var c = 6356752;//连接两极的短半轴   
var h = 3.5785864E7;//卫星高度    单位'米'
var lon1 = 104.7;

var f1=1.0/90000.0;//赤道扁率
var u0 = c/b;
var e2 = 1 - (1-f1)*(1-f1);//赤道椭圆离心率e1的平方
var R3 = b/Math.sqrt(1-e2*Math.cos(GetRadian(lon1-lon0))*Math.cos(GetRadian(lon1-lon0)));
var E = (R3+h)/c;

//以下计算在 卫星与地球相切焦平面 上的参数
//S为卫星所在点，O为地球球心，C为SO与焦平面的交点,P为切点
//需要计算SC长度来确定点在此焦平面上的投影坐标，从而换算出像素坐标	
var OP=R3;//c/sqrt(1-(1-u0*(1-e2*cos(GetRadian(lon-lon0))*cos(GetRadian(lon-lon0))))*cos(GetRadian(lat)));
var SO=R3+h;
var OC= OP*OP/SO;
var SC=SO-OC;
var PC=Math.sqrt(OC*SC);
//以下计算在 过极点的焦平面 上的参数
//Q为SP延长线与 过极点的焦平面 的交点
var SP=Math.sqrt(SC*SO);
var OQ=OP*SO/SP;


var  u02e12=u0*u0*e2;
var  beita=(GetRadian(2*(lon1-lon0)));
function GetX1( x, y){
	var result=0;
	
	var ga0T=x*x-1+E*E*(y*y+u02e12*x*x*Math.cos(beita));
	var ga0D=Math.abs(2*x-E*E*u02e12*Math.sin(beita));
	var ga0 = Math.atan (ga0T/ga0D);
	
	var ga1T=E*E*(u0*u0*(2-e2)*x*x+y*y)-1-x*x;
	var ga1D=Math.sqrt((2*x-E*E*u02e12*Math.sin(beita))*(2*x-E*E*u02e12*Math.sin(beita))+(x*x-1+E*E*(y*y+u02e12*x*x*Math.cos(beita)))*(x*x-1+E*E*(y*y+u02e12*x*x*Math.cos(beita))));
	var ga1=Math.asin(ga1T/ga1D);
	
	var ga=GetAngle(ga1-ga0);
	
//	console.log(" ga1  "+ga1+"  ga "+  ga+"ga0  "+ga0);
	if(x>=0){
		result=Math.abs(ga/2)+lon1;
	}else{
		result=-Math.abs(ga/2)+lon1;
	}
	return result;
}

var ceigema=GetRadian(lon1-lon0);
function GetY1( x, y){
	var result=0;
	
	var la0T=x*x-1+y*y+E*E*(y*y+u02e12*x*x*Math.cos(2*ceigema)-y*y*u0*u0*(1-e2*e2*Math.cos(ceigema)*Math.cos(ceigema)));
	var la0=Math.atan(la0T/Math.abs(2*y));
	
	var la1T=x*x-1+y*y+E*E*(y*y+u02e12*x*x*Math.cos(2*ceigema)+u0*u0*y*y*(1-e2*e2*Math.cos(ceigema)*Math.cos(ceigema)));
	var la1=Math.asin(la1T/Math.sqrt(4*y*y+la0T*la0T));
	
	var la=GetAngle(la1-la0);
	
//	console.log(" ga1  "+la1+"  ga "+  la+"ga0  "+la0);
	if(y>=0){
		result=Math.abs(la/2);
//		result=GetAngle(Math.atan(Math.abs(y*Math.sin(GetRadian(lon1-lon0))/x)));
	}else{
		result=-Math.abs(la/2);
//		result=-GetAngle(Math.atan(Math.abs(y*Math.sin(GetRadian(lon1-lon0))/x)));
	}
	return result;
}
//全圆盘坐标转中国区经纬度坐标
function GetENPoint1( lon, lat)
{
	var a0=lon*2/SIZE;
	var b0=lat*2/SIZE;
	
	var a1=a0*OQ;
	var b1=b0*OQ;
	
	var a2=a1/SC;
	var b2=b1/SC;
	
	var x1=GetX1(a2,b2).toFixed(4);
	var y1=GetY1(a2,b2).toFixed(4);
	//'&deg;E, ' + _str[1] + '&deg;N';
	if("NaN".indexOf(x1)>=0|| "NaN".indexOf(y1)>=0 || y1>90 ||y1<-90 || null==x1 || null==y1 || "undefined".indexOf(x1)>=0 || "undefined".indexOf(y1)>=0){
		return "";
	}
	
	
	var degreeEW="E,";
	var degreeSN="N";
	if(x1>180){
		x1= x1-360;
	}
	if(x1<0){
		x1= -x1;
		degreeEW="W,";
	}
	if(y1<0){
		y1=-y1;
		degreeSN="S";
	}
	
	x1=x1.toString();
	y1=y1.toString();
	if(lonLatShow==1){
		if(x1.indexOf(".")>=0){
			var str0List=x1.split(".");
			var miniEW=Math.ceil(parseFloat("0."+str0List[1])*60);
			
		}
//		console.log(typeof(y1))
		if(y1.indexOf(".")>=0){
			var str1List=y1.split(".");
			var miniSN=Math.ceil(parseFloat("0."+str1List[1])*60);
		}
//		console.log(str0List[0]  +    "    "+str1List[0])
		return str0List[0]+"&deg;"+miniEW+"'"+degreeEW+str1List[0]+"&deg;"+miniSN+"'"+degreeSN;
	}else{
		var x2=x1+"&deg;"+degreeEW;
		var y2=y1+"&deg;"+degreeSN;
//		console.log(x2+"    "+y2)
		return x2+y2;
	}
	
}


//角度转弧度
function GetRadian( angle)
{
	return angle* PI / 180.0;
}
//弧度转角度
function GetAngle( radian)
{
	return radian/ PI * 180.0;
}



//假定地球为球形体，求X （经纬度-> GSP投影坐标）
function GetX0( lon, lat){
	var up = Math.cos(GetRadian(lat)) * Math.sin (GetRadian(lon - lon1));
	var down = h/a + 1 - Math.cos(GetRadian(lat)) * Math.cos (GetRadian(lon - lon1));


	var x = up/down;
	return x;
}
//假定地球为球形体，求Y （经纬度-> GSP投影坐标）
function GetY0( lon, lat){
	//lon = GetRadian(lon);
	//lat = GetRadian(lat);

	var up = Math.sin(GetRadian(lat)) ;
	var down = h/a + 1 - Math.cos(GetRadian(lat)) * Math.cos (GetRadian(lon - lon1));
	var y = up/down;
	return y;
}





//地心坐标投影正算（经纬度-> GSP投影坐标），求X
function GetX( lon, lat){

	var  up = Math.sin (GetRadian(lon - lon1));

	var down = E * Math.sqrt(Math.tan(GetRadian(lat))*Math.tan(GetRadian(lat)) + u0*u0*(1-e2*e2*Math.cos(GetRadian(lon-lon0))*Math.cos(GetRadian(lon-lon0)))) - Math.cos(GetRadian(lon-lon1));


	var x = up/down;
	return x;
}
//地心坐标投影正算（经纬度-> GSP投影坐标），求Y
function GetY( lon, lat){


	var up = Math.tan(GetRadian(lat)) ;
	//var down = E * sqrt(tan(lat)*tan(lat) + u0*u0*(1-e2*cos(lon-lon0)*cos(lon-lon0) )) - cos(lon-lon1);
	var down = E * Math.sqrt(Math.tan(GetRadian(lat))*Math.tan(GetRadian(lat)) + u0*u0*(1-e2*e2*Math.cos(GetRadian(lon-lon0))*Math.cos(GetRadian(lon-lon0)))) - Math.cos(GetRadian(lon-lon1));

	var y = up/down;//单位圆中的坐标

	return y;
	//return y*SIZE/2;
}

function GetRadian( angle)
{
	return angle* PI / 180.0;
}

//根据经纬度获取查找表中的坐标点
GetTablePoint( 116, 39);
function GetTablePoint( lon, lat)
{
	if(lon>=-180 &&lon<=180 && lat>=-90&& lat<=90){
		//判断是否在范围内的点
		var OP1=c/Math.sqrt(1-(1-u0*(1-e2*Math.cos(GetRadian(lon-lon0))*Math.cos(GetRadian(lon-lon0))))*Math.cos(GetRadian(lat)));
		var left=OP1*Math.cos(GetRadian(lat))*Math.cos(GetRadian(lon-lon1));
		var right=R3*R3 / (R3+h);
		if(left<right)//在范围外
			return;

		//地心坐标系
		var x0 = GetX(lon,lat);
		var y0 = GetY(lon,lat);
		

		//球形体坐标系
//		var x0 = GetX0(lon,lat);
//		var y0 = GetY0(lon,lat);
		
		
		var x1=x0*SC;
		var y1=y0*SC;
//		var x1=x0*SC/1.030428769017980636237897648686;
//		var y1=y0*SC/1.030428769017980636237897648686;

		var x2=x1/OQ;
		var y2=y1/OQ;

		var xx=x2*SIZE/2;
		var yy=y2*SIZE/2;
		
//		console.log(xx+"   "+yy)
		return xx+","+yy;
		//计算出可能最接近的点
//		var pX = xx + SIZE/2;
//		var pY = SIZE/2 - yy;
//
//		//在实际辅助数据中(pX,pY)附近找最接近的经纬度的点	
//		x = pX;
//		y = pY;
//		console.log(x","+y)
//		return x+","+y+
		//GetNearestPoint(pX,pY,lon,lat,x,y);
	}
}


/**
 * Created by cll on 2017/12/26.
 */
$(function () {
    "use strict";

    var configMap,Drag,replaceHttp,touch,touchOr,log2,GetQueryString,
        loadMatchInfoContent,checkWordsLength,loadMatchView,loadMatchContent,timeFormat;

    configMap= {
        java_handler_addr: 'http://iyingdi.gonlan.com/',
        ifhttps:/https:\/\//.test(window.location.href)? true:false,
        /*java_handler_addr:'https://www.iyingdi.cn/',	//线上*/
        /* java_handler_addr:'http://beta.iyingdi.cn/',//线上测试*/
        destroyBubble:function (event) {
            event.preventDefault();
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
            else {
                event.cancelBubble = true;
            }
        },
    };

    GetQueryString = function (name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    };

    replaceHttp = function(url){
        if(configMap.ifhttps){
            return url.replace('http://','https://');
        }
        else{
            return url;
        }
    };

    timeFormat = function(time,formatStr){
        var bind;
        if(/[\.]/i.test(formatStr)){
            bind = '.';
        }
        else if(/[\-]/i.test(formatStr)){
            bind = '-';
        }
        else if(/[\/]/i.test(formatStr)){
            bind = '/';
        }
        var date = new Date(time),
            date_year = date.getFullYear(),
            date_month = '0'+(date.getMonth()+1),
            date_day = '0'+date.getDate(),
            time_str = date_year+bind+date_month.substring(date_month.length-2)+bind+date_day.substring(date_day.length-2);
        if(/[\:]/i.test(formatStr)){
            var   date_hour=('0'+date.getHours()).substr(-2,2),
                date_minute=('0'+date.getMinutes()).substr(-2,2);
            time_str +=  ' '+date_hour+':'+date_minute;
        }
        return time_str;

    };

    log2 = function (value) {
        if (value == 1)
            return 0;
        else
            return 1+log2(value>>1);
    };

    touchOr = function (e) {
        var originalEvent = e.originalEvent; // 这里要判断移动端多点触控的问题，jquery扩展的event对象没有这个属性
        var touches = originalEvent.touches;// 获取源生event对象
        var touch;
        if(touches){ // 如果有touches属性，则代表是移动端touchmove事件
            touch = touches[0]; // 取到多个触控点中的第一个，这样才能获取到触控点的对应位置
        }else{
            touch = e;
        }
        return touch;
    };

    /*region 拖拽事件*/
    touch = function () {
        var tag = false,ox = 0,oy = 0,left = 0,top = 0,bgleft = 0;
        var startEvent = 'touchstart';
        var moveEvent =  'touchmove';
        var upEvent = 'touchend';
        $('#againstTable').on(startEvent,function(e) {
            var touch = touchOr(e);
            ox = touch.pageX - left;
            oy = touch.pageY - top;
            tag = true;
            configMap.destroyBubble(e);
        });
        $('#againstTable').on(upEvent,function() {
            tag = false;
        });
        $('#againstTable').on(moveEvent,function(e) {
            var touch = touchOr(e);
            if (tag) {
                left = touch.pageX - ox;
                top = touch.pageY - oy;
                $('#againstTable').css({'left':left,'top':top});
                configMap.destroyBubble(e);
            }
        });
    };
    /*endregion*/

    checkWordsLength = function (str) {
        var flag = 0,originStr,newStr;
        originStr = str;
        if(str.length>7){
            newStr = str.substr(0,7) +'...';
            flag = 1;
        }
        return {newStr:newStr,flag:flag,originStr:originStr};
    };

    loadMatchView = function (index,rounds,matchList) {
        $('#againstTable>svg').remove();
        var paper = Raphael("againstTable");
        var curRound = rounds - index;//总轮数
        var curIndex = Math.pow(2,rounds) - Math.pow(2,curRound);//当前开始坐标
        var count = Math.pow(2,(curRound-1));//总基数
        var w = 145,h = 30,xPosition,yPosition,r=6, xMax = log2(count)+1, yMax = count,
            nameAttr = {"fill":"#F5F7F9","border":"none","stroke":"transparent","class":"name","stroke-opacity":"0.05"},
            numAttr = {"fill":"#EAEDF0","border":"none","stroke":"transparent","class":"num","stroke-opacity":"0.05"},
            winAttr = {"fill":"#66BA71","border":"none","stroke":"transparent","class":"win"},
            warnAttr = {"fill":"#D55C68","border":"none","stroke":"transparent","class":"warn","cursor":"pointer"},
            lineAttr = {"fill": "#CED4D9", "stroke": "#CED4D9", "stroke-width": 0.3},
            lineWarnAttr = {"fill": "#D55C68", "stroke": "#D55C68", "stroke-width": 0},
            nameText = {"font-size":"14px","stroke":"transparent","fill":"#646464","font-family":"serif","text-anchor":"initial"},
            winText = {"font-size":"14px","stroke":"transparent","fill":"#ffffff","font-family":"serif","text-anchor":"initial"},
            xSplitLine = "",xConcatLine = "",yLine = "" ,warnLine ="";
        var height = (count*3)*h + h+"px";
        var width = (curRound*3)*w + h+"px";
        $('#againstTable>svg').animate({"height":height,"width":width});
        $('.againstContent').animate({"height":height});

        for(var i = 0;i<xMax;i++){
            yMax = count/Math.pow(2,i);
            for(var j=0;j<yMax;j++){
                xPosition = h+i*(3*h+w);
                yPosition = h*(3*Math.pow(2,i)*j+3*Math.pow(2,i-1))-h/2;
                warnLine = 'M'+(xPosition+w)+','+(yPosition+h)+'L'+(xPosition+w+h)+','+(yPosition+h)+'z';
                //region 连线设置
                if(i == xMax-1){//最后一列
                    xSplitLine = 'M'+(xPosition+w)+','+(yPosition+h)+'L'+(xPosition-h)+','+(yPosition+h)+'z';
                }
                else{
                    if(j%2 ==0 && j!=yMax-1){//偶数行且不是最后一行
                        yLine = 'M'+(xPosition+w+2*h)+','+(yPosition+h)+'L'+(xPosition+w+2*h)+','+(yPosition+h+h*(3*Math.pow(2,i)))+'z';//y轴线的起止坐标
                    }
                    if(i==0){//第一列
                        xSplitLine = 'M'+(xPosition+w)+','+(yPosition+h)+'L'+xPosition+','+(yPosition+h)+'z';
                    }
                    else{//除去第一列最后一列
                        xSplitLine = 'M'+(xPosition+w)+','+(yPosition+h)+'L'+(xPosition-h)+','+(yPosition+h)+'z';//x轴线的起止坐标
                    }
                    xConcatLine = 'M'+(xPosition+w+2*h)+','+(yPosition+h)+'L'+(xPosition+w+h)+','+(yPosition+h)+'z';
                }
                //endregion
                //region 边框改成线设置
                var ltLine = "M"+(xPosition+r)+","+yPosition+" L"+(xPosition+w)+","+yPosition+" L"+(xPosition+w)+","+(yPosition+h)+" L"+xPosition+","+(yPosition+h)+" L"+xPosition+","+(yPosition+r)+" A"+r+","+r+",0,0,1,"+(xPosition+r)+","+yPosition+" Z";
                var rtLine = "M"+(xPosition+w+h)+","+(yPosition+r)+" L"+(xPosition+w+h)+","+(yPosition+h)+" L"+(xPosition+w)+","+(yPosition+h)+" L"+(xPosition+w)+","+yPosition+" L"+(xPosition+w+h-r)+","+yPosition+" A"+r+","+r+",0,0,1,"+(xPosition+w+h)+","+(yPosition+r)+" Z";
                var lbLine = "M"+xPosition+","+(yPosition+h+h-r)+" L"+xPosition+","+(yPosition+h)+" L"+(xPosition+w)+","+(yPosition+h)+" L"+(xPosition+w)+","+(yPosition+h+h)+" L"+(xPosition+r)+","+(yPosition+h+h)+" A"+r+","+r+",0,0,1,"+xPosition+","+(yPosition+h+h-r)+" Z";
                var rbLine = "M"+(xPosition+w+h-r)+","+(yPosition+h+h)+" L"+(xPosition+w)+","+(yPosition+h+h)+" L"+(xPosition+w)+","+(yPosition+h)+" L"+(xPosition+w+h)+","+(yPosition+h)+" L"+(xPosition+w+h)+","+(yPosition+h+h-r)+" A"+r+","+r+",0,0,1,"+(xPosition+w+h-r)+","+(yPosition+h+h)+" Z";
                //endregion
                var item,state = "",curCount = 0,id,finalScore1 = "",finalScore2 = "",userName1 = '',first,second,rn = 3,
                    userName2 ='',userId1,userId2,winnerId,obj,textLeftTop = nameText,textRightTop=nameText,
                    textLeftBottom =nameText,textRightBottom = nameText,pathLeftTop = nameAttr,pathLeftBottom = nameAttr;

                for(var z = 0; z < i ;z++){
                    curCount += Math.pow(2,(curRound-1-z));
                }
                item = matchList[curCount+j+curIndex];

                console.log(i,curCount+j+curIndex,curIndex,curCount,curRound);

                if(typeof item != 'undefined'){
                    id = item.id;
                    state = item.state;
                    finalScore1 = item.finalScore1;
                    finalScore2 = item.finalScore2;
                    first = checkWordsLength(item.userName1);
                    second =checkWordsLength(item.userName2);
                    if(first.flag){
                        userName1 = first.newStr;
                    }
                    else{
                        userName1 = first.originStr;
                    }
                    if(second.flag){
                        userName2 = second.newStr;
                    }
                    else{
                        userName2 = second.originStr;
                    }
                    userId1 = item.userId1;
                    userId2 = item.userId2;
                    winnerId = item.winnerId;
                    obj = {matchInfo:[{userId:userId1,userName:item.userName1},
                            {userId:userId2,userName:item.userName2}],id:id};
                    obj = JSON.stringify(obj);

                }
                //出错设置
                if(state == -1){
                    paper.customAttributes.className= function (data) {
                        return {"class":"warn className"+data};
                    };
                    paper.path(rtLine).attr(warnAttr).attr({"className":obj}); //数字框框上
                    paper.path(rbLine).attr(warnAttr).attr({"className":obj}); //数字框框下

                    textRightTop = winText;
                    textRightBottom = winText;
                    finalScore1 = '出';
                    finalScore2 = '错';
                    paper.path(warnLine.toString()).attr(lineWarnAttr);
                }
                else{//比赛结束
                    if(finalScore1>finalScore2){
                        pathLeftTop = winAttr;
                        textLeftTop = winText;
                    }else if(finalScore1<finalScore2){
                        pathLeftBottom = winAttr;
                        textLeftBottom = winText;
                    }
                    paper.path(rtLine).attr(numAttr); //数字框框上
                    paper.path(rbLine).attr(numAttr); //数字框框下

                }
                paper.path(ltLine).attr(pathLeftTop); //名称框框上
                paper.path(lbLine).attr(pathLeftBottom); //名称框框下
                paper.text(xPosition+h/2,yPosition+h/2,userName1).attr(textLeftTop);//名称文本上
                paper.text(xPosition+h/2,yPosition+3*h/2,userName2).attr(textLeftBottom);//名称文本下
                paper.text(xPosition+w+h/2-rn,yPosition+h/2,finalScore1).attr(textRightTop);//数字文本上
                paper.text(xPosition+w+h/2-rn,yPosition+3*h/2,finalScore2).attr(textRightBottom);//数字文本下

                paper.path(xConcatLine.toString()).attr(lineAttr);
                paper.path(xSplitLine.toString()).attr(lineAttr);
                paper.path(yLine.toString()).attr(lineAttr);

            }
        }

    };


    loadMatchContent = function (rounds) {
        var args = {},url;
        args.token = '519f7cf0a1fa401baddd8af7768dff05';
        args.matchId = 56;

        /* args.token = GetQueryString("token");
         args.matchId = GetQueryString("matchId");*/

        url = replaceHttp(configMap.java_handler_addr);

        $.ajax({
            url:url+'match/VS/list',
            type:'get',
            dataType:'json',
            data:args,
            success:function(data){
                if(data.success){
                    var matchList,index = 0;
                    matchList = data.matchVS;
                    loadMatchView(index,rounds,matchList);
                    $('.againstFold span').off().on('click',function (event) {
                        var $this = $(this);
                        if($this.hasClass('increase')){
                            index--;
                            if(index > -1){
                                loadMatchView(index,rounds,matchList);
                            }
                            else{
                                index = 0;
                            }

                        }
                        else{
                            index++;
                            if(index<rounds){
                                loadMatchView(index,rounds,matchList);

                            }
                            else{
                                index = rounds;
                            }
                        }
                        if(index ==0 || index == rounds-1){
                            $this.hasClass('active') ? $this.removeClass('active'):'';
                        }
                        else{
                            $this.hasClass('active') ? '' : $this.addClass('active');
                        }
                        $this.siblings('span').hasClass('active') ? '' : $this.siblings('span').addClass('active');
                    });
                    touch();
                }else{
                    /* alert(data.msg);*/
                }
            }
        });
    };

    loadMatchInfoContent = function () {
        var gameId,token,args = {},url;

        args.token = '519f7cf0a1fa401baddd8af7768dff05';
        gameId = 56;

        /*gameId = GetQueryString('matchId');
        args.token = GetQueryString('token');*/
        args.id = gameId;
        url = replaceHttp(configMap.java_handler_addr);
        $.ajax({
            url:url+'match/get',
            type:'get',
            dataType:'json',
            data:args,
            success:function(data){
                if(data.success){
                    var match,state,roundState,rounds;
                    match = data.match;
                    state = match.state;
                    roundState = match.roundState;
                    rounds = match.rounds;
                    if(state < 4){
                        $('.againstWarning').removeClass('hidden');
                        $('.againstFold').addClass('hidden');
                        $('.againstWarning .time').html(timeFormat(match.signinOver,'yyyy/MM/dd hh:mm'));
                    }
                    else{
                        var header_html = '';
                        if(state == 6){
                            header_html = '比赛结束';
                        }
                        else{
                            header_html = '比赛开始，第'+roundState+'轮结束时间：'+timeFormat(match.matchOver,'yyyy/MM/dd hh:mm');
                        }
                        $('.againstHeader label').html(header_html);
                        $('.againstWarning').addClass('hidden');
                        $('.againstFold').removeClass('hidden');
                        loadMatchContent(rounds);
                    }
                }else{
                }
            }
        });
    };

    (function () {
        loadMatchInfoContent();
    }());
});
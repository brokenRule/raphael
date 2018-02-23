/**
 * Created by cll on 2017/12/6.
 */
web.admin.game = (function () {
    "use strict";
    var configMap,initModule,onUrlChange,loadGameListPage,Drag,loadPageList,loadGameDetailPage,loadPlayersPage,loadMatchPage,changeSelect
        ,changeWord,getTimestamp,timeFormat,resetModalFrame,getGameId,log2,timeDiffer;
    configMap = {
        java_handler_addr:web.hostMap.host_pre,
        default_deckSet_img:'https://iplaymtg.oss-cn-beijing.aliyuncs.com/deck/hearthstone/deckseticon/yingdi.png',
        pageNum:0,
        pageSize:10,
        destroyBubble:function (event) {
            event.preventDefault();
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }
            else {
                event.cancelBubble = true;
            }
        },
        alertFormat:function (content,style) {
            style = style == 'success' ? 'alert-success' : 'alert-warning';
            web.utility.showBasicPrompt({
                content:content,
                style:style
            });
        }
    };

    /*region 公共方法*/

    changeSelect = function (which) {
        var $this = which ,val = $this.val();
        val = changeWord(val);
        $this.find("option[value="+ val+"]").attr("selected",true);
        $this.find("option[value="+ val+"]").siblings().attr("selected",false);
    };

    changeWord = function(keyword){
        var  reg = /[^0-9a-zA-Z\u4e00-\u9fa5]+/g;//如果下拉框有特殊字符
        keyword = keyword.replace(reg,function () {
            return '\\' + arguments[0];
        });
        return keyword;
    };

    resetModalFrame = function(){
        $('.utility-model-modelBody').css('border-radius','6px');
        $('.utility-model-modelHeader').css('border','none');
        $('.utility-model-modelContent').css({'margin-bottom':'15px','border-bottom':'1px solid #e7e7e7'});
        $('.utility-model-modelFooter>.utility-model-confirmButton').css({'background-color':'#3b68b8','border-radius':'3px',
            'width':'95px','height':'31px'});
    };

    getTimestamp = function (date) {//获取一定时间字符串
        var  reg = /(\s*)/g;
        if(date){
            date = date + '00';
            date = date.replace(reg,'');
            date = date.replace(/\//g,'');
            date = date.replace(/\:/g,'');
            date = parseInt(date);
        }
        else{
            date = 0 ;
        }
        return date;
    };

    timeFormat = function(time,formatStr){
        var bind,time,date,date_year,date_month,date_day,date_hour,date_minute,time_str;
        if(/[\.]/i.test(formatStr)){
            bind = '.';
        }
        else if(/[\-]/i.test(formatStr)){
            bind = '-';
        }
        else if(/[\/]/i.test(formatStr)){
            bind = '/';
        }
        date = !!time ? new Date(time) : new Date();
        date_year = date.getFullYear();
        date_month = '0'+(date.getMonth()+1);
        date_day = '0'+date.getDate();
        time_str = date_year+bind+date_month.substring(date_month.length-2)+bind+date_day.substring(date_day.length-2);
        if(/[\:]/i.test(formatStr)){
            date_hour=('0'+date.getHours()).substr(-2,2);
            date_minute=('0'+date.getMinutes()).substr(-2,2);
            time_str +=  ' '+date_hour+':'+date_minute;
        }
        return time_str;

    };

    timeDiffer = function (startTime,endTime,differType) {
        var divNum = 1,sTime,eTime;
        startTime = startTime.replace(/\-/g,'/');
        endTime = endTime.replace(/\-/g,'/');
        differType = differType.toLowerCase();
        sTime = new Date(startTime);
        eTime = new Date(endTime);
        switch (differType){
            case 'second' : divNum = 1000; break;
            case 'minute' : divNum = 60*1000; break;
            case 'hour'   : divNum = 60*60*1000; break;
            case 'day'    : divNum = 24*60*60*1000; break;
        }
        return Math.ceil((eTime.getTime() - sTime.getTime())/parseInt(divNum));
    };

    getGameId = function () {
        var current_url,urlParams,obj = {},array = '';
        current_url = window.location.pathname;
        urlParams = current_url.substr(current_url.lastIndexOf('/')+1);
        if(/\d+/g.test(urlParams)){
            if(/\_/g.test(urlParams)){
                array = urlParams.split('_');
                obj.title = array[0];
                obj.id = array[1];
            }
            else{
                obj.id = parseInt(urlParams);
                obj.title = configMap.gameTitle;
            }
        }
        else{
            obj.id ='';
            obj.title = "";
        }
        return obj;
    };

    log2 = function (value) {
        if (value == 1)
            return 0;
        else
            return 1+log2(value>>1);
    };

    loadPageList = function (pageAry,args) {//下标识0 页码1
        var page , page_num ,curPage,page_view= '';
        page = pageAry.pageIndex;
        page_num = pageAry.pageNum;
        if(page){
            page = Number(page);
        }
        if(page<=0&&page_num>1){
            page_view+='<li class="pageFirst" data-page="'+(0)+'"><a>首页</a></li>';
        }else if(page>0){
            page_view +='<li class="pageFirst" data-page="'+(0)+'"><a>首页</a></li>'+
                '<li class="pageUp" data-page="'+(page-1)+'"><a>上一页</a></li>';
        }
        if(page>=2&&page_num>=5&&page_num-page>=3){
            for (var i = page-2; i <= page+2; i++) {
                page_view+='<li class="pageData" data-page="'+i+'"><a>'+(i+1)+'</a></li>';
            };
        }else if(page<2&&page_num>=5&&page_num-page>=3){
            for (var i = 0; i <= 4; i++) {
                page_view+='<li class="page_data" data-page="'+i+'"><a>'+(i+1)+'</a></li>';
            };
        } else if(page_num<5&&page_num>1){
            for (var i = 0; i <page_num; i++) {
                page_view+='<li class="pageData" data-page="'+i+'"><a>'+(i+1)+'</a></li>';
            };
        }else if(page_num<=1){
        }else{
            for (var i = page_num-5; i < page_num; i++) {
                page_view+='<li class="pageData" data-page="'+i+'"><a>'+(i+1)+'</a></li>';
            };
        }
        if(page_num>1&&page!=page_num-1){
            page_view+='<li class="pageDown" data-page="'+(page+1)+'"><a>下一页</a></li>'+
                '<li class="pageEnd" data-page="'+(page_num-1)+'"><a>尾页</a></li>';
        }
        if(page_num&&Number(page_num)>0){
            $('.pageList').html(page_view);
            curPage  = $('.pageList li[data-page="'+page+'"]:not(.pageFirst)');
            $('.pageList>li').hasClass('currentPage') ? null: curPage.addClass('currentPage');
        }
    };

    /*region 拖拽事件*/

    Drag = function (ele){
        this.ele = ele;
        this.l = null;
        this.t = null;

        var that = this;
        this.DOWN = function(e){
            //这里的this是 this.ele,所以要修改this为原构造函数的this
            that.down.call(that,e)
        };

        this.ele.onmousedown = this.DOWN;
        this.MOVE = function(e){ that.move.call(that,e);};
        this.UP = function(e){ that.up.call(that,e); }
    };

    Drag.prototype.down = function(e){
        this.l = e.pageX - this.ele.offsetLeft;
        this.t = e.pageY - this.ele.offsetTop;
        //要修改　move 和 up  中的this指向
        document.onmousemove = this.MOVE;
        document.onmouseup = this.UP;
    };

    Drag.prototype.move = function(e){
        var l = e.pageX - this.l;
        var t = e.pageY - this.t;
        this.ele.style.left = l + 'px';
        this.ele.style.top = t + 'px';
        e.preventDefault();
    };

    Drag.prototype.up = function(){
        document.onmousemove =   document.onmouseup = null;
    };

    /*endregion*/

    /* endregion*/

    /*region  页面*/

    loadGameListPage = (function () {
        var initModule,callback,initPageView,token,getSeedList,getConditions,
            loadGameContent,loadGameView,pageNum = 0;
        token =  web.user.getUser('token');

        getSeedList = function () {
            var seed_html = '',list,gameFirstTitle;
            list = configMap.games_list;
            seed_html = '<option value="">游戏选择</option>';
            for(var i=0;i<list.length;i++){
                var game_item = list[i];
                /*if(i == 0){
                    gameFirstTitle = game_item.ename;
                }*/
                seed_html += String()+
                    '<option data-id="'+game_item.id+'" value="'+game_item.ename+'">'+game_item.cname+'</option>';

            }
            $('.seedsList').html(seed_html);
            loadGameContent({token:token,game:"",state:-1,visible:-1});
        };

        getConditions = function () {
            var args = {},game,state,title,visible,start_time,$timeBtn;
            game = $('.seedsList').children('option:selected').val();
            state = $('.gameSelect').children('option:selected').val();
            visible = $('.visibleList').children('option:selected').val();
            title = $('.gameSearch input').val();
            $timeBtn = $('.timeBtn');
            if($timeBtn.hasClass('active')){
                start_time = $timeBtn.attr('data-start');
                if(start_time){
                    var reg = /\./g;
                    start_time = start_time.replace(reg,'');
                    start_time += '000000';
                    args.matchStart= start_time;
                }
            }
            if(state == 7){
                args.normal = 0;
            }
            else{
                args.state = parseInt(state);
            }
            args.title = title;
            args.game = game;
            args.visible = visible;
            args.page = pageNum;
            loadGameContent(args);
        };

        loadGameView = function (game_item) {
            var view = '',seedTitle = '',stateName = '',stateTime = '',curTime = '',operate = '',operate_title = '',operate_html = '';
            if(game_item.game == 'hearthstone'){
                seedTitle = '炉石传说';
            }
            else if(game_item.game == 'gwent'){
                seedTitle = '昆特';
            }
            switch (game_item.state){
                case 0:
                    stateName = '未开始报名';
                    stateTime = '报名开始时间：' + timeFormat(game_item.registerStart,'yyyy.MM.dd hh:mm');
                    break;
                case 1:
                    stateName = '正在报名';
                    stateTime = '报名结束时间：' + timeFormat(game_item.registerOver,'yyyy.MM.dd hh:mm');
                    break;
                case 2:
                    stateName = '报名结束';
                    stateTime = '签到开始时间：' + timeFormat(game_item.signinStart,'yyyy.MM.dd hh:mm');
                    break;
                case 3:
                    stateName = '正在签到';
                    stateTime = '签到结束时间：' + timeFormat(game_item.signinOver,'yyyy.MM.dd hh:mm');
                    break;
                case 4:
                    stateName = '签到结束';
                    stateTime = '比赛开始时间：' + timeFormat(game_item.matchStart,'yyyy.MM.dd hh:mm');
                    break;
                case 5:
                    stateName = '正在比赛';
                    stateTime = '比赛结束时间：' + timeFormat(game_item.matchOver,'yyyy.MM.dd hh:mm');
                    break;
                case 6:
                    stateName = '完赛';
                    break;
            }
            if(game_item.normal == -1){
                stateName = '比赛出错，需要处理！';
            }
            operate = getTimestamp(timeFormat(game_item.registerStart-24*60*60*1000,'yyyy/MM/dd'));
            curTime = getTimestamp(timeFormat('','yyyy/MM/dd'));
            if(curTime>=operate){
                operate_html = '查看';
                operate_title = 'see';
            }
            else{
                operate_html = '修改';
                operate_title = 'update';
            }
            view += String()+
                '<li class="items column">'+
                '<div class="item gameName">'+
                '<img src="'+game_item.imgBig+'">'+
                '<div class="right">'+
                '<div class="title">'+game_item.title+'</div>'+
                '<div class="seedTitle">'+seedTitle+'</div>'+
                '</div>'+
                '</div>'+
                '<div class="item gameTime">'+timeFormat(game_item.matchStart,'yyyy.MM.dd hh:mm')+'</div>'+
                '<div class="item gameNumber">'+
                '<div class="formal">正式：<span>'+game_item.signined+'</span>/<span>'+game_item.number+'</span></div>'+
                /* '<div class="substitute">替补：<span>'+(parseInt(game_item.number)-parseInt(game_item.signined))+'</span>/<span>'+game_item.number+'</span></div>'+*/
                '</div>'+
                '<div class="item gameState">'+
                '<div class="stateName">'+stateName+'</div>'+
                '<div class="stateTime">'+stateTime+'</div>'+
                '</div>'+
                '<div class="item gameOperate"><a data-ajax href="/admin/game/create/'+operate_title+'_'+game_item.id+'">'+operate_html+'</a></div>'+
                '</li>';
            return view;
        };

        loadGameContent = function (args) {
            var pageAry = {},pageSize;
            pageSize = configMap.pageSize;
            pageAry.pageIndex = typeof args.page == 'undefined' ? 0 : args.page;
            pageAry.pageSize = pageSize;
            args.size = pageSize;
            args.token = web.user.getUser('token');
            $.ajax({
                url:configMap.java_handler_addr+'match/list',
                type:'get',
                dataType:'json',
                data:args,
                success:function(data){
                    if(data.success){
                        var list ,length,match_view = '',total;
                        list= data.matchUser;
                        total = data.total;
                        length = list && list.length > 0 ? list.length : 0;
                        pageAry.pageNum = Math.ceil(total/pageSize);
                        pageAry.pageTotal = total;
                        if(length &&length>0)
                        {
                            for(var i =0; i< length ;i++){
                                var item = list[i].match;
                                match_view += loadGameView(item);
                            }
                            $('.gameManage-contentList .content').html(match_view);
                            $('.curNum').html(total);
                            $('.pageBox').show();
                            $('.pageBox').html('<ul class="pageList"></ul>');
                            loadPageList(pageAry,args);
                        }
                        else{
                            var nullData = String() +
                                '<li class="items column"><div class="null_digital">暂无数据！！！</div></li>';
                            $('.gameManage-contentList .content').html(nullData);
                            $('.pageBox').hide();
                            $('.curNum').html(0);
                        }
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };

        callback = function () {
            var $pageBox;
            $pageBox = $('.pageBox');
            $('.gameManage-headerItem select').off().on('change',function (event) {
                var $this = $(event.target);
                changeSelect($this);
                getConditions();
                configMap.destroyBubble(event);
            });
            $('.timeBtn').off().on('click',function(){
                var $this = $(event.target);
                var res = $this.hasClass('active');
                var start_str,end_str;
                if(res){
                    start_str = $this.attr('data-start');
                    start_str = start_str ? start_str : '';
                    end_str = $this.attr('data-end');
                    end_str = end_str ? end_str : '';
                }else{
                    var date = new Date(),
                        date_year = date.getFullYear(),
                        date_month = '0'+(date.getMonth()+1),
                        date_day = '0'+date.getDate();
                    start_str = date_year+'.'+date_month.substring(date_month.length-2)+'.'+date_day.substring(date_day.length-2);
                    end_str = start_str;
                }

                var choose_html = String()+
                    '<div class="gameManage-frame-window">'+
                    '<div class="feedInfo-item">'+
                    '<span>查看全部:</span>'+
                    '<button id="see_all">全部</button>'+
                    '</div>'+
                    '<div class="feedInfo-item">'+
                    '<span>选择时间:</span>'+
                    '<input id="select_start" type="text" value="'+start_str+'" style="margin-left: 10px;width: 156px;">'+
                    '</div>'+
                    '</div>';
                web.modalFrame.showModal({
                    title:'开赛时间',
                    content:choose_html,
                    content_width:'400px',
                    initialize_function:function(){
                        resetModalFrame();
                        $('#select_start').datetimepicker({
                            lang:'ch',
                            format: "Y.m.d",
                            timepicker:false
                        });
                        $('#see_all').off().on('click',function () {
                            $this.hasClass('active')? $this.removeClass('active'): null;
                            web.modalFrame.closeModal();
                            $this.html('开赛时间<span></span>');
                            getConditions();
                        });
                    },
                    confirm_function:function(){
                        var  start = $('#select_start').val();
                        if(!start){
                            $this.html('开赛时间<span></span>');
                        }else{
                            $this.html(start+'<span></span>');
                            $this.addClass('active');
                        }
                        $this.attr('data-start',start);
                        getConditions();
                        web.modalFrame.closeModal();
                    }
                });

            });
            $('.gameSearch>a').off().on('click',function () {
                getConditions();
            });
            $pageBox.off('click','.pageList>li>a').on('click','.pageList>li>a',function (event) {//页码跳转
                event.preventDefault();
                $(this).parent().siblings().hasClass('currentPage') ?  $(this).parent().siblings().removeClass('currentPage'):null;
                $(this).parent().hasClass('pageFirst') ? $(this).parent().next().addClass('currentPage') : $(this).parent().addClass('currentPage');
                pageNum = $(this).parent().data('page');
                getConditions();
            });
        };

        initPageView = function(pageid ){
            var page_html = String()+
                '<div class="manage-content-box">'+
                '<div class="manage-headmenu-list">'+
                '<ul id="manage-headmenu-ul">'+
                '<li><a data-ajax href="/admin">管理端首页</a></li>'+
                '<li> > </li>'+
                '<li><a data-ajax href="/admin/game">比赛管理列表页</a></li>'+
                '</ul>'+
                '</div>'+
                '<div class="gameManage-Frame">'+
                '<div class="gameManage-contentBox">'+
                '<div class="gameManage-headerList">'+
                '<div class="gameManage-headerItem">'+
                '<select  class="seedsList"></select>'+
                '<select  class="visibleList">'+
                '<option value="-1">可见性</option>'+
                '<option value="1">可见</option>'+
                '<option value="0">不可见</option>'+
                '</select>'+
                '<select  class="gameSelect">'+
                '<option value="-1">全部状态</option>'+
                '<option value="0">未报名</option>'+
                '<option value="1">报名中</option>'+
                '<option value="2">报名结束</option>'+
                '<option value="3">签到中</option>'+
                '<option value="4">签到结束</option>'+
                '<option value="5">比赛中</option>'+
                '<option value="6">比赛结束</option>'+
                '<option value="7">比赛出错</option>'+
                '</select>'+
                /*'<a class="">开赛时间选择</a>'+*/
                '<a data-ajax href="/admin/game/create" class="createGame">创建比赛</a>'+
                '</div>'+
                '<div class="gameManage-headerItem">'+
                '<label>共计：<span class="curNum">10</span>条</label>'+
                '<div class="gameSearch">比赛名称：<input type="text"><a>搜索</a></div>'+
                '</div>'+
                '</div>'+
                '<div class="gameManage-contentList">'+
                '<ul class="header items">'+
                '<li class="item">名称</li>'+
                '<li class="item timeBtn">开赛时间<span></span></li>'+
                '<li class="item">参赛人数</li>'+
                '<li class="item">状态</li>'+
                '<li class="item">操作</li>'+
                '</ul>'+
                '<ul class="content">'+
                '</ul>'+
                '</div>'+
                '<div class="pageBox">'+
                '<ul class="pageList"></ul>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';

            $.gevent.publish('mainPageUpdate',{
                page_id:pageid,
                html:page_html,
                title:'比赛管理-旅法师营地',
                callback: 'admin.game.loadGameListPage.callback'
            });

            getSeedList();
        };

        initModule = function(arg_array,pageid){
            $("html,body").animate({'scrollTop':"0"},0);
            if(configMap.games_list){
                initPageView(pageid);
            }
            else{
                $.get(configMap.java_handler_addr+'match/game',{token:token,size:60,visible:-1},function(data){
                    if(data.success){
                        configMap.games_list = data.game;
                        initPageView(pageid);
                    }
                },'json');
            }
        };

        return{
            initModule:initModule,
            callback:callback,
            initPageView:initPageView
        }
    }());

    loadGameDetailPage = (function () {
        var initModule,callback,initPageView,token,addSubItem,editView;
        token =  web.user.getUser('token');

        addSubItem = function (i) {
            var title = '',sub_view = '',operate_view = '';
            if(i==0 || i==1){
                title = '第'+(i+1)+'名';
                operate_view = '-';
            }
            else{
                title = '前'+Math.pow(2,i)+'强';
                operate_view = '<a class="delete">删除</a>';
            }
            sub_view += String()+
                '<tr data-num="'+i+'">'+
                '<td>'+title+'</td>'+
                '<td><input type="text" class="gameMoney"></td>'+
                '<td><input type="text" class="gameFire"></td>'+
                '<td>'+operate_view+'</td>'+
                '</tr>';
            return sub_view;
        };

        callback = function () {
            var $game_table, gameId,gameTitle = '';
            gameId = getGameId().id;
            gameTitle = getGameId().title;
            $game_table = $('.game-table');

            $('.createSure').attr('disabled',false);

            if(!gameTitle || gameTitle == 'update'){
                $('.game-pics .game-pic').off().on('click',function (event) {
                    var $this = $(this),game,$format,$getMode,$vsMode;
                    $this.siblings().hasClass('active') ?  $this.siblings().removeClass('active'):'';
                    $this.hasClass('active') ? '' : $this.addClass('active');
                    game = $this.attr('data-game');
                    $format = $('.format');
                    if(game == 'hearthstone'){
                        $format.hasClass('hidden') ? $format.removeClass('hidden') : '';
                    }
                    else{
                        $format.hasClass('hidden') ? '' : $format.addClass('hidden');
                    }
                    configMap.destroyBubble(event);
                });

                $('#edit_icon').off().on('click',function() {
                    var imgUrl = $('#showPic').find('img').attr('src') ? $('#showPic').find('img').attr('src'):configMap.default_deckSet_img;
                    var pic_size_x,pic_size_y;
                    pic_size_x = 702;
                    pic_size_y = 386;
                    web.modalFrame.showUploadImgModal({
                        radio_width: 1408,
                        radio_height: 772,
                        show_width: pic_size_x,
                        show_height: pic_size_y,
                        imgUrl:imgUrl,
                        confirm_function: function (args) {
                            $('#showPic').removeClass('hidden');
                            $('#showPic').find('img').attr('src',args.imgUrl);
                            $('#uploadPic').addClass('hidden');
                            web.modalFrame.closeUploadImgModal();
                        }
                    });
                });

                $('.game-info .timePick').off().datetimepicker({
                    autoclose:true,//选中关闭
                    todayBtn: true,//今日按钮
                    step:30
                });

                $('.game-info .registerTime').off().on('click',function () {
                    var $this = $(this);
                    var start_str = '',end_str = '';
                    start_str = $this.attr('data-start');
                    end_str = $this.attr('data-end');
                    typeof start_str == 'undefined' ?  start_str = '' :'';
                    typeof end_str == 'undefined' ?   end_str =  '' : '';
                    var choose_html = String()+
                        '<div class="gameManage-frame-window">'+
                        '<div class="feedInfo-item">'+
                        '<span>起始时间:</span>'+
                        '<input id="select_start" type="text" value="'+start_str+'" style="margin-left: 10px;width: 200px">'+
                        '</div>'+
                        '<div class="feedInfo-item">'+
                        '<span>截止时间:</span>'+
                        '<input id="select_end" type="text"  value="'+end_str+'" style="margin-left: 10px;width: 200px">'+
                        '</div>'+
                        '</div>';
                    web.modalFrame.showModal({
                        title:'选择时间',
                        content:choose_html,
                        content_width:'600px',
                        initialize_function:function(){
                            resetModalFrame();
                            $('#select_start').datetimepicker({
                                autoclose:true,//选中关闭
                                todayBtn: true,//今日按钮
                                step:30
                            });
                            $('#select_end').datetimepicker({
                                autoclose:true,//选中关闭
                                todayBtn: true,//今日按钮
                                step:30
                            });
                        },
                        confirm_function:function(){
                            var start,end,startNum,endNum;
                            start = $('#select_start').val();
                            end = $('#select_end').val();
                            startNum = getTimestamp(start);
                            endNum = getTimestamp(end);
                            if(!start && !end){
                                alert('请选择报名开始和截止时间！');
                            }
                            else if(!start && end){
                                alert('请选择报名开始时间！');
                            }
                            else if(start && !end){
                                alert('请选择报名截止时间！')
                            }
                            else if(startNum>endNum){
                                alert('截止时间不能小于开始时间！');
                            }
                            else{
                                $('.game-info-name span').html('（'+timeDiffer(start,end,'day')+'天）');
                                $this.attr('data-start',start);
                                $this.attr('data-end',end);
                                $this.val(start+'-'+end);
                                web.modalFrame.closeModal();
                            }
                        }
                    });
                });

                $('.addClick').off().on('click',function(event){
                    var addData;
                    var  i = $(".game-table>tr:last").attr('data-num');
                    addData = addSubItem(parseInt(i)+1);
                    $('.game-table>tbody').before(addData);
                    configMap.destroyBubble(event);
                });

                $game_table.off('click','a.delete').on('click','a.delete',function(event){
                    configMap.destroyBubble(event);
                    var num = $(".game-table>tr").index($(this).parent().parent());
                    if(num>0){
                        $('.game-table>tr:eq('+num+')').remove();
                    }
                });

                $('.createSure').off().on('click',function (){
                    var $this = $(this);
                    $this.attr('disabled',true);
                    var token,game = '',title,number,signined,registered,registerFire,registerStart,registerOver,
                        matchStart,signinStart,signinOver,rewardDescription,VSMode, duration,intervals, description,
                        remark,rule,imgBig,visible,mode,fireItem = {},priceItem = {},signTime, formatText = '',format = '',
                        url = '',warning = '', args = {},flag = 1,ban;
                    token = web.user.getUser('token');
                    title = $('.game-info .title').val();
                    number = $('.game-info .number').val();
                    signined = $('.game-info .signined').val();
                    registered = $('.game-info .registered').val();
                    registerFire = $('.game-info .registerFire').val();
                    registerStart = $('.registerTime').attr('data-start');
                    registerOver = $('.registerTime').attr('data-end');
                    matchStart = $('.game-info .matchStart').val();
                    signTime = $('.signinTime').val();
                    if(!!gameId){
                        !signTime ? signTime =  parseInt($('.signinTime').attr('data-time')) : '';
                    }
                    duration = $('.game-info .duration').val();
                    intervals = $('.game-info .intervals').val();
                    rewardDescription = $('.game-info .rewardDescription').val();
                    VSMode = $('.game-rules .VSMode').val();
                    description = $('.game-info .description').val();
                    remark = $('.game-info .remark').val();
                    rule = $('.game-info .rule').val();
                    ban = $('.game-info .ban').val();
                    imgBig  = $('#showPic').find('img').attr('src');
                    visible = $('input[name="gameVisible"]:checked').val();
                    mode = $('input[name="gameMode"]:checked').val();
                    $(".game-pics .game-pic").each(function (index,item){
                        var $this = $(item);
                        if($this.hasClass('active')){
                            game = $this.attr('data-game');
                        }
                    });
                    game == 'hearthstone' ? formatText =  $('input[name="gameFormat"]:checked').val() : null;
                    formatText == '3' ?  format = $('.game-info  .writeAuto').val(): format = formatText;
                    $('.game-table>tr').each(function(index,item){
                        var $item = $(item),fire,price,num;
                        fire = $item.find('.gameFire').val();
                        price = $item.find('.gameMoney').val();
                        num = $item.attr('data-num');
                        fireItem[Math.pow(2,num)] = parseInt(fire);
                        priceItem[Math.pow(2,num)] = parseInt(price);

                    });
                    fireItem = JSON.stringify(fireItem);
                    priceItem = JSON.stringify(priceItem);
                    if(flag && !game){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请选择具体某一个游戏','warning');
                    }
                    else if(flag && !title){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写比赛名称','warning');
                    }
                    /* else if(flag && !signined){
                     flag = 0;
                     $(this).attr('disabled',false);
                     configMap.alertFormat('请填写已报名人数','warning');
                     }
                     else if(flag && !registered){
                     flag = 0;
                     $(this).attr('disabled',false);
                     configMap.alertFormat('请填写已签到人数','warning');
                     }*/
                    else if(flag && !number){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写总人数','warning');
                    }
                    else if(flag && !registerStart){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写报名开始时间','warning');
                    }
                    else if(flag && !registerOver){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写报名截止时间','warning');
                    }
                    else if(flag && !signTime){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写签到时间','warning');
                    }
                    else if(flag && !matchStart){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写比赛开始时间','warning');
                    }
                    else if(flag && !ban){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写ban职业数量','warning');
                    }
                    else if(flag && VSMode == '-1'){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请选择每轮对局的赛制','warning');
                    }
                    else if(flag && game == 'hearthstone' && formatText == '3' && !format){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请输入比赛规则特殊的赛制模式','warning');
                    }
                    else if(flag && !duration){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写每轮比赛时间','warning');
                    }
                    else if(flag && !intervals){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请填写每轮间隔时间','warning');
                    }
                    else if(flag && !imgBig){
                        flag = 0;
                        $this.attr('disabled',false);
                        configMap.alertFormat('请上传图片','warning');
                    }
                    if(flag){
                        signinStart = timeFormat((new Date(matchStart)-parseInt(signTime)*60*1000),'yyyy/MM/dd hh:mm');
                        args.token = token;
                        args.game = game;
                        args.title = title;
                        args.number = parseInt(Number(number));
                        args.registerFire = parseInt(Number(registerFire));
                        args.registerStart = getTimestamp(registerStart);
                        args.registerOver = getTimestamp(registerOver);
                        args.matchStart = getTimestamp(matchStart);
                        args.signinStart = getTimestamp(signinStart);//签到开始时间等于比赛开始时间减去签到时间
                        args.signinOver = getTimestamp(matchStart);//比赛开始时间等于签到结束时间
                        args.rewardDescription = rewardDescription;
                        args.VSMode = VSMode;
                        args.mode = 'single';
                        args.duration = parseInt(duration)*60;
                        args.intervals = parseInt(intervals)*60;
                        args.description = description;
                        args.rule = rule;
                        args.remark = remark;
                        args.imgBig = imgBig;
                        args.visible = visible;
                        args.ban = ban;
                        if(game == 'hearthstone'){
                            args.format = format;
                            url = 'match/create/hearthstone';
                        }
                        else if(game == 'gwent'){
                            url = 'match/create/gwent';
                        }
                        if(mode == 'single'){
                            args.singleFire = fireItem;
                            args.singleMoney = priceItem;

                        }
                        else{
                            args.loopFire = fireItem;
                            args.loopMoney = priceItem;
                        }
                        if(gameId){
                            args.id = gameId;
                            args.signined = parseInt(Number(signined));
                            args.registered = parseInt(Number(registered));
                            url = 'match/update';
                            warning = '修改';
                        }
                        else{
                            warning = '创建';
                        }
                        $.ajax({
                            url:configMap.java_handler_addr+url,
                            type:'post',
                            dataType:'json',
                            data:args,
                            success:function(data){
                                if(data.success){
                                    $(this).trigger('click');
                                    configMap.alertFormat( warning+'比赛成功','warning');
                                    $.gevent.publish('getPageByUrl','/admin/game');
                                }else{
                                    $this.attr('disabled',false);
                                    configMap.alertFormat(warning+'比赛失败，'+data.msg,'warning');
                                }
                            }
                        });
                    }
                });
            }
        };

        editView=  function () {
            var gameId,token;
            gameId = getGameId().id;
            token = web.user.getUser('token');
            $.ajax({
                url:configMap.java_handler_addr+'match/get',
                type:'get',
                dataType:'json',
                data:{token:token,id:gameId},
                success:function(data){
                    if(data.success){
                        var item,game,title,number,signined,registered,registerFire,registerStart,registerOver,reward,countFire = 0,countMax = 0,
                            signinStart,signinOver,matchStart,visible,rewardDescription,VSMode,format,mode,duration,intervals,countPrice = 0,ban,
                            description,remark,rule,imgBig,singleFire,singleMoney,loopFire,loopMoney,sub_html = '',fireItem = "",priceItem="",firePriceItem = '';
                        item = data.match;
                        reward = data.reward;
                        game = item.game;
                        title = item.title;
                        number = item.number;
                        signined = item.signined;
                        registered = item.registered;
                        registerFire = item.registerFire;
                        registerStart = item.registerStart;
                        registerOver = item.registerOver;
                        signinStart = item.signinStart;
                        signinOver  = item.signinOver;
                        matchStart  = item.matchStart;
                        visible  = item.visible;
                        rewardDescription  = item.rewardDescription;
                        VSMode  = item.vSMode;
                        format  = item.format;
                        /* mode  = item.mode;*/
                        mode  = 'single';
                        duration  = item.duration;
                        intervals  = item.intervals;
                        description  = item.description;
                        remark  = item.remark;
                        rule  = item.rule;
                        imgBig  = item.imgBig;
                        ban = item.ban;
                        $('.game-pics .game-pic').each(function (index, item) {
                            var $item = $(item),data_game;
                            data_game = $item.attr('data-game');
                            if(data_game == game){
                                $item.addClass('active');
                                return false;
                            }
                        });
                        $('.game-info .title').val(title);
                        $('.game-info .number').val(number);
                        $('.game-info .signined').val(signined);
                        $('.game-info .registered').val(registered);
                        $('.game-info .registerFire').val(registerFire);
                        $('.game-info .registerTime').val(timeFormat(registerStart,'yyyy/MM/dd hh:mm') + '-'+timeFormat(registerOver,'yyyy/MM/dd hh:mm'));
                        $('.game-info .registerTime').attr('data-start',timeFormat(registerStart,'yyyy/MM/dd hh:mm'));
                        $('.game-info .registerTime').attr('data-end',timeFormat(registerOver,'yyyy/MM/dd hh:mm'));
                        $('.game-info-name span').html('（'+timeDiffer(timeFormat(registerStart,'yyyy/MM/dd hh:mm'),timeFormat(registerOver,'yyyy/MM/dd hh:mm'),'day')+'天）');
                        $('.signinTime').attr('placeholder','比赛前：'+timeDiffer(timeFormat(signinStart,"yyyy/MM/dd hh:mm"),timeFormat(matchStart,"yyyy/MM/dd hh:mm"),'minute')+'分钟');
                        $('.signinTime').attr('data-time',timeDiffer(timeFormat(signinStart,"yyyy/MM/dd hh:mm"),timeFormat(matchStart,"yyyy/MM/dd hh:mm"),'minute'));
                        $('.signinTime').attr('signStart',timeFormat(signinStart,'yyy/MM/dd hh:mm'));
                        $('.signinTime').attr('MatchStart',timeFormat(matchStart,'yyy/MM/dd hh:mm'));
                        $('.game-info .matchStart').val(timeFormat(matchStart,'yyy/MM/dd hh:mm'));
                        $('.game-info .rewardDescription').val(rewardDescription);
                        $('.game-info .ban').val(ban);
                        $('.game-info .VSMode').val(VSMode);
                        $('.game-info .duration').val(duration/60);
                        $('.game-info .intervals').val(intervals/60);
                        $('.game-info .description').val(description);
                        $('.game-info .remark').val(remark);
                        $('.game-info .rule').val(rule);
                        $('input[name="gameVisible"][value="'+visible+'"]').attr("checked",true);
                        $('input[name="gameMode"][value="'+mode+'"]').attr("checked",true);
                        if(format == '标准' || format == '狂野'){
                            $('input[name="gameFormat"][value="'+format+'"]').attr("checked",true);
                        }
                        else{
                            $('input[name="gameFormat"][value="3"]').attr("checked",true);
                            $('.game-info .writeAuto').val(format);
                        }
                        if(imgBig){
                            $('#showPic').removeClass('hidden');
                            $('#uploadPic').addClass('hidden');
                            $('#showPic img').attr('src',imgBig);
                        }
                        if(typeof reward != 'undefined'){
                            if(mode != 'loop'){
                                singleFire = reward.singleFire;
                                singleMoney = reward.singleMoney;
                                fireItem =  typeof singleFire == 'undefined' ? "": singleFire;
                                priceItem =  typeof singleMoney == 'undefined' ? "": singleMoney;
                            }
                            else{
                                loopFire = reward.loopFire;
                                loopMoney = reward.loopMoney;
                                fireItem = typeof loopFire == 'undefined' ? "" : loopFire;
                                priceItem = typeof loopMoney == 'undefined' ? "" : loopMoney;
                            }
                            if(fireItem){
                                fireItem = 'JSON' in window ? JSON.parse(fireItem) : eval('(' + fireItem + ')');
                                for(var key in fireItem){
                                    countFire ++;
                                }
                                countMax = countFire;
                            }
                            if(priceItem){
                                priceItem = 'JSON' in window ? JSON.parse(priceItem) : eval('(' + priceItem + ')');
                                for(var key in priceItem){
                                    countPrice ++;
                                }
                                countMax > countPrice ? '' : countMax =  countPrice;
                            }
                            if(countMax){
                                if(countPrice>countFire){
                                    firePriceItem = priceItem;
                                }
                                else{
                                    firePriceItem = fireItem;
                                }
                                for(var key in  firePriceItem){
                                    var i = parseInt(key);
                                    if(i == 1 || i == 2){
                                        i -= 1;
                                        sub_html += addSubItem(i);
                                    }
                                    else{
                                        sub_html += addSubItem(log2(parseInt(key)));
                                    }
                                    /*sub_html += addSubItem(i);*/
                                }
                                $('.game-table>tr').remove();
                                $('.game-table tbody').before(sub_html);
                                $('.game-table>tr').each(function (index,item) {
                                    var $item = $(item),fire,price,num;
                                    num = parseInt($item.attr('data-num'));
                                    $item.find('.gameMoney').val(priceItem[Math.pow(2,num)]);
                                    $item.find('.gameFire').val(fireItem[Math.pow(2,num)]);
                                });
                            }
                        }
                    }else{
                        configMap.alertFormat('获取比赛信息，'+data.msg,'warning');
                    }
                }
            });
        };

        initPageView = function(pageid ){
            var gameId = '',gameTitle = '',nav_html = '',sub_view = '',btn_html = '',games_html = '',readonly_html = '',hidden_html = '';
            gameId = getGameId().id;
            if(gameId){
                gameTitle = getGameId().title;
                configMap.gameTitle = gameTitle;
                nav_html = String()+
                    '<div class="gameManage-navigation">'+
                    '<a class="active" data-ajax href="/admin/game/create/'+gameTitle+'_'+gameId+'"><span>比赛信息</span></a>'+
                    '<a data-ajax href="/admin/game/against/'+gameId+'"><span>对阵信息</span></a>'+
                    '<a data-ajax href="/admin/game/players/'+gameId+'"><span>参赛选手</span></a>'+
                    '</div>';
                btn_html = '保存修改';
                if(gameTitle == 'see'){
                    readonly_html = 'readonly';
                }
            }
            else{
                configMap.gameTitle = '';
                btn_html = '确认创建';
                hidden_html = 'hidden';
            }
            for(var i=0,l = configMap.games_list.length; i<l ;i++ )
            {
                var game_item = configMap.games_list[i];
                games_html += String()+
                    '<li class="game-pic" data-title="'+game_item.cname+'" data-game="'+game_item.ename+'">'+
                    '<img src="'+game_item.icon+'" alt="">'+
                    '<div class="img-title">'+game_item.cname+'</div>'+
                    '</li>';

            }
            var page_html = String()+
                '<div class="manage-content-box">'+
                '<div class="manage-headmenu-list">'+
                '<ul id="manage-headmenu-ul">'+
                '<li><a data-ajax href="/admin">管理端首页</a></li>'+
                '<li> > </li>'+
                '<li><a data-ajax href="/admin/game">比赛管理列表页</a></li>'+
                '</ul>'+
                '</div>'+
                '<div class="gameManage-Frame">'+
                '<div class="gameManage-contentBox">'+
                nav_html+
                '<div class="gameManage-gameDetail">'+
                '<ul class="gameDetail">'+
                '<li class="gameItem">'+
                '<div class="game-header">选择游戏</div>'+
                '<ul class="game-content game-pics">'+
                games_html+
                '</ul>'+
                '</li>'+
                '<li class="gameItem">'+
                '<div class="game-header">比赛信息</div>'+
                '<ul class="game-content game-infos">'+
                '<li class="game-info">'+
                '<div class="game-info-name">比赛名称</div>'+
                '<input type="text"  class="title" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">总人数</div>'+
                '<input type="text"  class="number" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">报名所需萤火</div>'+
                '<input type="text"  class="registerFire" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">报名时间<span></span></div>'+
                '<input type="text" class="registerTime" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">签到时间</div>'+
                '<input type="text"  placeholder="比赛前：30分钟"  class="signinTime" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">比赛开始时间</div>'+
                '<input type="text" class="matchStart timePick" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info '+hidden_html+'">'+
                '<div class="game-info-name">已签到人数</div>'+
                '<input type="text"  class="signined" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info '+hidden_html+'" >'+
                '<div class="game-info-name">已报名人数</div>'+
                '<input type="text"  class="registered" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info game-bonus">'+
                '<div class="game-info-name">奖励说明</div>'+
                '<textarea class="rewardDescription" '+readonly_html+'></textarea>'+
                '</li>'+
                '<li class="game-info game-bonus game-fireMoney">'+
                '<div class="game-info-name">奖励配置</div>'+
                '<table class="game-table" border="0" cellspacing="0" cellpadding="0">'+
                '<thead>'+
                '<tr>'+
                '<th class="">名次</th>'+
                '<th class="">金钱</th>'+
                '<th class="">萤火</th>'+
                '<th class="">&nbsp;</th>'+
                '</tr>'+
                '</thead>'+
                '<tbody>'+
                '<tr>'+
                '<td colspan ="4"><a  class="addClick">+添加奖金配置</a></td>'+
                '</tr>'+
                '</tbody>'+
                '</table>'+
                '</li>'+
                '</ul>'+
                '</li>'+
                '<li class="gameItem">'+
                '<div class="game-header">比赛规则</div>'+
                '<ul class="game-content game-rules">'+
                '<li class="game-info vsModel">'+
                '<div class="game-info-name">每轮对局赛制</div>'+
                '<select class="VSMode" '+readonly_html+'>'+
                '<option value="-1">请选择</option>'+
                '<option value="BO3">三局两胜</option>'+
                '<option value="BO5">五局三胜</option>'+
                '</select>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">每轮比赛时间</div>'+
                '<input type="text" placeholder="单位：分钟" class="duration" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">每轮间隔时间</div>'+
                '<input type="text" placeholder="单位：分钟" class="intervals" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">ban职业数量</div>'+
                '<input type="text" class="ban" '+readonly_html+'>'+
                '</li>'+
                '<li class="game-info format">'+
                '<div class="game-info-name">赛制</div>'+
                '<label><input  type="radio" value="标准" name="gameFormat" checked>标准</label>'+
                '<label><input  type="radio" value="狂野" name="gameFormat" >狂野</label>'+
                '<label><input  type="radio" value="3" name="gameFormat"><input class="writeAuto"></label>'+
                '</li>'+
                '<li class="game-info gameMode">'+
                '<div class="game-info-name">模式</div>'+
                '<label><input  type="radio" value="single" name="gameMode" checked disabled>单淘汰</label>'+
                '<label><input  type="radio" value="loop" name="gameMode" disabled>循环赛</label>'+
                '</li>'+
                '</ul>'+
                '</li>'+
                '<li class="gameItem">'+
                '<div class="game-header">其他</div>'+
                '<ul class="game-content game-others">'+
                '<li class="game-info">'+
                '<div class="game-info-name">赛事介绍</div>'+
                '<div class="game-info-text">'+
                '<div></div>'+
                '<textarea class="description" '+readonly_html+'></textarea>'+
                '</div>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">特殊规则</div>'+
                '<div class="game-info-text">'+
                '<div></div>'+
                '<textarea class="remark" '+readonly_html+'></textarea>'+
                '</div>'+
                '</li>'+
                '<li class="game-info">'+
                '<div class="game-info-name">比赛说明</div>'+
                '<div class="game-info-text">'+
                '<div></div>'+
                '<textarea class="rule" '+readonly_html+'></textarea>'+
                '</div>'+
                '</li>'+
                '</ul>'+
                '</li>'+
                '</ul>'+
                '<div class="gameDetail-footer">'+
                '<div id="edit_icon" class="gameManage-edit-iconArea">'+
                '<div id="uploadPic" class="pic">'+
                '<p><img src="https://iplaymtg.oss-cn-beijing.aliyuncs.com/yingdiWeb/images/manage_newArticle/addImg.png"></p>'+
                '<p>大小：<4MB<br>尺寸：702*386</p>'+
                '</div>'+
                '<div id="showPic" class="hidden pic">'+
                '<img src="">'+
                '</div>'+
                '</div>'+
                '<button class="createSure">'+btn_html+'</button>'+
                '<div class="gameVisible">'+
                '<span>比赛可见性：</span>'+
                '<label><input  type="radio" value="0" name="gameVisible">不可见</label>'+
                '<label><input  type="radio" value="1" name="gameVisible"  checked>可见</label>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';

            $.gevent.publish('mainPageUpdate',{
                page_id:pageid,
                html:page_html,
                title:'比赛管理-旅法师营地',
                callback: 'admin.game.loadGameDetailPage.callback'
            });
            for (var i = 0; i<2 ;i++){
                sub_view += addSubItem(i);
            }
            $('.game-table tbody').before(sub_view);
            gameId ? editView() : '';
        };

        initModule = function(arg_array,pageid){
            $("html,body").animate({'scrollTop':"0"},0);
            if(configMap.games_list){
                initPageView(pageid);
            }
            else{
                $.get(configMap.java_handler_addr+'match/game',{token:token,size:60,visible:-1},function(data){
                    if(data.success){
                        configMap.games_list = data.game;
                        initPageView(pageid);
                    }
                },'json');
            }
        };

        return{
            initModule:initModule,
            callback:callback,
            initPageView:initPageView
        }
    }());

    loadPlayersPage = (function () {
        var initModule,callback,getConditions,initPageView,loadPlayerContent,playerView, pageNum = 0;

        playerView = function (item) {
            var player_html = '',singed_html,color,phone;
            singed_html = item.signined ? '已经签到' : '还没签到';
            color = item.signined ? '#64AF95' : '#BCBCBC';
            phone = typeof item.phone == 'undefined' ? '暂无': item.phone;
            player_html = String()+
                '<li class="item" data-name="'+item.userName+'" data-userid="'+item.userId+'" data-matchid="'+item.matchId+'">'+
                '<div class="playerPic">'+
                '<img src="'+item.userHead+'">'+
                '<div class="right">'+
                '<div class="name">'+item.userName+'</div>'+
                '<div class="phone hidden">'+phone+'</div>'+
                '</div>'+
                '</div>'+
                '<div class="playerSign flagOk" style="color: '+color+'">'+singed_html+'</div>'+
                '<div class="playerInfo flagOk"><i></i>查看详细信息</div>'+
                '<div class="playerCheck  flagFalse hidden"></div>'+
                '</li>';
            return player_html;
        };

        loadPlayerContent = function (args) {
            var pageAry = {},pageSize;
            pageSize = 16;
            pageAry.pageIndex = typeof args.page == 'undefined' ? 0 : args.page;
            pageAry.pageSize = pageSize;
            args.size = pageSize;
            args.token = web.user.getUser('token');
            $.ajax({
                url:configMap.java_handler_addr+'match/players',
                type:'get',
                dataType:'json',
                data:args,
                success:function(data){
                    if(data.success){
                        var list ,length,player_view = '',match,state,total ;
                        list= data.player;
                        match = data.match;
                        length = list && list.length > 0 ? list.length : 0;
                        total = data.total;
                        state = match.state;
                        pageAry.pageNum = Math.ceil(total/args.size);
                        pageAry.pageTotal = total;
                        if(typeof state!=='undefinded' && state >= 2){
                            $('.deletePlayer').addClass('hidden');
                        }
                        else{
                            $('.deletePlayer').removeClass('hidden');
                        }
                        if(length &&length>0)
                        {
                            for(var i=0; i<length; i++){
                                var item = list[i];
                                player_view += playerView(item);
                            }
                            $('.gameManage-playsList .playsContent').html(player_view);
                            $('.curNum').html(total);
                            $('.pageBox').show();
                            loadPageList(pageAry,args);
                        }
                        else{
                            var nullData = String() +
                                '<li class="item"><div class="null_digital">暂无数据！！！</div></li>';
                            $('.gameManage-playsList .playsContent').html(nullData);
                            $('.curNum').html(0);
                            $('.pageBox').hide();
                        }
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };

        getConditions = function () {
            var args = {};
            args.page = pageNum;
            args.size = configMap.pageSize;
            args.token = web.user.getUser('token');
            args.matchId = parseInt(getGameId().id);
            args.userName = $('.playersSearch input').val();
            loadPlayerContent(args);
        };

        callback = function () {
            var $pageBox,$playsContent;
            $pageBox = $('.pageBox');
            $playsContent = $('.playsContent');
            $('.playsHeader>a').off().on('click',function (event) {
                var $this = $(this);
                if($this.hasClass('cancelDelete')){
                    $this.addClass('hidden');
                    $this.siblings('.confirmDelete').addClass('hidden');
                    $this.siblings('.deletePlayer').removeClass('hidden');
                    $playsContent.find('.item .flagOk').removeClass('hidden');
                    $playsContent.find('.item .flagFalse').addClass('hidden');
                }
                else if($this.hasClass('confirmDelete')){

                }
                else if($this.hasClass('deletePlayer')){
                    $this.addClass('hidden');
                    $this.siblings('a').removeClass('hidden');
                    $playsContent.find('.item .flagOk').addClass('hidden');
                    $playsContent.find('.item .flagFalse').removeClass('hidden');
                }
                configMap.destroyBubble(event);
            });
            $('.playersSearch>a').off().on('click',function () {
                getConditions();
            });
            $playsContent.off('click','.item .playerInfo').on('click','.item .playerInfo',function (event) {
                var $this,userid,matchId,args = {},choose_html = '';
                $this = $(this).closest('.item');
                matchId = $this.attr('data-matchid');
                userid = $this.attr('data-userid');
                args.matchId = matchId;
                args.userId = userid;
                args.token =  web.user.getUser('token');
                $.ajax({
                    url:configMap.java_handler_addr+'match/players/info',
                    type:'get',
                    dataType:'json',
                    data:args,
                    success:function(data){
                        if(data.success){
                            var user = data.playerInfo;
                            var pick = user.pick;
                            var gameName = typeof user.gameName == 'undefined' ? '':user.gameName;
                            var username = !user.username  ? '暂无':user.username;
                            var phone = !user.phone  ? '暂无':user.phone;
                            choose_html = String()+
                                '<div class="gameManage-frame-window">'+
                                '<div class="feedInfo-item">'+
                                '<span>名字:</span>'+
                                '<label>'+username+'</label>'+
                                '</div>'+
                                '<div class="feedInfo-item">'+
                                '<span>手机号:</span>'+
                                '<label>'+phone+'</label>'+
                                '</div>'+
                                '<div class="feedInfo-item">'+
                                '<span>游戏id:</span>'+
                                '<input  type="text"  value="'+gameName+'" class="gameName">'+
                                '</div>'+
                                '<div class="playerBpImgs">'+
                                '</div>';
                            web.modalFrame.showModal({
                                title:'报名信息',
                                content:choose_html,
                                content_width:'800px',
                                initialize_function:function(){
                                    resetModalFrame();
                                    if( typeof pick !='undefined' && pick.bPIcon){
                                        var imgAry,pickIcon,pics,imgs_html='';
                                        pickIcon = pick.bPIcon;
                                        imgAry = 'JSON' in window ? JSON.parse(pickIcon) : eval('(' + pickIcon + ')');
                                        pics = imgAry["pick"];
                                        if(pics){
                                            for (var i = 0;i <pics.length ;i++){
                                                imgs_html += String()+
                                                    '<img src="'+pics[i]+'">';
                                            }
                                            $('.playerBpImgs').html(imgs_html);
                                        }
                                    }
                                },
                                confirm_function:function(){
                                    var params ={},token;
                                    params.token = web.user.getUser('token');
                                    params.matchId = matchId;
                                    params.userId = userid;
                                    params.gameName = $('.feedInfo-item .gameName').val();
                                    $.ajax({
                                        url:configMap.java_handler_addr+'match/players/update',
                                        type:'POST',
                                        dataType:'json',
                                        data:params,
                                        success:function (data) {
                                            if(data.success){
                                                alert('修改信息成功！');
                                            }
                                        }
                                    });
                                    web.modalFrame.closeModal();
                                }
                            });
                        }else{
                            alert(data.msg);
                        }
                    }
                });
                configMap.destroyBubble(event);
            });
            $playsContent.off('click','.item .playerCheck').on('click','.item .playerCheck',function (event){
                var curState,$this,confirmFlag,name,userid,token,matchId,args={};
                $this = $(this).closest('.item');
                name = $this.attr('data-name');
                userid = $this.attr('data-userid');
                matchId = $this.attr('data-matchid');
                args.token = web.user.getUser('token');
                args.matchId = parseInt(matchId);
                args.userId = parseInt(userid);
                args.visible = 0;
                confirmFlag = confirm('确认删除该选手吗？');
                if(confirmFlag){
                    $.ajax({
                        url:configMap.java_handler_addr+'match/register/visible',
                        type:'post',
                        dataType:'json',
                        data:args,
                        success:function(data){
                            if(data.success){
                                $('.cancelDelete').addClass('hidden');
                                getConditions();
                            }else{
                                alert(data.msg);
                            }
                        }
                    });
                }

                configMap.destroyBubble(event);
            });
            $pageBox.off('click','.pageList>li>a').on('click','.pageList>li>a',function (event) {//页码跳转
                event.preventDefault();
                $(this).parent().siblings().hasClass('currentPage') ?  $(this).parent().siblings().removeClass('currentPage'):null;
                $(this).parent().hasClass('pageFirst') ? $(this).parent().next().addClass('currentPage') : $(this).parent().addClass('currentPage');
                pageNum = $(this).parent().data('page');
                getConditions();
            });
        };

        initPageView = function(pageid ){
            var gameId,gameTitle = '',nav_html = '';
            gameId = getGameId().id;
            gameTitle = configMap.gameTitle;
            if(gameId){
                nav_html = String()+
                    '<div class="gameManage-navigation">'+
                    '<a  data-ajax href="/admin/game/create/'+gameTitle+'_'+gameId+'"><span>比赛信息</span></a>'+
                    '<a data-ajax href="/admin/game/against/'+gameId+'"><span>对阵信息</span></a>'+
                    '<a class="active" data-ajax href="/admin/game/players/'+gameId+'"><span>参赛选手</span></a>'+
                    '</div>';
            }
            var page_html = String()+
                '<div class="manage-content-box">'+
                '<div class="manage-headmenu-list">'+
                '<ul id="manage-headmenu-ul">'+
                '<li><a data-ajax href="/admin">管理端首页</a></li>'+
                '<li> > </li>'+
                '<li><a data-ajax href="/admin/game">比赛管理列表页</a></li>'+
                '</ul>'+
                '</div>'+
                '<div class="gameManage-Frame">'+
                '<div class="gameManage-contentBox">'+
                nav_html+
                '<div class="gameManage-playsList">'+
                '<div class="playsHeader">'+
                '<div>参赛选手(<span class="curNum">0</span>人)</div>'+

                /*'<a class="confirmDelete hidden">确认删除</a>'+*/
                '<div class="playersSearch"><input type="text" placeholder="寻找选手"><a>搜索</a></div>'+
                '<a class="cancelDelete hidden">取消</a>'+
                '<a class="deletePlayer">删除参赛选手</a>'+
                '</div>'+
                '<ul class="playsContent">'+
                '</ul>'+
                '</div>'+
                '<div class="pageBox">'+
                '<ul class="pageList"></ul>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';

            $.gevent.publish('mainPageUpdate',{
                page_id:pageid,
                html:page_html,
                title:'比赛管理-旅法师营地',
                callback: 'admin.game.loadPlayersPage.callback'
            });
            getConditions();
        };

        initModule = function(arg_array,pageid){
            $("html,body").animate({'scrollTop':"0"},0);
            initPageView(pageid);
        };

        return{
            initModule:initModule,
            callback:callback,
            initPageView:initPageView
        }
    }());

    loadMatchPage = (function () {
        var initModule,callback,initPageView,loadMatchContent,loadMatchInfoContent,loadMatchView,loadDissenView,checkWordsLength;

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
            var curRound = rounds - index;//当前所剩总轮数
            var curIndex = Math.pow(2,rounds) - Math.pow(2,curRound);//当前开始坐标
            var count = Math.pow(2,(curRound-1));//第一轮总数据
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
            $('#againstTable>svg').animate({"height":height,"width":width},10);
            $('.againstContent').animate({"height":height},10);

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

                    /* console.log(i,curCount+j+curIndex,curIndex,curCount,curRound);*/

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
                        obj = {matchInfo:[{userId:userId1,userName:item.userName1,userScore1:item.userScore11,userScore2:item.userScore12},
                                {userId:userId2,userName:item.userName2,userScore1:item.userScore21,userScore2:item.userScore22}],id:id};
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

        loadDissenView = function (data) {
            var token,userId1,userId2,userName1,userName2,userScore11,userScore12,userScore21,userScore22,VSId, args = {},params = {},matchInfo;
            data = 'JSON' in window ? JSON.parse(data) : eval('(' + data + ')');
            matchInfo = data["matchInfo"];
            userId1 = matchInfo[0].userId;
            userId2 =  matchInfo[1].userId;
            userName1 =  matchInfo[0].userName;
            userName2 =  matchInfo[1].userName;
            userScore11 = matchInfo[0].userScore1;
            userScore12 = matchInfo[0].userScore2;
            userScore21 = matchInfo[1].userScore1;
            userScore22 = matchInfo[1].userScore2;
            VSId = data["id"];
            token = web.user.getUser('token');
            args.token = token;
            args.VSId = VSId;
            args.userId = userId1;
            params.token = token;
            params.VSId = VSId;
            params.userId = userId2;
            $.ajax({
                url:configMap.java_handler_addr+'match/appeal/get',
                type:'get',
                dataType:'json',
                data:args,
                success:function(data){
                    if(data.success){
                        var appeal = data.appeal;
                        if(typeof appeal != 'undefined'){
                            var imgs ,description ,img_html = '';
                            description = appeal.description;
                            imgs = appeal.imgs;
                            imgs = imgs ? imgs.split(';') : 0;
                            if(imgs.length>0){
                                for(var i = 0 ; i < imgs.length ;i++){
                                    img_html += String()+
                                        '<img src="'+imgs[i]+'">';
                                }
                            }
                            $('.info1 .info').html(description);
                            $('.info1 .pics').html(img_html);
                            $('.player1').addClass('active');
                            $('.player2').removeClass('active');
                            $('.scores .score1').val(userScore11);
                            $('.scores .score2').val(userScore12);
                        }

                    }else{
                        alert(data.msg);
                    }
                }
            });
            $.ajax({
                url:configMap.java_handler_addr+'match/appeal/get',
                type:'get',
                dataType:'json',
                data:params,
                success:function(data){
                    if(data.success){
                        var appeal = data.appeal;
                        if(typeof appeal != 'undefined'){
                            var imgs ,description ,img_html = '';
                            description = appeal.description;
                            imgs = appeal.imgs;
                            imgs = imgs ? imgs.split(';') : 0;
                            if(imgs){
                                for(var i = 0 ; i < imgs.length ;i++){
                                    img_html += String()+
                                        '<img src="'+imgs[0]+'">';
                                }
                            }
                            $('.info2 .info').html(description);
                            $('.info2 .pics').html(img_html);
                            $('.player1').removeClass('active');
                            $('.player2').addClass('active');
                            $('.scores .score1').val(userScore21);
                            $('.scores .score2').val(userScore22);
                        }
                    }else{
                        alert(data.msg);
                    }
                }
            });
            var diss_html  = String()+
                '<div class="gameManage-frame-window">'+
                '<div class="gameManage-dissenContent">'+
                '<ul class="header">'+
                '<li class="item player1 active">'+userName1+'</li>'+
                '<li class="item player2">'+userName2+'</li>'+
                '</ul>'+
                '<div class="letterPlayer" style="cursor: pointer">'+
                '<i></i>'+
                '<span>私信该选手</span>'+
                '</div>'+
                '<div class="dissenInfo info1">'+
                '<div class="info"></div>'+
                '<div class="pics"></div>'+
                '</div>'+
                '<div class="dissenInfo info2 hidden">'+
                '<div class="info"></div>'+
                '<div class="pics"></div>'+
                '</div>'+
                '<div class="footer">'+
                '<div class="name">'+
                '<span class="name1">'+userName1+'</span>'+
                '<span class="name2">'+userName2+'</span>'+
                '</div>'+
                '<div class="scores">'+
                '<input type="text" class="score1" value="'+userScore11+'">'+
                '<div>3局2胜</div>'+
                '<input type="text" class="score2" value="'+userScore12+'">'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';
            web.modalFrame.showModal({
                title:'比赛纠纷',
                content:diss_html,
                content_width:'1200px',
                initialize_function:function(){
                    $('.utility-model-modelBody').css('border-radius','6px');
                    $('.utility-model-modelHeader').css('border','none');
                    $('.utility-model-modelContent').css({'margin-bottom':'15px','border-top':'1px solid #e7e7e7'});
                    $('.utility-model-modelFooter').css({'text-align':'center'});
                    $('.utility-model-modelFooter>.utility-model-confirmButton').css({'background-color':'#3b68b8','border-radius':'3px',
                        'width':'253px','height':'38px','float':'initial','font-size':'18px'});
                    $('.gameManage-dissenContent .header .item').off().on('click',function () {
                        var $this = $(this);
                        $this.siblings().hasClass('active') ?  $this.siblings().removeClass('active'):'';
                        $this.hasClass('active') ? '' : $this.addClass('active');
                        if($this.hasClass('player1')){
                            $('.info1').removeClass('hidden');
                            $('.info1').siblings('.dissenInfo ').addClass('hidden');
                            $('.scores .score1').val(userScore11);
                            $('.scores .score2').val(userScore12);
                        }
                        else{
                            $('.info2').removeClass('hidden');
                            $('.info2').siblings('.dissenInfo ').addClass('hidden');
                            $('.scores .score1').val(userScore21);
                            $('.scores .score2').val(userScore22);
                        }
                    });
                    $('.letterPlayer').off().on('click',function () {
                        $('.my-chat-box-right-mainContent').bind("mousehover",function(e){
                            return false;
                        });
                        var userid,$item;
                        $item = $('.gameManage-dissenContent .header .active');
                        if($item.hasClass('player1')){
                            userid = userId1;
                        }
                        else{
                            userid = userId2;
                        }
                        web.modalFrame.closeModal();
                        web.chitchat.initChatWindow.init({
                            friendId:userid
                        });
                    });
                },
                confirm_function:function(){
                    var obj = {};
                    obj.token = token;
                    obj.VSId = VSId;
                    obj.userScore1 = $('.scores .score1').val();
                    obj.userScore2 = $('.scores .score2').val();
                    $.ajax({
                        url:configMap.java_handler_addr+'match/VS/update/score',
                        type:'post',
                        dataType:'json',
                        data:obj,
                        success:function(data){
                            if(data.success){
                                alert('修改成功');
                                loadMatchInfoContent();
                                web.modalFrame.closeModal();

                            }else{
                                alert(data.msg);
                            }
                        }
                    });
                }
            });
        };

        loadMatchContent = function (rounds) {
            var args = {};
            args.token = web.user.getUser('token');
            args.matchId = getGameId().id;
            $.ajax({
                url:configMap.java_handler_addr+'match/VS/list',
                type:'get',
                dataType:'json',
                data:args,
                success:function(data){
                    if(data.success){
                        var matchList,index = 0;
                        matchList = data.matchVS;
                        loadMatchView(index,rounds,matchList);
                        if(matchList.length>0){
                            $('.againstHeader label>span').html(timeFormat(matchList[matchList.length-1].vSOver,'yyyy/MM/dd hh:mm'));
                        }
                        else{
                            $('.againstHeader label>span').html('暂无数据');
                        }

                        var $rect = $('.warn');
                        $rect.off().on('click',function(event){
                            var $this = $(event.target);
                            var data = $this.attr("class");
                            data = data.replace('warn className','');
                            loadDissenView(data);
                        });

                        $('.againstFold span').off().on('click',function () {
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
                                    index = rounds -1;
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

                        var ele = document.getElementById('againstTable');
                        new Drag(ele);
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };

        loadMatchInfoContent = function () {
            var gameId,token;
            gameId = getGameId().id;
            token = web.user.getUser('token');
            $.ajax({
                url:configMap.java_handler_addr+'match/get',
                type:'get',
                dataType:'json',
                data:{token:token,id:gameId},
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
                                header_html = '比赛开始，第'+roundState+'轮结束时间：<span></span>';
                            }
                            $('.againstHeader label').html(header_html);
                            $('.againstWarning').addClass('hidden');
                            $('.againstFold').removeClass('hidden');
                            loadMatchContent(rounds);
                        }
                    }else{
                        alert(data.msg);
                    }
                }
            });
        };

        callback = function () {};

        initPageView = function(pageid ){
            var gameId,gameTitle = '',nav_html = '';
            gameId = getGameId().id;
            gameTitle = getGameId().title;
            if(gameId){
                nav_html = String()+
                    '<div class="gameManage-navigation">'+
                    '<a  data-ajax href="/admin/game/create/'+gameTitle+'_'+gameId+'"><span>比赛信息</span></a>'+
                    '<a class="active" data-ajax href="/admin/game/against/'+gameId+'"><span>对阵信息</span></a>'+
                    '<a  data-ajax href="/admin/game/players/'+gameId+'"><span>参赛选手</span></a>'+
                    '</div>';
            }
            var page_html = String()+
                '<div class="manage-content-box">'+
                '<div class="manage-headmenu-list">'+
                '<ul id="manage-headmenu-ul">'+
                '<li><a data-ajax href="/admin">管理端首页</a></li>'+
                '<li> > </li>'+
                '<li><a data-ajax href="/admin/game">比赛管理列表页</a></li>'+
                '</ul>'+
                '</div>'+
                '<div class="gameManage-Frame">'+
                '<div class="gameManage-contentBox">'+
                nav_html+
                '<div class="gameManage-againstContent">'+
                '<div class="againstHeader">'+
                '<label>"确认参赛"阶段完成后，系统将自动为您生成对阵图</label>'+
                '</div>'+
                '<div class="againstFold hidden"><span class="increase">上一轮</span><span class="reduce active">下一轮</span></div>'+
                '<div class="againstContent">'+
                '<div class="againstWarning hidden">'+
                '<label>"确认参赛"阶段结束时间：<span class="time">2017/12/12</span></label>'+
                '</div>'+
                '<div id="againstTable"></div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>';

            $.gevent.publish('mainPageUpdate',{
                page_id:pageid,
                html:page_html,
                title:'比赛管理-旅法师营地',
                callback: 'admin.game.loadMatchPage.callback'
            });
            loadMatchInfoContent();
        };

        initModule = function(arg_array,pageid){
            $("html,body").animate({'scrollTop':"0"},0);
            initPageView(pageid);
        };

        return{
            initModule:initModule,
            callback:callback,
            initPageView:initPageView
        }
    }());

    /*endregion*/

    onUrlChange = function(arg_array,pageid) {
        if(arg_array.length == 0){
            loadGameListPage.initModule(arg_array,pageid);
        }
        if(arg_array.length==1){
            switch(arg_array[0]){
                case 'create':
                    loadGameDetailPage.initModule(arg_array,pageid);
                    break
            }

        }
        if(arg_array.length ==2){
            switch(arg_array[0]){
                case 'create':
                    loadGameDetailPage.initModule(arg_array,pageid);
                    break;
                case 'players':
                    loadPlayersPage.initModule(arg_array,pageid);
                    break;
                case 'against':
                    loadMatchPage.initModule(arg_array,pageid);
                    break;
            }
        }

    };

    initModule = function (arg_array,pageid) {
        var token = web.user.getUser('token');
        if(token){
            onUrlChange(arg_array,pageid);
        }
        else{
            web.user.toLogin();
        }
    };

    return {
        initModule:initModule,
        loadGameListPage:loadGameListPage,
        loadGameDetailPage:loadGameDetailPage,
        loadPlayersPage:loadPlayersPage,
        loadMatchPage:loadMatchPage
    }

}());
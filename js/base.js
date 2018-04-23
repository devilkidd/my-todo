// ;结束之前的内容,提高容错率
// 匿名函数包裹代码,避免污染
; (function () {
    'use strict';
    var $form_add_task = $('.add-task'),
        $task_delete_trigger,      
        $task_detail_trigger,
        $task_detail=$('.task-detail'),
        $task_detail_mask=$('.task-detail-mask'),    
        task_list = {},
        $task_item,
        $checkbox_complete,
        current_index,
        $update_form_button,
        $task_detail_content,
        $task_detail_content_input,
        $msg=$('.msg'),
        $msg_content=$msg.find('.msg-content'),
        $msg_confirm=$msg.find('.msg_confirm'),
        $alerter=$('.alerter');

    init();
    function listen_msg_event(){
        $msg_confirm.click(function(){
            hide_msg();
        })
    }

    //点击mask隐藏任务详情
    $('.task-detail-mask').click(function () {
        hide_task_detail();
    })   
    //点击提交任务按钮
    $('.submit-task').click(function (e) {
        //注意该变量的作用域问题
        var new_task = {};
        //阻止默认行为
        e.preventDefault();
        // e.stopPropagation();
        //获取新task的值
        var $input = $(this).siblings('input[name=content]');
        new_task.content = $input.val();
        //验证new_task.content是否存在
        if (!new_task.content) return;
        //添加新任务 

        if (add_task(new_task)) {
            //清空输入框
            $input.val('');
        }
    })
    //回车提交任务
    $('.add-task-content').keyup(function (e) {
        //注意该变量的作用域问题
        if(e.keyCode!==13) return;
        var new_task = {};
        //阻止默认行为
        e.preventDefault();
        // e.stopPropagation();
        //获取新task的值
        var $input = $(this);
        new_task.content = $input.val();
        //验证new_task.content是否存在
        if (!new_task.content) return;
        //添加新任务 
        if (add_task(new_task)) {
            //清空输入框
            $input.val('');
        }
    })
    //监听删除任务事件
    function listen_task_delete() {
        //点击删除按钮
        $task_delete_trigger.click(function () {
            var $this=$(this)
            var index = $this.parents('.task-item').data('index');
            var tmp = confirm('确定该删除吗?');
            tmp ? delete_task(index) : null;
        })
    }

    //监听详情任务事件
    function listen_task_detail() {
        //点击详情按钮
        $task_detail_trigger.click(function () {
            var $this=$(this);
            var index = $this.parents('.task-item').data('index');
            show_task_detail(index);
        })
        // 双击任务
        $task_item.dblclick(function () {
            var $this=$(this);
            var index = $this.data('index');
            show_task_detail(index);
        })
    }
    //监听任务前面的checkbox
    function listen_checkbox_complete() {
        //点击checkbox事件
        $checkbox_complete.click(function(){
            var $this=$(this),
                index=$this.parents('.task-item').data('index'),       
                item=get(index);
            if(item.complete){
                update_task(index,{complete:false});
            }else{
                update_task(index,{complete:true});
            }        
            // console.log(item);        
        })

    }
    function get(index){
        return store.get("task_list")[index];
    }

    //显示任务详情窗口
    function show_task_detail(index) {
        // 渲染任务详情窗口
        render_task_detail(index);
        current_index=index;
        $task_detail.show(index);
        $task_detail_mask.show();
        
    }
    function update_task(index,data) {    
        if(index===undefined||!task_list[index]) return; 
        task_list[index]=$.extend({},task_list[index],data); 
        // console.log(task_list[index])       
        refresh_task_list();
    }
    function hide_task_detail() {
        $task_detail.hide();
        $task_detail_mask.hide();
        
    }

    //添加新任务方法
    function add_task(new_task) {
        //将新任务推入任务列表
        task_list.push(new_task);
        refresh_task_list();
        //保存任务列表
        return true;
    }

    //删除一条任务
    function delete_task(index) {
        //没有index或任务列表中index不存在 则返回
        if (index === undefined || !task_list[index]) return;
        //删除task_list中的指定任务
        delete task_list[index];
        refresh_task_list();
    }
    //更新localstorage并重新渲染html
    function refresh_task_list() {
        store.set('task_list', task_list);
        render_task_list();
    }
    //渲染任务列表方法
    function render_task_list() {
        var $task_list = $('.task-list');
        var complete_items=[];
        //渲染前清空任务列表
        $task_list.html('');
        for (var i = 0; i < task_list.length; i++) {
            var item=task_list[i];
            if(item&&item.complete){
                complete_items[i]=item;
            }else{
                var $task = render_task_item(item, i);
                $task_list.prepend($task);
            }
        }
        
        for (var j = 0; j < complete_items.length; j++) {
            // if(!item) continue;              
            // $task.addClass('completed');
            $task = render_task_item(complete_items[j], j);
            if(!$task) continue; 
            $task.addClass('completed');
            $task_list.append($task);
        }
        //渲染后获取删除/详情按钮
        $task_delete_trigger = $('.action.delete');        
        $task_detail_trigger = $('.action.detail');
        //获取task_item
        $task_item=$('.task-item');
        //获取任务前的checkbox
        $checkbox_complete=$('.task-item .complete');
        //每次渲染后重新绑定删除/详情事件
        listen_task_delete();
        listen_task_detail();
        listen_checkbox_complete();
    }
    //生成一条任务模版
    function render_task_item(data, index) {
        if (!data || index===undefined) return;
        var list_item_tpl =
            '<div class="task-item" data-index="' + index + '">' +
            '<input type="checkbox" '+(data.complete?'checked':'')+' class="complete" >' +
            '<span class="task-content">' + data.content + '</span>' +
            '<span class="fr">' +
            '<span class="action delete"> 删除</span>' +
            '<span class="action detail"> 详细</span>' +
            '</span>' +
            '</div>';
        return $(list_item_tpl);
    }
    //渲染任务详情窗口的方法
    function render_task_detail(index){
        if(index===undefined||!task_list[index]) return;
        var item=task_list[index];
        var tpl='<form>'+
        '<div class="input-item">'+
        '<div class="task_detail_content" name="content">'+item.content+'</div>'+
        '<input style="display:none" class="task_detail_content_input" type="text" name="content" value="'+(item.content||'')+'">'+
        '</div>'+
        '<div class="desc input-item">'+
        //item.desc||''  item.desc为undefined转化为空字符串
        '<textarea name="desc" class="desc-con">'+(item.desc||'')+'</textarea>'+
        '</div>'+
        '<div class="remind input-item">'+
        '<label>提醒时间</label>'+
        '<input class="datetime" type="text" name="remind_date" value="'+(item.remind_date||'')+'">'+
        '</div>'+
        '<button type="submit" class="update-form-button input-item">更新</button>'+
        '</form>';
        $task_detail.html('');
        $task_detail.html(tpl);
        $('.datetime').datetimepicker();
        //获取更新按钮
        $update_form_button=$('.update-form-button');
        $task_detail_content=$('.task_detail_content');
        $task_detail_content_input=$('.task_detail_content_input');
        //双击标题事件
        $task_detail_content.dblclick(function () {
            $task_detail_content_input.show();
            $task_detail_content.hide();
        })
        //点击更新的事件
        $update_form_button.click(function(e){
            
            var data={};
            e.preventDefault();
            //获取任务详情里的数据
            var $this=$(this);

            data.content=$this.siblings('.task_detail_content_input').val();
            data.desc=$this.siblings('.desc').children('.desc-con').val();
            data.remind_date=$this.siblings('.remind').children('[name=remind_date]').val();
            update_task(index,data);
            hide_task_detail();
        })

    }
    function task_remind_check() {
        var current_timestamp,task_timestamp;
        var itl=setInterval(function(){
            for (var i=0;i<task_list.length;i++) {
                var item=get(i);
                if (!item||!item.remind_date||item.informed) 
                    continue;
                current_timestamp=(new Date()).getTime();
                task_timestamp=(new Date(item.remind_date)).getTime();  
                if(current_timestamp-task_timestamp>=1)   {
                    update_task(i,{informed:true});
                    show_msg(item.content);
                }   
            }
        },500);
    }
    function show_msg(msg) {
        if(!msg) return;
        $msg_content.html(msg);
        $msg.show();
        $alerter.get(0).play();
    }
    function hide_msg() {
        $msg.hide();
    }
    //初始化task_list
    //从localstorage中取到task_list并保存
    function init() {
        task_list = store.get('task_list') || [];
        //页面打开时渲染任务列表
        if (task_list.length) {
            render_task_list();
        }
        listen_msg_event();
        task_remind_check();
    }
})();
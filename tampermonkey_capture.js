// ==UserScript==
// @name         org-capture-bookmark-tags
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.google.com/
// @include       *
// @grant        none
// ==/UserScript==
(function() {
    'use strict'; // Your code here...
    window.onload = function () {
        // 传输协议
        var protocol = "capture";
        // 使用的capture 模板
        var template = {
            unselected: "pb",
            selected: "pn",
        };
        // 预定义的标签
        var tag_data = {
            classify: ["learn", "book","play", "game", "music", "movie", "other"],
            code: ["python", "golang", "javascript", "Elisp", "C", "C#", "C++"],
            editer: ["vim", "emacs", "vscode"],
            score: ["bad", "not_bad", "good", "very_good", "nonsuch"]
        };
        // 此处设定快捷键,前置键为Shift+Alt
        var keybinds = {
            // 使用tag面板
            use_tag_panel:{key:"W",func:on},
            // 使用浏览器自带弹窗,此方式只能手动输入tag
            use_prompt:{key:"U",func:showPrompt},
            // 直接生成没有tag的书签
            send_to_emacs:{key:"Y",func:sendData},
        };
        // 是否使用新版的链接格式
        var useNewStyleLinks = true;
        // 默认使用不选中页面内容的模板
        var temp = template.unselected;

        var selection_tag = "";
        var selectcontent="";

        // 生成html 代码
        var outer_id = "org-capture-extension-overlay";
        var inner_id = "org-capture-extension-text";
        if (!document.getElementById(outer_id)) {
            var outer_div = document.createElement("div");
            outer_div.id = outer_id;
            var inner_div = document.createElement("div");
            inner_div.id = inner_id;
            if (JSON.stringify(tag_data) != "{}") {
                for (var i in tag_data) {
                    var p = document.createElement("p");
                    p.className = "ps";
                    p.innerHTML = i + ":";
                    for (var j in tag_data[i]) {
                        var sp = document.createElement("span");
                        sp.innerHTML = tag_data[i][j];
                        sp.className = "ss";
                        var cb = document.createElement("input");
                        cb.type = "checkbox";
                        cb.name = "box";
                        cb.value = tag_data[i][j];
                        cb.className = "cs";
                        sp.appendChild(cb);
                        p.appendChild(sp);
                    }
                    inner_div.appendChild(p);
                }
            }
            var p1 = document.createElement("p");
            p1.className = "ps";
            p1.innerHTML = "Manual:";
            var text = document.createElement("input");
            text.type = "text";
            text.id = "text";
            text.className = "ts";
            p1.appendChild(text);
            inner_div.appendChild(p1);
            var btn_ok = document.createElement("span");
            btn_ok.id = "btn_ok";
            btn_ok.innerHTML = "submit";
            var btn_cancel = document.createElement("span");
            btn_cancel.id = "btn_cancel";
            btn_cancel.innerHTML = "cancel";
            inner_div.appendChild(btn_ok);
            inner_div.appendChild(btn_cancel);
            outer_div.appendChild(inner_div);
            document.body.appendChild(outer_div);
            var css = document.createElement("style");
            css.type = "text/css";
            css.innerHTML = `.ts {position: relative;left: 15px;}#org-capture-extension-overlay { position: fixed; display: none; width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.2); z-index: 104; } .ps{ font-size:20px; color:blue; } .ss{display: unset; padding-left: 15px; font-size: 18px; background-image: initial; color: black;} .cs{ vertical-align:middle; margin-left: 5px;} #btn_ok{ font-size: 18px; padding: 6px; border-radius: 10px; color: white; background: green; position: absolute; bottom: 13%; left:20%} #btn_ok:hover { background: chartreuse; } #btn_cancel{ left: 55%;font-size: 18px; padding: 6px; border-radius: 10px; color: white; background: dimgray; position: absolute; bottom: 13%; left:40%; } #btn_cancel:hover { background: red; } #org-capture-extension-text{ position: absolute; top: 50%; left: 50%; font-size: 20px; color: black; transform: translate(-50%,-50%); background: navajowhite; padding: 55px 55px 100px 55px; border-radius: 30px; }`;
            document.body.appendChild(css);
        }

        // 绑定 button 事件
        document.getElementById('btn_cancel').addEventListener('click', off);
        document.getElementById('btn_ok').addEventListener('click', btn_submit);

        // 提交btn 事件
        function btn_submit() {
            var str = document.getElementsByName("box");
            var tbx = document.getElementById("text");
            // 取出文本框中的值
            var tbx_value = tbx.value;

            var chestr = [];
            // 取出选中的checkbox 的值
            for (var i = 0; i < str.length; i++) {
                if (str[i].checked == true) {
                    chestr.push(str[i].value + ":");
                    str[i].checked=false;
                }
            }

            // 整理数据
            if (chestr.length > 0 || tbx_value.length > 0) {
                chestr.unshift(":");
                if (tbx_value.length > 0) chestr.push(tbx_value.replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, ":") + ":");
                selection_tag = chestr.join("");
            }
            sendData();
            tbx.value="";
            off();
        };
        // 发送数据
        function sendData(){
            var f= "";
            var title= document.title.length>70 ? document.title.slice(0,65)+"..." : document.title;
            // 判断页面中是否有选中内容，如果有，则添加内容，切换模板
            if (selectcontent) {
                selection_tag = selection_tag + "\r\n" + selectcontent;
                temp = template.selected;
            }
            // 判断是否使用新风格的链接
            if (useNewStyleLinks) {
                f = "org-protocol://" + protocol + "?template=" + encodeURIComponent(temp) + '&url=' + encodeURIComponent(location.href) + '&title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(selection_tag);
            }
            else{
                f = "org-protocol://"+protocol+":/"+encodeURIComponent(temp)+'/'+encodeURIComponent(location.href) +'/'+encodeURIComponent(document.title)+'/'+encodeURIComponent(selection_tag);
            }
            location.href = f;
            initData();
        }
        function showPrompt(){
            selection_tag = ":"+prompt("请输入Tag:").replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, ":") + ":";
            if (selection_tag=="::") selection_tag="";
            sendData();
        }
        // 初始化全局变量
        function initData(){
            selection_tag="";
            selectcontent="";
            temp = template.unselected;
        };
        function on() {
            document.getElementById(outer_id).style.display = "block";
            document.getElementById('text').focus();
        };
        function off() {
            document.getElementById(outer_id).style.display = "none";
        };
        // 绑定快捷键
        document.onkeydown = keybind;
        function keybind(e) {
            // 获取当前页面选中内容
            selectcontent=document.getSelection().toString();
            for (var i in keybinds){
                if (e.shiftKey && e.altKey && e.keyCode == keybinds[i].key.charCodeAt()) {
                    e.preventDefault();
                    keybinds[i].func();
                }
            }
            if (e.keyCode==13){
                if (document.getElementById(outer_id).style.display=="block") btn_submit();
            }
            else if (e.keyCode==27){
                off();
            }
        }

    }();
})();

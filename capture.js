javascript: void((function () {
    var protocol = "capture";
    var template = {
        unselected: "pb",
        selected: "pn",
    };

    var tag_data = {
        classify: ["learn", "book","play", "game", "music", "movie", "other"],
        code: ["python", "golang", "javascript", "Elisp", "C", "C#", "C++"],
        editer: ["vim", "emacs", "vscode"],
        score: ["bad", "not_bad", "good", "very_good", "nonsuch"]
    };

    var useNewStyleLinks = true;

    var temp = template.unselected;

    var usefunc = "use_prompt";

    var selection_tag = "";
    var selectcontent=document.getSelection().toString();

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

    document.getElementById('btn_cancel').addEventListener('click', off);
    document.getElementById('btn_ok').addEventListener('click', btn_submit);

    function btn_submit() {
        var str = document.getElementsByName("box");
        var tbx = document.getElementById("text");
        var tbx_value = tbx.value;

        var chestr = [];
        for (var i = 0; i < str.length; i++) {
            if (str[i].checked == true) {
                chestr.push(str[i].value + ":");
                str[i].checked=false;
            }
        }

        if (chestr.length > 0 || tbx_value.length > 0) {
            chestr.unshift(":");
            if (tbx_value.length > 0) chestr.push(tbx_value.replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, ":") + ":");
            selection_tag = chestr.join("");
        }
        sendData();
        tbx.value="";
        off();
    };
    function sendData(){
        var f= "";
        if (selectcontent) {
            selection_tag = selection_tag + "\r\n" + selectcontent;
            temp = template.selected;
        }
        if (useNewStyleLinks) {
            f = "org-protocol://" + protocol + "?template=" + encodeURIComponent(temp) + '&url=' + encodeURIComponent(location.href) + '&title=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent(selection_tag);
        }
        else{
            f = "org-protocol://"+protocol+":/"+encodeURIComponent(temp)+'/'+encodeURIComponent(location.href) +'/'+encodeURIComponent(document.title)+'/'+encodeURIComponent(selection_tag);
        }
        location.href = f;
        initData();
    }
    function initData(){
        selection_tag="";
        selectcontent="";
        temp = template.unselected;
    };

    document.onkeydown = keybind;
    function keybind(e) {
        if (e.keyCode==13){
            if (document.getElementById(outer_id).style.display=="block") btn_submit();
        }
        else if (e.keyCode==27){
            off();
        }
    }

    function showPrompt(){
        selection_tag = ":"+prompt("请输入Tag:").replace(/^ +/, "").replace(/ +$/, "").replace(/ +/g, ":") + ":";
        sendData();
    }
    function on() {
        document.getElementById(outer_id).style.display = "block";
        document.getElementById('text').focus();
    };
    function off() {
        document.getElementById(outer_id).style.display = "none";
    };

    switch(usefunc){
    case "use_tag_panel":
        on();
        break;
    case "use_prompt":
        showPrompt();
        break;
    case "send_to_emacs":
        sendData();
    }
})());

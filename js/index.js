/*
 * @Author: https://www.bajins.com
 * @Date: 2021-01-21 08:51:40
 * @LastEditTime: 2021-01-21 10:40:36
 * @LastEditors: Please set LastEditors
 * @Description: 主页js
 * @FilePath: index.js
 */

$(document).ready(function () {
    // 点击历史记录按钮
    $("#history .slide").click(function () {
        getLocalHistory();
        if ($("#history ul li").length == 0) {
            myalert("暂无记录", "info");
            return false;
        }
        $("#history ul").slideToggle();
        clickpre();
        $("#history .slide span").toggleClass("reverse").toggleClass("upright");
        $("#history .clearHistory").click(function () {
            Swal.fire({
                title: '警告',
                text: "确定清空最近记录吗?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: '确定',
                cancelButtonColor: '#d33',
                cancelButtonText: "取消",
                focusCancel: true, // 是否聚焦 取消按钮
                reverseButtons: false  // 是否反转两个按钮的位置，默认：左边-确定，右边-取消
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.setItem("keyWord", "");
                    $("#history ul").html("");
                    $("#history ul").slideToggle();
                    myalert("历史记录已清空!", "success");
                }
            });
        });
    });

    // 点击转换按钮
    $(".zhuanhuan").click(function () {
        $("#history ul").slideUp();
        text = $("#text").val();

        if (getStringLength(trimStr(text)) <= 140) {
            myalert("您的内容太少不需要转换，直接发不会折叠哈", "info");
            return false;
        } else {
            addHistory("#history ul", text);
            startZh(text, ".zhuanhuan");
        }
    });

    // 点击清空按钮
    $("#clear").click(function () {
        $("#history ul").slideUp();
        text = "";
        $("#text").val("");
        $("#text").focus();
    });

    //导航切换:不折叠输入法
    $("#pyqbzd").click(function () {
        $(this).addClass("index");
        $("#hyzt").removeClass("index");
        $("#explain").show();
        $("#fonts").hide();
    });

    //导航切换:花样字体
    $("#hyzt,.hyzt").click(function () {
        $("#hyzt").addClass("index");
        $("#pyqbzd").removeClass("index");
        $("#explain").hide();
        $("#fonts").show();
    });

    $("#fonts li").click(function () {
        fontid = $(this).attr("fontid");
        fonttype = $(this).attr("fonttype");
        $("#fonts li").removeClass("selected");
        $(this).addClass("selected");
    });
});


// 获取当前时间
function writeCurrentDate() {
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth() + 1;//得到月份
    var date = now.getDate();//得到日期
    var hour = now.getHours();//得到小时
    var minu = now.getMinutes();//得到分钟
    var sec = now.getSeconds();//得到秒
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;
    return year + "-" + month + "-" + date + " " + hour + ":" + minu + ":" + sec;
}

// 添加历史记录
function addHistory(obj, str) {
    str = '<li><span class="time">' + writeCurrentDate() + '：</span><pre>' + str + '</pre></li>';
    $(obj).prepend(str);
    setLocalHistory(str, 5);
    clickpre();
    if ($("#history li").length >= 4) {
        $("#history li").eq(-1).remove();
    }
}

// 历史记录列表点击
function clickpre() {
    $("#history pre").click(function () {
        var text = $(this).text();
        $("#history pre").removeClass("copypre");
        $(this).addClass("copypre");
        startZh(text, ".copypre");
        $("#text").val(text);
    });
}

function random(m, n) {
    return Math.floor(Math.random() * (m - n) + n);
}

/**
 * 随机生成N位数字(0到9) 获取随机数
 * 
 * @param n 0-9
 */
function getRandomNumber(n) {
    var arr = new Array(n); //用于存放随机数
    var randomNumber = ''; //存放随机数
    for (i = 0; i < arr.length; i++)
        arr[i] = parseInt(Math.random() * 10);
    var flag = 0;
    for (i = 0; i < arr.length - 1; i++) {
        for (j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) {
                flag = 1;
                break;
            }
        }
        if (flag) break;
    }
    for (var i = 0; i < arr.length; i++) {
        randomNumber += arr[i];
    }
    return randomNumber;
}

function getRandomNumberArray(len) {
    let arr = [];
    for (let i = 0, j = Math.ceil(Math.random() * 10); i < j; i++) {
        arr[i] = random(0, len);
    }
    return arr;
}

// 开始转换
function startZh(text, clipboardobj) {
    let strArray = ["\u200D", "\u202A", "\u202B", "\u202C", "\u202D", "\u202E",
        "\u2060", "\u2061", "\u2062", "\u2063", "\u2064", "\u2065", "\u206A",
        "\u206B", "\u206C", "\u206D", "\u206E", "\u206F"];

    let textArry = text.split('');
    for (let i = 0, j = getRandomNumberArray(text.length - 1); i < j.length; i++) {
        let str = escape(strArray[random(0, strArray.length - 1)]);
        textArry.splice(j[i], 0, str);
    }
    $(clipboardobj).attr('data-clipboard-text', unescape(textArry.join('')));

    var myclipboard = new ClipboardJS(clipboardobj);

    myclipboard.on('success', function (e) {
        myalert("转换并复制成功!", "success");
    });

    myclipboard.on('error', function (e) {
        myalert("复制失败，请换个浏览器试一下!", "error");
    });
}

// 提示框
function myalert(text, icon) {
    Swal.fire({
        icon: icon,
        title: "提示",
        text: text,
        timer: 3000,
        showConfirmButton: true,
        footer: icon == "error" ? $("#copyright").html() : null
    });
}

// 去除前后空格及回车
function trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)|(^\r\n)|(\r\n$)/g, "");
}

// 获取字符串长度
function getStringLength(Str) {
    var i, len, code;
    if (Str == null || Str == "") return 0;
    len = Str.length;
    for (i = 0; i < Str.length; i++) {
        code = Str.charCodeAt(i);
        if (code > 255) {
            len += 1
        }
    }
    return len;
}

// 设置历史记录
function setLocalHistory(keyWord, historyCount) {
    var keyWords = localStorage.getItem("keyWord");
    var keyWord = encodeURIComponent(keyWord);
    if (!keyWords) {
        localStorage.setItem("keyWord", keyWord);
    } else {
        var keys = keyWords.split(",");
        for (var i = keys.length - 1; i >= 0; i--) {
            if (keys[i] == keyWord) {
                keys.splice(i, 1);
            }
        }
        keys.push(keyWord);
        if (keys.length >= historyCount) {
            //删除最开始的多余记录
            var count = keys.length - historyCount + 1; //需要删除的个数
            keys.splice(0, count); //开始位置,删除个数
        }
        localStorage.setItem("keyWord", keys.join(','));
    }
}

// 获取历史记录
function getLocalHistory() {
    var keyWords = localStorage.getItem("keyWord");
    if (keyWords) {
        var keys = keyWords.split(",");
        var length = keys.length;
        if (length > 0) {
            $("#history ul").empty();
            var htmlString = "";
            for (var i = length - 1; i >= 0; i--) {
                htmlString += decodeURIComponent(keys[i]);
                htmlString += "…";
            }
            $("#history ul li").remove();
            $("#history ul").append('<div class="clearHistory">清空记录</div>');
            $("#history ul").prepend(htmlString);
        }
    }
}
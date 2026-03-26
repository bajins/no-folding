/*
 * @Author: https://www.bajins.com
 * @Date: 2021-01-21 08:51:40
 * @LastEditTime: 2021-10-21 13:41:28
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

// 开始转换
function startZh(text, clipboardobj) {

    // 1. 空格替换
    text = replaceSpace(text);

    // 2. 同形标点替换
    text = replaceHomoglyphs(text, 0.7);

    // 3. 随机插入零宽字符
    text = antiFoldProcess(text);

    $(clipboardobj).attr('data-clipboard-text', text);

    var myclipboard = new ClipboardJS(clipboardobj);

    myclipboard.on('success', function (e) {
        myalert("转换并复制成功!", "success");
    });

    myclipboard.on('error', function (e) {
        myalert("复制失败，请换个浏览器试一下!", "error");
    });
}

// 定义零宽字符字典
/*
"\u202E", "\u202B" 将字符串反序（反转/翻转）
*/
const zeroWidthChars = [
    // --- 【核心零宽字符】（最安全、肉眼绝对不可见） ---
    "\u200B", // 零宽空格 (Zero-Width Space) - 最常用的混淆符
    "\u200C", // 零宽不连字 (Zero-Width Non-Joiner) - 阻止相邻字符连字
    "\u200D", // 零宽连字 (Zero-Width Joiner) - 强制相邻字符连字（常用于Emoji组合）
    "\ufeff", // 零宽不换行空格 / 字节顺序标记 (BOM)
    "\u2060", // 词语连接符 (Word Joiner) - 零宽度，且阻止在此处换行

    // --- 【不可见的数学/逻辑符号】 ---
    "\u2061", // 函数应用 (Function Application) - 数学不可见字符
    "\u2062", // 不可见乘号 (Invisible Times)
    "\u2063", // 不可见分隔符 (Invisible Separator)
    "\u2064", // 不可见加号 (Invisible Plus)
    "\u2065", // Unicode 预留的未分配控制字符 (Unassigned)

    // --- 【文本方向控制符】（完全不可见，用于控制从左到右或从右到左） ---
    // "\u202A", // 从左至右嵌入 (Left-to-Right Embedding)
    // "\u202C", // 弹出方向格式 (Pop Directional Formatting)
    // "\u202D", // 从左至右覆盖 (Left-to-Right Override)

    // --- 【弃用的格式控制符】（不可见，但不推荐大量使用） ---
    // "\u206A", // 阻止对称交换 (Inhibit Symmetric Swapping)
    // "\u206B", // 激活对称交换 (Activate Symmetric Swapping)
    "\u206C", // 阻止阿拉伯语成形 (Inhibit Arabic Form Shaping)
    "\u206D", // 激活阿拉伯语成形 (Activate Arabic Form Shaping)
    "\u206E", // 国家数字形状 (National Digit Shapes)
    "\u206F", // 标称数字形状 (Nominal Digit Shapes)

    // --- 【软分隔符与特殊不可见字符】 ---
    "\u00ad", // 软连字符 (Soft Hyphen) - 只有在单词被强制换行时才会显示为“-”，否则不可见
    "\u180e", // 蒙古文元音分隔符 (Mongolian Vowel Separator) - 在大部分现代字体中不可见

    // --- ⚠️ 【注意：以下字符带有实际宽度或换行效果】 ⚠️ ---
    // "\u2028", // 行分隔符 (Line Separator) - 会导致文本强制换行！
    // "\u2029", // 段落分隔符 (Paragraph Separator) - 会导致文本换段落！
    // "\u202f", // 窄不换行空格 (Narrow No-Break Space) - 带有很窄的可见宽度，且不换行
    // "\u2007"  // 图形空格 / 数字间距 (Figure Space) - 宽度与一个数字相同的可见空格！
];

/**
 * 文本防折叠混淆处理
 * @param {string} text 原始文本
 * @returns {string} 混淆后的文本
 */
function antiFoldProcess(text) {
    if (!text) return text;

    // 1. 先清洗掉之前可能残留的零宽字符，防止多次转换导致字符无限堆积
    let cleanText = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

    let result = '';
    // 2. 遍历每一个字
    for (let i = 0; i < cleanText.length; i++) {
        result += cleanText[i];

        // 3. 随机插入零宽字符，概率控制在 20% ~ 30% 左右即可
        // 概率不要设置成100%，否则文本体积会翻倍，容易触发微信的其他异常风控
        if (Math.random() < 0.3) {
            const randomChar = zeroWidthChars[Math.floor(Math.random() * zeroWidthChars.length)];
            result += randomChar;
        }
    }
    return result;
}

/**
 * 空格混淆替换
 * @param {string} text 原始文本
 * @returns {string} 替换后的文本
 */
function replaceSpace(text) {
    if (!text) return text;

    const spaces = [
        '\u2002', //  (En Space, 约半个中文字宽)
        '\u2003', // (Em Space,1个中文字宽)
        '\u2004', //  (Three-per-em space, 三分之一中文字宽)
        '\u2005', //  (Four-per-em space, 四分之一中文字宽，宽度接近普通空格)
        '\u2008', //  (标点空格 Punctuation Space)
        // '\u3000', //  (全角空格/中文空格, 1个中文字宽)
        '\u00A0', // (不换行空格)
    ];

    // 使用正则表达式全局匹配普通空格 ( \u0020 )
    return text.replace(/ /g, function (match) {
        // 设定 60% 的概率将普通空格替换为特殊空格，剩余 40% 保持原样
        if (Math.random() < 0.6) {
            return spaces[Math.floor(Math.random() * spaces.length)];
        }
        return match; // 保持原本的普通空格
    });
}

const HOMOGLYPH_DICT = {
    // 1. 英文字母替换 (拉丁字母 -> 西里尔字母/希腊字母/全角字母)
    'a': ['а',],// 'ɑ', 'ａ'],
    'c': ['с',],// 'ｃ'],
    'e': ['е',],// 'ｅ'],
    'o': ['о',],// 'ο', 'ｏ'],
    'p': ['р',],// 'ｐ'],
    'x': ['х',],// 'ｘ'],
    'y': ['у',],// 'ｙ'],
    'A': ['А',],// 'Α', 'Ａ'],
    'B': ['В',],// 'Β', 'Ｂ'],
    'C': ['С',],// 'Ｃ'],
    'E': ['Е',],// 'Ε', 'Ｅ'],
    'H': ['Н',],// 'Η', 'Ｈ'],
    'M': ['М',],// 'Μ', 'Ｍ'],
    'O': ['О',],// 'Ο', 'Ｏ'],
    'P': ['Р',],// 'Ρ', 'Ｐ'],
    'T': ['Т',],// 'Τ', 'Ｔ'],
    'X': ['Х',],// 'Χ', 'Ｘ'],
    'Y': ['Υ',],// 'Ｙ'],

    // 利用 Unicode 的小写变体 (Small Form Variants)
    '，': ['﹐'],         // 中文逗号 -> 小逗号 (U+FE50)
    '。': ['﹒', '．'],   // 中文句号 -> 小句号 (U+FE52) / 全角英文句号
    '！': ['﹗'],         // 中文叹号 -> 小叹号 (U+FE57)
    '？': ['﹖'],         // 中文问号 -> 小问号 (U+FE56)
    '：': ['﹕'],         // 中文冒号 -> 小冒号 (U+FE55)
    '；': ['﹔'],         // 中文分号 -> 小分号 (U+FE54)
    '（': ['﹙'],         // 中文左括号 -> 小左括号 (U+FE59)
    '）': ['﹚'],         // 中文右括号 -> 小右括号 (U+FE5A)
    '“': ['〝'],         // 中文左双引号 -> 繁体/竖排双引号变体
    '”': ['〞'],         // 中文右双引号 -> 繁体/竖排双引号变体
    // '、': ['﹅', '﹆'],   // 顿号 -> 芝麻点标点

    /*
    兼容汉字（CJK Compatibility Ideographs）
    康熙部首与补充部首（Kangxi Radicals）
    中国在1977年曾推行的“二简字”
    异体字（Variants）
    */
    '一': ['⼀'],
    '二': ['⼆'],
    '十': ['⼗'],
    '八': ['⼋'],
    '人': ['⼈'],
    '入': ['⼊'],
    '口': ['⼝'],
    '大': ['⼤'],
    '女': ['⼥'],
    '子': ['⼦'],
    '小': ['⼩'],
    '山': ['⼭'],
    '工': ['⼯'],
    '己': ['⼰'],
    '巾': ['⼱'],
    '干': ['⼲'],
    '木': ['⽊'],
    '水': ['⽔'],
    '火': ['⽕'],
    '田': ['⽥'],
    '白': ['⽩'],
    '目': ['⽬'],
    '石': ['⽯'],
    '立': ['⽴'],
    '米': ['⽶'],
    '网': ['⽹'],
    '羊': ['⽺'],
    '羽': ['⽻'],
    '老': ['⽼'],
    '耳': ['⽿'],
    '肉': ['⾁'],
    '臣': ['⾂'],
    '自': ['⾃'],
    '至': ['⾄'],
    '舌': ['⾆'],
    '行': ['⾏'],
    '衣': ['⾐'],
    // '西': ['⾄'],
    '角': ['⾓'],
    '言': ['⾔'],
    '谷': ['⾕'],
    '豆': ['⾖'],
    '豕': ['⾗'],
    // '贝': ['⾙'],
    '赤': ['⾚'],
    '走': ['⾛'],
    '足': ['⾜'],
    '身': ['⾝'],
    // '车': ['⾞'],
    '辛': ['⾟'],
    '辰': ['⾠'],
    '邑': ['⾢'],
    '酉': ['⾣'],
    '采': ['⾤'],
    '里': ['⾥'],
    '金': ['⾦'],
    // '长': ['⾧'],
    // '门': ['⾨'],
    '阜': ['⾩'],
    '隶': ['⾪'],
    '雨': ['⾬'],
    '青': ['⾭'],
    '非': ['⾮'],
    '面': ['⾯'],
    '革': ['⾰'],
    '韦': ['⾱'],
    '韭': ['⾲'],
    '音': ['⾳'],
    // '页': ['⾴'],
    // '风': ['⾵'],
    // '飞': ['⾶'],
    '食': ['⾷'],
    '首': ['⾸'],
    '香': ['⾹'],
    // '马': ['⾺'],
    '骨': ['⾻'],
    '高': ['⾼'],
    '鬼': ['⻤'],
    '鱼': ['⻥'],
    '鸟': ['⻦'],
    '麦': ['⻨'],
    '麻': ['⿇'],
    '黄': ['⻩'],
    '黍': ['⿉'],
    '黑': ['⿊'],
    '黹': ['⿋'],
    '黾': ['⿌'],
    '鼎': ['⿍'],
    '鼓': ['⿎'],
    '鼠': ['⿏'],
    '鼻': ['⿐'],
    '齐': ['⻬'],
    '齿': ['⻮'],
    '龙': ['⻰'],
    '龟': ['⻳'],
    '土': ['⼟'],
    '心': ['⼼'],
    '手': ['⼿'],
    '日': ['⽇'],
    '月': ['⽉'],
    '见': ['⻅'],
    '贝': ['⻉'],
    '车': ['⻋'],
    '门': ['⻔'],
    '马': ['⻢'],
    '风': ['⻛'],
    '飞': ['⻜'],
    // '食': ['⻠'],
    '气': ['⽓'],
    '长': ['⻓'],
    '页': ['⻚'],
    '令': ['令'],
    '林': ['林'],
    '里': ['里'],
    '立': ['立'],
    '女': ['女'],
    '年': ['年'],
    '冷': ['冷'],
    '郎': ['郎'],
    '度': ['度'],
    '海': ['海'],
    '免': ['免'],
    '理': ['理'],
    '路': ['路'],
    '露': ['露'],
    '六': ['六'],
    '论': ['論'],
    '率': ['率'],
    '杀': ['殺'],
    '连': ['連'],
    '列': ['列'],
    '烈': ['烈'],
};

/**
 * 同形字混淆替换函数
 * @param {string} text 原始输入文本
 * @param {number} probability 替换概率（0到1之间，默认0.7即70%的概率替换）
 * @returns {string} 替换后的文本
 */
function replaceHomoglyphs(text, probability = 0.7) {
    if (!text) return text;

    let result = '';

    // 遍历文本中的每一个字符
    for (let i = 0; i < text.length; i++) {
        let char = text[i];

        // 如果字典中存在该字符的同形字，并且命中随机概率
        if (HOMOGLYPH_DICT[char] && Math.random() < probability) {
            // 获取可用的同形字数组
            let options = HOMOGLYPH_DICT[char];
            // 随机挑选其中一个同形字
            let randomGlyph = options[Math.floor(Math.random() * options.length)];
            result += randomGlyph;
        } else {
            // 没有命中，或者字典里没有这个字，保持原样
            result += char;
        }
    }

    return result;
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
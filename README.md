<!--
 * @Author: https://www.bajins.com
 * @Date: 2021-01-21 09:09:14
 * @LastEditTime: 2021-01-21 09:15:21
 * @LastEditors: Please set LastEditors
 * @Description: 项目描述
 * @FilePath: README.md
-->
# no-folding

> 微信朋友圈不折叠复制的文字

微信的折叠机制主要包含两层检测：

- 文本重复度检测（防搬运/防刷屏），微信服务端的文本去重（防营销/防刷屏）机制
    - 零宽字符（Zero-Width Characters）混淆：每次生成的文本在肉眼看起来一模一样，但底层字符串的 Hash 值完全不同
    - 同形字替换（Homoglyph Substitution）：利用 Unicode 字符集中长得一样、但在计算机底层编码完全不同的字符来进行随机替换。例如将英文字母 a 替换为俄语字母 а（Cyrillic Small Letter A，U+0430）。
- 剪贴板粘贴行为检测（防长文直接复制），文本超过 6 行且被识别为直接粘贴
    - 先随便打两个字，然后长按全选你打的字，点“粘贴”将其覆盖



**参考**

* [https://github.com/godbiao/godbiao.github.io/blob/master/tools/bzd](https://github.com/godbiao/godbiao.github.io/blob/master/tools/bzd)
* [https://godbiao.com/tools/bzd](https://godbiao.com/tools/bzd)

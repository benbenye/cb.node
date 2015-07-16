/**
 * Created by bby on 15/6/4.
 */
var funcHelper = new FuncHelper();
function FuncHelper(){
    /*手机访问还是pc访问*/
    this.agent = function(useragent){
        var m = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        return m.some(function(i){return useragent.match(i);}) ? 'm' : 'pc';
    };
    /*是否是微信访问*/
    this.isWeixin = function (useragent) {
        return useragent.match('MicroMessenger') ? true : false;
    };
    /*验证邮箱*/
    this.isEmail = function (email) {
        var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        return reg.test(email);
    };
    /*验证手机号*/
    this.isMobile = function (mobile) {
        var reg = /1[34578]{1}\d{9}$/;
        return reg.test(mobile);
    }
}
module.exports = funcHelper;

/**
 * Created by bby on 15/6/4.
 */
var ua = new Ua();
function Ua(){
    this.agent = function(useragent){
        var m = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        return m.some(function(i){return useragent.match(i);}) ? 'm' : 'pc';
    }
}
module.exports = ua;

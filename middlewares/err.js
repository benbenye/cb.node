/**
 * Created by bby on 15/7/16.
 */
var err = new Err();
function Err(){
  this.handle = function (err, req, res) {
    if(1){err.json(err, req, res);}
  };

  this.json = function (err, req, res) {
    res.json({status:0,info:'错啦'});
  }
}
module.exports = err;
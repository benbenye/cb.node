$(document).ready(function(){
	var _dom = '<div class="login_popup">'
		+'<h3 class="title">登录春播</h3>'
		+'<a href="javascript:;" class="cross"></a>'
		+'<p class="error_line"></p>'
		+'<div class="clearfix login_content">'
			+'<div class="left">'
				+'<p class="line" style="margin-top:0;">'
					+'<input type="text" class="input_text validateEmailorMobile" name="username" placeholder="请输入您的手机号/邮箱" value="13426286424"></p>'
				+'<p class="line input_infor">'
					+'<input type="password" class="input_text validateLen" value="" name="password" placeholder="请输入密码"></p><p></p>'
				+'<input type="hidden" name="login_url" id="login_url" value="/Login/login.html">'
				+'<input type="hidden" name="redirect_url" value="http://chunbo.com/" id="redirect_url">'
				+'<input type="hidden" name="form_token" value="3dd676cfd8de3f62827de7241167f432">"'
				+'<p class="line"><a href="" class="confirm_btn" id="login">登录</a></p>'
				+'<p class="line"><a href="" class="btn_checkbox btn_checkbox_cur" id="keepLogin"></a>记住我<a href="/Login/ForgetPwd.html" class="forget">忘记密码</a></p>'
			+'</div>'
			+'<div class="right">欢迎您注册春播，春播是您安心健康食品的网购首选！</div>'
		+'</div>'
		+'<p class="login_now">还不是春播会员？<a href="/Login/regMobile.html">立即注册</a></p>'
	+'</div>';
});

document.addEventListener('DOMContentLoaded', function(){ // Аналог $(document).ready(function(){
                                                          // Если должен быть найден один элемент
    if(isIE()){
        document.getElementById("iehide").style.display="none";
        document.getElementById("fig").style.display="none";
    }
    var app=new Vue({
        el:"#app",
        data:{
            init:false,
            isShowRegistration:false,
            Ierr:false,
            Ferr:false,
            Eerr:false,
            Cerr:false,
            user:{
                i:localStorage.getItem("i"),
                f:localStorage.getItem("f"),
                e:localStorage.getItem("e"),
                c:localStorage.getItem("c"),
                position:localStorage.getItem("position")
            },
            isRegLoader:false,
            isRegCompl:false,
            isAgreement:false,
            isAgreeApproved:false,
        },
        methods:{
            changeAgr:function(){
                if(!this.isRegCompl)
                    this.isAgreeApproved=!this.isAgreeApproved
            },
            sendReg: function () {
                var _this=this;
                if(this.isRegLoader)
                    return;
                if(this.isRegCompl)
                    return;
                var _this=this;
                if(!this.user.i || this.user.i.length==0)
                     this.Ierr=true;
                if(!this.user.f || this.user.f.length==0)
                    this.Ferr=true;
                if(!this.user.e || this.user.e.length==0 || !validateEmail(this.user.e))
                    this.Eerr=true;
                if(!this.user.c || this.user.c.length==0)
                    this.Cerr=true;
                if( this.Ierr ||  this.Ferr ||  this.Eerr ||  this.Cerr)
                    return ;

                localStorage.setItem("i", this.user.i)
                localStorage.setItem("f", this.user.f)
                localStorage.setItem("e", this.user.e)
                localStorage.setItem("c", this.user.c)
                localStorage.setItem("position", this.user.position)

                this.isRegLoader=true;

                axios.post("/rest/api/user",{user:_this.user/*, token:token*/}).then(function (r) {
                    setTimeout(function(){
                        _this.isRegLoader=false;
                        _this.isRegCompl=true;
                    },1000)
                })

               /* grecaptcha.ready(function() {
                    grecaptcha.execute('6Ldk8uIZAAAAAEsV4RKg0n4cFEnn7ZmMEShcWgjX', {action: 'submit'}).then(function(token) {
                        // Add your logic to submit to your backend server here.


                    });
                });*/




            }
        },
        watch:{
            isShowRegistration:function () {
                if(this.isShowRegistration){
                    setTimeout(function(){
                        document.getElementById("regI").focus()
                    },0)
                }

            }
        },
        mounted:function(){
            var _this=this;
            setTimeout(function(){ _this.init=1;},1000)

        }
    })
});
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
function isIE() {
    const ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
    const msie = ua.indexOf('MSIE '); // IE 10 or older
    const trident = ua.indexOf('Trident/'); //IE 11

    return (msie > 0 || trident > 0);
}
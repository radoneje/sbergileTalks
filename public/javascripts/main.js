
document.addEventListener('DOMContentLoaded', function(){ // Аналог $(document).ready(function(){
                                                          // Если должен быть найден один элемент
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
            isAgreement:false
        },
        methods:{
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

                axios.post("/rest/api/user", this.user).then(function (r) {
                    setTimeout(function(){
                        _this.isRegLoader=false;
                        _this.isRegCompl=true;
                    },2000)
                })


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

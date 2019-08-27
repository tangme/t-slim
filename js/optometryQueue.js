var Vue = window.Vue;

var test = Mock.mock({
    'roomList|1-12':[{
        'no':function(){return Mock.mock('@integer(1, 100)')},
        'roomName':function(){ return '验光室 '+ Mock.mock({"number|1-100": 0}).number }, 
        'waiterList|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }]
    }]
});

console.log('---');
console.log(test.roomList);

new Vue({
    el: '#app',
    mounted() {
        setInterval(() => {
            this.dateTime = moment().format('ll,dddd LTS');
        }, 1000);

        this.totalPage = Math.ceil(this.roomList.length/8);
        console.log('totalPage:',this.totalPage);
        if(this.totalPage>1){
            this.$nextTick(()=>{
                console.log(this.$refs.maincontainer.scrollLeft);
                this.pageWidth = parseInt(getComputedStyle(this.$refs.maincontainer)['width']);
                console.log(this.pageWidth);
                this.autoPlay();
            });
        }
        
    },
    computed: {
        formatDate() {
            if (this.dateTime) {
                return this.dateTime.split(',')[0];
            }
        },
        formatTime() {
            if (this.dateTime) {
                return this.dateTime.split(',')[1];
            }
        }
    },
    data: function() {
        return {
            dateTime: moment().format('ll,dddd LTS'),
            roomList: test.roomList,
            timeFlag:'',//轮播时间标识
            targetPosition:0,//滚动到的目标位置
            curPosition:0,//当前滚动的位置
            totalPage:1,
            pageWidth:0,
        }
    },
    methods:{
        autoPlay(){
            var curPage = 1;
            setInterval(()=>{
                if(curPage >= this.totalPage){
                    curPage = 0;
                }
                this.targetPosition = this.pageWidth * curPage;
                ++curPage;
                this.switchPage();
            },5000);
        },
        switchPage(){
            clearInterval(this.timeFlag);
            this.timeFlag = setInterval(()=> {
                //获取步长
                var step = (this.targetPosition - this.curPosition) / 10;
                //二次处理步长
                step = step > 0 ? Math.ceil(step) : Math.floor(step);
                this.curPosition = this.curPosition + step;
                this.$refs.maincontainer.scrollLeft = this.curPosition;
                //清除定时器
                if (this.curPosition === this.targetPosition) {
                    console.log('clear.');
                    clearInterval(this.timeFlag);
                }
            }, 40);
        }
    }
});
Vue.component("panel-info", {
    props: {
        title: {
            type: String,
            default: '标题'
        },
        show_default_slot: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    template: `  <div class="panel-info">
                    <div class="panel-info-header">{{title}}</div>
                    <ul class="panel-info-list text-show-font">
                        <li v-for='item in data' class="panel-info-list-item">
                            <span>{{item.name}}</span>
                            <span>（{{item.no}}）</span>
                        </li>
                        <div class="panel-info-list-bg">
                            <div class="panel-info-list-bg-item" v-once v-for="i in 5">
                                <span class="panel-info-list-bg-item-span">bg</span>
                            </div>
                        </div>
                    </ul>
                </div>`
});
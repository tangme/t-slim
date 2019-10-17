var Vue = window.Vue;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.transformRequest = [function (data) {
    let ret = ''
    for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
    }
    return ret
}]

var test = Mock.mock({
    "queueList|3":[{
        "queueId":function(){return Mock.mock("@integer(1, 100)");},
        "queueName":function(){ return "验光室 "+ Mock.mock({"number|1-100": 0}).number; },
        "callQue|0-1":[{
            "orders":function(){return Mock.mock("@integer(1, 100)");},
            "patientName":function(){ return Mock.mock("@cname()");},
            "opDate":function(){ return Mock.mock("@datetime");},
            "regNumber":function(){ return Mock.mock("@cname()");}
        }],
        "waitingQue|1-10":[{
            "orders":function(){return Mock.mock("@integer(1, 100)");},
            "patientName":function(){ return Mock.mock("@cname()");},
            "opDate":function(){ return Mock.mock("@datetime()");},
            "regNumber":function(){ return Mock.mock("@cname()");}
        }]
    }]
});

new Vue({
    el: '#app',
    mounted() {
        setInterval(() => {
            this.dateTime = moment().format('ll,dddd LTS');
        }, 1000);
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
            dataList: test.queueList
        }
    }
});
Vue.component("panel-info", {
    props: {
        title: {
            type: String,
            default: "标题"
        },
        show_default_slot: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: () => []
        },
        call:{
            type: Array,
            default: () => []
        }
    },
    template: ` <div class="panel-info">
                    <div class="panel-info-header">{{title}}</div>
                    <ul class="panel-info-list text-show-font">
                        <li v-for='item in call' class="panel-info-list-item calling-item">
                            <span>({{item.orders}}.) {{item.patientName}}就诊</span>
                        </li>
                        <template v-if="call.length>0">
                            <li v-for='(item,index) in data' v-if="index<7" class="panel-info-list-item">
                                <span>({{item.orders}}.) {{item.patientName}}</span>
                            </li>
                        </template>
                        <template v-else>
                            <li v-for='(item,index) in data' v-if="index<8" class="panel-info-list-item">
                                <span>({{item.orders}}.) {{item.patientName}}</span> 
                            </li>
                        </template>
                        <div class="panel-info-list-bg">
                            <div class="panel-info-list-bg-item" v-once v-for="i in 8">
                                <span class="panel-info-list-bg-item-span">bg</span>
                            </div>
                        </div>
                    </ul>
                </div>`
});

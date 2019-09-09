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
    'roomList|3':[{
        'no':function(){return Mock.mock('@integer(1, 100)')},
        'roomName':function(){ return '验光室 '+ Mock.mock({"number|1-100": 0}).number }, 
        'waiterList|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
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
            dataList: test.roomList
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
                            <div class="panel-info-list-bg-item" v-once v-for="i in 20">
                                <span class="panel-info-list-bg-item-span">bg</span>
                            </div>
                        </div>
                    </ul>
                </div>`
});

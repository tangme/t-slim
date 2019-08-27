var Vue = window.Vue;

Mock.mock('getQueue',{ 
    'data':{
        'wait|1-20':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }],
        'pass|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }],
        'inQueue|1-5':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }]
    }
});

new Vue({
    el: '#app',
    created(){
        //获取队列
        axios.get('getQueue').then((res)=>{
            let { inQueue, pass,wait} = res.data.data;
            this.waitQueueList = wait; 
            this.passQueueList = pass;
            this.inQueueList = inQueue;
        });
    },
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
            waitQueueList:[], 
            passQueueList:[],
            inQueueList:[],
        }
    },
    methods: {
    }
})
Vue.component("patient-item", {
    props: {
        bgcolor: {
            type: String,
            default: '#ccc'
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
        }
    },
    template: ` <div class="bg-container">
                    <div class="bg-item">
                        <div class="bgDiv cell-height" v-for="i in 20" v-once v-bind:style="{backgroundColor:bgcolor}"></div>
                    </div>
                    <div v-for="i in data" class="showItem cell-height">
                        <span class="showItem-span">
                            <span class="showItem-span-left">
                                {{i.no}}号
                            </span>
                            <span class="showItem-span-right">
                                {{i.name}}
                            </span>
                        </span>
                    </div>
                </div>`
});
var Vue = window.Vue;
console.log('helle uglify');
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
            ws: null,
            dateTime: moment().format('ll,dddd LTS'),
            tempData: [{
                name: '1号 王小虎',
            }, {
                name: '2号 王小虎',
            }, {
                name: '3号 王小虎',
            }, {
                name: '4号 王小虎',
            }, {
                name: '5号 王小虎',
            }]
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
            cc: 'red'
        }
    },
    template: ` <div class="bg-container">
                    <div class="bg-item">
                        <div class="bgDiv cell-height" v-for="i in 20" v-bind:style="{backgroundColor:bgcolor}"></div>
                    </div>
                    <div v-for="i in data" class="showItem cell-height">
                        <span class="showItem-span">{{i.name}}</span>
                    </div>
                </div>`
});
var Vue = window.Vue;

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
            dataList: [
                { name: '张三', number: '304' },
                { name: '李四', number: '501' },
                { name: '王五', number: '666' },
                { name: '阿拉德', number: '397' },
                { name: '机器猫', number: '256' },
                { name: '张三', number: '304' },
                { name: '李四', number: '501' },
                { name: '王五', number: '666' },
                { name: '阿拉德', number: '397' },
                { name: '机器猫', number: '256' },
                { name: '机器猫', number: '256' },
            ]
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
                    <ul class="panel-info-list">
                        <li v-for='item in data' class="panel-info-list-item">
                            <span>{{item.name}}</span>
                            <span>（{{item.number}}）</span>
                        </li>
                    </ul>
                </div>`
});
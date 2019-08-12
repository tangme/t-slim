var Vue = window.Vue;
var vant = window.vant;

// 注册组件
Vue.use(vant);


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
            value: '',
            show: false,
            showPicker: false,
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
            }],
            form: {
                odfar: '',
                odRemark: "",
                odnear: '',
                odCorrect: '',
                odPressure: '',
                osfar: '',
                osRemark: "",
                osnear: '',
                osCorrect: '',
                osPressure: '',
            },
            costList: [
                { itemId: '1', itemName: "眼压检查", fee: 11.00 },
                { itemId: '2', itemName: "普通视力检查", fee: 22.00 },
                { itemId: '3', itemName: "综合验光", fee: 33.00 },
            ],
            cost: [],
            columns: ['0.08', '0.06', '0.04', '0.02', '2.0', '1.5', '1.2', '1.0', '0.8', '0.6', '0.5', '0.4', '0.3', '0.25', '0.2', '0.15', '0.12', '0.1'],
            currentPickerField: ''
        }
    },
    methods: {
        callNext() {
            vant.Toast('提示');
        },
        showPopup() {
            this.show = true;
        },
        toggle(index) {
            this.$refs.checkboxes[index].toggle();
        },
        toggleAll() {
            setTimeout(() => {
                this.$nextTick(() => {
                    if (this.$refs.checkboxAll.checked) {
                        this.cost = this.costList.map(item => {
                            return item.itemId;
                        });
                        this.cost.push(this.$refs.checkboxAll.name);
                    } else {
                        this.cost = [];
                    }
                });
            });
        },
        handleSave() {
            console.log(this.cost);
        },
        handleShowPicker(type) {
            this.showPicker = true;
            this.currentPickerField = type;
        },
        onConfirm(value) {
            this.form[this.currentPickerField] = value;
            this.showPicker = false;
        }
    }
});
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
                        <span class="showItem-span">
                            <slot></slot>
                            {{i.name}}
                        </span>
                    </div>
                </div>`
});
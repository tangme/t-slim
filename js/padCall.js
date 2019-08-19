var Vue = window.Vue;
var vant = window.vant;

// 注册组件
Vue.use(vant);

Mock.mock('getFee',{
    'res|1-5':[{
        'itemId|+1': 1,
        'itemName|1':['眼压检查', '普通视力检查', '综合验光', '特殊验光', '普通验光'],
        "fee|1-100.2": 1
    }]
});
Mock.mock('getQueue',{
    'data':{
        'wait|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }],
        'pass|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }],
        'inQueue|1-10':[{
            'no':function(){return Mock.mock('@integer(1, 100)')},
            'name':function(){ return Mock.mock('@cname()');}
        }]
    }
});


new Vue({
    el: '#app',
    created(){
        this.resetForm = JSON.parse(JSON.stringify(this.form));
        //获取费用
        axios.get('getFee').then((res)=>{
            console.log(res.data.res);
            this.costList = res.data.res;
        });
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
            value: '',
            showResult: false,
            showBtn: false, //底部按钮选择 弹出层
            showPicker: false,
            dateTime: moment().format('ll,dddd LTS'),
            waitQueueList: [],
            passQueueList: [],
            inQueueList: [],
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
                cost: [],
            },
            resetForm:{},
            costList: [],//检查结果弹窗里 费用列表
            columns: ['0.08', '0.06', '0.04', '0.02', '2.0', '1.5', '1.2', '1.0', '0.8', '0.6', '0.5', '0.4', '0.3', '0.25', '0.2', '0.15', '0.12', '0.1'],
            currentPickerField: ''
        }
    },
    methods: {
        /**
         * [handleCallin 就诊按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handleCallin() {
            vant.Toast('提示1');
        },
        /**
         * [handleRecall 重叫按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handleRecall() {
            vant.Toast('提示2');
        },
        /**
         * [handlePass 过号按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handlePass() {
            vant.Toast('提示3');
        },
        /**
         * [callNext 下一位按钮按钮事件]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        callNext() {
            // vant.Toast('提示');
            this.showBtn = true;
        },
        /**
         * [showPopup 显示结果费用弹窗]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        showPopup() {
            this.showResult = true;
        },
        toggle(index) {
            this.$refs.checkboxes[index].toggle();
        },
        toggleAll() {
            setTimeout(() => {
                this.$nextTick(() => {
                    if (this.$refs.checkboxAll.checked) {
                        this.form.cost = this.costList.map(item => {
                            return item.itemId;
                        });
                        this.form.cost.push(this.$refs.checkboxAll.name);
                    } else {
                        this.form.cost = [];
                    }
                });
            });
        },
        /**
         * [handleSave 保存按钮事件]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handleSave() {
            /*vant.Dialog.confirm({
                title: '确认保存吗？',
                // message: '弹窗内容'
            }).then(() => {
                this.saveData();
            }).catch(() => {
                // on cancel
            });*/
            vant.Dialog.confirm({
                title: '确认保存吗？',
                beforeClose:(action, done)=>{
                    if (action === 'confirm') {
                        this.saveData().then(()=>{
                            done();
                        }).catch(()=>{
                            done();
                        });
                    } else {
                        done();
                    }
                }
            }).catch(()=>{
                //on cancel
            });
        },
        /**
         * [saveData 保存数据]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        saveData(){
            return axios.get('https://api.myjson.com/bins/13ztir', {})
            .then((response)=> {
                console.log(response);
                vant.Toast(response.data.code);
                this.showResult = false;
                this.formReset();
            })
            .catch((error)=> {
                console.log(error);
            });
        },
        formReset(){
            this.form = JSON.parse(JSON.stringify(this.resetForm));
        },
        /**
         * [handleShowPicker 显示视力选择弹窗]
         * @Author tanglv   2019-08-19
         * @param  {[type]} type       [description]
         * @return {[type]}            [description]
         */
        handleShowPicker(type) {
            this.showPicker = true;
            this.currentPickerField = type;
        },
        /**
         * [onConfirm 视力弹窗确定事件]
         * @Author tanglv   2019-08-19
         * @param  {[type]} value      [description]
         * @return {[type]}            [description]
         */
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
            
        }
    },
    template: ` <div class="bg-container">
                    <div class="bg-item">
                        <div class="bgDiv cell-height" v-for="i in 20" v-once v-bind:style="{backgroundColor:bgcolor}"></div>
                    </div>
                    <div v-for="i in data" class="showItem cell-height">
                        <span class="showItem-span">
                            <span class="showItem-span-left">
                                <slot></slot>
                                {{i.no}}号
                            </span>
                            <span class="showItem-span-right">
                                {{i.name}}
                            </span>
                        </span>
                    </div>
                </div>`
});
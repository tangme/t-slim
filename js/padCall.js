var Vue = window.Vue;
var vant = window.vant;

axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
axios.defaults.transformRequest = [function(data) {
    let ret = "";
    for (let it in data) {
        ret += encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
    }
    return ret;
}];

// 注册组件
Vue.use(vant);

Mock.mock("getFee", {
    "res|1-5": [{
        "itemId|+1": 1,
        "itemName|1": ["眼压检查", "普通视力检查", "综合验光", "特殊验光", "普通验光"],
        "fee|1-100.2": 1
    }]
});
Mock.mock("getQueue", {
    "data": {
        "wait|10": [{
            "orders": function() { return Mock.mock("@integer(1, 100)"); },
            "patientName": function() { return Mock.mock("@cname()"); }
        }],
        "pass|1-10": [{
            "orders": function() { return Mock.mock("@integer(1, 100)"); },
            "patientName": function() { return Mock.mock("@cname()"); }
        }],
        "inQueue|1-10": [{
            "orders": function() { return Mock.mock("@integer(1, 100)"); },
            "patientName": function() { return Mock.mock("@cname()"); }
        }]
    }
});
Mock.mock("fetch", {
    "data": "success"
});


new Vue({
    el: "#app",
    created() {
        this.resetForm = JSON.parse(JSON.stringify(this.form));
        //获取费用
        // axios.get('getFee').then((res)=>{
        //     console.log(res.data.res);
        //     this.costList = res.data.res;
        // });
        //获取队列
        // axios.get("getQueue").then((res)=>{
        //     let { inQueue, pass,wait} = res.data.data;
        //     this.waitQueueList = wait;
        //     this.passQueueList = pass;
        //     this.inQueueList = inQueue;
        // });
    },
    mounted() {
        setInterval(() => {
            this.dateTime = moment().format("ll,dddd LTS");
        }, 1000);

        this.fetchQueueData();
        this.fetchFeeData();
    },
    computed: {
        formatDate() {
            if (this.dateTime) {
                return this.dateTime.split(",")[0];
            }
        },
        formatTime() {
            if (this.dateTime) {
                return this.dateTime.split(",")[1];
            }
        },
    },
    watch: {
        "form.cost"() {
            this.getAnswer();
        }
    },
    data: function() {
        return {
            value: "",
            showResult: false,
            showBtn: false, //底部按钮选择 弹出层
            nextBtn: { //下一位按钮
                loading: false,
                disabled: false,
            },
            reCallBtn: { //重叫按钮
                loading: false,
                disabled: false,
            },
            passBtn: { //过号按钮
                loading: false,
                disabled: false,
            },
            callInBtn: { //接诊按钮
                loading: false,
                disabled: false,
            },
            refreshBtn: { //刷新按钮
                loading: false,
                disabled: false,
            },
            showPicker: false,
            dateTime: moment().format("ll,dddd LTS"),
            waitQueueList: [],
            passQueueList: [],
            inQueueList: [],
            form: {
                bid: "",
                scdOd: "", //远视力
                odRemark: "",
                scnOd: "", //近视力
                odCorrect: "",
                iopOd: "", //眼压
                scdOs: "", //远视力
                osRemark: "",
                scnOs: "", //近视力
                osCorrect: "",
                iopOs: "", //眼压
                cost: [],
            },
            resetForm: {},
            costList: [], //检查结果弹窗里 费用列表
            columns: ["0.08", "0.06", "0.04", "0.02", "2.0", "1.5", "1.2", "1.0", "0.8", "0.6", "0.5", "0.4", "0.3", "0.25", "0.2", "0.15", "0.12", "0.1"],
            currentPickerField: "",
            operateTitle: "", //操作弹窗的标题名称 e.g: 13号 张三
            regNumber: "", //就诊号
            queueId: "", //队列号
            bgRefreshTimeFlag: null,
        };
    },
    methods: {
        getAnswer: _.debounce(
            function() {
                let index = this.form.cost.findIndex(item => {
                    return item === "all";
                });
                console.log("index:", index);
                if (index != -1) { //all被选中
                    if (!(this.costList.length == this.form.cost.length - 1)) { //如果 总费用长度 与 选择费用长度 不一致
                        this.form.cost.splice(index, 1); // 取消 all 选中
                    }
                } else { //all未被选中
                    if (this.costList.length == this.form.cost.length) { //如果 选中费用长度 与 总共费用长度一致
                        this.form.cost.push("all"); //将 all 选中
                    }
                }
            },
            50
        ),
        bgRefresh() {
            clearInterval(this.bgRefreshTimeFlag);
            this.bgRefreshTimeFlag = setInterval(() => {
                axios.post("/commonClientLogin").then((res) => {
                    var data = res.data;
                    this.waitQueueList = data.data.queueList[0].waitingQue;
                    this.passQueueList = data.data.queueList[0].overDUE;
                    this.inQueueList = data.data.queueList[0].seekQue;
                });
            }, 1000 * 20);
            //1000*60*5  每五分钟
        },
        /**
         * 刷新页面数据
         */
        refresh() {
            this.refreshBtn.disabled = true;
            this.refreshBtn.loading = true;
            this.fetchQueueData().then(res => {
                console.log(res);
                this.refreshBtn.disabled = false;
                this.refreshBtn.loading = false;
                vant.Notify({
                    message: "刷新成功",
                    color: "#ffffff",
                    background: "#07c160"
                });
            }).catch(err => {
                vant.Notify("错误：" + err);
                this.refreshBtn.disabled = false;
                this.refreshBtn.loading = false;
            });
        },
        /**
         * 请求显示列表数据
         */
        fetchQueueData() {
            this.bgRefresh();
            return axios.post("/commonClientLogin").then((res) => {
                var data = res.data;
                this.waitQueueList = data.data.queueList[0].waitingQue;
                this.passQueueList = data.data.queueList[0].overDUE;
                this.inQueueList = data.data.queueList[0].seekQue;
            });
        },
        /**
         * 查询费用
         */
        fetchFeeData() {
            return axios.post("/getFeeList").then((res) => {
                var { data } = res.data;
                this.costList = data;
            });
        },
        /**
         * 免检按钮
         */
        withoutChecking(item) {
            vant.Dialog.confirm({
                title: `免检：(${item.orders}号)${item.patientName}`,
                beforeClose: (action, done) => {
                    if (action === "confirm") {
                        axios.post("/padSeek", { regNumber: item.regNumber }).then((res) => {
                            console.log(res);
                            this.fetchQueueData(); //刷新列表
                            vant.Notify({
                                message: "操作成功",
                                color: "#ffffff",
                                background: "#07c160"
                            });
                            done();
                        }).catch((err) => {
                            console.log(err);
                            vant.Notify("错误：" + err);
                        });
                    } else {
                        done();
                    }
                }
            });
        },
        /**
         * [passToCallin 过号到就诊按钮]
         * @Author tanglv   2019-09-05
         * @return {[type]} [description]
         */
        passToCallin(item) {
            vant.Dialog.confirm({
                title: `过号患者：(${item.orders}号)${item.patientName} 已接诊`,
                beforeClose: (action, done) => {
                    if (action === "confirm") {
                        axios.post("/padSeek", { regNumber: item.regNumber }).then((res) => {
                            console.log(res);
                            this.fetchQueueData(); //刷新列表
                            vant.Notify({
                                message: "操作成功",
                                color: "#ffffff",
                                background: "#07c160"
                            });
                            done();
                        }).catch((err) => {
                            console.log(err);
                            vant.Notify("错误：" + err);
                        });
                    } else {
                        done();
                    }
                }
            });
        },
        /**
         * [handleCallin 就诊按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handleCallin() {
            this.callInBtn.disabled = true;
            this.callInBtn.loading = true;
            axios.post("/padSeek", { regNumber: this.regNumber }).then((res) => {
                console.log(res);
                this.fetchQueueData(); //刷新列表
                this.showBtn = false;
                this.callInBtn.disabled = false;
                this.callInBtn.loading = false;
            }).catch((err) => {
                console.log(err);
                vant.Notify("错误：" + err);
                this.callInBtn.disabled = false;
                this.callInBtn.loading = false;
            });
        },
        /**
         * [handleRecall 重叫按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handleRecall() {
            this.reCallBtn.disabled = true;
            this.reCallBtn.loading = true;
            axios.post("/callAgain", { queueId: this.queueId, regNumber: this.regNumber }).then((res) => {
                console.log(res);
                this.fetchQueueData(); //刷新列表
                // this.showBtn = false;
                this.reCallBtn.loading = false;
                this.reCallBtn.disabled = false;
            }).catch((err) => {
                vant.Notify("错误：" + err);
                this.reCallBtn.loading = false;
                this.reCallBtn.disabled = false;
            });
        },
        /**
         * [handlePass 过号按钮]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        handlePass() {
            this.passBtn.loading = true;
            this.passBtn.disabled = true;
            axios.post("/padOver", { regNumber: this.regNumber }).then((res) => {
                console.log(res);
                this.fetchQueueData(); //刷新列表
                this.showBtn = false;
                this.passBtn.loading = false;
                this.passBtn.disabled = false;
            }).catch((err) => {
                vant.Notify("错误：" + err);
                this.passBtn.loading = false;
                this.passBtn.disabled = false;
            });
        },
        /**
         * [callNext 下一位按钮按钮事件]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        callNext() {
            this.nextBtn.disabled = true;
            this.nextBtn.loading = true;
            axios.post("/getPadNext").then((res) => {
                console.log(res);
                var data = res.data.data;
                var callObj = data.queueList[0].callQue[0];
                this.operateTitle = `${callObj.orders} ${callObj.patientName}`;
                console.log(res.data.res);
                this.queueId = data.queueList[0].queueId;
                this.regNumber = callObj.regNumber;
                this.showBtn = true;
                this.nextBtn.disabled = false;
                this.nextBtn.loading = false;
            }).catch((err) => {
                vant.Notify("错误：" + err);
                this.nextBtn.disabled = false;
                this.nextBtn.loading = false;
            });
            // $.post("/getPadNext",function (res) {
            //     console.log(res);
            // } );
        },
        /**
         * [showPopup 显示结果费用弹窗]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        showPopup(item) {
            console.log(item);
            this.form.bid = item.bid;
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
                            return item.id;
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
            vant.Dialog.confirm({
                title: "确认保存吗？",
                beforeClose: (action, done) => {
                    if (action === "confirm") {
                        this.saveData().then(() => {
                            done();
                            this.fetchQueueData();
                        }).catch(() => {
                            done();
                            this.fetchQueueData();
                        });
                    } else {
                        done();
                    }
                }
            }).catch(() => {
                //on cancel
            });
        },
        /**
         * 录入结果层 弹出事件
         */
        handleOpenResult() {
            this.form.cost = this.costList.map(item => {
                return item.id;
            });
        },
        /**
         * [saveData 保存数据]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        saveData() {
            return axios.post("/padSaveResult", this.form)
                .then((response) => {
                    vant.Notify({
                        message: `${response.data.msg}`,
                        color: "#ffffff",
                        background: "#07c160"
                    });
                    this.showResult = false;
                    this.formReset();
                })
                .catch((error, response) => {
                    vant.Notify("保存失败");
                    console.log(error);
                    console.log(response);
                });
        },
        formReset() {
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
            default: "#ccc"
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            observer: null,
            minNum: 1,
        };
    },
    created() {
        window.addEventListener("resize", () => {
            this.calcHeight();
        });
    },
    methods: {
        calcHeight() {
            this.minNum = Math.ceil(this.$el.clientHeight / this.$el.childNodes[0].childNodes[0].clientHeight);
            console.log("this.minNum:" + this.minNum);
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.minNum = Math.ceil(this.$el.clientHeight / this.$el.childNodes[0].childNodes[0].clientHeight);
            if (this.$el.scrollHeight > this.$el.clientHeight) {
                this.$el.childNodes[0].style.overflow = "visible";
            }

            this.observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    var height = Math.max(mutation.target.childNodes[0].clientHeight, mutation.target.childNodes[0].scrollHeight);
                    if (height > mutation.target.clientHeight) {
                        mutation.target.childNodes[0].style.overflow = "hidden";
                    }
                    if (mutation.target.scrollHeight > mutation.target.clientHeight) {
                        mutation.target.childNodes[0].style.overflow = "visible";
                    }
                });
            });

            let config = {
                attributes: false,
                childList: true,
                characterData: true,
                subtree: false
            };
            this.observer.observe(this.$el, config);
        });
    },
    template: ` <div class="bg-container">
                    <div class="bg-item">
                        <template v-if="data.length > minNum">
                            <div class="bgDiv cell-height" v-for="i in data.length" v-bind:style="{backgroundColor:bgcolor}"></div>
                        </template>    
                        <template v-else>
                            <div class="bgDiv cell-height" v-for="i in minNum" v-bind:style="{backgroundColor:bgcolor}"></div>
                        </template> 
                    </div>
                    <div v-for="i in data" class="showItem cell-height">
                        <span class="showItem-span">
                            <span class="showItem-span-left">
                                <slot v-bind:item="i"></slot>
                                {{i.orders}}
                            </span>
                            <span class="showItem-span-right">
                                {{i.patientName}}
                                <slot name="right" v-bind:item="i"></slot>
                            </span>
                        </span>
                    </div>
                </div>`
});
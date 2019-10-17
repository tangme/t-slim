var Vue = window.Vue;
var vant = window.vant;

const myAxios = axios.create({
    // transformRequest: [function (data) {
    //     // 将数据转换为表单数据
    //     let ret = "";
    //     for (let it in data) {
    //         ret += encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
    //     }
    //     return ret;
    // }],
    headers: {
        "Content-Type": "application/json"
    }
});

axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
axios.defaults.transformRequest = [function (data) {
    let ret = "";
    for (let it in data) {
        ret += encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
    }
    return ret;
}];



// 注册组件
Vue.use(vant);

Mock.mock("getFee",{
    "res|1-5":[{
        "itemId|+1": 1,
        "itemName|1":["眼压检查", "普通视力检查", "综合验光", "特殊验光", "普通验光"],
        "fee|1-100.2": 1
    }]
});
Mock.mock("getQueue",{
    "data":{
        "wait|10":[{
            "orders":function(){return Mock.mock("@integer(1, 100)");},
            "patientName":function(){ return Mock.mock("@cname()");}
        }],
        "pass|1-10":[{
            "orders":function(){return Mock.mock("@integer(1, 100)");},
            "patientName":function(){ return Mock.mock("@cname()");}
        }],
        "inQueue|1-10":[{
            "orders":function(){return Mock.mock("@integer(1, 100)");},
            "patientName":function(){ return Mock.mock("@cname()");}
        }]
    }
});
Mock.mock("fetchResultList",{
    "resultList|10-30":[{
        "orders":function(){return Mock.mock("@integer(1, 100)");},
        "patientName":function(){ return Mock.mock("@cname()");}
    }]
});
Mock.mock("fetch",{
    "data":"success"
});


new Vue({
    el: "#app",
    created(){
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

        this.fetchQueueData();//查询 候检、过号、已检队列数据
        this.fetchFeeData();//查询费用
        this.fetchDictView();//查询视力码表
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
    watch:{
        "form.payItemIds"(){
            this.getAnswer();
        },
        "form.odpress":{
            handler(val){
                this.form.dchIopExam.fingerTonometryOd = val.fingerTonometry;//指压类型
                this.form.dchIopExam.iopOd = val.iop;//数值
                this.form.dchIopExam.tonometryType = val.tonometryType;//眼压类型
                if(this.form.ospress.tonometryType != val.tonometryType){
                    this.form.ospress.tonometryType = val.tonometryType;
                }
            },
            deep: true,
        },
        "form.ospress":{
            handler(val){
                this.form.dchIopExam.fingerTonometryOs = val.fingerTonometry;//指压类型
                this.form.dchIopExam.iopOs = val.iop;//数值
                this.form.dchIopExam.tonometryType = val.tonometryType;//眼压类型
                if(this.form.odpress.tonometryType != val.tonometryType){
                    this.form.odpress.tonometryType = val.tonometryType;
                }
            },
            deep: true,
        }
    },
    data: function() {
        return {
            farOption:{//远视力 picker 值
                "数值": [],
                "描述": []
            },
            activeNames: [],//折叠面板 展开值
            updateResultModel:false,//更新-已检列表模态窗口
            showResult: false,//录入检查结果表单 模态窗口
            showBtn: false, //底部按钮选择 弹出层
            nextBtn:{//下一位按钮
                loading:false,
                disabled:false,
            },
            reCallBtn:{//重叫按钮
                loading:false,
                disabled:false,
            },
            passBtn:{//过号按钮
                loading:false,
                disabled:false,
            },
            callInBtn:{//接诊按钮
                loading:false,
                disabled:false,
            },
            refreshBtn:{//刷新按钮
                loading:false,
                disabled:false,
            },
            resultModelBtn:{//查询结果更新按钮
                loading:false,
                disabled:false,
            },
            showPicker: false,
            dateTime: moment().format("ll,dddd LTS"),
            waitQueueList: [],//候诊
            passQueueList: [],//过号
            inQueueList: [],//已诊
            resultList:[],//更新检查队列
            form: {
                dchVisionExam:{//基本表单 对象
                    bid:"",
                    scdOd: "",//右眼-远视力（OD）
                    scdOdLabel:"",
                    scdOdType:"",//右眼视力类型(1数值2描述）
                    scdDescOd:"",//远视力描述(OD)
                    ccdOd: "",//右眼-矫正视力（OD）
                    ccdOdLabel:"",
                    phdOd:"",//右眼-小孔视力（OD）
                    phdOdLabel:"",
                    scnOd: "",//右眼-近视力（OD）
                    scnOdLabel:"",
                    ccnOd:"",//右眼-矫正近视力（OD）
                    ccnOdLabel:"",
                    scdOs: "",//左眼-远视力（OS）
                    scdOsLabel:"",
                    scdOsType:"",//左眼视力类型(1数值2描述）
                    scdDescOs:"",//远视力描述(Os)
                    ccdOs: "",//左眼-矫正视力（Os）
                    ccdOsLabel:"",
                    phdOs:"",//左眼-小孔视力（Os）
                    phdOsLabel:"",
                    scnOs: "",//左眼-近视力（OS）
                    scnOsLabel:"",
                    ccnOs:"",//左眼-矫正近视力（Os）
                    ccnOsLabel:"",
                },
                dchIopExam:{//眼压 表单 对象
                    iopOd:"",//眼压数值（OD）
                    iopOs:"",//眼压数值（Os）
                    tonometryType:"",//眼压类型
                    fingerTonometryOd:"",//指测眼压结果（OD）
                    fingerTonometryOs:"",//指测眼压结果（Os）
                },
                dchVisionFunc:{//色觉 光定位 光感表单 对象
                    lightPerceptionOd:"",//右 光感OD
                    lightPerceptionOdLabel:"",
                    lightPerceptionOs:"",//左 光感os
                    lightPerceptionOsLabel:"",
                    lightProjectionOd:"",//右 光定位od
                    lightProjectionOs:"",//左 光定位os
                    colourVisionRedOd:"",//右 色觉 红
                    colourVisionRedOs:"",//左 色觉 红
                    colourVisionGreenOd:"",//右 色觉 绿
                    colourVisionGreenOs:"",//左 色觉 绿
                },

                payItemIds: [],
                odpress:{tonometryType:"",fingerTonometry:"",iop:""},
                ospress:{tonometryType:"",fingerTonometry:"",iop:""},

            },
            resetForm:{}, 
            costList: [],//检查结果弹窗里 费用列表
            columns: [],//["0.08", "0.06", "0.04", "0.02", "2.0", "1.5", "1.2", "1.0", "0.8", "0.6", "0.5", "0.4", "0.3", "0.25", "0.2", "0.15", "0.12", "0.1"],
            far_eyesight:[],//远视力
            eyesight_desc:[],//远视力描述
            near_eyesight:[],//近视力
            iop_type:[],//眼压类型
            finger_tonometry:[],//指压法码表
            currentPickerField: "",
            operateTitle:"",//操作弹窗的标题名称 e.g: 13号 张三
            regNumber:"",//就诊号
            queueId:"",//队列号
            bgRefreshTimeFlag:null,//页面后台时间刷新标识
            showFarSightModel:false,//远视力弹窗
            farSightColumns:[],//远视力选项
            showNearSightPicker:false,//近视力弹窗
            nearSightcolumns:[],//近视力选项
            showLightPicker:false,//光感弹窗
            lightColumns:[//光感选项
                {valueCode:"1",valueDesc:"1米"},
                {valueCode:"2",valueDesc:"2米"},
                {valueCode:"3",valueDesc:"3米"},
                {valueCode:"4",valueDesc:"4米"},
                {valueCode:"5",valueDesc:"5米"},
                {valueCode:"6",valueDesc:"6米"},
                {valueCode:"7",valueDesc:"7米"},
                {valueCode:"8",valueDesc:"8米"},
                {valueCode:"9",valueDesc:"9米"},
                {valueCode:"10",valueDesc:"10米"}
            ],
        };
    },
    methods: {
        logout(){
            vant.Dialog.confirm({
                title: "您确定推出系统吗？",
                beforeClose:(action, done)=>{
                    if (action === "confirm") {
                        window.location.href ="/logout";
                    } else {
                        done();
                    }
                }
            });
        },
        getAnswer: _.debounce(
            function () {
                try {
                    let index = this.form.payItemIds.findIndex(item=>{
                        return item === "all";
                    });
                    if(index!=-1){//all被选中
                        if(!(this.costList.length == this.form.payItemIds.length - 1)){//如果 总费用长度 与 选择费用长度 不一致
                            this.form.payItemIds.splice(index,1);// 取消 all 选中
                        }
                    }else{//all未被选中
                        if(this.costList.length == this.form.payItemIds.length){//如果 选中费用长度 与 总共费用长度一致
                            this.form.payItemIds.push("all");//将 all 选中
                        }
                    }
                }catch (e) {
                    console.log(e);
                }
            },
            50
        ),
        openResultModel(){
            this.resultModelBtn.disabled = true;
            this.resultModelBtn.loading = true;
            axios.post("/getHasCommonResultPatient").then((res)=>{
                let {data} = res;
                console.log(data);
                this.resultList = data.data;
                this.updateResultModel = true;
                this.resultModelBtn.disabled = false;
                this.resultModelBtn.loading = false;
            });
            // setTimeout(()=>{
            //     this.updateResultModel = true;
            //     this.resultModelBtn.disabled = false;
            //     this.resultModelBtn.loading = false;
            // },1000);


        },
        bgRefresh(){
            clearInterval(this.bgRefreshTimeFlag);
            this.bgRefreshTimeFlag = setInterval(()=>{
                axios.post("/commonClientLogin").then((res)=>{
                    var data = res.data;
                    this.waitQueueList = data.data.queueList[0].waitingQue;
                    this.passQueueList = data.data.queueList[0].overDUE;
                    this.inQueueList = data.data.queueList[0].seekQue;
                });
            },1000*60*1);
            //1000*60*5  每五分钟
        },
        /**
         * 刷新页面数据
         */
        refresh(){
            this.refreshBtn.disabled = true;
            this.refreshBtn.loading = true;
            this.fetchQueueData().then(res=>{
                console.log(res);
                this.refreshBtn.disabled = false;
                this.refreshBtn.loading = false;
                vant.Notify({
                    message: "刷新成功",
                    color: "#ffffff",
                    background: "#07c160"
                });
            }).catch(err=>{
                vant.Notify("错误："+err);
                this.refreshBtn.disabled = false;
                this.refreshBtn.loading = false;
            });
        },
        /**
         * 请求显示列表数据
         */
        fetchQueueData(){
            this.bgRefresh();
            return axios.post("/commonClientLogin").then((res)=>{
                var data = res.data;
                this.waitQueueList = data.data.queueList[0].waitingQue;
                this.passQueueList = data.data.queueList[0].overDUE;
                this.inQueueList = data.data.queueList[0].seekQue;
            });
        },
        /**
         * 查询费用
         */
        fetchFeeData(){
            return axios.post("/getFeeList").then((res)=>{
                var {data} = res.data;
                this.costList = data;
            });
        },
        /**
         * 查询视力码表
         */
        fetchDictView(){
            return axios.post("/getDictView").then((res)=>{
                let {data} = res.data;
                this.columns = data.far_eyesight;
                this.far_eyesight = data.far_eyesight;
                this.eyesight_desc = data.eyesight_desc;
                this.near_eyesight = data.near_eyesight;
                this.nearSightcolumns = data.near_eyesight;
                this.finger_tonometry = data.finger_tonometry;
                this.iop_type = data.iop_type;

                this.farOption["数值"] = data.far_eyesight;
                this.farOption["描述"] = data.eyesight_desc;
                this.farSightColumns = [//远视力选项
                    {
                        values: Object.keys(this.farOption),
                        className: "column1",
                    },
                    {
                        values: this.farOption["数值"],
                        className: "column2",
                        defaultIndex: 0
                    }
                ];
            });
        },
        /**
         * 免检按钮
         */
        withoutChecking(item){
            vant.Dialog.confirm({
                title: `是否免检：(${item.orders}号)${item.patientName}`,
                beforeClose:(action, done)=>{
                    if (action === "confirm") {
                        axios.post("/padSeek",{regNumber:item.regNumber,saveResult:1}).then((res)=>{
                            console.log(res);
                            this.fetchQueueData();//刷新列表
                            vant.Notify({
                                message: "操作成功",
                                color: "#ffffff",
                                background: "#07c160"
                            });
                            done();
                        }).catch((err)=>{
                            console.log(err);
                            vant.Notify("错误："+err);
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
        passToCallin(item){
            vant.Dialog.confirm({
                title: `是否已接诊：(${item.orders}号)${item.patientName} `,
                beforeClose:(action, done)=>{
                    if (action === "confirm") {
                        axios.post("/padSeek",{regNumber:item.regNumber,saveResult:1}).then((res)=>{
                            console.log(res);
                            this.fetchQueueData();//刷新列表
                            vant.Notify({
                                message: "操作成功",
                                color: "#ffffff",
                                background: "#07c160"
                            });
                            done();
                        }).catch((err)=>{
                            console.log(err);
                            vant.Notify("错误："+err);
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
            axios.post("/padSeek",{regNumber:this.regNumber,saveResult:0}).then((res)=>{
                console.log(res);
                this.fetchQueueData();//刷新列表
                this.showBtn = false;
                this.callInBtn.disabled = false;
                this.callInBtn.loading = false;
            }).catch((err)=>{
                console.log(err);
                vant.Notify("错误："+err);
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
            axios.post("/callAgain",{queueId:this.queueId,regNumber:this.regNumber}).then((res)=>{
                console.log(res);
                this.fetchQueueData();//刷新列表
                // this.showBtn = false;
                this.reCallBtn.loading = false;
                this.reCallBtn.disabled = false;
            }).catch((err)=>{
                vant.Notify("错误："+err);
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
            axios.post("/padOver",{regNumber:this.regNumber}).then((res)=>{
                console.log(res);
                this.fetchQueueData();//刷新列表
                this.showBtn = false;
                this.passBtn.loading = false;
                this.passBtn.disabled = false;
            }).catch((err)=>{ 
                vant.Notify("错误："+err);
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
            axios.post("/getPadNext").then((res)=>{
                console.log(res);
                var data = res.data.data;
                if(data.queueList[0].callQue.length > 0){
                    var callObj = data.queueList[0].callQue[0];
                    this.operateTitle = `${callObj.orders} ${callObj.patientName}`;
                    this.queueId = data.queueList[0].queueId;
                    this.regNumber = callObj.regNumber;
                    this.showBtn = true;
                }else{
                    vant.Notify({
                        message: "当前已无候检患者",
                        color: "#ffffff",
                        background: "#07c160"
                    });
                }
                this.nextBtn.disabled = false;
                this.nextBtn.loading = false;
            }).catch((err)=>{
                vant.Notify("错误："+err);
                this.nextBtn.disabled = false;
                this.nextBtn.loading = false;
            });
        },
        /**
         * [showPopup 显示结果费用弹窗]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        showPopup(item) {
            console.log(item);
            this.form.bid = item.bid;
            axios.post("/getCommonObserveByBid",{bid:item.bid}).then((res)=>{
                var {data} = res.data;
                if(!data){//未查询到数据
                    return;
                }
                if(!data.payItemIds){
                    data.payItemIds = [];
                }
                if(!data.dchVisionExam.hospId){
                    data.dchVisionExam.hospId = item.hospId;
                }
                if(!data.dchVisionExam.visitNumber){
                    data.dchVisionExam.visitNumber = item.regNumber;
                }
                if(!data.dchVisionExam.bid){
                    data.dchVisionExam.bid = item.bid;
                }

                this.form = JSON.parse(JSON.stringify(data)) ;
                if(data.dchVisionExam.inspection == 1){//费用是否选中，都按后台的来
                    if(!data.payItems){
                        data.payItems = [];
                    }else{
                        data.payItems.forEach(item=>{
                            data.payItemIds.push(item.payItemId);
                        });
                        this.form.payItemIds = data.payItemIds;
                    }
                }else{//都勾上
                    this.form.payItemIds = this.costList.map(item=>{
                        return item.payItemId;
                    });
                }
                //设置眼压
                this.$set(this.form,"odpress",{
                    tonometryType:this.form.dchIopExam.tonometryType,
                    fingerTonometry:this.form.dchIopExam.fingerTonometryOd,
                    iop:this.form.dchIopExam.iopOd,
                });
                this.$set(this.form,"ospress",{
                    tonometryType:this.form.dchIopExam.tonometryType,
                    fingerTonometry:this.form.dchIopExam.fingerTonometryOs,
                    iop:this.form.dchIopExam.iopOs,
                });
                this.setNearLabelText("ccnOs",this.form.dchVisionExam.ccnOs);//矫正近视力 左
                this.setNearLabelText("scnOs",this.form.dchVisionExam.scnOs);//近视力 左
                this.setSingleFarLabelText("phdOs",this.form.dchVisionExam.phdOs);//小孔视力 左
                this.setSingleFarLabelText("ccdOs",this.form.dchVisionExam.ccdOs);//矫正视力 左
                this.setFarLabelText("scdOs",this.form.dchVisionExam.scdOs,this.form.dchVisionExam.scdDescOs,this.form.dchVisionExam.scdOsType);//远视力 左
                this.setNearLabelText("ccnOd",this.form.dchVisionExam.ccnOd);//矫正近视力
                this.setNearLabelText("scnOd",this.form.dchVisionExam.scnOd);//近视力 右
                this.setSingleFarLabelText("phdOd",this.form.dchVisionExam.phdOd);//小孔视力 右
                this.setSingleFarLabelText("ccdOd",this.form.dchVisionExam.ccdOd);//矫正视力 右
                this.setFarLabelText("scdOd",this.form.dchVisionExam.scdOd,this.form.dchVisionExam.scdDescOd,this.form.dchVisionExam.scdOdType);//远视力 右
                this.setLightLabelText("lightPerceptionOd",this.form.dchVisionFunc.lightPerceptionOd);//右 光感
                this.setLightLabelText("lightPerceptionOs",this.form.dchVisionFunc.lightPerceptionOs);//左 光感


            }).catch((err)=>{

                vant.Notify("错误："+err);
                console.log(this.form);
            });
            this.showResult = true;
        },
        //设置远视力
        setFarLabelText(field,val,desc,type){
            if(type == 1){//数值
                if(!val){
                    return;
                }
                let t = this.far_eyesight.find(item=>item.valueCode == val);
                // this.form.dchVisionExam[field + "Label"] = t.valueDesc;
                this.$set(this.form.dchVisionExam,`${field}Label`,t.valueDesc);
            }else if(type == 2){//描述
                if(!desc){
                    return;
                }
                let t = this.eyesight_desc.find(item=>item.valueCode == desc);
                // this.form.dchVisionExam[field + "Label"] = t.valueDesc;
                this.$set(this.form.dchVisionExam,`${field}Label`,t.valueDesc);
            }
        },
        //设置光感
        setLightLabelText(field,val){
            if(val){
                let value = this.lightColumns.find(item=>{
                    return item.valueCode == val;
                });
                this.form.dchVisionFunc[field + "Label"] = value.valueDesc;
            }
        },
        //设置单列远视力
        setSingleFarLabelText(field,val){
            if(val){
                let value = this.far_eyesight.find(item=>{
                    return item.valueCode == val;
                });
                this.form.dchVisionExam[field + "Label"] = value.valueDesc;
            }
        },
        //设置近视力显示标签
        setNearLabelText(field,val){
            if(val){
                let value = this.near_eyesight.find(item=>{
                    return item.valueCode == val;
                });
                this.form.dchVisionExam[field + "Label"] = value.valueDesc;
            }
        },
        toggle(index) {
            this.$refs.checkboxes[index].toggle();
        },
        toggleAll() {
            setTimeout(() => {
                this.$nextTick(() => {
                    if (this.$refs.checkboxAll.checked) {
                        this.form.payItemIds = this.costList.map(item => {
                            return item.payItemId;
                        });
                        this.form.payItemIds.push(this.$refs.checkboxAll.name);
                    } else {
                        this.form.payItemIds = [];
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
                beforeClose:(action, done)=>{
                    if (action === "confirm") {
                        this.saveData().then(()=>{
                            done();
                            this.fetchQueueData();
                        }).catch(()=>{
                            done();
                            this.fetchQueueData();
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
         * 录入结果层 弹出事件
         */
        handleOpenResult(){
            this.form.payItemIds = this.costList.map(item=>{
                return item.payItemId;
            });
        },
        /**
         * 录入结果层 关闭事件
         */
        handleCloseResult(){
            this.formReset();
        },
        /**
         * [saveData 保存数据]
         * @Author tanglv   2019-08-19
         * @return {[type]} [description]
         */
        saveData(){
            let data = JSON.parse(JSON.stringify(this.form));
            if(this.form.payItemIds.length > 0 ){//有费用的情况
                let costObjArr = this.costList.filter(item=>{
                    let index = this.form.payItemIds.findIndex(payitem=>{
                        return payitem == item.payItemId;
                    });
                    return index!=-1;
                });
                data.payItems = costObjArr;
            }
            return myAxios.post("/padSaveResult", JSON.stringify(data))
                .then((response)=> {
                    vant.Notify({
                        message: `${response.data.msg}`,
                        color: "#ffffff",
                        background: "#07c160"
                    });
                    this.showResult = false;
                    this.formReset();
                })
                .catch(()=> {
                    vant.Notify("保存失败");
                });
            //以下是jquery方式，已废弃
            // return new Promise((resolve, reject) => {// eslint-disable-line
            //     $.ajax({
            //         url: "/padSaveResult",
            //         type: "POST",
            //         dataType: "json",
            //         contentType: "application/json",
            //         data: JSON.stringify(data),
            //         success: (response)=> {
            //             vant.Notify({
            //                 message: `${response.msg}`,
            //                 color: "#ffffff",
            //                 background: "#07c160"
            //             });
            //             this.showResult = false;
            //             this.formReset();
            //             resolve();
            //         },
            //         error:(e)=> {
            //             console.log(e);
            //             resolve();
            //         }
            //     });
            // });
        },
        formReset(){
            this.form = JSON.parse(JSON.stringify(this.resetForm));
        },
        /**
         * [handleShowPicker 显示单列远视力选择弹窗]
         * @Author tanglv   2019-08-19
         * @param  {[type]} type       [description]
         * @return {[type]}            [description]
         */
        handleShowPicker(type) {
            this.showPicker = true;
            this.currentPickerField = type;
            if(this.form.dchVisionExam[this.currentPickerField]){
                this.$nextTick(()=>{
                    let index = this.far_eyesight.findIndex(item=>{
                       return item.valueCode == this.form.dchVisionExam[this.currentPickerField];
                    });
                    if(index!=-1){
                        this.$refs.singleFarSight.setIndexes([index]);
                    }
                });
            }
        },
        //显示远视力选择器
        showFarSight(leftOrRight){//type
            this.showFarSightModel = true;
            this.currentPickerField = leftOrRight;
            //判断类型
            let tmpType = `scd${leftOrRight}Type`;//设置是 数值 还是 描述
            if(this.form.dchVisionExam[tmpType]){//判断是 1数值 2描述
                let index = -1,type = -1;
                if(this.form.dchVisionExam[tmpType] == 1){//数值
                    type = 0;
                    index = this.far_eyesight.findIndex(item=>{
                        return item.valueCode == this.form.dchVisionExam[`scd${leftOrRight}`];
                    });
                }else{//描述
                    type = 1;
                    index = this.eyesight_desc.findIndex(item=>{
                        return item.valueCode == this.form.dchVisionExam[`scdDesc${leftOrRight}`];
                    });
                }
                this.$nextTick(()=>{
                    if(type!=-1){
                        this.$refs.farSight.setColumnIndex(0,[type]);
                        this.$refs.farSight.setColumnValues(1, this.farOption[type==0?"数值":"描述"]);
                    }
                    if(index!=-1){
                        this.$refs.farSight.setColumnIndex(1,[index]);
                    }
                });
            }
        },
        //远视力选择器改变事件
        onFarSightChange(picker, values) {
            picker.setColumnValues(1, this.farOption[values[0]]);
        },
        //远视力选择器确定事件
        onFarSightConfirm(value){
            var typeVal = 2;//1数值2描述
            if(value[0]=="数值"){
                typeVal = 1;
            }
            if(this.currentPickerField.toLowerCase().indexOf("od")!=-1){
                this.form.dchVisionExam["scdOdType"] = typeVal;
            }else{
                this.form.dchVisionExam["scdOsType"] = typeVal;
            }
            if(typeVal==1){//类型是数值
                this.form.dchVisionExam[`scd${this.currentPickerField}`] = value[1].valueCode;
                this.form.dchVisionExam[`scd${this.currentPickerField}Label`] = value[1].valueDesc;
            }else{//类型是描述
                this.form.dchVisionExam[`scdDesc${this.currentPickerField}`] = value[1].valueCode;
                this.form.dchVisionExam[`scd${this.currentPickerField}Label`] = value[1].valueDesc;
            }
            this.showFarSightModel = false;
        },
        /**
         * 显示近视力选项弹窗
         * @param type
         */
        showNearSight(type){
            this.showNearSightPicker = true;
            this.currentPickerField = type;
            if(this.form.dchVisionExam[this.currentPickerField]){
                this.$nextTick(()=>{
                    let index = this.near_eyesight.findIndex(item=>{
                        return item.valueCode == this.form.dchVisionExam[this.currentPickerField];
                    });
                    if(index!=-1){
                        this.$refs.singleNearSight.setIndexes([index]);
                    }
                });
            }
        },
        /**
         * 近视力 选项确定事件
         * @param value
         */
        onNearSightConfirm(value){
            this.form.dchVisionExam[this.currentPickerField] = value.valueCode;
            this.form.dchVisionExam[this.currentPickerField+"Label"] = value.valueDesc;
            this.showNearSightPicker = false;
        },
        /**
         * 显示 光感 选择弹出框
         * @param type
         */
        showLight(type){
            this.showLightPicker = true;
            this.currentPickerField = type;
            if(this.form.dchVisionFunc[this.currentPickerField]){
                this.$nextTick(()=>{
                    let index = this.lightColumns.findIndex(item=>{
                        return item.valueCode == this.form.dchVisionFunc[this.currentPickerField];
                    });
                    if(index!=-1){
                        this.$refs.lightPicker.setIndexes([index]);
                    }
                });
            }
        },
        /**
         * 光感选项 确定事件
         * @param value
         */
        onLightConfirm(value){
            this.form.dchVisionFunc[this.currentPickerField] = value.valueCode;
            this.form.dchVisionFunc[this.currentPickerField+"Label"] = value.valueDesc;
            this.showLightPicker = false;
        },
        /**
         * [onConfirm 单列远视力 弹窗确定事件]
         * @Author tanglv   2019-08-19
         * @param  {[type]} value      [description]
         * @return {[type]}            [description]
         */
        onConfirm(value) {
            this.form.dchVisionExam[this.currentPickerField] = value.valueCode;
            this.form.dchVisionExam[this.currentPickerField+"Label"] = value.valueDesc;
            this.showPicker = false;
        },
    }
});

/* 候检、过号、已检未录、已检已录 列表组件 */
Vue.component("patient-column", {
    props: {
        bgcolor: {
            type: String,
            default: "#ccc"
        },
        color:{
            type:String,
            default:"#303133"
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            observer:null,
            minNum:1, 
        };
    },
    created(){
        window.addEventListener("resize", ()=>{
            this.calcHeight();
        });
    },
    methods:{
        calcHeight(){
            this.minNum = Math.ceil(this.$el.clientHeight/this.$el.childNodes[0].childNodes[0].clientHeight);
            console.log("this.minNum:"+this.minNum);
        }
    },
    mounted(){
        this.$nextTick(()=>{
            this.minNum = Math.ceil(this.$el.clientHeight/this.$el.childNodes[0].childNodes[0].clientHeight);
            if(this.$el.scrollHeight > this.$el.clientHeight){
                this.$el.childNodes[0].style.overflow = "visible";
            }

            this.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function(mutation) {
                    var height = Math.max(mutation.target.childNodes[0].clientHeight,mutation.target.childNodes[0].scrollHeight);
                    if(height > mutation.target.clientHeight){
                        mutation.target.childNodes[0].style.overflow = "hidden";
                    }
                    if(mutation.target.scrollHeight > mutation.target.clientHeight){
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
            this.observer.observe(this.$el,config);
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
                        <span class="showItem-span" v-bind:style="{color:color}">
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

/* 检查结果 组件 - 已废弃 */
Vue.component("result-item", {
    props: {
        bgcolor: {
            type: String,
            default: "#ccc"
        },
        color:{
            type:String,
            default:"#303133"
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            observer:null,
            minNum:1,
        };
    },
    created(){
        window.addEventListener("resize", ()=>{
            this.calcHeight();
        });
    },
    methods:{
        calcHeight(){
            this.minNum = Math.ceil(this.$el.clientHeight/this.$el.childNodes[0].childNodes[0].clientHeight);
            console.log("this.minNum:"+this.minNum);
        }
    },
    mounted(){
        this.$nextTick(()=>{
            this.minNum = Math.ceil(this.$el.clientHeight/this.$el.childNodes[0].childNodes[0].clientHeight);
            if(this.$el.scrollHeight > this.$el.clientHeight){
                this.$el.childNodes[0].style.overflow = "visible";
            }

            this.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function(mutation) {
                    var height = Math.max(mutation.target.childNodes[0].clientHeight,mutation.target.childNodes[0].scrollHeight);
                    if(height > mutation.target.clientHeight){
                        mutation.target.childNodes[0].style.overflow = "hidden";
                    }
                    if(mutation.target.scrollHeight > mutation.target.clientHeight){
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
            this.observer.observe(this.$el,config);
        });
    },
    template: ` <div class="bg-container" >
                    <div class="bg-item">
                        <template v-if="data.length > minNum">
                            <div class="bgDiv cell-height" v-for="i in data.length" v-bind:style="{backgroundColor:bgcolor}"></div>
                        </template>    
                        <template v-else>
                            <div class="bgDiv cell-height" v-for="i in minNum" v-bind:style="{backgroundColor:bgcolor}"></div>
                        </template> 
                    </div>
                    <div v-for="i in data" class="showItem cell-height">
                        <span class="showItem-span" v-bind:style="{color:color}">
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

/* 光定位 组件*/
Vue.component("light-item", {
    props: {
        value:{
            type:String,
            default:""
        }
    },
    watch:{
        "value":{
            handler(val){
                if(val){//有值，显示九宫格
                    this.optBtn = false;
                    this.closeBtn = false;
                    this.curVal = val.split("");

                }else{//无值，显示启用按钮
                    this.optBtn = true;
                    this.closeBtn = true;
                    this.alwaysCloseBtn = false;
                }
            },
            immediate:true
        }
    },
    data() {
        return {
            curVal:"",
            optBtn:true,//显示启用按钮 标识
            closeBtn:false,//关闭九宫格按钮 标识
            alwaysCloseBtn:false,//总是显示 关闭九宫格按钮 标识
        };
    },
    methods:{
        handlePress(e){
            e.stopPropagation();
            if(e.target.className == "light-icon-item"){
                this.$set(this.curVal,e.target.getAttribute("data-index"),e.target.innerHTML=="+"?"0":"1");
                this.$emit("input", this.curVal.join(""));
            }
        },
        //显示九宫格初始值录入
        showDefaultGrid(){
            this.optBtn = false;
            this.curVal=[1,1,1,1,1,1,1,1,1];
            this.$emit("input", this.curVal.join(""));
            this.$nextTick(()=>{
                this.alwaysCloseBtn = true;
            });
        },
        //显示启用九宫格按钮
        showOptBtn(){
            this.optBtn = true;
            this.$emit("input","");
        }
    },
    template: ` 
        <div class="light-position-container" @click="handlePress">
            <template v-if="!optBtn">
                <van-icon name="close" v-if="alwaysCloseBtn || closeBtn" @click="showOptBtn" size="22" class="light-position-always-close-btn"/>
                <div v-for="(i,index) in curVal" :key="index"  class="light-icon-item" :data-index="index">{{i=='1'?'+':'-'}}</div>
            </template>
            <template v-else>
                <van-icon name="records" size="40" @click="showDefaultGrid"/>
            </template>
            
            <input ref="input" type="hidden">
        </div>
    `
});


/* 色觉组 组件*/
Vue.component("colour-group-item", {
    props: {
        value:{
            type:Object,
        },
        leftRightEye:{
            type:String
        },
    },
    watch:{
        "value":{
            handler(val){
                this.curVal = val;
                if(val[`colourVisionRed${this.leftRightEye}`]){//有值
                    this.optBtn = false;
                    this.closeBtn = false;
                }else{//无值
                    this.optBtn = true;
                    this.closeBtn = true;
                    this.alwaysCloseBtn = false;
                }
            },
            immediate:true,
            deep:true
        }
    },
    data() {
        return {
            curVal:"",
            optBtn:true,//显示启用按钮 标识
            closeBtn:false,//关闭九宫格按钮 标识
            alwaysCloseBtn:false,//总是显示 关闭九宫格按钮 标识
        };
    },
    methods:{
        showDefaultGrid(){
            this.curVal[`colourVisionRed${this.leftRightEye}`] = 1;
            this.curVal[`colourVisionGreen${this.leftRightEye}`] = 1;
            this.$emit("input", this.curVal);
            this.optBtn = false;
            this.$nextTick(()=>{
                this.alwaysCloseBtn = true;
            });
        },
        showOptBtn(){
            this.optBtn = true;
            this.curVal[`colourVisionRed${this.leftRightEye}`] = "";
            this.curVal[`colourVisionGreen${this.leftRightEye}`] = "";
            this.$emit("input",this.curVal);
        }
    },
    template: ` 
        <div>
            <van-row>
                <input ref="input" type="hidden">
                <template v-if="!optBtn">
                    <van-col :span="alwaysCloseBtn?10:12" class="textAlignCenter">
                         <slot name="red"></slot>
                    </van-col>
                    <van-col :span="alwaysCloseBtn?10:12" class="textAlignCenter">
                         <slot name="green"></slot>
                    </van-col>
                    <van-col :span="alwaysCloseBtn?4:0" class="textAlignCenter">
                         <van-icon name="close" v-if="alwaysCloseBtn || closeBtn" @click="showOptBtn" size="22" />
                    </van-col>
                </template>
                <template v-else>
                    <van-col span="24"  class="textAlignCenter">
                        <van-icon name="records" size="20" @click="showDefaultGrid"/>
                    </van-col>
                </template>
            </van-row>
        </div>
    `
});

/* 色觉 组件*/
Vue.component("colour-item", {
    props: {
        text:{
            type:String,
            default:"红"
        },
        value:{
            type:String,
            default:"1"
        }
    },
    data() {
        return {
            curVal:this.value
        };
    },
    created(){
        if(this.value===""){
            this.curVal = 1;
            this.$emit("input", this.curVal?"1":"0");
        }
    },
    methods:{
        handleToggle(e){
            e.stopPropagation();
            this.curVal = !this.curVal;
            this.$emit("input", this.curVal?"1":"0");
        }
    },
    template: ` 
        <div @click="handleToggle">
            <span style="vertical-align: text-bottom;">{{text}}</span>
            <span style="font-size: 26px">{{curVal==1?'+':'-'}}</span>
            <input ref="input" type="hidden">
        </div>
    `
});


/* 眼压 组件*/
Vue.component("eyepress-item", {
    props: {
        iop_type:{//眼压类型
            type:Array
        },
        finger_tonometry:{//指压值
            type:Array
        },
        leftRightEye:{
            type:String
        },
        value:{
            type:Object
        }
    },
    created(){
        this.$set(this.pressType,"眼压",this.withoutFinger);
        this.eyePressColumns = [
            {
                values: Object.keys(this.pressType),
                className: "column1"
            },
            {
                values: this.pressType["眼压"],
                className: "column2",
                defaultIndex: 0
            }
        ];
    },
    data() {
        return {
            pressType:{
                "眼压":this.withoutFinger,
                "指压法":this.finger_tonometry
            },
            form:{
                typePickVal:this.value.tonometryType,//眼压类型值
                typePickLabel:"",//眼压类型显示值
                shiatsuPickVal:this.value.fingerTonometry,//指压法值
                shiatsuPickLabel:"",//指压法显示值
                stepperVal:this.value.iop || 9,//眼压值
            },
            showEyePressModel:false,
            eyePressColumns:[],//眼压选项
        };
    },
    watch:{
        "value":{
            handler(val){
                this.form.typePickVal = val.tonometryType;//眼压类型值
                this.form.shiatsuPickVal = val.fingerTonometry;
                this.form.stepperVal = val.iop;
            },
            deep: true,
            immediate: true
        },
        "form.typePickVal":{
            handler(val){
                if(val){
                    let t = this.iop_type.find(item=>item.valueCode==val);
                    this.form.typePickLabel = t.valueDesc;
                }else{
                    this.form.typePickLabel = "";
                }

            },
            deep: true,
            immediate: true
        },
        "form.shiatsuPickVal":{
            handler(val){
                if(val){
                    let t = this.finger_tonometry.find(item=>item.valueCode==val);
                    this.form.shiatsuPickLabel = t.valueDesc;
                }else{
                    this.form.shiatsuPickLabel = "";
                }
            },
            deep: true,
            immediate: true
        },
    },
    computed:{
        withoutFinger(){//去除 指压法 的码表值
            return this.iop_type.filter(item=>{
               return item.valueDesc != "指压法";
            });
        },
        finger(){//指压法码表值
            return this.iop_type.find(item=>item.valueDesc == "指压法");
        }
    },
    methods:{
        //显示眼压选项框
        showEyePress(){
            this.showEyePressModel = true;
            this.$nextTick(()=>{
                let index = -1,type = -1;
                if(this.form.typePickLabel == "指压法"){//指压法
                    index = this.finger_tonometry.findIndex(item=>{
                        return item.valueCode == this.form.shiatsuPickVal;
                    });
                    type = 1;
                }else{//其它眼压
                    index = this.withoutFinger.findIndex(item=>{
                        return item.valueCode == this.form.typePickVal;
                    });
                    type = 0;
                }
                if(type!=-1){
                    this.$refs.eyePressPicker.setColumnIndex(0,[type]);//设置第一列默认选中项
                    this.$refs.eyePressPicker.setColumnValues(1, this.pressType[type==0?"眼压":"指压法"]);//设置第二列选项值
                }
                if(index!=-1){
                    this.$refs.eyePressPicker.setColumnIndex(1,[index]);//设置第二列默认选中项
                }
            });
        },
        //眼压选项框确认事件
        onEyePressConfirm(value){
            if(value[0]=="眼压"){//眼压的情况
                this.form.typePickVal = value[1].valueCode;
                this.form.typePickLabel = value[1].valueDesc;
            }else{//指压法的情况
                this.form.typePickVal = this.finger.valueCode;
                this.form.typePickLabel = "指压法";
                this.form.shiatsuPickVal = value[1].valueCode;
                this.form.shiatsuPickLabel = value[1].valueDesc;
            }
            this.$emit("input",{tonometryType:this.form.typePickVal,fingerTonometry:this.form.shiatsuPickVal,iop:this.form.stepperVal});
            this.showEyePressModel = false;
        },
        //眼压选项框改变事件
        onEyePressChange(picker, values) {
            picker.setColumnValues(1, this.pressType[values[0]]);
        },
        //眼压值 步进器改变事件
        handleStepChange(){
            this.$emit("input",{tonometryType:this.form.typePickVal,fingerTonometry:this.form.shiatsuPickVal,iop:this.form.stepperVal});
        }
    },
    template: ` 
        <div>
            <input ref="input" type="hidden">
            <!-- 眼压 picker -->
            <van-popup v-model="showEyePressModel" position="bottom" >
                <van-picker ref="eyePressPicker" :columns="eyePressColumns" value-key="valueDesc" show-toolbar @change="onEyePressChange" @confirm="onEyePressConfirm" @cancel="showEyePressModel = false"></van-picker>
            </van-popup>
            <van-row>
                <!-- 眼压类型 -->
                <van-col :span="form.typePickLabel?13:24">
                    <van-field clearable right-icon="arrow-down" readonly @click="showEyePress('scnOd')" input-align="center" v-model="form.typePickLabel"></van-field>
                </van-col>
                <!-- 眼压值 -->
                <van-col span="11" v-show="(form.typePickLabel && form.typePickLabel != '指压法')">
                    <van-stepper v-model="form.stepperVal" step="1" max="99" button-size="24px" @change="handleStepChange"/>
                </van-col>
                <!-- 指压法选项 -->
                <van-col span="11" v-show="form.typePickLabel == '指压法' ">
                    <van-field clearable right-icon="arrow-down" readonly @click="showEyePress" input-align="center" v-model="form.shiatsuPickLabel"></van-field>
                </van-col>
            </van-row>
        </div>
    `
});

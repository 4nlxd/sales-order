import {notification, Select} from 'antd';


export default {
    toFixed: function (num, s) {
        let times = Math.pow(10, s);
        let des = num * times + 0.5;
        des = parseInt(des, 10) / times;
        return des;
    },

    openNotification : function (type, desc){
        notification[type]({
            message: '提示信息',
            description: desc
        })
    },

    shopsData: [{"code": "14", "name": "惠商"}, {"code": "20", "name": "新零售"}],

    getShopIds: function(){
        let _arr = [];

        for(let i=0; i<this.shopsData.length; i++){
            _arr.push(this.shopsData[i].code);
        }

        return _arr;
    },

    transformNameById : function(data, id){
        for(let i=0; i<data.length; i++){
            if(data[i].code == id){
                return data[i].name;
            }
        }
    },

    salesType: [{"code": "3", "name": "套餐"}, {"code": "1", "name": "赠品"}, {"code": "7", "name": "下单立减"}],

    setOptions: function (data) {
        let _options = [];

        for(let i=0; i<data.length; i++){
            _options.push(<Select.Option value={data[i].code} key={data[i].code}>{ data[i].name }</Select.Option>);
        }

        return _options;
    },

    terminalData: [{ value: '1', label: 'PC' }, { value: '2', label: 'WAP' }, { value: '3', label: 'APP' }, { value: '4', label: 'Wechat' }],

    transformTerminal: function(ids){
        let _html = [],
            _ids = ids.split(",");

        for(let i=0; i<_ids.length; i++){
            for(let q=0; q<this.terminalData.length; q++){
                if(_ids[i] == this.terminalData[q].value){
                    _html.push(this.terminalData[q].label);
                }
            }
        }

        return _html.join(",");
    },

    transformOrderstatus: function(orderStatus, orderFlowState){
        if (orderStatus == 110) {
            if(orderFlowState == '1200'){
                return '待支付';
            }else if(orderFlowState == '1250'){
                return '支付中';
            }else if(orderFlowState == '1300'){
                return '支付完毕';
            }else if(orderFlowState == '1400'){
                return '出小票';
            }else if(orderFlowState == '1500'){
                return '结单';
            }
        } else if (orderStatus == 120) {
            return '已冻结';
        } else if (orderStatus == 130) {
            return '已取消';
        } else if (orderStatus == 140) {
            return '已退货';
        } else if (orderStatus == 145) {
            return '已退预收款';
        } else if (orderStatus == 150) {
            return '已预收转销售';
        }
    },

    getTotalPrice: function(data) {
        let total = data && data.originalTotalPrice || 0;
        return total.toFixed(2);
    },

    getDiscountVal: function(data){
        let discount = data && data.shopDiscount || 0;
        return discount.toFixed(2);
    },

    getGiftDiscount: function(data){
        let discount = data && data.giftDiscount || 0;
        return discount.toFixed(2);
    },

    getCouponsVal: function(data){
        let coupons = data && data.coupons || [];

        let ckCoupons = coupons.filter((c)=>{
            if(c.selected){
                return c;
            }
        });

        let ckVal = 0;

        for(let i=0; i<ckCoupons.length; i++){
            ckVal += parseFloat(ckCoupons[i].amount);
        }

        return ckVal.toFixed(2);
    },

    getOriginTotal: function(data){
        let totalprice = this.getTotalPrice(data),
            discount = this.getDiscountVal(data),
            couponval = this.getCouponsVal(data),
            giftDiscount = this.getGiftDiscount(data);

        let total = (totalprice - couponval - discount - giftDiscount).toFixed(2);

        if(total < 0){ return 0; }

        return total;
    }
}

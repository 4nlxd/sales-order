import React from 'react';
import {hashHistory} from 'dva/router';
import {Form, Row, Col, Spin, AutoComplete, message, Button, Icon, Input, Radio, InputNumber, TreeSelect, Carousel, Modal, DatePicker} from 'antd';
import styles from './NewSalesOrder.css';
import cartService from '../../services/cartService';
import _ from 'lodash';
import base from '../../models/base';

const FormItem = Form.Item;
const { Option } = AutoComplete;
const RadioGroup = Radio.Group;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 14},
};

const loginId = loginInfo.loginId;
let readyToComputeJf = false;
let time = 60;

class SalesOrder extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            data: {},
            ckSn: {},
            currentItemIndex: -1,
            memberName: '',
            memberModal: false,
            hyfwqModal: false,
            delModal: false,
            addModal: false,
            regModal1: false,
            regModal2: false,
            getPhoneCode: false,
            changingPrice: false,
            priceError: false,
            stockError: false,
            searchProductArr: [],
            currentSnData: [],
            packageData: [],
            timeoutAble: true,

            memberJf: 0,
            usablePoints: 0,
            confirmMemberJf: 0,

            editPriceModal: false,
            shopId: ''
        };

        this.deleteKey = -1;
        this.changePrice = 0;
        this.state.ckSn.submited = [];
        this.dibanjia = 0;
        this.canAddPackage = true;
    }

    componentDidMount() {
        let that = this;

        cartService.getFaInfo().then((res)=>{
            let code = [];

            if(res.data.code == 200){
                let data = res.data.data && res.data.data[0].permission || [];

                for(let i=0; i<data.length; i++){
                    code.push(data[i].value);
                }
            }

            that.setState({ shopId: code.join(',') }, function(){
                that.autoLogin();
            });
        });
    };

    autoLogin = () => {
        if(/^0{4}/.test(this.state.memberName)){
            this.setState({memberModal: false}, function(){
                this.productCode.focus();
            });

            return;
        }

        let memberId = (this.props.location.state && this.props.location.state.memberId) ? this.props.location.state.memberId : ('0000' + this.state.shopId + new Date().getTime());

        this.setState({memberName: memberId, memberModal: false, confirmMemberJf: 0 }, function(){
            this.productCode.focus();
        });

        this.getCarts(memberId);
        !/^0{4}/.test(memberId) && this.getMemberJf(memberId);
    };

    submitOrder = () => {
        hashHistory.push({
            pathname: '/order/NewSalesOrder/submit',
            state: { data: this.state.data, memberId: this.state.memberName, memberJf: this.state.confirmMemberJf }
        });
    };

    doAddHandler = (code) => {
        const {setFieldsValue} = this.props.form;

        this.setState({ searchProductArr: [] }, function(){
            this.productCode.focus();

            setFieldsValue({
                "entCode": ""
            });
        });

        let custormId = this.state.memberName;

        if(!this.state.memberName){
            message.error('请输入会员卡号！');
            return;
        }

        if(code == ''){
            message.error('请输入商品名称或者扫码商品条码！');
            return;
        }

        this.setState({loading: true});

        cartService.addCart(custormId, code, '', this.state.shopId).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                this.getCarts(this.state.memberName);
            }else if(res.data.code == 3001){
                let data = res.data.data;

                data.single = true;

                for(let i in data.promotion.packs){
                    data.promotion.packs[i].select = false
                }

                this.setState({ addModal: true, packageData: data });
            }else{
                message.error(res.data.message);
            }
        });
    };

    addCart = (e) => {
        const code = this.transformM(e);

        this.doAddHandler(code);
    };

    pressAddCart = (e) => {
        let code = e.target.value;
        if(code == ''){
            return;
        }

        let searchArr = this.state.searchProductArr;

        if(searchArr.length == 0){
            this.doAddHandler(code);
        }
    };

    getCanuseJf = () => {
        const usablePoints = this.state.usablePoints;
        if(/^0{4}/.test(this.state.memberName)) return;

        if(readyToComputeJf){
            const originTotal = this.getOriginTotal(), jf = parseInt(this.state.usablePoints), maxjf = Math.round(originTotal * 5);
            let canusejf = jf > maxjf ? maxjf : (jf >= 100 ? jf : 0);
            if(canusejf < 100) canusejf = 0;
            this.setState({confirmMemberJf: canusejf})
        }else{
            console.log('waiting for ready to compute jf');
            setTimeout(this.getCanuseJf, 500);
        }
    };

    getCarts = (member) => {
        this.setState({ loading: true });

        cartService.getCart(member, this.state.shopId).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                let data = res.data.data || {}, items = data && data.items || [];

                for(let i=0; i<items.length; i++){
                    for(let q=0; q<items[i].productInfo.length; q++){
                        if(q>0){
                            if(items[i].productInfo[q].promotionType == 2){ //promotionType: 1:套餐  2:买赠
                                items[i].promotion = 1; //1 赠品  7 套餐
                                break;
                            }else if(items[i].productInfo[q].promotionType == 1){
                                items[i].promotion = 7;
                                break;
                            }
                        }else{
                            items[i].promotion = 0;
                        }
                    }
                }

                this.setState({
                    data: res.data.data || {},
                    couponModal: false
                }, this.getCanuseJf);

                if(this.state.data && this.state.data.items && this.state.data.items.length>0){
                    this.setState({ currentItemIndex: 0 });
                    this.confirmCurrentItem();
                }
            }else{
                message.error(res.data.message);
            }
        });
    };

    confirmCurrentItem = () => {
        let cur = this.getCurrentItem(),
            index = this.state.currentItemIndex;
        this.ckItem(cur, index);
    };

    ckItem = (record, index) => {
        this.setState({ priceError: false });

        if(index == -1){
            return;
        }

        let data = this.state.data;

        data && data.items.map((c)=>{
            if(c.key != record.key){
                c.selected = false;
            }else{
                c.selected = true;
            }
        });

        let code = record.productInfo[0] && record.productInfo[0].productCode;
        let isSnControl = record.productInfo[0] && record.productInfo[0].isSnControl;

        this.changePrice = record.price.toFixed(2);

        this.setState({ currentItemIndex: index, data: data });

        if(isSnControl == 1){
            this.setState({ loading: true });

            cartService.getSnList(code, this.state.shopId).then((res) => {
                this.setState({ loading: false });

                if(res.data.code == 200){
                    let data = (res.data && res.data.data) || [],
                        snList = [{value: '-1', label: '全选'}];

                    for(let i=0; i<data.length; i++){
                        let obj = {};
                        obj.value = data[i].barCode;
                        obj.label = data[i].sn || data[i].barCode;

                        snList.push(obj);
                    }
                    this.setState({ currentSnData: snList });
                }
            });
        }else{
            this.setState({ currentSnData: [] });
        }
    };

    chooseSn = (value, label, extra) => {
        let that = this, record = this.getCurrentItem(), ckSn= this.state.ckSn || {},
            currentSnData = this.state.currentSnData.filter(e => {
                if(e.value != '-1'){
                    return e;
                }
            });

        if(extra.triggerValue == '-1'){
            if(!extra.triggerNode.props.checked){
                if(currentSnData.length > record.quantity){
                    message.error("该商品SN数量上限为"+record.quantity);
                    return;
                }
                ckSn[record.key] = that.state.currentSnData.map( n => {
                    return n.value;
                });

                that.setState({ ckSn });
                return;
            }else{
                ckSn[record.key] = [];

                that.setState({ ckSn });
                return;
            }
        }

        let values = value.filter(e => {
            return e != '-1';
        });

        if(values.length > record.quantity){
            message.error("该商品SNS数量上限为"+record.quantity);
            const nv = extra.preValue.map( n => {
                return n.value;
            });

            ckSn[record.key] = nv;

            this.setState({ ckSn });
            return;
        }

        ckSn[record.key] = values;

        this.setState({ ckSn });
    };

    submitSns = (val) => {
        let that = this,
            currentItem = this.getCurrentItem(),
            _ckSn = this.state.ckSn[currentItem.key].filter(c => {
                if(c != '-1'){
                    return c;
                }
            });

        let barCodes = val ? val.toString() : _ckSn.join(','),
            detailId = currentItem.productInfo[0] && currentItem.productInfo[0].shoppingCartDetailId;

        that.setState({ loading: true });
        cartService.submitSn(detailId, barCodes).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                message.success('商品唯一码录入成功!');

                /*let submitedSn = that.state.ckSn;

                if(submitedSn.submited.length == 0){
                    submitedSn.submited.push(currentItem.key);
                    that.setState({ ckSn : submitedSn });
                }else{
                    for(let i=0; i<submitedSn.submited.length; i++){
                        if(submitedSn.submited[i] == currentItem.key){
                            return;
                        }else{
                            submitedSn.submited.push(currentItem.key);
                            that.setState({ ckSn : submitedSn });
                        }
                    }
                }*/
            }else{
                message.error('商品唯一码录入失败，请稍后重试!');
            }
        });
    };

    transformM = (e) => {
        let c=(typeof e == 'object') ? e.target.value : e, pData = this.state.searchProductArr;
        let result = pData.filter((m)=> {
            return m.name == c;
        });

        return result.length > 0 ? (result[0] && result[0].materialNumber) : c;
    };

    getCurrentItem = () => {
        let data = this.state.data && this.state.data.items,
            index = this.state.currentItemIndex;

        return data[index];
    };

    searchMaterial(v){
        if(v == ''){
            this.setState({ searchProductArr: [] })
        }else{
            cartService.searchMaterial(v, this.state.shopId).then((res) => {
                const data = res.data;
                if(data.errorCode == '0'){
                    this.setState({ searchProductArr: res.data.datas })
                }else{
                    message.error('商品不存在！');
                }
            });
        }
    };

    switchMember = (e) => {
        const {setFieldsValue} = this.props.form;

        e.target.blur();
        this.setState({ memberModal: true }, function(){
            setFieldsValue({
                "memberId": ""
            });
            this.memberModal.focus();
        });
    };

    hxfwq = (e) => {
        const {setFieldsValue} = this.props.form;

        e.target.blur();
        this.setState({ hyfwqModal: true }, function(){
            setFieldsValue({
                "hyfwq": ""
            });
            this.memberHyfwq.focus();
        });
    };

    doHyfwq = (e) => {
        let vid = this.state.memberName, code = e.target.value;

        if(!/^0{4}/.test(vid)){
            cartService.hxfwq(vid, code).then((res) => {
                if(res.data.code == 1000){
                    message.success('优惠券核销成功!');
                    this.setState({ hyfwqModal: false });
                    this.productCode.focus();
                }else{
                    message.error(res.data.message);
                }
            });
        }
    };

    cancelHyfwq = () => {
        this.setState({ hyfwqModal: false }, function () {
            this.productCode.focus();
        });
    };

    inputMember = (e) => {
        let dom = document.getElementById('memberError');

        dom.style.display = 'none';
    };

    getMemberInfo = (e) =>{
        e.stopPropagation();

        this.props.form.validateFields(['memberId'], (err, values) => {
            if (!err) {
                if(/^0{4}$/.test(values.memberId)){
                    this.autoLogin();

                    return;
                }

                this.setState({loading: true});

                const {setFieldsValue} = this.props.form;

                cartService.getMemberInfo(values.memberId).then((res) => {
                    this.setState({ loading: false });

                    if(res.data.code == 100000 && !_.isEmpty(res.data.data)){
                        this.getMemberJf(res.data.data.vid);
                        this.changeMemberHander(this.state.memberName, res.data.data.vid);

                        this.setState({memberName: res.data.data.vid, memberModal: false, loading: false}, function () {
                            this.productCode.focus();
                        });

                    }else{
                        let dom = document.getElementById('memberError');

                        dom.style.display = 'block';
                        //message.error('未查询到会员信息，请确保卡号正确!');

                        setFieldsValue({
                            "memberId": ""
                        });
                    }


                    /*ezp login*/
                    /*if(res.data.StatusCode == 200){
                        this.changeMemberHander(this.state.memberName, res.data.Result.OldCode);

                        this.setState({memberName: res.data.Result.OldCode, memberModal: false, loading: false}, function () {
                            this.productCode.focus();
                        });
                    }else{
                        let dom = document.getElementById('memberError');

                        dom.style.display = 'block';
                        //message.error('未查询到会员信息，请确保卡号正确!');

                        setFieldsValue({
                            "memberId": ""
                        });
                    }*/
                });
            }
        });
    };

    getMemberJf = (vid) => {
        cartService.getMemberJf(vid).then((res)=>{
            readyToComputeJf = true;

            let memberJf = 0, usablePoints = 0;
            if(res.data.code == 200){
                const data = res.data.data;
                memberJf = data.points || 0;
                usablePoints = data.usablePoints || 0;
                if(usablePoints < 0) usablePoints = 0;
            }

            this.setState({ memberJf, usablePoints });
        });
    };

    blurJf = (e) => {
        let val = e.target.value || 0;
        const originTotal = this.getOriginTotal(), jf = parseInt(this.state.usablePoints), maxjf = Math.round(originTotal * 5), canusejf = jf > maxjf ? maxjf : jf;
        if(jf < 100 && val > 0){
            message.error('会员可用积分不足，需要至少100积分' );
            this.setState({ confirmMemberJf: 0 });
        }else if(jf >= 100 && val < 100 && val != 0){
            if(maxjf < 100){
                this.setState({ confirmMemberJf: 0 });
            }else{
                this.setState({ confirmMemberJf: 100 });
            }
            message.error('需要使用至少100积分' );
        }else if(jf >= 100 && val > canusejf ){
            message.error('最多可使用' + canusejf + '积分' );
        }else{
            this.setState({ confirmMemberJf: val });
        }
    };

    editJf = (e) => {
        let val = parseInt(e.target.value || 0);
        const originTotal = this.getOriginTotal(), jf = parseInt(this.state.usablePoints), maxjf = Math.round(originTotal * 5), canusejf = jf > maxjf ? maxjf : jf;
        if(val > canusejf) val = canusejf;
        if(val < 0) val = 0;
        
        this.setState({ confirmMemberJf: val });
    };

    changeMemberHander = (oldVid, vid) => {
        let items = this.state.data && this.state.data.items || [];

        readyToComputeJf = false;

        if(items.length>0){
            if(oldVid == vid){
                return;
            }

            this.setState({ loading: true });

            let cartNo = this.state.data && this.state.data.shoppingCartNo;

            cartService.updateCustormId(cartNo, oldVid, vid).then((res) => {
                if(res.data.code == 200){
                    message.success('切换会员成功!');
                    this.productCode.focus();
                    this.getCarts(vid);
                }else{
                    message.error('切换会员失败，请稍后重试!');
                }
            });
        }else{
            this.getCarts(vid);
        }
    };

    focusPrice = () => {
        let record = this.getCurrentItem();
        if(record.productInfo.length == 1){
            this.setState({ changingPrice: true });
        }
    };

    editPrice = (e) => {
        this.changePrice = e;
    };

    doEditPrice = () => {
        let that = this,
            val = that.changePrice,
            record = that.getCurrentItem();

        this.setState({ priceError: false });

        if(val == record.price){
            that.setState({ changingPrice: false });
            return;
        }

        if(val < record.floorPrice){
            that.changePrice = record.price;
            that.dibanjia = val;
            this.setState({priceError: true, editPriceModal: true});

            return;
        }

        that.setState({loading: true});

        cartService.editPrice(record, val).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                message.success('价格更改成功!');

                this.getCarts(this.state.memberName);
            }else{
                message.error('价格更改失败，请稍后重试!');
            }
        });

        this.setState({ changingPrice: false });
    };

    minusNum = (e)=> {
        e.target.blur();

        let record = this.getCurrentItem();
        let num = record.quantity - 1;

        if(num == 0){
            message.error('购物车商品数量最少为1！');
            return;
        }
        this.changeNum(num, record);
    };

    plusNum = (e) => {
        e.target.blur();

        let record = this.getCurrentItem();
        let num = record.quantity + 1;

        if(num > record.inventoryQuantity){
            //this.setState({ stockError: true });
            //message.error('库存不足！');
            return;
        }

        this.changeNum(num, record);
    };

    changeNum = (num, record) => {
        let that = this;

        if(num == ''){ return; }

        if(num > record.inventoryQuantity){
            //message.error("库存不足!");
            this.setState({ stockError: true });
            num = record.inventoryQuantity;
            //return;
        }

        this.setState({ loading: true });
        cartService.editNum(record, num).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                this.setState({ stockError: false });

                message.success('数量更改成功!');
                that.getCarts(this.state.memberName);
            }else{
                message.error('数量更改失败，请稍后重试!');
            }
        });
    };

    getCkCoupons = (coupons) => {
        let data = this.state.data;
        data.coupons = coupons;

        this.getCanuseJf();
        this.setState({ data });
    };

    confirmDelete = (i) => {
        this.setState({ delModal: true });
        this.deleteKey = i;
    };

    delCart = () => {
        this.setState({ loading: true, delModal: false });

        let that = this, key = this.deleteKey, items = this.state.data && this.state.data.items, currentItem = items && items[key], allKeys = [];

        for(let i=0; i<items.length; i++){
            allKeys.push(items[i].key);
        }

        let keys = key == '-1' ? allKeys.join(',') : currentItem && currentItem.key;
        cartService.delHandler(keys).then((res) => {
            that.setState({ loading: false });

            if(res.data.code == 200){
                if(that.deleteKey === that.state.currentItemIndex){
                    that.setState({ currentItemIndex: -1 });
                }
                message.success('删除成功!');
                that.getCarts(this.state.memberName);
            }else{
                message.error('删除失败，请稍后重试!');
            }
        });
    };

    cancelDel = () => {
        this.setState({ delModal: false });
    };

    cancelAdd = () => {
        this.setState({ addModal: false });
    };

    renderItem = (index, data) => {
        let item = [], _data = data.productInfo;

        for(let i=0; i<_data.length; i++){
            item.push(
                <Row
                    key={ i }
                    className={data.selected && i == 0 ? `${styles.cartListLine} ${styles.on}` : styles.cartListLine}
                    onClick={ ()=> { !i && this.ckItem.call(this, data, index) }}
                >
                    { i == 0 ? <Col span={2} className={ data.promotion == 7 ? styles.packageIcon : (data.promotion == 1 ? styles.zengIcon : null) }>{ i == 0 ? (index+1) : '' }</Col> : '' }
                    { i == 0 ? <Col span={4}>{ _data[i].productCode }</Col> : <Col span={4} offset={2} className={ _data.length > 1 ? styles.packageConcat : ''}>{ _data[i].productCode }</Col> }
                    <Col span={7} className={ styles.ell }>{ _data[i].productName }</Col>
                    <Col span={3}>{ (data.promotion == 1 && i != 0) ? null : _data[i].price.toFixed(2) }</Col>
                    <Col span={3}>{ (data.promotion == 1 && i != 0) ? null : _data[i].shopDiscount.toFixed(2) }</Col>
                    <Col span={2}>{ _data[i].quantity }</Col>
                    <Col span={3}>
                        { (data.promotion == 1 && i != 0) ? null : (_data[i].itemTotalPrice - _data[i].shopDiscount).toFixed(2) }
                        { i == 0 ? <Button icon="close" className={ styles.delBtn } onClick={ this.confirmDelete.bind(this, index) }></Button> : ''}
                    </Col>
                </Row>
            );
        }

        return item;
    };

    getList = () => {
        let data = this.state.data && this.state.data.items || [], list = [];

        if(data.length>0){
            for(let i=0; i< data.length; i++){
                list.push(
                    <div key={ data[i].key } className={ styles.cartItem }>
                        { this.renderItem(i, data[i]) }
                    </div>
                )
            }
        }else{
            list.push(
                <div key="0" className={styles.listEmpty}></div>
            );
        }

        return list;
    };

    getOriginTotal = () => {
        return base.getOriginTotal(this.state.data);
    };

    getPayStatus = () => {
        const originTotal = this.getOriginTotal(), jf = parseInt(this.state.usablePoints), maxjf = Math.round(originTotal * 5), canusejf = jf > maxjf ? maxjf : jf,  memberjf = this.state.confirmMemberJf;
        let data = this.state.data && (this.state.data.items || []);

        if(data.length > 0 && (/^0{4}/.test(this.state.memberName) || (memberjf == '0' || (memberjf >= 100 && memberjf <= canusejf)))){
            return false;
        }else{
            return true;
        }
    };

    checkPackage = (data) => {
        let hasSelected = false, packData = this.state.packageData, packs = packData.promotion && packData.promotion.packs;

        if(data){
            for(let i in packs){
                if(JSON.stringify(packs[i]) == JSON.stringify(data)){
                    packs[i].select = !packs[i].select;
                }else{
                    packs[i].select = false;
                }
                if(packs[i].select) hasSelected = true;
            }

            packData.single = hasSelected ? false : true;
        }else{
            for(let i in packs){
                packs[i].select = false;
            }

            packData.single = true;
        }

        this.setState({ packageData: packData });
    };

    getPackageInfo = (data) => {
        let info = [], dictionary = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        for(let i = 0; i<data.length; i++){
            info.push(
                <p key={data[i].code}><span>￥{ data[i].salePrice }</span>{ dictionary[i] }：{ data[i].goodsName }</p>
            );
        }

        return info;
    };

    getPackage = () => {
        let data = this.state.packageData.promotion && this.state.packageData.promotion.packs, list = [];

        for(let i in data){
            list.push(
                <Row gutter={0} key={i} className={ data[i].select ? `${styles.packageLine} ${styles.current}` : styles.packageLine } onClick={ this.checkPackage.bind(this, data[i]) }>
                    <Col span={4} className={ styles.packageTotal }><em>{ this.getPackageTotalPrie(data[i]) }</em>¥{ this.getPackagePrice(data[i]) }</Col>
                    <Col span={20} className={ styles.packageInfo }>
                        { this.getPackageInfo(data[i]) }
                    </Col>
                </Row>
            )
        }

        return list;
    };

    getPackageTotalPrie = (data) => {
        let price = 0;

        for(let i=0; i<data.length; i++){
            price += parseFloat(data[i].salePrice || 0);
        }

        return parseFloat(price).toFixed(2);
    };

    getPackagePrice = (data) => {
        let totalPrice = this.getPackageTotalPrie(data), discount = 0;

        for(let i=0; i<data.length; i++){
            discount += parseFloat(data[i].discountAmount || 0);
        }

        return (totalPrice - discount).toFixed(2);
    };

    addPackage = () => {
        if(!this.canAddPackage){
            return;
        }

        this.canAddPackage = false;

        let data = this.state.packageData, packs = data.promotion && data.promotion.packs, packageId = '';

        if(!data.single){
            for(let i in packs){
                if(packs[i].select){
                    packageId = i;
                }
            }
        }else{
            packageId = data.materialNumber;
        }

        cartService.addCart(this.state.memberName, data.materialNumber, packageId, this.state.shopId).then((res) => {
            if(res.data.code == 200){
                this.canAddPackage = true;
                this.setState({ addModal: false });
                this.getCarts(this.state.memberName);
            }else{
                message.error(res.data.message);
            }
        });
    };

    cancelEditPrice = () => {
        this.setState({ editPriceModal: false, changingPrice: false, priceError: false });
    };

    editDbPrice = () => {
        let that = this;
        this.props.form.validateFields(['editPriceName', 'editPricePassword'], (err, values) => {
            if(!err){
                let record = that.getCurrentItem();

                cartService.getApprove(values.editPriceName, values.editPricePassword, this.dibanjia, record.key).then((res)=>{
                    this.setState({ editPriceModal: false, changingPrice: false, priceError: false });
                    if(res.data.code == 200){
                        message.success('价格修改成功！');
                        that.getCarts(this.state.memberName);
                    }else{
                        message.error('没有修改权限！');
                    }
                });
            }
        });
    };

    render () {
        let currentItem = null;
        let that = this;

        const {getFieldDecorator} = this.props.form;

        if(this.state.currentItemIndex != -1){
            currentItem = this.state.data && this.state.data.items && this.state.data.items[this.state.currentItemIndex];
        }

        const tProps = {
            treeData: this.state.currentSnData,
            value: this.state.ckSn[currentItem && currentItem.key],
            onChange: this.chooseSn,
            treeCheckable: true,
            showCheckedStrategy: SHOW_PARENT,
            searchPlaceholder: '请选择商品唯一码',
            className: 'chooseSn',
        };

        const searchProductOptions = this.state.searchProductArr.map(m => {
            const key = m && m.materialNumber, label = m && m.name;
            return <Option key={ key } value={ key } mid={ key } >{ label }</Option>
        });

        const originTotal = this.getOriginTotal(), jf = this.state.usablePoints,  canusejf = this.state.confirmMemberJf, maxjf = Math.round(originTotal * 5), total = (originTotal - canusejf/100).toFixed(2);

        return (
            <div className="cartLayout" id="cartLayout">
                <div className={styles.cartMain}>
                    <div className={styles.cartside}>
                        <div className={styles.cartSideWrapper}>
                            <div className={styles.cartMember}>
                                <Button className={styles.changeMemberBtn} onClick={ this.switchMember }>切换</Button>
                                <div className={ styles.memberName }>会员：{ this.state.memberName || '请输入会员卡号' }</div>
                                { /^0{4}/.test(this.state.memberName) ? '' :
                                    <div className={ styles.memberJf }>{ this.state.memberJf }</div>
                                }
                            </div>
                            <div className={styles.promotionService}>
                                <h6>服务券</h6>
                                <Button onClick={ this.hxfwq } disabled={ /^0{4}/.test(this.state.memberName) ? true : false }>点击核销服务券</Button>
                            </div>
                            <div className={styles.promotionCoupons}>
                                <h6>代金券</h6>
                                <Coupons data={this.state.data && this.state.data.coupons} onSelect={ this.getCkCoupons } />
                            </div>
                            <div className={styles.carTotal}>
                                <p>已选择 <strong>{ this.state.data && this.state.data.items && this.state.data.items.length || 0 }</strong> 件商品</p>
                                <dl><dt>总金额：</dt><dd>{ base.getTotalPrice(this.state.data) }</dd></dl>
                                <dl><dt>优惠：</dt><dd>{ base.getDiscountVal(this.state.data) }</dd></dl>
                                <dl><dt>代金券：</dt><dd>{ base.getCouponsVal(this.state.data) }</dd></dl>
                                <dl>
                                    <dt>积分：</dt>
                                    <dd style={{ float: 'none' }}>
                                        <span style={{ float: 'right' }}>{ (canusejf / 100).toFixed(2) }</span>
                                        <Input
                                            type="number"
                                            style={{ width: '30%' }}
                                            value={ canusejf }
                                            onChange={ this.editJf }
                                            onBlur={ this.blurJf }
                                            className={ styles.entJf }
                                            disabled={ (originTotal == 0 || /^0{4}/.test(this.state.memberName) || this.state.usablePoints < 100 || (canusejf == 0 && maxjf < 100)) ? true : false}
                                        /> 分
                                    </dd>
                                </dl>
                                <dl className={styles.strong}><dt>应付金额：</dt><dd>{ total }</dd></dl>
                            </div>
                        </div>
                        <Button className={styles.submitCartBtn} disabled={ this.getPayStatus() } onClick={ this.submitOrder }>去结算</Button>
                    </div>
                    <div className={styles.cartContainer}>
                        <div id="entProduct" className={styles.addCart}>
                            {getFieldDecorator('entCode',{
                                initialValue: '',
                            })(
                                <AutoComplete
                                    allowClear={true}
                                    className={styles.searchInput}
                                    dataSource={ searchProductOptions }
                                    onSearch={ e => this.searchMaterial.call(this, e) }
                                    onSelect={ this.addCart }
                                >
                                    <Input
                                        autoComplete="off"
                                        ref={e => this.productCode = e}
                                        placeholder="通过商品编号查询"
                                        className={styles.sProductByM}
                                        onPressEnter={ this.pressAddCart }
                                    />
                                </AutoComplete>
                            )}
                        </div>
                        <div className={styles.cartList}>
                            <Row className={styles.cartListHeader}>
                                <Col span={2}>序号</Col>
                                <Col span={4}>商品编码</Col>
                                <Col span={7}>商品名称</Col>
                                <Col span={3}>单价</Col>
                                <Col span={3}>优惠</Col>
                                <Col span={2}>数量</Col>
                                <Col span={3}>小计</Col>
                            </Row>
                            <div className={styles.cartListBody} id="cartList">
                                { this.state.data.items && this.state.data.items.length > 0 ? <a href="javascript:;" className={ styles.emptyCartList } onClick={ () => this.confirmDelete('-1') }>删除</a> : '' }
                                <Spin spinning={ this.state.loading }>
                                    { this.getList() }
                                </Spin>
                            </div>
                        </div>
                        { this.state.data.items && this.state.data.items.length > 0 && this.state.currentItemIndex != -1 ?
                            <div className={`${styles.productDetail} ${styles.checkItem}`}>
                                <div className={styles.productName}>商品详情<span>{ currentItem && currentItem.productInfo && currentItem.productInfo[0].productName }</span></div>
                                <div className={styles.productInfo}>
                                    <div className={styles.productPrice}>
                                        <dl className={ this.state.priceError ? styles.priceError : '' }>
                                            <dt>单价</dt>
                                            <dd className={ this.state.changingPrice ? styles.editPrice : '' }>
                                                <InputNumber
                                                    id="editPrice"
                                                    min={0}
                                                    value={ this.changePrice }
                                                    onFocus={ this.focusPrice }
                                                    onChange={ this.editPrice }
                                                    disabled={ (currentItem.productInfo && currentItem.productInfo.length>1) ? true : false }
                                                    className={ styles.changePrice }
                                                />
                                                { currentItem && currentItem.productInfo.length == 1
                                                    ?
                                                    <div>
                                                        <div className={ styles.modifyBtns }>
                                                            <Button onClick={ this.doEditPrice }>确认</Button>
                                                        </div>
                                                        <div className={ styles.numError }><Icon type="exclamation-circle"/>不能低于地板价</div>
                                                    </div>
                                                    : ''
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                    <div className={styles.productSn}>
                                        <dl>
                                            <dt>SN码</dt>
                                            <dd className="clearfix">
                                                { currentItem && this.state.currentSnData && this.state.currentSnData.length > 0 ?
                                                    <div>
                                                        <TreeSelect {...tProps}/>
                                                        <div className={ styles.submitSnBtn }><Button onClick={ this.submitSns.bind(this, '') }>确认</Button></div>
                                                    </div> :
                                                    <div className={styles.noSn}>该商品暂无SN码</div>
                                                }
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                                <div className={styles.productNum}>
                                    <dl className={ this.state.stockError ? styles.stockError : '' }>
                                        <dt>数量</dt>
                                        <dd className={ styles.editNum }>
                                            <div className={styles.numGroup}>
                                                <Button icon="minus" onClick={ this.minusNum.bind(this) }></Button>
                                                <InputNumber
                                                    id="nums"
                                                    min={1}
                                                    max={ currentItem && currentItem.productInfo && currentItem.productInfo[0].inventoryQuantity }
                                                    value={ currentItem && currentItem.productInfo && currentItem.productInfo[0].quantity }
                                                    className={styles.changeNum}
                                                    onChange={ e => this.changeNum.call(this, e, currentItem) }
                                                />
                                                <Button icon="plus" onClick={ this.plusNum.bind(this) }></Button>
                                            </div>
                                            <div className={styles.stock}>
                                                库存：
                                                <strong>
                                                    {
                                                        currentItem && currentItem.productInfo && currentItem && currentItem.productInfo.length > 0 ?
                                                            currentItem.inventoryQuantity :
                                                            currentItem.productInfo[0].inventoryQuantity
                                                    }
                                                </strong>台
                                            </div>
                                            <div className={ styles.numError }><Icon type="exclamation-circle"/>库存数量不足</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div> :
                            <div className={`${styles.productDetail} ${styles.noDetail}`}>
                                <div className={styles.productName}>商品详情</div>
                            </div>
                        }
                    </div>
                </div>
                <div className={styles.cartFooter}>Copyright © 联想（北京）有限公司，PC&SD BT/IT</div>

                <Modal
                    title="会员登录"
                    visible={this.state.memberModal}
                    onCancel={this.autoLogin}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <p className={styles.memberTips}>请输入会员卡号码或直接扫描会员卡</p>
                    <Form className="inputStyle" style={{position: 'relative', width: '80%', margin: '0 auto'}}>
                        <FormItem>
                            {getFieldDecorator('memberId',{
                                initialValue: '',
                                rules: [{required: true, message: '请输入会员卡号!'}]
                            })(
                                <Input
                                    autoComplete="off"
                                    ref={e => this.memberModal = e}
                                    onPressEnter={ this.getMemberInfo }
                                    onChange={ this.inputMember }
                                />
                            )}
                        </FormItem>
                        <div className="ant-form-explain" id="memberError" style={{ position: 'absolute', top: 32, color: '#f04134', display: 'none' }}>未查询到会员信息，请确保卡号正确!</div>
                    </Form>
                    <Row gutter={16} className={styles.modalBtns}>
                        {/*<Col span={12}><Button onClick={ this.register } className={styles.sky}>注册</Button></Col>*/}
                        <Col span={12}><Button onClick={ this.autoLogin } className={styles.sky}>'0000'快捷输入</Button></Col>
                        <Col span={12}><Button onClick={ this.getMemberInfo }>确  定</Button></Col>
                    </Row>
                </Modal>

                <Modal
                    title="服务券核销"
                    visible={this.state.hyfwqModal}
                    onCancel={this.cancelHyfwq}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <p className={styles.memberTips}>请直接扫描会员服务券</p>
                    <Form className="inputStyle" style={{width: '80%', margin: '0 auto'}}>
                        <FormItem>
                            {getFieldDecorator('hyfwq',{
                                initialValue: '',
                                rules: [{required: true, message: '请输入服务券!'}]
                            })(
                                <Input
                                    autoComplete="off"
                                    ref={e => this.memberHyfwq = e}
                                    onPressEnter={ this.doHyfwq }
                                />
                            )}
                        </FormItem>
                    </Form>
                </Modal>

                <Modal
                    title="删除商品"
                    visible={this.state.delModal}
                    onCancel={this.cancelDel}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <div className="ant-confirm-body" style={{ padding: '0 40px 20px' }}>
                        <i className="anticon anticon-question-circle" style={{ color: '#ffbf00' }}></i>
                        <span className="ant-confirm-title">{ this.deleteKey == '-1' ? '确定清空所有的商品？' : '确定删除选中的商品？' }</span>
                        <div className="ant-confirm-content">
                            <p><span>{ this.deleteKey == '-1' ? '删除后将无法购买' : '删除后将无法购买此商品' }</span>,你还要继续吗？</p>
                        </div>
                    </div>

                    <Row gutter={16} className={styles.modalBtns}>
                        <Col span={12}><Button onClick={ this.cancelDel } className={styles.gray}>取  消</Button></Col>
                        <Col span={12}><Button onClick={ this.delCart.bind(this) }>删  除</Button></Col>
                    </Row>
                </Modal>

                <Modal
                    title="请选择您要购买的类型"
                    visible={this.state.addModal}
                    onCancel={this.cancelAdd}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 1100 : 780 }
                >
                    <Row gutter={0} onClick={ this.checkPackage.bind(this, '') } className={ this.state.packageData.single ? `${styles.packageLine} ${styles.singleProduct} ${styles.current}` : `${styles.packageLine} ${styles.singleProduct}` }>
                        <Col span={4} className={ styles.packageTotal }>¥{ this.state.packageData.salePrice }</Col>
                        <Col span={20} className={ styles.packageInfo }><span>￥{ this.state.packageData.salePrice }</span>{ this.state.packageData.name }</Col>
                    </Row>
                    <div className={ styles.packageTips }><span>以下套餐供您选择</span></div>
                    <div className={ styles.packageList }>
                        { this.getPackage() }
                    </div>
                    <Button className={ styles.submitPackageBtn } onClick={ this.addPackage }>确定</Button>
                </Modal>

                <Modal
                    title="修改单价"
                    visible={ this.state.editPriceModal }
                    onCancel={ this.cancelEditPrice }
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <div className="ant-confirm-body" style={{ padding: '0 80px 20px' }}>
                        <i className="anticon anticon-exclamation-circle" style={{ color: '#fc2425' }}></i>
                        <span className="ant-confirm-title">您当前输入的价格已低于地板价</span>
                        <div className="ant-confirm-content">
                            <p>确认价格请填写姓名、密码</p>
                        </div>
                        <Form className="inputStyle" onSubmit={ this.editDbPrice } style={{ marginTop: 20 }}>
                            <FormItem {...formItemLayout} label="姓名" style={{marginBottom: 10}}>
                                {getFieldDecorator('editPriceName', {initialValue: '', rules: [ {required: true, message: '请输入姓名!'}] })(<Input />)}
                            </FormItem>
                            <FormItem {...formItemLayout} label="密码" style={{marginBottom: 10}}>
                                {getFieldDecorator('editPricePassword', {initialValue: '', rules: [ {required: true, message: '请输入密码!'}] })(<Input type="password" />)}
                            </FormItem>

                            <Row gutter={0} className={styles.modalBtns}>
                                <Col span={16} offset={4}><Button className={styles.regBtn} htmlType="submit">确定</Button></Col>
                            </Row>
                        </Form>
                    </div>

                </Modal>
            </div>
        )
    }
}

class Coupons extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            ckItems: []
        }
    }

    chooseCoupon = (record) => {
        let data = this.props.data;

        data.map((c)=>{
            if(c.couponid == record.couponid){
                if(c.selected){
                    c.selected = false;
                }else{
                    c.selected = true;
                }
            }else{
                c.selected = false;
            }
        });

        this.props.onSelect(data);
    };

    getCoupon = () => {
        let couponData = this.props.data || [];
        let pageConut = parseInt(couponData.length / 4);

        if(couponData.length % 4 > 0){
            pageConut ++;
        }

        const renderLi = (couponData, page, pageSize) => {
            const data = couponData.filter((c, i)=>{
                if (i >= page * pageSize && i < (page+1) * pageSize){
                    return c;
                }
            });

            return data.map((c)=>{
                if(c.status == 0){
                    return (
                        <li key={ c.couponid }
                            className={ c.selected ? `${styles.checked}` : '' }
                            onClick={ this.chooseCoupon.bind(this, c) }>
                            {/*<div>该商品下单<strong>{ c.name }</strong>元</div>*/}
                            <div><strong>{ c.name }</strong></div>
                        </li>
                    );
                }else{
                    return (<li key={ c.couponid } className={styles.disabled} ><div><strong>{ c.name }</strong></div></li>);
                }
            })
        };

        let $ul = [];

        for(let i = 0; i < pageConut; i++){
            $ul.push( <ul key={i}>{renderLi(couponData, i , 4)}</ul>);
        }

        return $ul;
    };

    render() {
        return (
            <div className={ styles.couponList } id="chooseCoupon">
                { this.props.data && this.props.data.length > 0 ?
                    <Carousel>
                        { this.getCoupon() }
                    </Carousel> :
                    <div className={ styles.noCoupon }></div>
                }
            </div>
        )
    }
}

export default Form.create()(SalesOrder);

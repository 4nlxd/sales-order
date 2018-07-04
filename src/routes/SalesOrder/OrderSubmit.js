/**
 * Created by chaoqin on 18/3/12.
 */
import React from 'react';
import {hashHistory} from 'dva/router';
import {Form, Row, Col, Spin, Select, message, Button, Alert, Icon, Input, Radio, Modal} from 'antd';
import styles from './NewSalesOrder.css';
import base from '../../models/base';
import cartService from '../../services/cartService';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
let Option = Select.Option;
const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
};

class OrderSubmit extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            loading: false,
            chooseSalerBl: false,
            chooseSaler: {},
            salersList: [],
            chooseSalersTxt: '编辑',
            addressModal: false,
            invoiceModal: false,
            useAddress: 0,
            addressInfo: {},
            invoiceInfo: {},
            useInvoice: 0,
            invoiceTypeData: [
                {code: 'P', name: '普通发票', ck: true},
                {code: 'D', name: '电子发票', ck: false},
                {code: 'Z', name: '增值税发票', ck: false},
            ],
            shopInfo: {}
        };

        this.data = this.props.location.state.data;
        this.memberId = this.props.location.state.memberId;
        this.memberUsedJf = this.props.location.state.memberJf;
        this.payStatus = true;
    }

    componentDidMount() {
        let that = this;

        cartService.getFaInfo().then((res)=>{
            if(res.data.code == 200){
                let data = res.data.data[0].permission;

                that.setState({ shopInfo: data[0] });

                that.getSalers(data[0].value);
            }
        });
    };

    gotoPay = () => {
        /*let submitedSns = this.state.ckSn.submited,
            data = this.state.data && this.state.data.items,
            keys = [];

        for(let i=0; i<data.length; i++){
            keys.push(data[i].key);
        }

        let notSubmited = _.difference(keys, submitedSns);

        if(notSubmited.length>0){
            console.log(notSubmited);
        }*/

        //do...
        if(!this.payStatus){
            return;
        }

        let ckSales = this.state.chooseSaler,
            coupons = this.data && this.data.coupons || [],
            ckCouponid = [],
            no = this.data && this.data.shoppingCartNo,
            memberName = this.memberId,
            jifen = this.memberUsedJf,
            storeName = this.state.shopInfo.label;

        let ckCoupons = coupons.filter((c)=>{
            if(c.selected){
                return c;
            }
        });

        for(let i=0; i<ckCoupons.length; i++){
            if(ckCoupons[i].selected){
                ckCouponid.push(ckCoupons[i].couponid);
            }
        }

        this.payStatus = false;

        cartService.submit(no, ckCouponid, memberName, jifen, ckSales, storeName).then((res) => {
            this.setState({ loading: false });
            this.payStatus = true;

            if(res.data.code == 200){
                message.success('订单提交成功!');
                //this.props.history.pushState({data: res.data.data}, "/order/NewSalesOrder/pay");
                hashHistory.push({
                    pathname: '/order/NewSalesOrder/pay',
                    state: { data: res.data.data }
                });
            }else{
                message.error(res.data.message);
            }
        }, ()=>{
            this.payStatus = true;
        });
    };

    renderInvoiceType = () => {
        let list = [], data = this.state.invoiceTypeData;

        for(let i=0; i<data.length; i++){
            list.push(
                <a key={ data[i].code } onClick={ this.checkInvoiceType.bind(this, data[i]) } className={ data[i].ck ? `${styles.on}` : '' }>{ data[i].name }</a>
            );
        }

        return list;
    };

    checkInvoiceType = (obj) => {
        let invoiceTypeData = this.state.invoiceTypeData;

        invoiceTypeData.map((c)=>{
            if(obj.code == c.code){
                c.ck = true;
            }else{
                c.ck = false;
            }
        });

        this.setState({ invoiceTypeData });
    };

    getInvoiceType = () => {
        let invoiceTypeData = this.state.invoiceTypeData, code = 1;

        invoiceTypeData.filter((c)=>{
            if(c.ck){
                code = c.code;
            }
        });

        return code
    };

    getSalers = (id) => {
        cartService.getSalers(id).then((res)=>{
            if(res.data.code == 200){
                let data = res.data.data, ckSale = {};

                for(let i=0; i<data.length; i++){
                    if(data[i].loginId == loginInfo.loginId){
                        ckSale = data[i];
                    }
                }
                this.setState({ salersList: data, chooseSaler: ckSale });
            }
        });
    };

    renderItem = (index, data) => {
        let item = [], _data = data.productInfo;

        for(let i=0; i<_data.length; i++){
            item.push(
                <Row
                    key={ i }
                    className={styles.cartListLine}
                >
                    { i == 0 ? <Col span={2} className={ data.promotion == 7 ? styles.packageIcon : (data.promotion == 1 ? styles.zengIcon : null) }>{ i == 0 ? (index+1) : '' }</Col> : '' }
                    { i == 0 ? <Col span={4}>{ _data[i].productCode }</Col> : <Col span={4} offset={2} className={ _data.length > 1 ? styles.packageConcat : ''}>{ _data[i].productCode }</Col> }
                    <Col span={7} className={ styles.ell }>{ _data[i].productName }</Col>
                    <Col span={3}>{ (data.promotion == 1 && i != 0) ? null : _data[i].price.toFixed(2) }</Col>
                    <Col span={3}>{ (data.promotion == 1 && i != 0) ? null : _data[i].shopDiscount.toFixed(2) }</Col>
                    <Col span={2}>{ _data[i].quantity }</Col>
                    <Col span={3}>
                        { (data.promotion == 1 && i != 0) ? null : (_data[i].itemTotalPrice - _data[i].shopDiscount).toFixed(2) }
                    </Col>
                </Row>
            );
        }

        return item;
    };

    getList = () => {
        let data = this.data && this.data.items || [], list = [];

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

    backSales = () => {
        hashHistory.push({
            pathname: '/order/NewSalesOrder',
            state: { memberId: this.memberId }
        });
    };

    showSalesList = () => {
        this.setState({ chooseSalerBl: !this.state.chooseSalerBl, chooseSalersTxt: this.state.chooseSalersTxt == '确定' ? '编辑' : '确定' });
    };

    changeAddress = (e) => {
        this.setState({ useAddress: e.target.value });

        if(e.target.value == 0){
            this.doAddressSaveHandler({
                'ShoppingCartNo': this.data && this.data.shoppingCartNo
            });
        }else{
            let addressInfo = this.state.addressInfo;

            if(JSON.stringify(addressInfo) != '{}'){
                this.doAddressSaveHandler(addressInfo);
            }
        }
    };

    changeVoice = (e) => {
        this.setState({ useInvoice: e.target.value });

        if(e.target.value == 0){
            this.doInvoiceSaveHandler({
                'ShoppingCartNo': this.data && this.data.shoppingCartNo
            });
        }else{
            let invoiceInfo = this.state.invoiceInfo;

            if(JSON.stringify(invoiceInfo) != '{}'){
                this.doInvoiceSaveHandler(invoiceInfo);
            }
        }
    };

    chooseSaler = (data) => {
        this.setState({ chooseSalerBl: false, chooseSalersTxt: '编辑', chooseSaler: data });
    };

    renderSalers = () => {
        let list = [], data = this.state.salersList;

        for(let i=0; i<data.length; i++){
            list.push(
                <div key={ data[i].id } className={ styles.salesListRow } onClick={ this.chooseSaler.bind(this, data[i]) }>
                    <div className={ styles.saleCol1 }>{ data[i].userName }</div>
                    <div className={ styles.saleCol2 }>{ data[i].job }</div>
                </div>
            );
        }

        return list;
    };

    showAddress = () => {
        this.setState({ addressModal: true });
    };

    showVoice = () => {
        this.setState({ invoiceModal: true });
    };

    closeAddressModal = () => {
        this.setState({ addressModal: false });
    };

    closeInvoiceModal = () => {
        this.setState({ invoiceModal: false });
    };

    saveAddress = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(['dq', 'shr', 'xxdz', 'sjhm'], (err, values) => {
            if (!err) {
                let addressInfo = {
                    'receiverName': values.shr,
                    'receiverPhone': values.sjhm,
                    'receiverProvince': values.dq.ckProvince,
                    'receiverCity': values.dq.ckCity,
                    'receiverDistrict': values.dq.ckTown,
                    'receiverAddress': values.xxdz,
                    'receiverPostCode': '',
                    'orderSource': 20,
                    'ShoppingCartNo': this.data && this.data.shoppingCartNo
                };

                if(this.state.useAddress != 0){
                    addressInfo['deliveryType'] = 2;
                }

                this.doAddressSaveHandler(addressInfo);
            }
        });
    };

    doAddressSaveHandler = (addressInfo) => {
        cartService.saveAddress(addressInfo).then((res)=>{
            if(res.data.code == 200){
                if(this.state.useAddress != 0){
                    this.setState({ addressInfo });
                    message.success('地址保存成功！');
                }

                this.setState({ addressModal: false });
            }else{
                message.error(res.data.message);
            }
        });
    };

    saveInvoice = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(['companyName', 'taxpayerCode', 'registeredAddress', 'registeredTel', 'taxpayerBank', 'bankAccount'], (err, values) => {
            if (!err) {
                let invoiceInfo = {
                    'invoiceType': this.getInvoiceType(),
                    'registeredAddress': values.registeredAddress,
                    'registeredTel': values.registeredTel,
                    'taxpayerBank': values.taxpayerBank,
                    'bankAccount': values.bankAccount,
                    'ShoppingCartNo': this.data && this.data.shoppingCartNo
                };

                if(this.getInvoiceType() != 'Z'){
                    invoiceInfo['invoiceTitle'] = values.companyName;
                    invoiceInfo['invoiceCode'] = values.taxpayerCode;
                }else{
                    invoiceInfo['companyName'] = values.companyName;
                    invoiceInfo['taxpayerCode'] = values.taxpayerCode;
                }

                this.doInvoiceSaveHandler(invoiceInfo);
            }
        });
    };

    doInvoiceSaveHandler = (invoiceInfo) => {
        cartService.saveInvoice(invoiceInfo).then((res)=>{
            if(res.data.code == 200){
                if(this.state.useInvoice != 0){
                    this.setState({ invoiceInfo });
                    message.success('发票保存成功！');
                }

                this.setState({ invoiceModal: false });
            }else{
                message.error(res.data.message);
            }
        });
    };

    checkArea = (rule, value, callback) => {
        if(value && !value.ckProvince.code){
            callback('请选择省/市!');
        }else if(value && !value.ckCity.code){
            callback('请选择市/区!');
        }else if(value && !value.ckTown.code){
            callback('请选择区/县!');
        }else{
            callback();
        }
    };

    checkPhone = (rule, value, callback) => {
        if(value && value.length != 11){
            callback('请输入正确的手机号码！');
        }else{
            callback();
        }
    };

    render(){
        const {getFieldDecorator} = this.props.form;

        let addressInfo = '';

        if(JSON.stringify(this.state.addressInfo) != '{}'){
            addressInfo = this.state.addressInfo.receiverName + ' ' + (this.state.addressInfo.receiverProvince && this.state.addressInfo.receiverProvince.name) + (this.state.addressInfo.receiverCity && this.state.addressInfo.receiverCity.name) + (this.state.addressInfo.receiverDistrict && this.state.addressInfo.receiverDistrict.name) + this.state.addressInfo.receiverAddress + " "+ this.state.addressInfo.receiverPhone;
        }

        const originTotal = base.getOriginTotal(this.data), usedJf = this.memberUsedJf, total = (originTotal - usedJf/100).toFixed(2);

        let invoiceType = this.getInvoiceType();

        return (
            <div className="cartLayout">
                <div className={ styles.cartMain }>
                    <div className={ styles.cartside }>
                        <div className={ styles.salerBlock }>
                            <div className={ styles.salerLable }>售货员：</div>
                            <div className={ styles.salerMain }>
                                <div className={ this.state.chooseSalerBl ? `${styles.chooseSale} ${styles.on}` : styles.chooseSale } onClick={ this.showSalesList }>
                                    <div className={ styles.saleCol1 }>{ this.state.chooseSaler.userName || '--' }</div>
                                    <div className={ styles.saleCol2 }>{ this.state.chooseSaler.job || '--' }</div>
                                </div>
                                <div className={ `listScroll  ${styles.salesList}` } style={{ display: this.state.chooseSalerBl ? 'block' : 'none' }}>
                                    <div className={ styles.salesListHeader }>
                                        <div className={ styles.saleCol1 }>【姓名】</div>
                                        <div className={ styles.saleCol2 }>【职务】</div>
                                    </div>
                                    <div className={ styles.salesListBody }>
                                        { this.renderSalers() }
                                    </div>
                                </div>
                            </div>
                            <a className={ styles.ctrSaleBtn } onClick={ this.showSalesList }>{ this.state.chooseSalersTxt }</a>
                        </div>
                        <div className={ styles.submitTools }>
                            <dl>
                                <dt>配送方式：</dt>
                                <dd>
                                    <RadioGroup onChange={ this.changeAddress } value={ this.state.useAddress+'' }>
                                        <Radio value="0">自提</Radio>
                                        <Radio value="1" style={{backgroundColor: '#f5ffff'}}>
                                            <span>快递</span>
                                            <span className={ styles.toolsText }>{ addressInfo }</span>
                                            <a className={ styles.ctrSaleBtn } onClick={ this.showAddress }>编辑</a>
                                        </Radio>
                                    </RadioGroup>
                                </dd>
                            </dl>
                            <dl>
                                <dt>发票信息：</dt>
                                <dd>
                                    <RadioGroup onChange={ this.changeVoice } value={ this.state.useInvoice+'' }>
                                        <Radio value="0">不开发票</Radio>
                                        <Radio value="1" style={{backgroundColor: '#f5ffff'}}>
                                            <span>开发票</span>
                                            <span className={ styles.toolsText }>{ this.state.invoiceInfo && (this.state.invoiceInfo.invoiceTitle || this.state.invoiceInfo.companyName) }</span>
                                            <a className={ styles.ctrSaleBtn } onClick={ this.showVoice }>编辑</a>
                                        </Radio>
                                    </RadioGroup>
                                </dd>
                            </dl>
                        </div>
                        <div className={styles.carTotal}>
                            <p>已选择 <strong>{ this.data && this.data.items && this.data.items.length }</strong> 件商品</p>
                            <dl><dt>总金额：</dt><dd>{ base.getTotalPrice(this.data) }</dd></dl>
                            <dl><dt>优惠：</dt><dd>{ base.getDiscountVal(this.data) }</dd></dl>
                            <dl><dt>代金券：</dt><dd>{ base.getCouponsVal(this.data) }</dd></dl>
                            <dl>
                                <dt>积分：</dt>
                                <dd style={{ float: 'none' }}>
                                    <span style={{ float: 'right' }}>{ '-'+(usedJf / 100).toFixed(2) }</span>
                                    <Input
                                        style={{ width: '30%', backgroundColor: '#fff', color: '#666', fontSize: '14px', textAlign: 'left', border: 0, cursor: 'default' }}
                                        value={ '('+usedJf+'分)' }
                                        className={ styles.entJf }
                                        disabled={ true }
                                    />
                                </dd>
                            </dl>
                            <dl className={styles.strong}><dt>应付金额：</dt><dd>{ total }</dd></dl>
                        </div>
                        <Button className={styles.submitCartBtn} onClick={ this.gotoPay }>去付款</Button>
                    </div>
                    <div className={ styles.submitMain }>
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
                            <div className={styles.cartListBody}>
                                <Spin spinning={ this.state.loading }>
                                    { this.getList() }
                                </Spin>
                            </div>
                            <div className={ `${styles.backSales} ${styles.cartBtn}` } onClick={ this.backSales }>返回购物车</div>
                        </div>
                    </div>
                </div>
                <div className={ styles.cartFooter }>Copyright © 联想（北京）有限公司，PC&amp;SD BT/IT</div>

                <Modal
                    title="快递信息"
                    visible={this.state.addressModal}
                    onCancel={this.closeAddressModal}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <Form className="inputStyle" onSubmit={ this.saveAddress }>
                        <FormItem {...formItemLayout} label="地区" style={{marginBottom: 10}}>
                            {getFieldDecorator('dq', {
                                rules: [{required: true, message: '请输入地区!'}, {validator: this.checkArea }]
                            })(<SelectAddress></SelectAddress>)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="收货人" style={{marginBottom: 10}}>
                            {getFieldDecorator('shr', {
                                rules: [{required: true, message: '请输入收货人!'}]
                            })(<Input style={{width: '100%'}} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="详细地址" style={{marginBottom: 10}}>
                            {getFieldDecorator('xxdz', {
                                rules: [{required: true, message: '请输入详细地址!'}],
                            })(<Input style={{width: '100%'}} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="手机号码" style={{marginBottom: 10}}>
                            {getFieldDecorator('sjhm', {
                                rules: [{required: true, message: '请输入正确的手机号码!'}, {validator: this.checkPhone }],
                            })(<Input type="number" style={{width: '100%'}} />)}
                        </FormItem>
                        <Row gutter={0} className={styles.modalBtns}>
                            <Col span={14} offset={5}><Button className={styles.regBtn} htmlType="submit">确 定</Button></Col>
                        </Row>
                    </Form>
                </Modal>

                <Modal
                    title="发票信息"
                    visible={this.state.invoiceModal}
                    onCancel={this.closeInvoiceModal}
                    footer={ null }
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <div className={ styles.invoiceTypeBtns }>
                        { this.renderInvoiceType() }
                    </div>
                    <Alert style={{margin: '10px 0 20px', border: '2px solid #fdba5a'}} type="warning" showIcon description="我公司依法开具发票，如您购买的商品按税法规定属于不得从增值税销项税额中抵扣的项目（例如集体福利或个人消费等），请您选择普通发票。如商品由第三方卖家销售，发票内容由其卖家决定，发票由卖家开具并寄出。"></Alert>
                    <Form className="inputStyle" onSubmit={ this.saveInvoice }>
                        <div className="ant-row ant-form-item" style={{marginBottom: 10}}>
                            <div className="ant-col-5 ant-form-item-label"><label>开票方式</label></div>
                            <div className="ant-col-18" style={{ lineHeight: '32px' }}>订单完成后开票</div>
                        </div>
                        <div className="ant-row ant-form-item" style={{marginBottom: 10}}>
                            <div className="ant-col-5 ant-form-item-label"><label>发票内容</label></div>
                            <div className="ant-col-18" style={{ lineHeight: '32px' }}><span style={{ border: '1px solid #3ac7c0', color: '#3ac7c0', padding: '5px 15px' }}>明细</span></div>
                        </div>
                        <FormItem {...formItemLayout} label="单位名称" style={{marginBottom: 10}}>
                            {getFieldDecorator('companyName', {
                                rules: [{required: true, message: '请输入单位名称!'}],
                            })(<Input style={{width: '100%'}} />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="纳税人识别号" style={{marginBottom: 10}}>
                            {getFieldDecorator('taxpayerCode', {
                                rules: [{required: true, message: '请输入纳税人识别号!'}],
                            })(<Input style={{width: '100%'}} />)}
                        </FormItem>
                        <div style={{ display: this.getInvoiceType() != 'Z' ? 'none' : 'block' }}>
                            <FormItem {...formItemLayout} label="注册地址" style={{marginBottom: 10}}>
                                {getFieldDecorator('registeredAddress', {
                                    rules: invoiceType == 'Z' ? [{required: true, message: '请输入注册地址!'}] : []
                                })(<Input style={{width: '100%'}} />)}
                            </FormItem>
                            <FormItem {...formItemLayout} label="注册电话" style={{marginBottom: 10}}>
                                {getFieldDecorator('registeredTel', {
                                    rules: invoiceType == 'Z' ? [{required: true, message: '请输入注册电话!'}] : []
                                })(<Input style={{width: '100%'}} />)}
                            </FormItem>
                            <FormItem {...formItemLayout} label="开户银行" style={{marginBottom: 10}}>
                                {getFieldDecorator('taxpayerBank', {
                                    rules: invoiceType == 'Z' ? [{required: true, message: '请输入开户银行!'}] : []
                                })(<Input style={{width: '100%'}} />)}
                            </FormItem>
                            <FormItem {...formItemLayout} label="银行账户" style={{marginBottom: 10}}>
                                {getFieldDecorator('bankAccount', {
                                    rules: invoiceType == 'Z' ? [{required: true, message: '请输入银行账户!'}] : []
                                })(<Input type='number' style={{width: '100%'}} />)}
                            </FormItem>
                        </div>

                        <Row gutter={0} className={styles.modalBtns}>
                            <Col span={14} offset={5}><Button className={styles.regBtn} htmlType="submit">确 定</Button></Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        );
    }
}

class SelectAddress extends React.Component{
    constructor(props){
        super(props);

        this.state={
            provinceData: [],
            cities: [],
            townsData: [],
            ckArea: {
                ckProvince: {},
                ckCity: {},
                ckTown: {}
            }
        };
    }

    componentDidMount() {
        cartService.getProvinceData().then((res)=>{
            if(res.data.code == 200){
                this.setState({ provinceData: res.data.data });
            }else{
                message.error(res.data.message);
            }
        });
    };

    handleProvinceChange = (value, option) => {
        let ckArea = this.state.ckArea, mid = option.props.mid;

        ckArea.ckProvince = mid;
        ckArea.ckCity = {};
        ckArea.ckTown = {};

        this.setState({ ckArea }, function(){
            this.props.onChange(ckArea);
        });

        cartService.getCityData(value).then((res)=>{
            if(res.data.code == 200){
                this.setState({ cities: res.data.data });
            }else{
                message.error(res.data.message);
            }
        });

    };

    handleCityChange = (value, option) => {
        let ckArea = this.state.ckArea, mid = option.props.mid;

        ckArea.ckCity = mid;
        ckArea.ckTown = {};

        this.setState({ ckArea }, function(){
            this.props.onChange(ckArea);
        });

        cartService.getTownData(value).then((res)=>{
            if(res.data.code == 200){
                this.setState({ townsData: res.data.data });
            }else{
                message.error(res.data.message);
            }
        });
    };

    handleTownChange = (value, option) => {
        let ckArea = this.state.ckArea, mid = option.props.mid;

        ckArea.ckTown = mid;

        this.setState({ ckArea }, function(){
            this.props.onChange(ckArea);
        });
    };

    render(){
        let provinceOptions = this.state.provinceData.map(function(c) {
            return <Option key={c.code} mid={c}>{c.name}</Option>;
        });
        let cityOptions = this.state.cities.map(function(c) {
            return <Option key={c.code} mid={c}>{c.name}</Option>;
        });
        let townOptions = this.state.townsData.map(function(c) {
            return <Option key={c.code} mid={c}>{c.name}</Option>;
        });

        return (
            <div>
                <Select value={ this.state.ckArea.ckProvince.code } style={{width: '25%'}} onSelect={this.handleProvinceChange}>
                    { provinceOptions }
                </Select> 省/市
                <Select value={ this.state.ckArea.ckCity.code } style={{width: '25%'}} onSelect={this.handleCityChange}>
                    { cityOptions }
                </Select> 市/区
                <Select value={ this.state.ckArea.ckTown.code } style={{width: '25%'}} onSelect={this.handleTownChange}>
                    { townOptions }
                </Select> 区/县
            </div>
        );
    }
}

export default Form.create()(OrderSubmit);

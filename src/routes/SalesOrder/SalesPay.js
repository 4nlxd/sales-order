import React from 'react';
import {Row, Col, Checkbox, Button, Icon, Modal, Input, InputNumber, Form, message, AutoComplete} from 'antd';
import styles from './Pay.css';
import request from '../../utils/request';
import moment from 'moment';
import { domain } from '../../models/config';

const FormItem = Form.Item;
const confirm = Modal.confirm;
let times = 0;
let ito;
const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 14},
};

class SalesPay extends React.Component {
    constructor(props){
        super(props);

        this.data = this.props.location.state.data;
        this.state = {
            payModal: false,
            payPOSModal: false,
            invoiceData: {},
            POSCode: '',
            payType: "", //1 支付宝，   2  ， 3 微信
            payInfo: {},
            payOnceModal: false,
            onceVal: this.data.total_fee,
            payAll: true,
            payTransNo: '',
            payByXjModal: false,
            zhaoling: 0
        };

        this.xianjinValue = 0;
    }

    componentDidMount(){
        this.getPayInfo();
    }

    getPayInfo = () => {
        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/payInfo?outSalesOrderNo=${this.data.out_trade_no}&orderSource=20&payTransNo=${this.state.payTransNo}`,{
            method: 'GET'
        }).then((res)=>{
            if(res.data.code == 200){
                this.setState({ payInfo: res.data.data });

                if(res.data.data.amountReceivable == 0){
                    this.delayPrint();
                }
            }else if(res.data.code == 3990){
                let that = this;
                setTimeout(function(){
                    that.getPayInfo();
                }, 200);
            }else{
                message.error(res.data.message);
            }
        })
    };

    changePayMode = (e) => {
        const payAll = !e.target.checked, payInfo = this.state.payInfo, onceVal = !payInfo.amountReceied && !payInfo.amountReceivable ? this.data.total_fee : parseFloat(this.state.payInfo.amountReceivable || 0).toFixed(2);
        this.setState({ payAll, onceVal });
    };

    showModal = (code) => {
        if(this.state.payAll){
            this.setState({ payType: code }, () => {
                this.showPayMethod()
            })
        }else{
            const payInfo = this.state.payInfo, amountReceivable = payInfo.amountReceivable, { getFieldValue, setFieldsValue } = this.props.form;
            if(amountReceivable) setFieldsValue({ onceVal: amountReceivable});

            this.setState({ payType: code, payOnceModal: true });
        }
    };

    hideModal = () => {
        this.setState({ payModal: false });
        ito && window.clearTimeout(ito);
    };

    delayPrint = () => {
        const that = this;
        setTimeout(function(){
            that.printHandler();
        }, 500);
    };

    getPayCode = (e) => {
        const {setFieldsValue} = this.props.form;
        let code = e.target.value, that = this, _data = this.props.location.state.data;

        that.payHandler(code, _data, function(res){
            setFieldsValue({
                "code": ""
            });

            if(res.data.code == 10000){
                that.setState({ payModal: false, payTransNo: res.data.payTransNo }, function(){
                    message.success('支付成功！');

                    that.getPayInfo();
                });
            }else if(res.data.code == 10001){
                that.paying(_data, res.data.query);
            }else if(res.data.code == 10002){
                message.error(res.data.message);
            }
        });
    };

    paying = (data, query) => {
        request(`${domain}pcsd-retail-pay-front/query.jhtm?out_trade_no=${data.out_trade_no}&shop_id=${data.shop_id}&query=${query.toString()}&manual_refresh=0`, {
            method: 'GET',
        }).then((res) => {
            if(res.data.code == 10000){
                this.setState({ payModal: false, payTransNo: res.data.payTransNo }, function(){
                    message.success('支付成功!');
                    this.hidePOSModal();
                    this.getPayInfo();
                });
            }else if(res.data.code == 10001){
                const that = this;
                ito = setTimeout(function () {
                    that.paying(data, query);
                }, 1000)

            }else if(res.data.code == 10002){
                message.error(res.data.message);
            }
        });
    };

    printHandler = () => {
        console.log('查询小票信息');
        let _data = this.props.location.state.data,
            out_trade_no = _data.out_trade_no,
            lenovo_id = _data.lenovo_id;

        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/v1/salesReceipt?outSalesOrderNo=${out_trade_no}&customerId=${lenovo_id}`,{
                method: 'GET',
            }
        ).then((res)=>{
            if(res.data.code == '200'){
                console.log('查询小票信息成功！');
                this.setState({invoiceData: res.data.data});
                this.invoice();
            }else{
                times++;

                if(times < 10){
                    const that = this;
                    setTimeout(function(){
                        that.printHandler();
                    }, 500);
                }else{
                    location.hash='/order/NewSalesOrder';
                }
            }
        });
    };

    invoice = () => {
        console.log('准备打印！');
        try{
            console.log('查找打印驱动中！');
            LODOP = getLodop();
            LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
            //LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
            LODOP.SET_PRINT_STYLE("FontSize", 10);
            LODOP.SET_PRINT_PAGESIZE(3,'48mm',40,"");
            LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900, document.getElementById("printInvoiceModal").innerHTML);
            LODOP.SET_PRINTER_INDEX(-1);
            //LODOP.PREVIEW();
            LODOP.PRINT();
            console.log('打印完毕！');
        }catch (e){
            console.log(e);
        }

        console.log('跳转回开单！');

        location.hash='/order/NewSalesOrder';
    };

    tranformType = (type) => {
        let name;
        switch(type){
            case 1:
                name = '支付宝刷卡'; break;
            case 2:
                name = '支付宝二维码'; break;
            case 3:
                name = '微信刷卡'; break;
            case 4:
                name = '微信二维码'; break;
            case 30:
                name = '银联刷卡'; break;
            case 40:
                name = '现金'; break;
            case 50:
                name = '货到付款'; break;
        }

        return name;
    };

    cancelOrderHandler = () => {
        let obj = this.data;
        return request(`${domain}pcsd-ordercenter-salesorder/orderInfo/cancelOrder?outSalesOrderNo=${obj.out_trade_no}&customerId=${obj.lenovo_id}`,{
                method: 'PUT',
            }
        ).then((res)=>{
            if(res.data.code == "200"){
                message.success('取消成功!');
                location.hash = '/order/NewSalesOrder';
            }else{
                message.error(res.data.message);
            }
        });
    };

    renderInvoice = () => {
        let list = [], data = this.state.invoiceData.items || [];

        for(let i=0; i<data.length; i++){
            list.push(
                <tr key={ data[i].giftGroupId }>
                    <td>{ data[i].promotionName }</td>
                </tr>
            );

            for(let q=0; q<data[i].itemDetails.length; q++){
                list.push(
                    <tr key={ i+'abc'+q }>
                        <td><p>{ data[i].itemDetails[q].productCode }</p><p style={{width: 60, wordBreak: 'keep-all'}}>{ data[i].itemDetails[q].productName }</p></td>
                        <td>{ data[i].itemDetails[q].quantity }</td>
                        <td>{ data[i].itemDetails[q].isGift != 1 ? data[i].itemDetails[q].price : '' }</td>
                        <td>{ -data[i].itemDetails[q].shopDiscount }</td>
                        <td>{ data[i].itemDetails[q].itemTotalPrice }</td>
                    </tr>
                );
            }
        }

        return list;
    };

    daishou = () => {
        const {setFieldsValue} = this.props.form;
        let that = this, _data = this.props.location.state.data;

        that.payHandler('', _data, function(res){
            setFieldsValue({
                "code": ""
            });

            if(res.data.code == 10000){
                that.setState({ payModal: false, payTransNo: res.data.payTransNo });
                message.success('支付成功！');

                that.getPayInfo();
            }else if(res.data.code == 10001){
                that.paying(_data, res.data.query);
            }else if(res.data.code == 10002){
                message.error(res.data.message);
            }
        });
    };

    payHandler = (code, _data, cb) => {
        let out_trade_no = _data.out_trade_no,
            shop_id = _data.shop_id,
            fa_id = _data.fa_id,
            terminal = _data.terminal,
            total_fee = _data.total_fee,
            lenovo_id = _data.lenovo_id,
            subject = _data.subject,
            it_b_pay = _data.it_b_pay,
            pay_type = this.state.payType, //10 POS
            notify_url= _data.notify_url,
            sign=_data.sign,
            payment=this.state.onceVal;

        let requestArg = `${domain}pcsd-retail-pay-front/pay.jhtm?out_trade_no=${out_trade_no}&shop_id=${shop_id}&fa_id=${fa_id}&terminal=${terminal}&total_fee=${total_fee}&lenovo_id=${lenovo_id}&subject=${subject}&it_b_pay=${it_b_pay}&pay_type=${pay_type}&notify_url=${notify_url}&sign=${sign}&pay_money=${payment}`;

        if(code){
            requestArg += `&auth_code=${code}`;
        }

        if(code == 5){
            requestArg += `&actual_fee=${this.xianjinValue}&change_fee=${this.state.zhaoling}`
        }

        request(requestArg, {
            method: 'GET',
        }).then((res) => {
            cb && cb(res);
        });
    };

    payByPOS = () => {
        const {setFieldsValue} = this.props.form;
        let that = this, _data = this.props.location.state.data;

        this.payHandler('', _data, function(res){
            setFieldsValue({
                "code": ""
            });

            if(res.data.code == 10000){
                that.setState({ payPOSModal: true, POSCode: res.data.qrCodeBase64 });

                that.paying(_data, res.data.query);
            }else{
                message.error(res.data.message);
            }
        });
    };

    hidePOSModal = () => {
        this.setState({ payPOSModal: false });
        ito && window.clearTimeout(ito);
    };

    hideOnceModal = () => {
        this.setState({ payOnceModal: false });
    };

    payMethod = () => {
        let type = this.state.payType, name = '';

        switch(type){
            case 3: name = '微信支付'; break;
            case 5: name = '现金收银'; break;
            case 9: name = '商场代收银'; break;
            case 10: name = '数字王府井POS'; break;
        }

        return name;
    };

    payOnce = (e) => {
        e.preventDefault();
        this.props.form.validateFields(['onceVal'], (err, values) => {
            if (!err) {
                this.setState({ onceVal: values.onceVal, payOnceModal: false }, function(){
                    this.showPayMethod();
                });
            }
        });
    };

    hideXjModal = () => {
        this.setState({ payByXjModal: false });
    };

    checkXianjinValue = (rule, value, callback) => {
        let payInfo = this.state.payInfo, toPay = !payInfo.amountReceied && !payInfo.amountReceivable ? this.data.total_fee : parseFloat(this.state.payInfo.amountReceivable || 0).toFixed(2);
        let reg = /(^[1-9]\d*((\.\d{1,}$)|(\d*))$)|(^0\.\d+$)|(^0$)/;

        if(!value || value <= 0){
            callback('金额必须大于0！');
            this.setState({ zhaoling: 0 });
        }else if(!reg.test(value)){
            callback('请输入正确的金额！');
            this.setState({ zhaoling: 0 });
        }else if(value && value-0 < toPay-0){
            callback('支付现金低于待支付金额！');
            this.setState({ zhaoling: 0 });
        }else if(value && value-0 >= toPay-0){
            this.xianjinValue = value;

            this.setState({ zhaoling: (value - toPay).toFixed(2) });
            callback();
        }
    };

    payByXj = (e) => {
        e.preventDefault();
        let that = this, _data = this.props.location.state.data;

        this.props.form.validateFields(['xjVal'], (err, values) => {
            if (!err) {
                that.payHandler(5, _data, function(res){
                    if(res.data.code == 10000){
                        that.setState({ payByXjModal: false });

                        that.paying(_data, res.data.query);
                    }else{
                        message.error(res.data.message);
                    }
                });
            }
        });
    };

    showPayMethod = () => {
        let that = this, payType = this.state.payType;

        if(payType == 3){ //微信
            this.setState({ payModal: true }, function(){ this.code.focus(); });
        }else if(payType == 9){
            confirm({
                title: '商场代收银',
                content: '确定已收款？',
                onOk() {
                    that.daishou();
                }
            });
        }else if(payType == 10){
            that.payByPOS();
        }else if(payType == 5){
            this.setState({ payByXjModal: true });
        }
    };

    render () {
        const {getFieldDecorator} = this.props.form;
        const payInfo = this.state.payInfo, toPay = !payInfo.amountReceied && !payInfo.amountReceivable ? this.data.total_fee : parseFloat(this.state.payInfo.amountReceivable || 0).toFixed(2);
        let total = this.state.payAll ? toPay : this.data.total_fee;

        return (
            <div className={styles.payPage}>
                <div className={styles.payHeader}>
                    <Icon type="check-circle" />
                    <h6>订单提交成功</h6>
                    <p>销售订单号：{this.data.out_trade_no} <a onClick={this.cancelOrderHandler}>取消订单</a></p>
                </div>
                <div className={ this.state.payAll ? (styles.payMain + ' ' + styles.payMainAll ) : styles.payMain }>
                    <p>应付总金额:</p>
                    <h6>¥{ total }</h6>
                    <div className={ styles.payInfos }>
                        <dl>
                            <dt>实付金额</dt>
                            <dd>¥{ parseFloat(payInfo.amountReceied || 0).toFixed(2) }</dd>
                        </dl>
                        <dl>
                            <dt>待支付金额</dt>
                            <dd>¥{ toPay }</dd>
                        </dl>
                    </div>
                </div>
                <div className={styles.payMethod}>
                    <h6>选择支付方式：</h6>
                    <div className={styles.methodBtn}>
                        <a onClick={ this.showModal.bind(this,3) }><i className={ styles.payWechat }></i>微信</a>
                        <a onClick={ this.showModal.bind(this, 9) }><i className={ styles.payDaishou }></i>商场代收银</a>
                        <a onClick={ this.showModal.bind(this, 10) }><i className={ styles.payPos }></i>POS</a>
                        <a onClick={ this.showModal.bind(this, 5) }><i className={ styles.payXianjin }></i>现金</a>
                    </div>
                    <div style={{marginTop: 10}}>
                        <Checkbox onChange={ this.changePayMode }>组合支付</Checkbox>
                    </div>
                </div>

                <Modal
                    title={ this.payMethod() }
                    visible={ this.state.payOnceModal }
                    onCancel={ this.hideOnceModal }
                    footer={ null }
                >
                    <Form onSubmit={ this.payOnce }>
                        <FormItem {...formItemLayout} label="待支付">
                            {getFieldDecorator('onceVal',{
                                initialValue: toPay,
                                rules: [{required: true, message: '请输入您要支付的金额!'}]
                            })(
                                <InputNumber
                                    min={ 0 }
                                    max={ parseFloat(toPay) }
                                    autoComplete="off"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </FormItem>
                        <Button className={ styles.oncePayBtn } htmlType="submit">确定</Button>
                    </Form>
                </Modal>

                <Modal
                    title="现金收银"
                    visible={ this.state.payByXjModal }
                    onCancel={ this.hideXjModal }
                    footer={ null }
                >
                    <Form onSubmit={ this.payByXj }>
                        <div className="ant-row ant-form-item" style={{marginBottom: 10}}>
                            <div className="ant-col-5 ant-form-item-label"><label>待支付金额</label></div>
                            <div className="ant-col-18" style={{ lineHeight: '32px' }}>{ toPay }</div>
                        </div>
                        <FormItem {...formItemLayout} label="收银金额">
                            {getFieldDecorator('xjVal',{
                                rules: [{validator: this.checkXianjinValue }]
                            })(<InputNumber min={ 0 } autoComplete="off" style={{ width: '100%' }} />)}
                        </FormItem>
                        <div className="ant-row ant-form-item" style={{marginBottom: 10}}>
                            <div className="ant-col-5 ant-form-item-label"><label>找零</label></div>
                            <div className="ant-col-18" style={{ lineHeight: '32px' }}>{ this.state.zhaoling }</div>
                        </div>

                        <Button className={ styles.oncePayBtn } htmlType="submit">确定</Button>
                    </Form>
                </Modal>

                <Modal
                    title="请支付"
                    visible={this.state.payModal}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <p style={{ textAlign: 'center', fontSize: 20, marginBottom: 10 }}>请直接扫描微信付款码</p>
                    {getFieldDecorator('code',{
                        initialValue: ''
                    })(
                        <Input
                            style={{ height: 40 }}
                            autoComplete="off"
                            ref={e => this.code = e}
                            onPressEnter={ this.getPayCode }
                        />
                    )}
                    <div style={{ width: '80%', margin: '0 auto', padding: 20 }}><img src={require('./images/paytips.gif')} style={{ display: 'block', width: '100%', height: 'auto' }}/></div>
                </Modal>

                <Modal
                    title="请支付"
                    visible={this.state.payPOSModal}
                    onCancel={this.hidePOSModal}
                    footer={null}
                    width={ document.body.offsetWidth > 1600 ? 800 : 570 }
                >
                    <img src={ "data:image/png;base64,"+this.state.POSCode } style={{ display: 'block', margin: '0 auto' }} />
                </Modal>

                <div id="printInvoiceModal" style={{display: "none", width: '48mm'}}>
                    <div style={{width: '100%', fontSize: '10px', textAlign: 'center'}}>
                        <div><img src={ require('./images/logo.jpg') } style={{display: 'block', width: '60%', height: 'auto', margin: '0 auto 10px'}} /></div>
                        <h5>{ this.state.invoiceData.companyName }</h5>
                        <h6 style={{marginTop: '10px'}}>{ this.state.invoiceData.address }</h6>
                        <p>电话：{ this.state.invoiceData.telPhone }</p>
                        <p>{ this.state.invoiceData.webSite }</p>
                        <p>购物小票</p>
                    </div>
                    <table style={{width: '100%', fontSize: '10px', border: 0}}>
                        <tbody>
                        <tr>
                            <td width='50'>单据日期：</td>
                            <td>{ moment(this.state.invoiceData.createTime).format('YYYY-MM-DD HH:mm:ss') }</td>
                        </tr>
                        <tr>
                            <td>单据编号：</td>
                            <td>{ this.state.invoiceData.outSalesOrderNo }</td>
                        </tr>
                        <tr>
                            <td>制单人：</td>
                            <td>{ this.state.invoiceData.createBy }</td>
                        </tr>
                        </tbody>
                    </table>
                    <table style={{margin: '6px 0', width: '100%', fontSize: 8, border: 0}}>
                        <thead style={{ fontStyle: 'normal', fontSize: 8 }}>
                        <tr>
                            <th>商品编码</th>
                            <th>数量</th>
                            <th>单价</th>
                            <th>折扣优惠</th>
                            <th>折后金额</th>
                        </tr>
                        </thead>
                        <tbody>{ this.renderInvoice() }</tbody>
                    </table>
                    <table style={{width: '100%', fontSize: '10px', border: 0}}>
                        <tbody>
                        <tr>
                            <td>合计数量：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.totalQuantity }</td>
                        </tr>
                        <tr>
                            <td>合计金额：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.totalPrice }</td>
                        </tr>
                        <tr>
                            <td>优惠合计：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.totalDiscount }</td>
                        </tr>
                        <tr>
                            <td>实销金额：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.payment }</td>
                        </tr>
                        </tbody>
                    </table>
                    <table style={{width: '100%', fontSize: '10px', borderTop: '1px dashed #e9e9e9', borderBottom: '1px dashed #e9e9e9'}}>
                        <tbody>
                        <tr>
                            <td colSpan="2">本次收款金额：</td></tr>
                        <tr>
                            <td>{ this.tranformType(this.state.invoiceData.paymentType) }</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.payment }</td>
                        </tr>
                        </tbody>
                    </table>
                    <table style={{width: '100%', fontSize: '10px'}}>
                        <tbody>
                        <tr><td>特别提醒：</td></tr>
                        <tr><td>1.请务必保留好您的购物小票和发票，同时保留商品原包装与附带的说明书、保修卡等所有附件达15天以上，以上内容在发生退换货时都需要出示原件</td></tr>
                        <tr><td>2.若发生退货，随机赠送的赠品一同需要退回</td></tr>
                        <tr><td>3.退货时，退款支付方式与购买支付方式必须相同</td></tr>
                        <tr><td>三包时间说明：</td></tr>
                        <tr><td>1、"7日"规定：产品自售出之日起7日内，发生性能故障，消费者可以选择退货、换货或修理(无法直接判别的需售后检测)；</td></tr>
                        <tr><td>2、"15日"规定：产品自售出之日起15日内，发生性能故障，消费者可以选择换货或修理(无法直接判别的需售后检测)；</td></tr>
                        <tr><td>3、电脑主要硬件最低保修为1年；</td></tr>
                        <tr><td>三包有效期说明："三包"有效期自开具发票之日起计算；</td></tr>
                        <tr><td>属下列情况之一的微型计算机商品，不实行三包：</td></tr>
                        <tr><td>（一）超过三包有效期的；</td></tr>
                        <tr><td>（二）未按产品使用说明的要求使用、维护、保管而造成损坏的；</td></tr>
                        <tr><td>（三）非承担三包的修理者拆动造成损坏的；</td></tr>
                        <tr><td>（四）无有效三包凭证及有效发票的（能够证明该商品在三包有效期内的除外）；</td></tr>
                        <tr><td>（五）擅自涂改三包凭证的；</td></tr>
                        <tr><td>（六）三包凭证上的产品型号或编号与商品实物不相符合的；</td></tr>
                        <tr><td>（七）使用盗版软件造成损坏的；</td></tr>
                        <tr><td>（八）使用过程中感染病毒造成损坏的；</td></tr>
                        <tr><td>（九）无厂名、厂址、生产日期、产品合格证的；</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default Form.create()(SalesPay);

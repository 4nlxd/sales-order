import React from 'react';
import {Table, Popconfirm, Button, Modal, Input, Col, Row, Form, DatePicker, notification, Alert} from 'antd';
import {Link} from 'dva/router';
import styles from './SalesOrder.css';
import moment from 'moment';
import request from '../../utils/request';
import { domain } from '../../models/config';
import cartService from '../../services/cartService';

const pageSize = 10;

const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};
const {RangePicker} = DatePicker;

let appkey, clientID, clientSecret, upload, token;
if(/(?:uat|dev)\./.test(document.domain)){
    appkey = 'C73E23AC2B400001C57218701746A360';
    clientID = 'C73E23AC2B5000016E801A581E77112A';
    clientSecret = 'C73E23AC2B40000169301A56C2F0EE10';
    token = 'http://10.122.12.243:8080';
}else{
    appkey = 'C73E23AC2760000134621118E3EC3BB0';
    clientID = 'C73E23AC27800001C250CBDB79651D19';
    clientSecret = 'C73E23AC27700001E4BACAB1988A1CB9';
    token = 'https://wngfp.unifiedcloud.lenovo.com';
}

class OrderList extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            data: [],
            searchData: {},
            ckItems: [],
            total: 0,
            editInvoiceModal: false,
            invoiceData: {},
            page: 1,
            shopId: ''
        };
    }

    initMadp(cb) {
        request(token + '/v1/tenants/lenovo/apps/' + appkey + '/service/auth/serverside/token', {
            method: 'GET',
            headers: {
                clientID: clientID,
                clientSecret: clientSecret
            }
        }).then(res => {
            const date = new Date();
            const token = res.data.accessToken;
            document.cookie = 'accessToken=' + token + ';path=/;domain=.lenovo.cn;max-age=' + res.data.expired;
            document.cookie = 'appkey=' + appkey + ';path=/;domain=.lenovo.cn;max-age=' + res.data.expired;

            if(cb && typeof cb == 'function') cb.call(this)
        })
    };

    componentDidMount() {
        let that = this;

        this.initMadp();
        cartService.getFaInfo().then((res)=>{
            let code = [];

            if(res.data.code == 200){
                let data = res.data.data[0].permission;

                for(let i=0; i<data.length; i++){
                    code.push(data[i].value);
                }
            }

            that.setState({ shopId: code.join(',') }, function(){
                this.search();
            });
        });
    };

    openNotification = (type, desc) => {
        notification[type]({
            message: '提示信息',
            description: desc
        })
    };

    search = (page = 1) => {
        let option = this.state.searchData,
            outSalesOrderNo = option.outSalesOrderNo || '',
            productName = option.productName || '',
            productCode = option.productCode || '',
            customerId = option.customerId || '',
            startTime = option.rangeTimes && option.rangeTimes[0] ? option.rangeTimes[0].format('YYYY-MM-DD') : '',
            endTime = option.rangeTimes && option.rangeTimes[1] ? option.rangeTimes[1].format('YYYY-MM-DD') : '';

        this.setState({ loading: true, page });
        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderList?currentPage=${page}&pageSize=${pageSize}&outSalesOrderNo=${outSalesOrderNo}&orderId=&orderby=&orderFlowState=&startTime=${startTime}&endTime=${endTime}&shopId=${this.state.shopId}&productName=${productName}&productCode=${productCode}&customerId=${customerId}&orderSource=20`, {
            method: 'GET',
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                this.setState({data: res.data.data, total: parseInt(res.data.total)});
            }else{
                this.openNotification('error', '查询失败，请稍后重试!');
            }
        });
    };

    transformStatus =(text, record) => {
        if (record.orderStatus == 110) {
            if(text == '1200'){
                return (<span className={styles.pointOragin}><i>•</i> 待支付</span>);
            }else if(text == '1250'){
                return (<span className={styles.pointOragin}><i>•</i> 支付中</span>);
            }else if(text == '1300'){
                return (<span className={styles.pointOragin}><i>•</i> 支付完毕</span>);
            }else if(text == '1400'){
                return (<span className={styles.pointBlue}><i>•</i> 出小票</span>);
            }else if(text == '1500'){
                return (<span className={styles.pointBlue}><i>•</i> 结单</span>);
            }
        } else if (record.orderStatus == 120) {
            return (<span className={styles.pointGray}><i>•</i> 已冻结</span>);
        } else if (record.orderStatus == 130) {
            return (<span className={styles.pointGray}><i>•</i> 已取消</span>);
        }else if(record.orderStatus == 140){
            return (<span className={styles.pointGray}><i>•</i> 已退货</span>);
        }else if(record.orderStatus == 145){
            return (<span className={styles.pointGray}><i>•</i> 已退预收款</span>);
        }else if(record.orderStatus == 150){
            return (<span className={styles.pointGray}><i>•</i> 已预收转销售</span>);
        }
    };

    getOpration = (text, record) => {
        if (record.orderStatus == 110) {
            if(record.orderFlowState == '1200'){
                return (
                    <span className={styles.operation}>
                        <Popconfirm title="确认取消吗?" onConfirm={this.cancelHandler.bind(null, record)}>
                            <a>取消</a>
                        </Popconfirm>
                    </span>
                )
            }else if(record.orderFlowState == '1300'){
                return (<a onClick={ this.chjdHandler.bind(this, record) }>出货结单</a>);
            }else if(record.orderFlowState == '1400'){
                return (<a onClick={ this.chjdHandler.bind(this, record) }>出货结单</a>);
            }else{
                return (<span>--</span>);
            }
        } else if (record.orderStatus == 120) {
            return (<span>--</span>);
        } else if (record.orderStatus == 130) {
            return (<span>--</span>);
        }
    };

    chjdHandler = (record)=> {
        this.setState({ loading: true });

        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/v1/finishOrder?orderSource=20&outSalesOrderNo=${record.outSalesOrderNo}&operator=${loginInfo.loginId}`, {
            method: 'GET',
        }).then((res) => {
            this.setState({ loading: false });

            if(res.data.code == 200){
                this.openNotification('success', '出货结单成功!');
                this.search();
            }else{
                this.openNotification('error', res.data.message);
            }
        });
    };

    cancelHandler = (obj) => {
        this.setState({ loading: true });
        return request(`${domain}pcsd-ordercenter-salesorder/orderInfo/cancelOrder?outSalesOrderNo=${obj.outSalesOrderNo}&customerId=${obj.customerId}&orderSource=20`,{
                method: 'PUT',
            }
        ).then((res)=>{
            this.setState({ loading: false });
            if(res.data.code == "200"){
                this.openNotification('success', '取消成功!');
                this.search();
            }else{
                this.openNotification('error', '取消失败，请稍后重试!');
            }
        });
    };

    exportHandler = () => {
        let option = this.state.searchData;
        let startTime = option.rangeTimes && option.rangeTimes[0] ? option.rangeTimes[0].format('YYYY-MM-DD') : '';
        let endTime = option.rangeTimes && option.rangeTimes[1] ? option.rangeTimes[1].format('YYYY-MM-DD') : '';

        if(!/accessToken=/i.test(document.cookie)){
            this.openNotification('error', '验证信息出错，请稍后重试!');
            this.initMadp();
            return false;
        }

        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/exportOrders?outSalesOrderNo=${option.outSalesOrderNo || ""}&orderId=&orderby=&orderFlowState=&startTime=${startTime}&endTime=${endTime}&orderSource=20&shopId=${this.state.shopId}`, {
            method: 'GET',
        }).then(res => {
            if(res.data.code == '200'){
                location.href = res.data.data;
            }else{
                this.openNotification('error', res.data.message)
            }
        })
    };

    printerHandler = () => {
        let ckItems = this.state.ckItems;

        if(ckItems.length != 1){
            this.openNotification('error', '请选中一条数据进行打印！');

            return;
        }

        let item = ckItems[0],
            out_trade_no = item.outSalesOrderNo,
            lenovo_id = item.customerId;

        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/v1/salesReceipt?outSalesOrderNo=${out_trade_no}&customerId=${lenovo_id}&orderSource=20`,{
                method: 'GET',
            }
        ).then((res)=>{
            this.setState({loading: false});
            if(res.data.code == '200'){
                this.setState({invoiceData: res.data.data});
                this.invoice();
            }else{
                this.openNotification('error', res.data.message);
            }
        });
    };

    invoice = () => {
        try{
            LODOP = getLodop();
            LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
            //LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
            LODOP.SET_PRINT_STYLE("FontSize", 10);
            LODOP.SET_PRINT_PAGESIZE(3,'48mm',40,"");
            LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900, document.getElementById("printInvoiceModal").innerHTML);
            LODOP.SET_PRINTER_INDEX(-1);
            //LODOP.PREVIEW();
            LODOP.PRINT();
        }catch (e){
            console.log(e);
        }
    };

    editInvoiceHandler = () => {
        let ckItems = this.state.ckItems;

        if(ckItems.length != 1){
            this.openNotification('error', '请选中一条数据进行修改！');

            return;
        }

        if(ckItems[0].orderFlowState >= 1300){
            this.setState({editInvoiceModal: true});
        }else{
            this.openNotification('error', '未支付，不可更新发票信息！');
        }
    };

    doEditInvoice = () => {
        let that = this,
            item = that.state.ckItems[0];

        this.props.form.validateFields(['invoiceId', 'invoiceCode', 'invoiceTime'], (err, values) => {
            if (!err) {
                let body = {
                    "outSalesOrderNo": item.outSalesOrderNo,
                    "orderSource": "20",
                    "invoiceNo": values.invoiceId,
                    "invoiceCode": values.invoiceCode,
                    "invoiceTime": values.invoiceTime.format('YYYY-MM-DD HH:mm:ss'),
                };

                request(`${domain}pcsd-ordercenter-salesorder/orderInfo/receiveInvoice`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json;uat-8'},
                    body: JSON.stringify(body),
                }).then((res) => {
                    that.setState({ loading: false, editInvoiceModal: false });

                    if(res.data.code == 200){
                        that.openNotification('success', '修改成功!');
                        that.search();
                    }else{
                        that.openNotification('error', '修改失败，请稍后重试!');
                    }
                });
            }
        });
    };

    cancelEditInvoice = () => {
        this.setState({editInvoiceModal: false});
    };

    handleSearch = (e) => {
        e.preventDefault();
        let that = this;
        this.props.form.validateFields(['outSalesOrderNo', 'rangeTimes', 'productName', 'productCode', 'customerId'], (err, values) => {
            if (!err) {
                that.setState({searchData: values}, function(){
                    that.search();
                });
            }
        });
    };

    handleReset = () => {
        this.props.form.resetFields();
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

    tranformType = (code) => {
        let type = '';

        switch (code){
            case 1:
                type='支付宝刷卡';
                break;
            case 2:
                type='支付宝二维码';
                break;
            case 3:
                type='微信刷卡';
                break;
            case 4:
                type='微信二维码';
                break;
            case 5:
                type='线下现金';
                break;
            case 6:
                type='微信H5';
                break;
            case 7:
                type='微信APP';
                break;
            case 8:
                type='微信JSAPI';
                break;
            case 9:
                type='商场代收';
                break;
            case 10:
                type='数字王府井POS';
                break;
            case 11:
                type='微信小程序';
                break;
            case 30:
                type='银联刷卡';
                break;
            case 50:
                type='货到付款';
                break;
        }

        return type;
    };

    render () {
        const {getFieldDecorator} = this.props.form;

        const columns = [
            {
                title: '销售订单号',
                dataIndex: 'outSalesOrderNo',
                key: 'outSalesOrderNo',
                fixed: 'left',
                render: text => <Link to={'/order/detail/' + text}>{text}</Link>
            },
            {
                title: '会员卡号',
                dataIndex: 'customerId',
                key: 'customerId',
            },
            {
                title: '会员名称',
                dataIndex: 'customerName',
                key: 'customerName',
            },
            {
                title: '订单来源',
                dataIndex: 'OrderSource',
                key: 'OrderSource',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 20:
                            type = '新零售';
                            break;
                        case 14:
                            type = '惠商';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '平台编号',
                dataIndex: 'platformId',
                key: 'platformId',
            },
            {
                title: '店铺编号',
                dataIndex: 'shopId',
                key: 'shopId',
            },
            {
                title: '店铺名称',
                dataIndex: 'shopName',
                key: 'shopName',
            },
            {
                title: '业务员工号',
                dataIndex: 'operatorNo',
                key: 'operatorNo',
            },
            {
                title: '业务员姓名',
                dataIndex: 'operatorName',
                key: 'operatorName',
            },
            {
                title: '状态',
                dataIndex: 'orderFlowState',
                key: 'orderFlowState',
                render: (text, record) => this.transformStatus(text, record),
            },
            {
                title: '订单取消原因',
                dataIndex: 'cancelReason',
                key: 'cancelReason'
            },
            {
                title: '订单挂起原因',
                dataIndex: 'freezeReason',
                key: 'freezeReason',
            },
            {
                title: '原总价',
                dataIndex: 'originalTotalPrice',
                key: 'originalTotalPrice',
            },
            {
                title: '总价',
                dataIndex: 'totalPrice',
                key: 'totalPrice',
            },
            {
                title: '代金券/优惠券代码',
                dataIndex: 'couponCode',
                key: 'couponCode',
            },
            {
                title: '代金券/优惠券金额',
                dataIndex: 'couponAmount',
                key: 'couponAmount',
            },
            {
                title: '平台优惠',
                dataIndex: 'platformDiscount',
                key: 'platformDiscount',
            },
            {
                title: '店铺优惠',
                dataIndex: 'shopDiscount',
                key: 'shopDiscount',
            },
            {
                title: '赠品带来的折扣',
                dataIndex: 'giftDiscount',
                key: 'giftDiscount',
            },
            {
                title: '下单渠道',
                dataIndex: 'clientType',
                key: 'clientType',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 1:
                            type = 'PC';
                            break;
                        case 2:
                            type = 'WAP';
                            break;
                        case 3:
                            type = 'APP';
                            break;
                        case 4:
                            type = '微信';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '支付方式',
                dataIndex: 'paymentType',
                key: 'paymentType',
                render: (text) => this.tranformType(text)
            },
            {
                title: '实际支付金额',
                dataIndex: 'payment',
                key: 'payment',
            },
            {
                title: '支付时间',
                dataIndex: 'payTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '支付流水号',
                dataIndex: 'paymentTxId',
                key: 'paymentTxId',
            },
            {
                title: '支付状态',
                dataIndex: 'paymentTxStatus',
                key: 'paymentTxStatus',
            },
            {
                title: '送达方名称',
                dataIndex: 'receiverName',
                key: 'receiverName',
            },
            {
                title: '送达方电话',
                dataIndex: 'receiverPhone',
                key: 'receiverPhone',
            },
            {
                title: '送达方省份',
                dataIndex: 'receiverProvince',
                key: 'receiverProvince',
            },
            {
                title: '送达方城市',
                dataIndex: 'receiverCity',
                key: 'receiverCity',
            },
            {
                title: '送达方区县',
                dataIndex: 'receiverDistrict',
                key: 'receiverDistrict',
            },
            {
                title: '送达方地址',
                dataIndex: 'receiverAddress',
                key: 'receiverAddress',
            },
            {
                title: '送达方邮编',
                dataIndex: 'receiverPostCode',
                key: 'receiverPostCode',
            },
            {
                title: '客户备注',
                dataIndex: 'customerRemark',
                key: 'customerRemark',
            },
            {
                title: '商家备注',
                dataIndex: 'sellerRemark',
                key: 'sellerRemark',
            },
            {
                title: '发票类型',
                dataIndex: 'invoiceType',
                key: 'invoiceType',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 'N':
                            type = '不需要发票';
                            break;
                        case 'P':
                            type = '增普';
                            break;
                        case 'Z':
                            type = '增专';
                            break;
                        case 'D':
                            type = '电子票';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '发票抬头',
                dataIndex: 'invoiceTitle',
                key: 'invoiceTitle',
            },
            {
                title: '发票代码',
                dataIndex: 'invoiceCode',
                key: 'invoiceCode',
            },
            {
                title: '发票号码',
                dataIndex: 'invoiceNo',
                key: 'invoiceNo',
            },
            {
                title: '公司名称',
                dataIndex: 'companyName',
                key: 'companyName',
            },
            {
                title: '纳税人识别码',
                dataIndex: 'taxpayerCode',
                key: 'taxpayerCode',
            },
            {
                title: '开户银行',
                dataIndex: 'taxpayerBank',
                key: 'taxpayerBank',
            },
            {
                title: '银行账户',
                dataIndex: 'bankAccount',
                key: 'bankAccount',
            },
            {
                title: '注册地址',
                dataIndex: 'registeredAddress',
                key: 'registeredAddress',
            },
            {
                title: '注册电话',
                dataIndex: 'registeredTel',
                key: 'registeredTel',
            },
            {
                title: '发货类型',
                dataIndex: 'deliveryType',
                key: 'deliveryType',
                render: (text) => { return text == 1 ? '店面自提' : '物流配送'}
            },
            {
                title: '发货时间',
                dataIndex: 'deliveryTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '快递类型',
                dataIndex: 'expressType',
                key: 'expressType',
            },
            {
                title: '快递单号',
                dataIndex: 'expressCode',
                key: 'expressCode',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '创建人',
                dataIndex: 'createBy',
                key: 'createBy',
            },
            {
                title: '修改时间',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '修改人',
                dataIndex: 'updateBy',
                key: 'updateBy',
            },
            {
                title: '编辑',
                fixed: 'right',
                width: 100,
                render: this.getOpration,
            }
        ];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ckItems: selectedRows});
            }
        };

        const pagination = {
            total: this.state.total,
            pageSize,
            current: this.state.page,
            onChange: (page, pageSize) => {
                this.search(page);
            }
        };

        return (
            <div>
                <Form
                    className={styles.form}
                    onSubmit={this.handleSearch}
                >
                    <Row gutter={40}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="销售订单号：">
                                { getFieldDecorator('outSalesOrderNo')(<Input placeholder="请输入订单号"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="商品名称：">
                                { getFieldDecorator('productName')(<Input placeholder="请输入商品名称"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="商品编码：">
                                { getFieldDecorator('productCode')(<Input placeholder="请输入商品编码"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="会员卡号：">
                                { getFieldDecorator('customerId')(<Input placeholder="请输入会员卡号"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="销售日期：">
                                { getFieldDecorator('rangeTimes')(<RangePicker format="YYYY-MM-DD"/>) }
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <Col span={14} offset={6}>
                                <Button type="primary" htmlType="submit" style={{padding: '0 20px'}}>搜索</Button>
                                <Button style={{marginLeft: 8, padding: '0 20px'}} onClick={this.handleReset}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>

                <div>
                    <Button type="primary" className={styles.printer} onClick={this.printerHandler}>打印小票</Button>
                    <Button type="primary" className={styles.printer} onClick={this.exportHandler}>导出</Button>
                    <Button type="primary" className={styles.printer} onClick={this.editInvoiceHandler}>更新发票信息</Button>
                </div>

                <Alert message={(<p>共搜索到 { this.state.total } 条数据</p>)} type="info" showIcon style={{margin: '10px 0'}} />

                <Table
                    loading={ this.state.loading }
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={this.state.data}
                    rowKey={record => record.outSalesOrderId}
                    pagination={ pagination }
                    scroll={{ x: 5500 }}
                />

                <Modal
                    title="修改发票信息"
                    visible={this.state.editInvoiceModal}
                    onOk={this.doEditInvoice}
                    onCancel={this.cancelEditInvoice}
                >
                    <Form>
                        <FormItem {...formItemLayout} label="发票号">
                            {getFieldDecorator('invoiceId', {
                                rules: [{ required: true, message: '发票号不能为空!' }],
                            })(<Input />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="发票代码">
                            {getFieldDecorator('invoiceCode', {
                                rules: [{ required: true, message: '发票代码不能为空!' }],
                            })(<Input />)}
                        </FormItem>
                        <FormItem {...formItemLayout} label="修改时间">
                            {getFieldDecorator('invoiceTime', {
                                rules: [{ required: true, message: '修改时间不能为空!' }],
                            })(<DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="请选择时间"
                            />)}
                        </FormItem>
                    </Form>
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
        );
    }
}

export default Form.create()(OrderList);

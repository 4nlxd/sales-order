import React from 'react';
import request from '../../../utils/request';
import { domain } from '../../../models/config';
import base from '../../../models/base';
import styles from '../returnOrder.css';
import paystyles from './Pay.css';
import moment from 'moment';
import { Form, Modal, notification, Input, Select, DatePicker, Button, Icon, Upload, Table, Popconfirm } from 'antd';
import cartService from '../../../services/cartService';


const { MonthPicker, RangePicker } = DatePicker;
const { TextArea } = Input;
const pageSize = 10;

let appkey, clientID, clientSecret, upload, token;
if (/(?:uat|dev)\./.test(document.domain)) {
    appkey = 'C73E23AC2B400001C57218701746A360';
    clientID = 'C73E23AC2B5000016E801A581E77112A';
    clientSecret = 'C73E23AC2B40000169301A56C2F0EE10';
    token = 'http://10.122.12.243:8080';
} else {
    appkey = 'C73E23AC2760000134621118E3EC3BB0';
    clientID = 'C73E23AC27800001C250CBDB79651D19';
    clientSecret = 'C73E23AC27700001E4BACAB1988A1CB9';
    token = 'https://wngfp.unifiedcloud.lenovo.com';
}

class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: false,
            loading: true,
            eloading: false,
            dloading: false,
            rloading: false,
            rtloading: false,
            rtdloading: false,
            dvisible: false,
            rvisible1: false,
            rvisible2: false,
            invoiceModal: false,
            required: false,
            data: [],
            detaildata: [],
            rdata: [],
            rddata: [],
            pdata: [],
            pddata: {
                createTime: 0,
                customerId: "",
                items: [],
                orderFlowState: 0,
                orderStatus: 0,
                outSalesOrderNo: "",
                totalPrice: 0
            },
            pass: {
                Reason: "",
                ApplyAmount: "",
                Remark: "",
                InvoceNo: "",
                InvoceCode: "",
                outSalesOrderNo: "",
                returnOrderId: ""
            },
            invoiceData: {
                createBy: "",
                createTime: "",
                items: [],
                outSalesOrderNo: "",
                payment: "",
                paymentType: "",
                ramount: 0,
                totalPrice: "",
                totalQuantity: 1,
            },
            items: [],
            itemdata: [],
            rOrderNo: "",
            current: 1,
            total: 0,
            detailcurrent: 1,
            detailtotal: 0,
            rcurrent: 1,
            rtotal: 0,
            type: "", //编辑or新建
            // rdcurrent: 1,
            // rdtotal: 1,
            shopId: ''
        };
        this.show = false;
    };

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

            if (cb && typeof cb == 'function') cb.call(this)
        })
    };

    componentDidMount() {
        let that = this;
        cartService.getFaInfo().then((res)=>{
            let code = [];

            if(res.data.code == 200){
                let data = res.data.data[0].permission;

                for(let i=0; i<data.length; i++){
                    code.push(data[i].value);
                }
            }

            that.setState({ shopId: code.join(',') }, function(){
                that.search();
            });
        });

        that.initMadp();
    };

    render() {
        const col = {
            labelCol: {
                span: 5
            },
            wrapperCol: {
                span: 19
            }
        };
        const cols = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            }
        };
        const columns = [
            {
                title: '退货单号',
                // dataIndex: 'returnOrderNo',
                key: 'returnOrderNo',
                render: (text, record, index) => (
                    <a href="javascript:void(0);" onClick={(v) => { this.detail(record.returnOrderId) }}>{record.returnOrderNo}</a>
                )
            }, {
                title: '退货订单Id',
                dataIndex: 'returnOrderId',
                key: 'returnOrderId'
            }, {
                title: '销售订单Id',
                dataIndex: 'outSalesOrderId',
                key: 'outSalesOrderId'
            }, {
                title: '销售订单编号',
                dataIndex: 'outSalesOrderNo',
                key: 'outSalesOrderNo'
            }, {
                title: '顾客/会员Id',
                dataIndex: 'customerId',
                key: 'customerId'
            }, {
                title: '顾客/会员名称',
                dataIndex: 'customerName',
                key: 'customerName'
            }, {
                title: '订单来源',
                // dataIndex: 'orderSource',
                key: 'orderSource',
                render: (text, record) => (
                    <span>{this.OSource(record.orderSource)}</span>
                )
            }, {
                title: '平台编号',
                dataIndex: 'platformId',
                key: 'platformId'
            }, {
                title: '店铺编号',
                dataIndex: 'shopId',
                key: 'shopId'
            }, {
                title: '订单流主状态',
                // dataIndex: 'orderFlowState',
                key: 'orderFlowState',
                render: (text, record) => (
                    <div>
                        <span className={record.orderFlowState == 2300 ? "" : "none"}>退货入库</span>
                    </div>
                )
            }, {
                title: '订单主状态',
                // dataIndex: 'orderStatus',
                key: 'orderStatus',
                render: (text, record) => (
                    <span>{this.OStatus(record.orderStatus)}</span>
                )
            }, {
                title: '申请退款金额',
                dataIndex: 'applyAmount',
                key: 'applyAmount'
            }, {
                title: '实际退款金额',
                dataIndex: 'rAmount',
                key: 'rAmount'
            }, {
                title: '支付方式',
                // dataIndex: 'paymentType',
                key: 'paymentType',
                render: (text, record) => (
                    <span>{this.payType(record.paymentType)}</span>
                )
            }, {
                title: '支付流水号',
                dataIndex: 'paymentTxId',
                key: 'paymentTxId'
            }, {
                title: '支付状态',
                dataIndex: 'paymentTxStatus',
                key: 'paymentTxStatus'
            }, {
                title: '是否退款',
                key: 'isRefund',
                render: (text) => { return text == '0' ? '未退款' : '已退款' }
            }, {
                title: '退款日期',
                dataIndex: 'refundDate',
                key: 'refundDate'
            }, {
                title: '退货原因',
                dataIndex: 'reason',
                key: 'reason'
            }, {
                title: '退货备注',
                dataIndex: 'remark',
                key: 'remark'
            }, {
                title: '拒绝原因',
                dataIndex: 'refuseReason',
                key: 'refuseReason'
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '创建人',
                dataIndex: 'createBy',
                key: 'createBy'
            }, {
                title: '修改时间',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '修改人',
                dataIndex: 'updateBy',
                key: 'updateBy'
            }
        ];
        const dcolumns = [
            {
                title: '退货订单明细Id',
                dataIndex: 'returnOrderDetailId',
                key: 'returnOrderDetailId'
            }, {
                title: '订单来源',
                // dataIndex: 'orderSource',
                key: 'orderSource',
                render: (text, record) => (
                    <span>{this.OSource(record.orderSource)}</span>
                )
            }, {
                title: '退货订单Id',
                dataIndex: 'returnOrderId',
                key: 'returnOrderId'
            }, {
                title: '销售订单明细Id',
                dataIndex: 'outSalesOrderDetailId',
                key: 'outSalesOrderDetailId'
            }, {
                title: '商品编号',
                dataIndex: 'productCode',
                key: 'productCode'
            }, {
                title: '商品名称',
                dataIndex: 'productName',
                key: 'productName'
            }, {
                title: '商品品类',
                dataIndex: 'productType',
                key: 'productType'
            }, {
                title: '产品组',
                dataIndex: 'productGroupNo',
                key: 'productGroupNo'
            }, {
                title: '是否实物',
                // dataIndex: 'isPhysical',
                key: 'isPhysical',
                render: (text, record) => (
                    <span>{this.yesno(record.isPhysical)}</span>
                )
            }, {
                title: '是否服务',
                // dataIndex: 'isSerivce',
                key: 'isSerivce',
                render: (text, record) => (
                    <span>{this.yesno(record.isSerivce)}</span>
                )
            }, {
                title: '原定销售价格',
                dataIndex: 'originalPrice',
                key: 'originalPrice'
            }, {
                title: '调整后的价格',
                dataIndex: 'price',
                key: 'price'
            }, {
                title: '商品数量',
                dataIndex: 'quantity',
                key: 'quantity'
            }, {
                title: '是否赠品',
                // dataIndex: 'isGift',
                key: 'isGift',
                render: (text, record) => (
                    <span>{this.yesno(record.isGift)}</span>
                )
            }, {
                title: '赠品绑定Id',
                dataIndex: 'giftGroupId',
                key: 'giftGroupId'
            }, {
                title: '店铺优惠',
                dataIndex: 'shopDiscount',
                key: 'shopDiscount'
            }, {
                title: '赠品带来的折扣',
                dataIndex: 'giftDiscount',
                key: 'giftDiscount'
            }, {
                title: '平台优惠',
                dataIndex: 'platFormDiscount',
                key: 'platFormDiscount'
            }, {
                title: '买家使用的积分金额',
                dataIndex: 'pointDiscount',
                key: 'pointDiscount'
            }, {
                title: '仓库代码',
                dataIndex: 'warehouseCode',
                key: 'warehouseCode'
            }, {
                title: '商品条码',
                dataIndex: 'barCode',
                key: 'barCode'
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '创建人',
                dataIndex: 'createBy',
                key: 'createBy'
            }, {
                title: '修改时间',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '修改人',
                dataIndex: 'updateBy',
                key: 'updateBy'
            }
        ];
        const rcolumns = [
            {
                title: '订单Id',
                dataIndex: 'outSalesOrderId',
                key: 'outSalesOrderId'
            }, {
                title: '订单编号',
                dataIndex: 'outSalesOrderNo',
                key: 'outSalesOrderNo'
            }, {
                title: '购物车编号',
                dataIndex: 'shoppingCartNo',
                key: 'shoppingCartNo'
            }, {
                title: '顾客/会员Id',
                dataIndex: 'customerId',
                key: 'customerId'
            }, {
                title: '顾客/会员名称',
                dataIndex: 'customerName',
                key: 'customerName'
            }, {
                title: '订单来源',
                // dataIndex: 'orderSource',
                key: 'orderSource',
                render: (text, record) => (
                    <span>{this.OSource(record.orderSource)}</span>
                )
            }, {
                title: '平台编号',
                dataIndex: 'platformId',
                key: 'platformId'
            }, {
                title: '店铺编号',
                dataIndex: 'shopId',
                key: 'shopId'
            }, {
                title: '订单流主状态',
                // dataIndex: 'orderFlowState',
                key: 'orderFlowState',
                render: (text, record) => base.transformOrderstatus(record.orderStatus, record.orderFlowState)
            }, {
                title: '订单主状态',
                // dataIndex: 'orderStatus',
                key: 'orderStatus',
                render: (text, record) => (
                    <span>{this.OStatus(record.orderStatus)}</span>
                )
            }, {
                title: '订单取消原因',
                dataIndex: 'cancelReason',
                key: 'cancelReason'
            }, {
                title: '订单挂起原因',
                dataIndex: 'FreezeReason',
                key: 'FreezeReason'
            }, {
                title: '原总价',
                dataIndex: 'originalTotalPrice',
                key: 'originalTotalPrice'
            }, {
                title: '总价',
                dataIndex: 'totalPrice',
                key: 'totalPrice'
            }, {
                title: '代金券代码',
                dataIndex: 'couponCode',
                key: 'couponCode'
            }, {
                title: '优惠券金额',
                dataIndex: 'couponAmount',
                key: 'couponAmount'
            }, {
                title: '平台优惠',
                dataIndex: 'platformDiscount',
                key: 'platformDiscount'
            }, {
                title: '店铺优惠',
                dataIndex: 'shopDiscount',
                key: 'shopDiscount'
            }, {
                title: '赠品带来的折扣',
                dataIndex: 'giftDiscount',
                key: 'giftDiscount'
            }, {
                title: '下单渠道',
                // dataIndex: 'clientType',
                key: 'clientType',
                render: (text, record) => (
                    <div>
                        <span className={record.clientType == 1 ? "" : "none"}>PC</span>
                        <span className={record.clientType == 2 ? "" : "none"}>WAP</span>
                        <span className={record.clientType == 3 ? "" : "none"}>APP</span>
                        <span className={record.clientType == 4 ? "" : "none"}>微信</span>
                    </div>
                )
            }, {
                title: '支付方式',
                // dataIndex: 'paymentType',
                key: 'paymentType',
                render: (text, record) => (
                    <span>{this.tranformType(record.paymentType)}</span>
                )
            }, {
                title: '实际支付金额',
                dataIndex: 'payment',
                key: 'payment'
            }, {
                title: '支付时间',
                dataIndex: 'payTime',
                key: 'payTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '支付流水号',
                dataIndex: 'paymentTxId',
                key: 'paymentTxId'
            }, {
                title: '支付状态',
                dataIndex: 'paymentTxStatus',
                key: 'paymentTxStatus'
            }, {
                title: '送达方名称',
                dataIndex: 'receiverName',
                key: 'receiverName'
            }, {
                title: '送达方电话',
                dataIndex: 'receiverPhone',
                key: 'receiverPhone'
            }, {
                title: '送达方省份',
                dataIndex: 'receiverProvince',
                key: 'receiverProvince'
            }, {
                title: '送达方城市',
                dataIndex: 'receiverCity',
                key: 'receiverCity'
            }, {
                title: '送达方区县',
                dataIndex: 'receiverDistrict',
                key: 'receiverDistrict'
            }, {
                title: '送达方地址',
                dataIndex: 'receiverAddress',
                key: 'receiverAddress'
            }, {
                title: '送达方邮编',
                dataIndex: 'receiverPostCode',
                key: 'receiverPostCode'
            }, {
                title: '客户备注',
                dataIndex: 'customerRemark',
                key: 'customerRemark'
            }, {
                title: '商家备注',
                dataIndex: 'sellerRemark',
                key: 'sellerRemark'
            }, {
                title: '发票类型',
                dataIndex: 'invoiceType',
                key: 'invoiceType'
            }, {
                title: '发票抬头',
                dataIndex: 'invoiceTitle',
                key: 'invoiceTitle'
            }, {
                title: '发票代码',
                dataIndex: 'invoiceCode',
                key: 'invoiceCode'
            }, {
                title: '发票号码',
                dataIndex: 'invoiceNo',
                key: 'invoiceNo'
            }, {
                title: '公司名称',
                dataIndex: 'companyName',
                key: 'companyName'
            }, {
                title: '纳税人识别码',
                dataIndex: 'taxpayerCode',
                key: 'taxpayerCode'
            }, {
                title: '开户银行',
                dataIndex: 'taxpayerBank',
                key: 'taxpayerBank'
            }, {
                title: '银行账户',
                dataIndex: 'bankAccount',
                key: 'bankAccount'
            }, {
                title: '注册地址',
                dataIndex: 'registeredAddress',
                key: 'registeredAddress'
            }, {
                title: '注册电话',
                dataIndex: 'registeredTel',
                key: 'registeredTel'
            }, {
                title: '发货类型',
                dataIndex: 'deliveryType',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 1:
                            type = '店面自提'; break;
                        case 2:
                            type = '物流配送'; break;
                    }

                    return type;
                }
            }, {
                title: '发货时间',
                dataIndex: 'deliveryTime',
                key: 'deliveryTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '快递类型',
                dataIndex: 'expressType',
                key: 'expressType'
            }, {
                title: '快递单号',
                dataIndex: 'expressCode',
                key: 'expressCode'
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '创建人',
                dataIndex: 'createBy',
                key: 'createBy'
            }, {
                title: '修改时间',
                dataIndex: 'updateTime',
                key: 'updateTime',
                render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
            }, {
                title: '修改人',
                dataIndex: 'updateBy',
                key: 'updateBy'
            }
        ];
        const rdcolumns = [{
            title: '订单商品详情Id',
            dataIndex: 'outSalesOrderDetailId',
            key: 'outSalesOrderDetailId'
        }, {
            title: '订单来源',
            // dataIndex: 'orderSource',
            key: 'orderSource',
            render: (text, record) => (
                <span>{this.OSource(record.orderSource)}</span>
            )
        }, {
            title: '订单Id',
            dataIndex: 'outSalesOrderId',
            key: 'outSalesOrderId'
        }, {
            title: '订单编号',
            dataIndex: 'outSalesOrderNo',
            key: 'outSalesOrderNo'
        }, {
            title: '商品编号',
            dataIndex: 'productCode',
            key: 'productCode'
        }, {
            title: '商品名称',
            dataIndex: 'productName',
            key: 'productName'
        }, {
            title: '商品品类',
            dataIndex: 'productType',
            key: 'productType'
        }, {
            title: '产品组',
            dataIndex: 'productGroupNo',
            key: 'productGroupNo'
        }, {
            title: '商品单位',
            dataIndex: 'productUnit',
            key: 'productUnit'
        }, {
            title: '是否实物',
            // dataIndex: 'isPhysical',
            key: 'isPhysical',
            render: (text, record) => (
                <span>{this.yesno(record.isPhysical)}</span>
            )
        }, {
            title: '是否服务',
            // dataIndex: 'isSerivce',
            key: 'isSerivce',
            render: (text, record) => (
                <span>{this.yesno(record.isSerivce)}</span>
            )
        }, {
            title: '商品税率',
            dataIndex: 'taxRate',
            key: 'taxRate'
        }, {
            title: '是否SN管控',
            // dataIndex: 'isSnControl',
            key: 'isSnControl',
            render: (text, record) => (
                <span>{this.yesno(record.isSnControl)}</span>
            )
        }, {
            title: '商品地板价',
            dataIndex: 'FloorPrice',
            key: 'FloorPrice'
        }, {
            title: '原定销售价格',
            dataIndex: 'originalPrice',
            key: 'originalPrice'
        }, {
            title: '调整后的价格',
            dataIndex: 'price',
            key: 'price'
        }, {
            title: '商品数量',
            dataIndex: 'quantity',
            key: 'quantity'
        }, {
            title: '是否赠品',
            // dataIndex: 'isGift',
            key: 'isGift',
            render: (text, record) => (
                <span>{this.yesno(record.isGift)}</span>
            )
        }, {
            title: '赠品绑定Id',
            dataIndex: 'giftGroupId',
            key: 'giftGroupId'
        }, {
            title: '促销编号',
            dataIndex: 'promotionCode',
            key: 'promotionCode'
        }, {
            title: '店铺优惠',
            dataIndex: 'shopDiscount',
            key: 'shopDiscount'
        }, {
            title: '赠品带来的折扣',
            dataIndex: 'giftDiscount',
            key: 'giftDiscount'
        }, {
            title: '平台优惠',
            dataIndex: 'platFormDiscount',
            key: 'platFormDiscount'
        }, {
            title: '买家使用的积分金额',
            dataIndex: 'pointDiscount',
            key: 'pointDiscount'
        }, {
            title: '仓库代码',
            dataIndex: 'warehouseCode',
            key: 'warehouseCode'
        }, {
            title: '商品条码',
            dataIndex: 'barCode',
            key: 'barCode'
        }, {
            title: '采购成本',
            dataIndex: 'purchaseCost',
            key: 'purchaseCost'
        }, {
            title: '发货类型',
            dataIndex: 'deliveryType',
            render: (text) => {
                let type = '';

                switch (text){
                    case 1:
                        type = '店面自提'; break;
                    case 2:
                        type = '物流配送'; break;
                }

                return type;
            }
        }, {
            title: '发货时间',
            dataIndex: 'deliveryTime',
            key: 'deliveryTime',
            render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
        }, {
            title: '快递类型',
            dataIndex: 'expressType',
            key: 'expressType'
        }, {
            title: '快递单号',
            dataIndex: 'expressCode',
            key: 'expressCode'
        }, {
            title: '关联退换货商品明细Id',
            dataIndex: 'reOrderDetailId',
            key: 'reOrderDetailId'
        }, {
            title: '退货数量',
            dataIndex: 'reQuantity',
            key: 'reQuantity'
        }, {
            title: '退货SN',
            dataIndex: 'reSn',
            key: 'reSn'
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
        }, {
            title: '创建人',
            dataIndex: 'createBy',
            key: 'createBy'
        }, {
            title: '修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            render: (text) => { if (text) return moment(text).format('YYYY-MM-DD HH:mm:ss') }
        }, {
            title: '修改人',
            dataIndex: 'updateBy',
            key: 'updateBy'
        }];

        const rowSelection = {
            type: "radio",
            onChange: (selectedRowKeys, selectedRows) => {
                document.getElementById('nums').innerHTML = selectedRows.length;
                this.setState({ items: selectedRowKeys, itemdata: selectedRows });
            }
        };
        const rdSelection = {
            type: "radio",
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ rOrderNo: selectedRowKeys[0], pdata: selectedRows });
            }
        };

        const pagination = {
            total: this.state.total,
            current: this.state.current,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
                this.setState({ current: page });
                this.search(page);
            }
        };

        const rpagination = {
            total: this.state.rtotal,
            current: this.state.rcurrent,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
                this.setState({ rcurrent: page });
                this.rsearch(page);
            }
        };

        // const rdpagination = {
        //     total: this.state.rdtotal,
        //     current: this.state.rdcurrent,
        //     pageSize: pageSize,
        //     onChange: (page, pageSize) => {
        //         this.setState({ rdcurrent: page });
        //         this.search(page);
        //     }
        // };

        const { getFieldDecorator } = this.props.form;

        return (
            <div>
                <Form id="form1" layout="inline" className={[styles.searchForm, styles.sForm]}>
                    <Form.Item { ...col } label="选择商城">
                        {getFieldDecorator('ShopId', { initialValue: '20', })(
                            <Select style={{ width: '92%' }}>
                                {base.setOptions(base.shopsData)}
                            </Select>)}
                    </Form.Item>
                    <Form.Item { ...col } label="退货单号">
                        {getFieldDecorator('ReturnOrderNo', { initialValue: '', })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                    </Form.Item>
                    <Form.Item { ...col } label="会员名称">
                        {getFieldDecorator('CustomerName', { initialValue: '', })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                    </Form.Item>
                    <Form.Item { ...col } label="退款日期">
                        {getFieldDecorator('Time', { initialValue: [], })(<RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '92%' }} />)}
                    </Form.Item>
                    <div id="formBtn" style={{ display: 'inline-block' }} className="mt2 right">
                        <Button onClick={this.searchBtn.bind(this)} type="primary">搜 索</Button>
                        <Button onClick={this.handleReset} className="ml10">重 置</Button>
                    </div>
                </Form>
                <div className={styles.actions}>
                    <Button type="primary" onClick={this.add.bind(this)}>创建退货申请</Button>
                    <Button type="primary" className="ml10" loading={this.state.eloading} onClick={this.edit.bind(this)}>修改</Button>
                    <Button type="primary" className="ml10" onClick={this.invoiceBtn.bind(this)}>打印小票</Button>
                    <Button className="ml10" onClick={this.out.bind(this)}>导出</Button>
                </div>
                <div className={styles.action_infos}>
                    <Icon type="info-circle" className="fz15 t_2icon" />
                    已选择<span className="nums" id="nums">0</span>项
                </div>
                <Table scroll={{ x: 2600 }} loading={this.state.loading} rowKey="returnOrderId" pagination={pagination} rowSelection={rowSelection} columns={columns} dataSource={this.state.data} />
                <Modal
                    visible={this.state.dvisible}
                    title="订单详情"
                    onCancel={this.detailCancel.bind(this)}
                    maskClosable={false}
                    width="900px"
                    footer={[<Button key="back" size="large" onClick={this.detailCancel.bind(this)}>关闭</Button>]}
                >
                    <Table scroll={{ x: 2300 }} loading={this.state.dloading} rowKey="returnOrderDetailId" pagination={false} columns={dcolumns} dataSource={this.state.detaildata} />
                </Modal>
                <Modal
                    visible={this.state.rvisible1}
                    title="退货申请"
                    onOk={this.rOk1.bind(this)}
                    onCancel={this.rCancel1.bind(this)}
                    maskClosable={false}
                    width="880px"
                    footer={[
                        <Button key="back" size="large" onClick={this.rCancel1.bind(this)}>关闭</Button>,
                        <Button key="submit" type="primary" size="large" loading={this.state.rloading} onClick={this.rOk1.bind(this)}> 下一步 </Button>]}
                >
                    <Form layout="inline" className={[styles.searchForm, styles.modalForm]}>
                        <Form.Item { ...col } label="交易单号">
                            {getFieldDecorator('outSalesOrderNo', { initialValue: '', })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item>
                        {/* <Form.Item { ...col } label="会员名称">
                            {getFieldDecorator('customerName', { initialValue: '', })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item>
                        <Form.Item { ...col } label="商品名称">
                            {getFieldDecorator('productName', { initialValue: '', })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item> */}
                        <Form.Item { ...col } label="下单时间">
                            {getFieldDecorator('rangeTimes', { initialValue: [], })(<RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" style={{ width: '92%' }} />)}
                        </Form.Item>
                        <div id="formBtn" style={{ display: 'inline-block' }} className="mt2 right">
                            <Button onClick={this.rsearchBtn.bind(this)} type="primary">搜 索</Button>
                            <Button onClick={this.rReset1.bind(this)} className="ml10">重 置</Button>
                        </div>
                    </Form>
                    <Table scroll={{ x: 4300 }} loading={this.state.rtloading} onRowDoubleClick={this.onRowDoubleClick.bind(this)} className="mt30" rowKey="outSalesOrderNo" rowSelection={rdSelection} pagination={rpagination} columns={rcolumns} dataSource={this.state.rdata} />
                    <Table scroll={{ x: 4300 }} loading={this.state.rtdloading} className="mt30" rowKey="outSalesOrderDetailId" pagination={false} columns={rdcolumns} dataSource={this.state.rddata} />
                </Modal>
                <Modal
                    visible={this.state.rvisible2}
                    title="退货申请"
                    onOk={this.rOk2.bind(this)}
                    onCancel={this.rCancel2.bind(this)}
                    maskClosable={false}
                    width="780px"
                    style={{ zIndex: 999 }}
                    footer={[
                        <Button key="back" size="large" onClick={this.rCancel2.bind(this)}>关闭</Button>,
                        <Button key="submit" type="primary" size="large" loading={this.state.rploading} onClick={this.rOk2.bind(this)}> 确认 </Button>]}
                >
                    <Form layout="inline" className={[styles.searchForm, styles.modalForm]}>
                        <Form.Item { ...cols } label="交易单号">
                            <span>{this.state.pddata.outSalesOrderNo}</span>
                        </Form.Item>
                        <Form.Item { ...cols } label="会员卡号">
                            <span>{this.state.pddata.customerId}</span>
                        </Form.Item>
                        <Form.Item { ...cols } label="发票代码">
                            {getFieldDecorator('InvoceCode', { initialValue: this.state.pass.InvoceCode, })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item>
                        <Form.Item { ...cols } label="发票号码">
                            {getFieldDecorator('InvoceNo', { initialValue: this.state.pass.InvoceNo, })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item>
                        <Form.Item { ...cols } label="退货原因">
                            {getFieldDecorator('Reason', { initialValue: this.state.pass.Reason, })(<Input placeholder="请输入" style={{ width: '92%' }} />)}
                        </Form.Item>
                        <Form.Item { ...cols } label="申请退款金额">
                            {getFieldDecorator('ApplyAmount', {
                                initialValue: this.state.pdata[0] && this.state.pdata[0].payment + '',
                                rules: [{
                                    required: true,
                                    whitespace: true,
                                    pattern: /^\d+(\.\d{0,2})?$/,
                                    message: '请输入申请退款金额,最多保留两位小数'
                                }]
                            })(<Input placeholder="请输入" style={{ width: '92%' }} disabled={true} />)}
                        </Form.Item>
                        <Form.Item { ...cols } label="审批意见">
                            {getFieldDecorator('Remark', {
                                initialValue: this.state.pass.Remark,
                                rules: [{
                                    required: true,
                                    whitespace: true,
                                    max: 50,
                                    message: '审批意见不能为空，且不能超过50个字数'
                                }]
                            })(<TextArea placeholder="请输入" rows={3} style={{ width: '92%' }} />)}
                        </Form.Item>
                        <div id="formBtn" style={{ display: 'inline-block' }} className="mt2 right">
                            <Button onClick={this.rReset2.bind(this)} className="ml10">重 置</Button>
                        </div>
                    </Form>
                    <Table scroll={{ x: 4300 }} className="mt30" rowKey="outSalesOrderNo" pagination={false} columns={rcolumns} dataSource={this.state.pdata} />
                    <Table scroll={{ x: 5500 }} className="mt30" rowKey="outSalesOrderDetailId" pagination={false} columns={rdcolumns} dataSource={this.state.pddata.items} />
                </Modal>

                <div id="invoicePrint" style={{ width: "48mm", display: "none" }}>
                    <div style={{ textAlign: 'center', fontSize: '10px' }}>
                        <div><img src={ require('../../SalesOrder/images/logo.jpg') } style={{display: 'block', width: '60%', height: 'auto', margin: '0 auto 10px'}} /></div>
                        <h5>{this.state.invoiceData.companyName}</h5>
                        <h6 style={{ marginTop: "10px" }}>{this.state.invoiceData.address}</h6>
                        <p>电话：{this.state.invoiceData.telPhone}</p>
                        <p>{this.state.invoiceData.webSite}</p>
                        <p>退货退款小票</p>
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
                    <table style={{margin: '6px 0', width: '100%', fontSize: 10, border: 0}}>
                        <thead style={{ fontStyle: 'normal', wordBreak: 'keep-all' }}>
                        <tr>
                            <th>商品编码</th>
                            <th>商品名称</th>
                            <th>数量</th>
                            <th>单价</th>
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
                            <td>退款金额：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.ramount }</td>
                        </tr>
                        <tr>
                            <td>优惠金额：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.totalDiscount }</td>
                        </tr>
                        <tr>
                            <td>实付金额：</td>
                            <td style={{textAlign:' right'}}>{ this.state.invoiceData.payment }</td>
                        </tr>
                        </tbody>
                    </table>
                    {/* <div style={{ width: "250px", padding: "5px 0", margin: "5px auto", borderTop: "1px dashed #e9e9e9", borderBottom: "1px dashed #e9e9e9" }}>
                        <p style={{ padding: "0 10px" }}>本次收款金额</p>
                        <dl style={{ height: "20px", lineHeight: "20px", padding: "0 10px", overflow: "hidden" }}>
                            <dt style={{ width: "70px", float: "left" }}>{this.tranformType(this.state.invoiceData.paymentType)}</dt>
                            <dd style={{ textAlign: "right", marginLeft: "70px" }}>{this.state.invoiceData.payment}</dd>
                        </dl>
                    </div> */}
                    {/* <div style={{ width: "250px", margin: "0 auto" }}>
                        <p>备注：</p>
                        <p>1.请保留好您的购物小票和发票</p>
                        <p>2.如发生退货，赠品退回</p>
                        <p>3.退款方式和收款方式一样</p>
                    </div> */}
                </div>
            </div>
        )
    }

    renderInvoice = () => {
        let list = [], data = this.state.invoiceData.items || [];

        for(let i=0; i<data.length; i++){
            list.push(
                <tr key={ data[i].outSalesOrderDetailId }>
                    <td>{ data[i].productCode }</td>
                    <td>{ data[i].productName }</td>
                    <td>{ data[i].quantity }</td>
                    <td>{ data[i].price }</td>
                </tr>
            );
        }

        return list;
    };

    add() {
        this.setState({
            rvisible1: true, type: "add",
            pass: {
                Reason: "",
                ApplyAmount: "",
                Remark: "",
                InvoceNo: "",
                InvoceCode: "",
                outSalesOrderNo: "",
                returnOrderId: ""
            }
        });
        this.rReset1();
        this.rReset2();
        this.rsearchBtn();
    }
    edit() {
        if (this.state.itemdata.length > 0) {
            this.setState({
                eloading: true,
                rploading: false,
                pass: {
                    Reason: this.state.itemdata[0].reason || "",
                    ApplyAmount: this.state.itemdata[0].applyAmount || "",
                    Remark: this.state.itemdata[0].remark || "",
                    InvoceNo: this.state.itemdata[0].invoiceNo || "",
                    InvoceCode: this.state.itemdata[0].invoiceCode || "",
                    outSalesOrderNo: this.state.itemdata[0].outSalesOrderNo || "",
                    returnOrderId: this.state.itemdata[0].returnOrderId || "",
                    shopId: this.state.itemdata[0].shopId || "",
                }
            });
            this.rReset2();
            request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderList?currentPage=1&pageSize=10&outSalesOrderNo=${this.state.itemdata[0].outSalesOrderNo}&orderId=&orderby=&startTime=&endTime=&orderFlowState=1500&orderStatus=&shopId=${this.state.shopId}`, {
                method: 'GET',
            }
            ).then((res) => {
                if (res.data.code == '200') {
                    this.setState({ rOrderNo: this.state.pass.outSalesOrderNo, pdata: res.data.data });
                    this.rOk1();
                } else {
                    this.openNotification('error', res.data.message);
                }
            });
            this.setState({ type: "edit" });
        } else {
            this.openNotification('error', '请选择退货单！');
        }
    }
    //订单详情
    detail(returnOrderId) {
        this.setState({ dvisible: true, dloading: true });
        request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/getReOrderDetList?ReturnOrderId=` + returnOrderId, {
            method: 'GET',
        }).then((res) => {
            this.setState({ dloading: false });
            if (res.data.code == 200) {
                this.setState({ detaildata: res.data.data, detailtotal: res.data.totalCount });
            }
        });
    }
    //modal
    detailCancel() {
        this.setState({ dvisible: false });
    }
    //退货申请
    rOk1() {
        if (this.state.rOrderNo == "") {
            this.openNotification('error', '请选择订单');
        } else {
            this.setState({ rloading: true });
            request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderDetail?outSalesOrderNo=${this.state.rOrderNo}&shopId=${this.state.shopId}`, {
                method: 'GET',
            }
            ).then((res) => {
                this.setState({ rloading: false, eloading: false });
                if (res.data.code == '200') {
                    this.setState({ pddata: res.data.data, rvisible2: true, rvisible1: false });
                } else {
                    this.openNotification('error', res.data.message);
                }
            });
        }
    }
    rCancel1() {
        this.setState({ rvisible1: false });
    }
    rsearchBtn() {
        this.setState({ rcurrent: 1 });
        this.rsearch();
    }
    rsearch(page = 1) {
        this.props.form.validateFields(['customerName', 'outSalesOrderNo', 'productName', 'rangeTimes'], (err, values) => {
            let startTime = values.rangeTimes && values.rangeTimes[0] ? values.rangeTimes[0].format('YYYY-MM-DD') : '';
            let endTime = values.rangeTimes && values.rangeTimes[1] ? values.rangeTimes[1].format('YYYY-MM-DD') : '';
            this.setState({ rtloading: true });
            request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderList?currentPage=${page}&pageSize=${pageSize}&outSalesOrderNo=${values.outSalesOrderNo || ""}&orderId=&orderby=&startTime=${startTime}&endTime=${endTime}&orderFlowState=1500&orderStatus=110&shopId=${this.state.shopId}`, {
                method: 'GET',
            }).then((res) => {
                this.setState({ rtloading: false });
                if (res.data.code == 200) {
                    this.setState({ rdata: res.data.data, rtotal: parseInt(res.data.total) });
                } else {
                    this.openNotification('error', res.data.message);
                }
            });
        })
    }
    rReset1() {
        this.props.form.resetFields(['customerName', 'outSalesOrderNo', 'productName', 'rangeTimes']);
    }
    onRowDoubleClick(record, index, event) {
        this.setState({ rtdloading: true });
        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderDetail?outSalesOrderNo=${record.outSalesOrderNo}&shopId=${this.state.shopId}`, {
            method: 'GET',
        }
        ).then((res) => {
            this.setState({ rtdloading: false });
            if (res.data.code == '200') {
                this.setState({ rddata: res.data.data.items });
            } else {
                this.openNotification('error', res.data.message);
            }
        });
    }

    rOk2() {
        this.props.form.validateFields(['InvoceCode', 'InvoceNo', 'Reason', 'ApplyAmount', 'Remark', 'ShopId'], (err, fieldsValue) => {
            if (err) return;
            this.setState({ rploading: true });
            const data = JSON.stringify({
                invoceCode: fieldsValue.InvoceCode,
                invoceNo: fieldsValue.InvoceNo,
                outSalesOrderNo: this.state.pddata.outSalesOrderNo,
                outSalesOrderId: this.state.pdata[0].outSalesOrderId,
                reOrderid: this.state.pass.returnOrderId,
                reason: fieldsValue.Reason,
                applyAmount: fieldsValue.ApplyAmount,
                remark: fieldsValue.Remark,
                orderSoure: fieldsValue.ShopId
            });
            let url, msg;
            if (this.state.type == "add") {
                url = "NewRetailReOrder/ReApp";
            } else if (this.state.type == "edit") {
                url = "NewRetailReOrder/UpReApp";
            }
            request(`${domain}pcsd-newretail-transaction-returnorder/` + url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data
            }).then((res) => {
                this.setState({ rploading: false })
                if (res.data.code == '200') {
                    this.setState({ rvisible1: false, rvisible2: false });
                    if (this.state.type == "edit") {
                        this.setState({ items: res.data.data.returnOrderId, itemdata: [res.data.data] });
                    }
                    this.openNotification('success', res.data.message);
                    this.search();

                    if (this.state.type == "add") {
                        request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/ReSmallReceipt?ReturnOrderNo=${res.data.data.returnOrderNo}&OrderSoure=${fieldsValue.ShopId}&shopId=${res.data.data.shopId}`, {
                            method: 'GET',
                        }).then((res) => {
                            this.setState({ dloading: false });
                            if (res.data.code == 200) {
                                this.setState({ invoiceData: res.data.data });
                                this.invoice();
                            }
                        });
                    }
                } else {
                    this.openNotification('error', res.data.message);
                }
            });
        })
    }
    rCancel2() {
        this.setState({ rvisible2: false });
    }
    rReset2() {
        this.props.form.resetFields(['InvoceCode', 'InvoceNo', 'Reason', 'ApplyAmount', 'Remark']);
    }
    //
    handleReset = () => {
        this.props.form.resetFields(['ShopId', 'ReturnOrderNo', 'CustomerName', 'Time']);
    }
    searchBtn() {
        this.show = true;
        this.setState({ current: 1 });
        this.search();
    }
    search(page = 1) {
        // const SupplierCode = document.getElementById('SupplierCode').value, SupplierName = document.getElementById('SupplierName').value;
        // if (selected) selected.innerHTML = '0';
        this.props.form.validateFields(['ShopId', 'ReturnOrderNo', 'CustomerName', 'Time'], (err, values) => {
            let StrTime = "", EndTime = "";
            if (values.Time.length > 0) {
                StrTime = values.Time[0].format('YYYY-MM-DD HH:mm:ss');
                EndTime = values.Time[1].format('YYYY-MM-DD HH:mm:ss');
            }
            request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/getReOrderInfo?ShopId=` + this.state.shopId + `&ReturnOrderNo=` + values.ReturnOrderNo + `&CustomerName=` + values.CustomerName + `&StrTime=` + StrTime + `&EndTime=` + EndTime + '&OrderSource='+values.ShopId, {
                method: 'GET',
            }).then((res) => {
                this.setState({ loading: false });
                if (res.data.code == 200) {
                    this.setState({ data: res.data.data, total: parseInt(res.data.total) });
                }
            });
        })
    };
    out() {
        this.props.form.validateFields(['ShopId', 'ReturnOrderNo', 'CustomerName', 'Time'], (err, values) => {
            let StrTime = "", EndTime = "";
            if (values.Time.length > 0) {
                StrTime = values.Time[0].format('YYYY-MM-DD HH:mm:ss');
                EndTime = values.Time[1].format('YYYY-MM-DD HH:mm:ss');
            }
            const data = JSON.stringify({
                customerName: values.CustomerName,
                shopId: values.ShopId,
                returnOrderNo: values.ReturnOrderNo,
                strTime: StrTime,
                endTime: EndTime
            });

            if (!/accessToken=/i.test(document.cookie)) {
                this.openNotification('error', '验证信息出错，请稍后重试!');
                this.initMadp();
                return false;
            }

            request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/ReexportOrders?shopId=` + values.ShopId + `&returnOrderNo=` + values.ReturnOrderNo + `&customerName=` + values.CustomerName + `&strTime=` + StrTime + `&endTime=` + EndTime, {
                method: 'GET',
            }).then((res) => {
                if (res.data.code == 200) {
                    window.open(res.data.data)
                    // location.href = res.data.data;
                } else {
                    this.openNotification('error', '导出失败！');
                }
            })
        })
    }
    //打印小票
    invoiceBtn() {
        let that = this;
        if (this.state.itemdata.length > 0) {
            request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/ReSmallReceipt?ReturnOrderNo=${this.state.itemdata[0].returnOrderNo}&OrderSoure=${this.state.itemdata[0].orderSource}&shopId=${this.state.itemdata[0].shopId}`, {
                method: 'GET',
            }).then((res) => {
                this.setState({ dloading: false });
                if (res.data.code == 200) {
                    this.setState({ invoiceData: res.data.data }, function(){
                        that.invoice();
                    });
                }
            });
        } else {
            this.openNotification('error', '请选择退货单！');
        }
    }
    invoice() {
        try{
            LODOP = getLodop();
            LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
            //LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
            LODOP.SET_PRINT_STYLE("FontSize", 10);
            LODOP.SET_PRINT_PAGESIZE(3,'48mm',40,"");
            LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900,document.getElementById("invoicePrint").innerHTML);
            LODOP.SET_PRINTER_INDEX(-1);
            //LODOP.PREVIEW();
            LODOP.PRINT();
        }catch(e){
            console.log(e);
        }
    }
    hideInvoiceModal() {
        this.setState({ invoiceModal: false })
    }

    openNotification(type, desc) {
        notification[type]({
            message: '提示信息',
            description: desc
        })
    };

    tranformType = (type) => {
        let name;
        switch (type) {
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

    yesno = (type) => {
        let name;
        switch (type) {
            case 0:
                name = '否'; break;
            case 1:
                name = '是'; break;
        }
        return name;
    };
    OSource = (type) => {
        let name;
        switch (type) {
            case '14':
                name = '惠商'; break;
            case '20':
                name = '新零售'; break;
        }
        return name;
    };
    OStatus = (type) => {
        let name;
        switch (type) {
            case 110:
                name = '正常'; break;
            case 120:
                name = '冻结'; break;
            case 130:
                name = '取消'; break;
            case 210:
                name = '正常'; break;
            case 220:
                name = '拒绝'; break;
            case 230:
                name = '取消'; break;
        }
        return name;
    };
    payType = (type) => {
        let name;
        switch (type) {
            case 1:
                name = '支付宝'; break;
            case 2:
                name = '微信'; break;
            case 3:
                name = '刷卡'; break;
            case 4:
                name = '现金'; break;
            case 5:
                name = '货到付款'; break;
        }
        return name;
    };
}
const Return = Form.create()(formWrapper);
export default Return;

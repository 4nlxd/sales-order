import React from 'react';
import request from '../../utils/request';
import { domain } from '../../models/config';
import base from '../../models/base';
import styles from './returnOrder.css';
import { Form, notification, Input, Select, DatePicker, Button, Icon, Upload, Modal, Table, Popconfirm } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;
const pageSize = 10;
class formWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expand: false,
            loading: true,
            dvisible: false,
            data: [],
            items: [],
            current: 1,
            total: 1,
            headers: {}
        };
        this.show = false;
        this.sdata = {};
    };
    componentDidMount() {
        this.setState({ value: '0' });
        this.search();
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
        const columns = [{
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
            // dataIndex: 'isRefund',
            key: 'isRefund',
            render: (text, record) => (
                <div>
                    <span className={record.isRefund == 0 ? "" : "none"}>未退款</span>
                    <span className={record.isRefund == 1 ? "" : "none"}>已退款</span>
                </div>
            )
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
            key: 'createTime'
        }, {
            title: '创建人',
            dataIndex: 'createBy',
            key: 'createBy'
        }, {
            title: '修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime'
        }, {
            title: '修改人',
            dataIndex: 'updateBy',
            key: 'updateBy'
        }];
        const dcolumns = [{
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
            key: 'createTime'
        }, {
            title: '创建人',
            dataIndex: 'createBy',
            key: 'createBy'
        }, {
            title: '修改时间',
            dataIndex: 'updateTime',
            key: 'updateTime'
        }, {
            title: '修改人',
            dataIndex: 'updateBy',
            key: 'updateBy'
        }];
        const pagination = {
            total: this.state.total,
            current: this.state.current,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
                this.setState({ current: page });
                this.search(page);
            }
        };

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
                {/* <div className={styles.action_infos}>
                    <Icon type="info-circle" className="fz15 t_2icon" />
                    已选择<span className="nums" id="nums">0</span>项
                </div> */}
                <Table scroll={{ x: 2600 }} loading={this.state.loading} rowKey="returnOrderId" pagination={pagination} columns={columns} dataSource={this.state.data} />
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
            </div>
        )
    }
    openNotification(type, desc) {
        notification[type]({
            message: '提示信息',
            description: desc
        })
    };
    handleReset = () => {
        this.props.form.resetFields();
    }
    searchBtn() {
        this.show = true;
        this.setState({ current: 1 });
        this.search();
    }
    search(page = 1) {
        this.props.form.validateFields((err, values) => {
            let StrTime = "", EndTime = "";
            if (values.Time.length > 0) {
                StrTime = values.Time[0].format('YYYY-MM-DD HH:mm:ss');
                EndTime = values.Time[1].format('YYYY-MM-DD HH:mm:ss');
            }
            request(`${domain}pcsd-newretail-transaction-returnorder/NewRetailReOrder/getReOrderInfo?ShopId=` + values.ShopId + `&ReturnOrderNo=` + values.ReturnOrderNo + `&CustomerName=` + values.CustomerName + `&StrTime=` + StrTime + `&EndTime=` + EndTime, {
                method: 'GET',
            }).then((res) => {
                this.setState({ loading: false });
                if (res.data.code == 200) {
                    this.setState({ data: res.data.data, total: res.data.totalCount });
                }
            });
        })
    };
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
    detailCancel() {
        this.setState({ dvisible: false });
    }

    OSource = (type) => {
        let name;
        switch (type) {
            case '14':
                name = '惠商'; break;
            case '20':
                name = '新零售'; break;
        }
        return name;
    }
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
    }
    yesno = (type) => {
        let name;
        switch (type) {
            case 0:
                name = '否'; break;
            case 1:
                name = '是'; break;
        }
        return name;
    }
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
const ReturnSearch = Form.create()(formWrapper);
export default ReturnSearch;

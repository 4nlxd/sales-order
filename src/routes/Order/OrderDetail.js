import React from 'react';
import {Row, Col, Table, notification, Form, Modal, Input} from 'antd';
import styles from './SalesOrder.css';
import request from '../../utils/request';
import moment from 'moment';
import { domain } from '../../models/config';
import base from '../../models/base';
import cartService from '../../services/cartService';

const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14},
};

class OrderDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            loading: false,
            //editSnModal: false,
            editItem: {},
            shopId: ''
        };
    }

    componentDidMount() {
        const { params } = this.props;
        let that = this;

        cartService.getFaInfo().then((res)=>{
            let code = [];

            if(res.data.code == 200){
                let data = res.data.data[0].permission;

                for(let i=0; i<data.length; i++){
                    code.push(data[i].value);
                }
            }

            that.setState({ shopId: code.join(',') });
        });

        that.getDetail(params.id);
    }

    openNotification = (type, desc) => {
        notification[type]({
            message: '提示信息',
            description: desc
        })
    };

    getDetail = (id) => {
        this.setState({loading: true});

        request(`${domain}pcsd-ordercenter-salesorder/orderInfo/getOrderDetail?outSalesOrderNo=${id}&shopId=${this.state.shopId}&orderSource=20`,{
                method: 'GET',
            }
        ).then((res)=>{
            this.setState({loading: false});
            if(res.data.code == '200'){
                this.setState({data: res.data.data});
            }else{
                this.openNotification('error', '查询订单详情失败，请稍后重试！');
            }
        });
    };

    /*editSn = (record) => {
        this.setState({editSnModal: true, editItem: record});
        console.log(record);
    };

    doEditSn = () => {
        this.setState({loading: true});
        const { params } = this.props;

        this.props.form.validateFields(['sncode'], (err, values) => {
            if (!err) {
                let item = this.state.editItem,
                    that=this,
                    body = {
                        "orderNo": params.id,
                        "prdCode": item.productCode,
                        "barCode": values.sncode
                    };

                request(`${domain}pcsd-ordercenter-salesorder/orderInfo/modifyOrderBarCode`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json;uat-8'},
                    body: JSON.stringify(body),
                }).then((res) => {
                    that.setState({ loading: false, editSnModal: false });

                    if(res.data.code == 200){
                        that.openNotification('success', '修改成功!');
                        that.getDetail(params.id);
                    }else{
                        that.openNotification('error', '修改失败，请稍后重试!');
                    }
                });
            }
        });
    };*/

    cancelEditSn = () => {
        this.setState({editSnModal: false});
    };

    render() {
        const {getFieldDecorator} = this.props.form;

        const columns = [
            {
                title: '序号',
                dataIndex: '',
                render: (text, record, index) => <span>{ index + 1 }</span>
            },
            {
                title: '订单商品详情Id',
                dataIndex: 'outSalesOrderDetailId',
            },
            {
                title: '订单来源',
                dataIndex: 'orderSource',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case '20':
                            type='新零售';
                            break;
                        case '14':
                            type='惠商';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '订单Id',
                dataIndex: 'outSalesOrderId',
            },
            {
                title: '订单编号',
                dataIndex: 'outSalesOrderNo',
            },
            {
                title: '商品名称',
                dataIndex: 'productName',
            },
            {
                title: '商品编码',
                dataIndex: 'productCode',
            },
            {
                title: '商品品类',
                dataIndex: 'productType',
            },
            {
                title: '产品组',
                dataIndex: 'productGroupNo',
            },
            {
                title: '商品单位',
                dataIndex: 'productUnit',
            },
            {
                title: '是否实物',
                dataIndex: 'isPhysical',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 0:
                            type='否';
                            break;
                        case 1:
                            type='是';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '是否服务',
                dataIndex: 'isSerivce',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 0:
                            type='否';
                            break;
                        case 1:
                            type='是';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '商品税率',
                dataIndex: 'taxRate',
            },
            {
                title: '是否SN管控',
                dataIndex: 'isSnControl',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 0:
                            type='否';
                            break;
                        case 1:
                            type='是';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '商品地板价',
                dataIndex: 'floorPrice',
            },
            {
                title: '原定销售价格',
                dataIndex: 'originalPrice',
            },
            {
                title: '销售价格',
                dataIndex: 'price',
            },
            {
                title: '商品数量',
                dataIndex: 'quantity',
            },
            {
                title: '商品小计',
                dataIndex: 'itemTotalPrice',
            },
            {
                title: '是否赠品',
                dataIndex: 'isGift',
                render: (text, record) => {
                    let type = '';

                    if(text == 1 && record.promotionType == 2){
                        type = '是';
                    }else{
                        type = '否';
                    }

                    return type;
                }
            },
            {
                title: '赠品绑定Id',
                dataIndex: 'giftGroupId',
            },
            {
                title: '促销编号',
                dataIndex: 'promotionCode',
            },
            {
                title: '促销名称',
                dataIndex: 'promotionName',
            },
            {
                title: '店铺优惠',
                dataIndex: 'shopDiscount',
            },
            {
                title: '赠品带来的折扣',
                dataIndex: 'giftDiscount',
            },
            {
                title: '平台优惠',
                dataIndex: 'platFormDiscount',
            },
            {
                title: '买家使用的积分金额',
                dataIndex: 'pointDiscount',
            },
            {
                title: '代金券折扣',
                dataIndex: 'couponDiscount',
            },
            {
                title: '仓库代码',
                dataIndex: 'warehouseCode',
            },
            {
                title: '商品唯一码',
                dataIndex: 'barCode',
                width: 200
            },
            {
                title: '采购成本',
                dataIndex: 'purchaseCost',
            },
            {
                title: '含税成本',
                dataIndex: 'purchaseTotalCost',
            },
            {
                title: '含税毛利',
                dataIndex: 'grossProfit',
            },
            {
                title: '发货类型',
                dataIndex: 'deliveryType',
                render: (text) => {
                    let type = '';

                    switch (text){
                        case 1:
                            type='店面自提';
                            break;
                        case 2:
                            type='物流配送';
                            break;
                    }

                    return type;
                }
            },
            {
                title: '发货时间',
                dataIndex: 'deliveryTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '快递类型',
                dataIndex: 'expressType',
            },
            {
                title: '快递单号',
                dataIndex: 'expressCode',
            },
            {
                title: '关联退换货商品明细Id',
                dataIndex: 'reOrderDetailId',
            },
            {
                title: '退货数量',
                dataIndex: 'reQuantity',
            },
            {
                title: '退货SN',
                dataIndex: 'reSn',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '创建人',
                dataIndex: 'createBy',
            },
            {
                title: '修改时间',
                dataIndex: 'updateTime',
                render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
            },
            {
                title: '修改人',
                dataIndex: 'updateBy',
            },
            /*{
                title: '操作',
                fixed: 'right',
                dataIndex: 'outSalesOrderDetailId',
                render: (text, record) => {
                    return (
                        <a onClick={this.editSn.bind(null, record)}>修改SN</a>
                    );
                }
            },*/
        ];

        return (
            <div className={styles.normal}>
                <Row className={styles.headerInfo}>
                    <Col span={24}><h6 className={styles.headerTitile}>订单信息</h6></Col>
                    <Col span={8} className={styles.headerInfoItem}><span>销售订单号：</span>{ this.state.data.outSalesOrderNo }</Col>
                    <Col span={8} className={styles.headerInfoItem}><span>会员卡号：</span>{ this.state.data.customerId }</Col>
                    <Col span={8} className={styles.headerInfoItem}><span>订单金额：</span>{ parseFloat(this.state.data.totalPrice).toFixed(2) }</Col>
                    <Col span={8} className={styles.headerInfoItem}><span>订单时间：</span>{ moment(this.state.data.createTime).format('YYYY-MM-DD HH:mm:ss') }</Col>
                    <Col span={8} className={styles.headerInfoItem}><span>状态：</span>{ base.transformOrderstatus(this.state.data.orderStatus, this.state.data.orderFlowState) }</Col>
                </Row>
                <div className={styles.detail}>
                    <Table
                        bordered
                        columns={columns}
                        dataSource={this.state.data.items}
                        rowKey={record => record.outSalesOrderDetailId}
                        pagination={false}
                        loading={this.state.loading}
                        scroll={{ x: 4500 }}
                    />
                </div>

                {/*<Modal
                    title="修改SN"
                    visible={this.state.editSnModal}
                    onOk={this.doEditSn}
                    onCancel={this.cancelEditSn}
                >
                    <Form>
                        <FormItem {...formItemLayout} label="SN">
                            {getFieldDecorator('sncode', {
                                rules: [{ required: true, message: 'SN码不能为空!' }],
                            })(<Input />)}
                        </FormItem>
                    </Form>
                </Modal>*/}
            </div>
        );
    }
}

export default Form.create()(OrderDetail);

import React from 'react';
import { Form, notification, Row, Modal, Col, Input, Button, Icon, DatePicker, TimePicker, Table } from 'antd';
import { Link } from 'dva/router';
import styles from './SalesOrder.css';
import request from '../../utils/request';
import moment from 'moment';
import { domain } from '../../models/config';
import cartService from '../../services/cartService';

const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;
const RangePicker = DatePicker.RangePicker;
const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 14 },
};

const pageSize = 10;

let appkey, clientID, clientSecret, upload, token;
if(/(?:uat|dev)\./.test(document.domain)) {
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

class Report extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			total: 0,
			page: 1,
			values: {},
			loading: false,
			visible: false,
			configm: true,
			data: [],
			report: [],
			shopId: ''
		}

	}
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

    }
	transformStatus = (text, record) => {
		if(record.orderStatus == 110) {
			if(text == '1200') {
				return(<span className={styles.pointOragin}>待支付</span>);
			} else if(text == '1300') {
				return(<span className={styles.pointOragin}>支付完毕</span>);
			} else if(text == '1400') {
				return(<span className={styles.pointBlue}> 出小票</span>);
			} else if(text == '1500') {
				return(<span className={styles.pointBlue}>结单</span>);
			}
		} else if(record.orderStatus == 120) {
			return(<span className={styles.pointGray}>已冻结</span>);
		} else if(record.orderStatus == 130) {
			return(<span className={styles.pointGray}>已取消</span>);
		} else if(record.orderStatus == 140) {
			return(<span className={styles.pointGray}>已退货</span>);
		}
	};
	handleSearch = (e) => {
		e.preventDefault();
		let that = this;
		this.props.form.validateFields((err, values) => {
			if(!err) {
				that.setState({ values: values }, function() {
					that.search();
				})
			}
		});
	};
	showModal = () => {
		if(this.state.data.length!= 0) {
			console.log(this.state.data)
			this.setState({visible: true });
			this.report();
		}else {
			this.openNotification('error', '暂无数据');
		}

	};
	report = () => {
		let shopName = this.state.data[0].shopName;
		let platformId = this.state.data[0].platformId;
		let shopId = this.state.data[0].shopId;
		let orderSource = "20";
		let startTime = this.time() + " 00:00:00";
		let endTime = this.time() + " 23:59:59";
		request(`${domain}pcsd-ordercenter-salesorder/orderInfo/DailySummary?OrderSource=20&PlatformId=${platformId}&ShopId=${shopId}&ShopName=${shopName}&startTime=${startTime}&endTime=${endTime}`, {
			method: 'GET',
		}).then((res) => {
			if(res.data.code == 200) {
				let arr = [];
				if(res.data.data){
					arr.push(res.data.data)
				}
				if(arr.length!=0){
					this.setState({ report: arr });
				}
				
				this.openNotification('success',res.data.message);
			} else {
			   this.openNotification('error',"暂无数据");
			}
		})
	};
	reportHandler = () => {
		this.setState({ loading: true });
		let closingDate = this.time();
		request(`${domain}pcsd-ordercenter-salesorder/orderInfo/ConfirmDaily?OrderSource=20&ShopId=${this.state.shopId}&ClosingDate=${closingDate}`, {
			method: 'GET',
		}).then((res) => {
			if(res.data.code == 200) {
				this.setState({ loading: false });
				this.openNotification('success', res.data.message);
			}
		})
	};
	handleOk = () => {
		this.setState({ configm: false });
		if(this.state.report.length != 0) {
			this.fineReport();
		}
	};
	fineReport = () => {
		
		try {
			LODOP = getLodop();
			LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
			//LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
			LODOP.SET_PRINT_STYLE("FontSize", 10);
			LODOP.SET_PRINT_PAGESIZE(3, '48mm', 40, "");
			LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900, document.getElementById("printReportModal").innerHTML);
			LODOP.SET_PRINTER_INDEX(-1);
			//LODOP.PREVIEW();
			LODOP.PRINT();
		} catch(e) {
			console.log(e);
		}
	};
	handleCancel = () => {
		this.setState({
			visible: false,
		});
	};
	handleReset = () => {
		this.props.form.resetFields();
	}
	openNotification = (type, desc) => {
		notification[type]({
			message: '提示信息',
			description: desc
		})
	};
	time = () => {
		let data = new Date();
		let year = data.getFullYear();
		let month = data.getMonth() + 1;
		let day = data.getDate();
		month = month > 10 ? month : "0" + month;
		return year + "-" + month + "-" + day

	};
	search = (page = 1) => {
		let startTime = this.time() + " 00:00:00";
		let endTime = this.time() + " 23:59:59";
		this.setState({ page, loading: true });
		const rangeTimeValue1 = this.state.values['startTime'];
		const rangeTimeValue2 = this.state.values['endTime'];
		let storeID = this.state.values['storeID'];
		let shopId = this.state.shopId;
		let shopName="";
		if(storeID) {
			shopName =storeID ;
		}
		if(rangeTimeValue1) {
			startTime = rangeTimeValue1.format('YYYY-MM-DD HH:mm:ss');
		};
		if(rangeTimeValue2) {
			endTime = rangeTimeValue2.format('YYYY-MM-DD HH:mm:ss');
		};
		request(`${domain}pcsd-ordercenter-salesorder/orderInfo/DailyOrderInfo?currentPage=${page}&pageSize=${pageSize}&shopId=${shopId}&shopName=${shopName}&orderSource=20&startTime=${startTime}&endTime=${endTime}`, {
			method: 'GET',
		}).then((res) => {
			this.setState({ loading: false });
			if(res.data.code == 200) {
				this.setState({ data: res.data.data, total: parseInt(res.data.total) });
			} else {
				this.openNotification('error', '查询失败，请稍后重试!');
			}
		});
	};

	render() {
		const columns = [{
				title: '订单号',
				dataIndex: 'outSalesOrderNo',
				key: 'OutSalesOrderNo',
			},
			{
				title: '用户名称',
				dataIndex: 'CustomerName',
				key: 'CustomerName',

			},
			{
				title: '支付时间',
				dataIndex: 'payTime',
				render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
			},
			{
				title: '订单状态',
				dataIndex: 'orderFlowState',
				key: 'orderFlowState',
				render: (text, record) => this.transformStatus(text, record),
			},
			{
				title: '原价',
				dataIndex: 'originalTotalPrice',
			},
			{
				title: '实际支付金额',
				dataIndex: 'payment',
			}
		];
		const { getFieldDecorator } = this.props.form;
		const config = {
			rules: [{ type: 'object', message: 'Please select time!' }],
		};
		const pagination = {
			total: this.state.total,
			pageSize,
			current: this.state.page,
			onChange: (page, pageSize) => {
				this.search(page);
			}
		};

		const { configm, visible, confirmLoading, ModalText } = this.state;
		let printinform1 = "";
		let printinform2 = "";
		let defultTime1=this.time();
		let defultTime2=this.time()+"24:00:00.000";
		if(this.state.report.length != 0 && this.state.report[0]) {
			console.log(this.state.report)
			printinform1=this.state.report.map((item, key) => {
				return(
					<div key={key} style={{fontSize:"16px",paddingLeft:"80px",paddingRight:"80px"}}>
		                     <h4  style={{borderBottom:"2px",textAlign:"center",borderBottomColor:"#989898",borderBottomStyle:"dashed",lineHeight:"50px",fontSize:"18px",fontWeight:"bold",}}>{item.shopName}</h4>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",height:"80px",lineHeight:"30px",paddingTop:"10px"}}>
		                          <p><span>销售日期:</span> <span>{moment(item.createTime).format('YYYY-MM-DD')}</span></p>
		                          <p><span>打印日期:</span> <span>{moment(item.printTime).format('YYYY-MM-DD')}</span></p>
		                      </div>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",height:"150px"}}>
		                         <table style={{width:"100%",lineHeight:"35px",textAlign:"center"}}>
		                            <tbody>
			                            <tr>
			                               <th>项目</th>
			                               <th>数额</th>
			                            </tr>
			                            <tr>
			                              <td>原价合计</td>
			                              <td>{item.originalTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>优惠金额</td>
			                              <td>{item.discountTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>实收金额</td>
			                              <td>{item.paymentTotalAmount}</td>
			                            </tr>
		                            </tbody>
		                         </table>
		                      </div>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed"}}>
		                         <h3 style={{lineHeight:"30px",textAlign:"center"}}>支付方式</h3>
		                         <table style={{width:"100%",lineHeight:"30px"}}>
		                           <tbody>
			                            <tr>
			                              <td>微信二维码</td>
			                              <td>{item.wechatQrPaymentTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>数字王府井</td>
			                              <td>{item.unionpayPaymentTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>商场代收银</td>
			                              <td>{item.cashPaymentTotalAmount}</td>
			                            </tr>
			                          </tbody>
		                         </table>
		                      </div>
		                      <div style={{lineHeight:"40px"}}>
		                         <p>收银员签字:</p>
		                         <p>店长签字:</p>
		                      </div>
		                  </div>
				)
			})
			printinform2 = this.state.report.map((item, key) => {
				return(
					<div key={key} style={{fontSize:"12px",width:"230px"}}>
		                     <h4  style={{borderBottom:"2px",fontSize:"12px",borderBottomColor:"#989898",borderBottomStyle:"dashed",fontWeight:"bold",}}>{item.shopName}</h4>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",height:"80px",lineHeight:"30px",paddingTop:"10px"}}>
		                          <p><span>销售日期:</span> <span>{moment(item.createTime).format('YYYY-MM-DD')}</span></p>
		                          <p><span>打印日期:</span> <span>{moment(item.printTime).format('YYYY-MM-DD')}</span></p>
		                      </div>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",height:"150px"}}>
		                         <table style={{width:"70%",lineHeight:"35px"}}>
		                            <tbody>
			                            <tr>
			                               <th>项目</th>
			                               <th>数额</th>
			                            </tr>
			                            <tr>
			                              <td>原价合计</td>
			                              <td>{item.originalTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>优惠金额</td>
			                              <td>{item.discountTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>实收金额</td>
			                              <td>{item.paymentTotalAmount}</td>
			                            </tr>
		                            </tbody>
		                         </table>
		                      </div>
		                      <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",height:"180px"}}>
		                         <h3 style={{width:"60%", textAlign:"center",lineHeight:"30px"}}>支付方式</h3>
		                         <table style={{width:"80%",lineHeight:"30px"}}>
		                           <tbody>
			                            <tr>
			                              <td>微信二维码</td>
			                              <td>{item.wechatQrPaymentTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>数字王府井</td>
			                              <td>{item.unionpayPaymentTotalAmount}</td>
			                            </tr>
			                            <tr>
			                              <td>商场代收银</td>
			                              <td>{item.cashPaymentTotalAmount}</td>
			                            </tr>
			                          </tbody>
		                         </table>
		                      </div>
		                      <div style={{lineHeight:"40px"}}>
		                         <p>收银员签字:</p>
		                         <p>店长签字:</p>
		                      </div>
		                  </div>
				)
			})
		}
		return(
			<div style={{marginTop:"0"}}>
					<Form
				        className={styles.form}
				        onSubmit={this.handleSearch}
				        style={{background:"#fbfbfb",paddingTop:"25px"}}
		            >
			        <Row gutter={8}>
			          <Col span={8}>
				        <FormItem {...formItemLayout} label="店铺名称">
			                { getFieldDecorator('store',{
			                	initialValue: loginInfo.shopName
			                })(<Input disabled={true} />) }
	                    </FormItem>
	                    </Col>
	                     <Col span={8} >
			                <FormItem
		                        {...formItemLayout}
		                        label="开始时间"
		                        >
		                      {getFieldDecorator('startTime',{initialValue:moment(defultTime1, 'YYYY-MM-DD HH:mm:ss')},config)(
		                      <DatePicker   style={{width:"100%"}} showTime format="YYYY-MM-DD HH:mm:ss" />
		                     )}
		                   </FormItem>
	                    </Col>
			            <Col span={8} >
			                <FormItem
		                        {...formItemLayout}
		                        label="结束时间"
		                        >
		                      {getFieldDecorator('endTime', {initialValue:moment(defultTime1+"T23:59:59", 'YYYY-MM-DD HH:mm:ss')},config)(
		                      <DatePicker  style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />
		                     )}
		                   </FormItem>
	                    </Col>
			        </Row>
			        <Row>
			           <Col span={8}>
				        <FormItem {...formItemLayout} label="店铺ID">
			                { getFieldDecorator('storeID',{
			                	
			                })(<Input placeholder="请输入店铺ID"/>) }
	                    </FormItem>
	                    </Col>
			        </Row>
			        <Row>
			          <Col span={3} offset={20} style={{marginBottom:"20px",marginRight:"10px"}}>
			            <Button type="primary" htmlType="submit">搜索</Button>
			            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>重置</Button>
			          </Col>
			        </Row>
	            </Form>
	            <div>
                    <Button type="primary" className={styles.printer} onClick={this.showModal}>报表预览</Button>
                    <Button type="primary" disabled={configm} className={styles.printer} onClick={this.reportHandler}>确认</Button>
                </div>
			    <Table style={{ marginTop:30, overflowX:"visible"}} 
			      	loading={this.state.loading}
			   		columns={columns} 
			       	dataSource={this.state.data}
			       	rowKey={record =>record.outSalesOrderNo}
			       	pagination={ pagination }
			    >
			    </Table>
			   <Modal title="报表预览"
		          visible={visible}
		          onOk={this.handleOk}
		          confirmLoading={confirmLoading}
		          onCancel={this.handleCancel}
		          okText="打印"
		          cancelText="关闭"
		          style={{top:"0"}}
		        >
			      <div id="printReportModal">
                    {printinform1}
                  </div>
                </Modal>
                <div id="printReportModal" style={{display:"none"}}>
                    {printinform2}
                  </div>
	        </div>
		)
	}
}
export default Form.create()(Report);
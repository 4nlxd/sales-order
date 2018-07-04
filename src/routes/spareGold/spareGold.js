import React from 'react';
import { Form, notification, Row, Select,Modal, Col, Input, Button, Icon, DatePicker, TimePicker, Table, message } from 'antd';
import { Link } from 'dva/router';
import styles from './SalesOrder.css';
import request from '../../utils/request';
import moment from 'moment';
import { domain } from '../../models/config';
const FormItem = Form.Item;
const Option = Select.Option;
const pageSize = 10;
const formItemLayout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 14 },
};
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
class spareGold extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			total: 0,
			page: 1,
			values: {},
			values1:[],
			loading: false,
			visible: false,
			visible1: false,
			visible2: false,
			dataId:"",
			title1:"",
			gold:"",
			gold1:0,
			btn:false,
			title2:"",
			title3:"",
			title4:"",
			data: [],
			collectData:[],
			style1:"",
			shopName:"",
			shopId:"",			
			save:[]
		}

	};
	transformStatus = (text, record) => {
		if(record.operation==1){
			return(<span className={styles.pointOragin}>备用金存入</span>);
		}else if(record.operation==2){
			return(<span className={styles.pointOragin}>备用金取出</span>);
		}else if(record.operation==3){
			return(<span className={styles.pointOragin}>实付</span>);
		}else if(record.operation==4){
			return(<span className={styles.pointOragin}>找零</span>);
		}
	};
	handleSearch = () => {
		let that = this;
		this.props.form.validateFields((err, values) => {
			if(!err) {
				that.setState({ values: values },function(){
					if(this.state.dataId==1){
						this.storeGold();
						this.saveDetaile();
					}else if(this.state.dataId==2){
						this.drawGold();
					}
					
				})
			}
		});
	};
	storeGold=()=>{
	this.setState({visible1: true ,visible: false});
	let password=this.state.values.password;
	let shopId=this.state.shopId;
	let shopName=this.state.shopName;
	let imprestFundAmount=this.state.values.imprestFundAmount;
	let operatorName=this.state.values.operatorName;
	let properties={"imprestFundAmount":imprestFundAmount, "orderSource":20,"shopName":shopName,"shopId":shopId,"operatorNo":operatorName,"password":password,"platformId":20}
	let storeData=JSON.stringify(properties);
	 request(`${domain}pcsd-ordercenter-salesorder/fund/save?`, {
			method:'POST',
			headers: {
                    'Content-Type': 'application/json',
                },
			body:storeData
		}).then((res) => {
			if(res.data.code == 200) {
				this.setState({visible1: true });
				 message.success("备用金已成功存入", 2);
				 this.saveDetaile();
				 this.search();
			} else {
				message.error(res.data.message, 2);
			}
		});
	}
	
	drawGold=()=>{
	let shopId=this.state.shopId;
	let shopName=this.state.shopName;
	let password=this.state.values.password;
	let imprestFundAmount=this.state.values.imprestFundAmount;
	let operatorName=this.state.values.operatorName;
	let properties={"imprestFundAmount":imprestFundAmount, "orderSource":20,"shopName":shopName,"shopId":shopId,"operatorNo":operatorName,"password":password,"platformId":20}
	let drawData=JSON.stringify(properties);
	let imprestFundAmount1="";
	if(this.state.gold!="" || this.state.gold==0){
		this.setState({visible1: false ,visible:true });
	    imprestFundAmount1=this.state.gold;
	}
	if(imprestFundAmount>imprestFundAmount1){
		message.error("备用金取出金额不能大于存入金额", 3);
		return;
	}else{
	this.setState({visible: false});
	 request(`${domain}pcsd-ordercenter-salesorder/fund/draw?`, {
			method:'POST',
			headers: {
                    'Content-Type': 'application/json',
                },
			body:drawData
		}).then((res) => {
			if(res.data.code == 200) {
			  message.success("备用金已成功取出", 2);
			  	 this.drawDetaile();
			     this.search();
			} else {
				message.error(res.data.message, 2);
				this.drawDetaile();
				
			}
		});
	  }
	}
	saveDetaile=()=>{
		let shopId=this.state.shopId;
		request(`${domain}pcsd-ordercenter-salesorder/fund/receipt/save?shopId=${shopId}&orderSource=20`, {
			method: 'GET',
		}).then((res) => {
			if(res.data.code == 200) {
				if(this.state.dataId==2){
					this.setState({visible:true})
				}
				
				let arr=[];
				if(res.data.data){
					arr.push(res.data.data)
				}
				if(arr.length!=0){
					let gold=arr[0].imprestFundAmount;
					this.setState({save: arr,gold},function(){
						 this.drawDetaile1();
					});
					
				}
			} else if(res.data.code==0 && this.state.dataId==2){
				message.error("尚未存入备用金", 2);
			}else if(res.data.code != 0){
				message.error(res.data.message, 2);
			}
		});
	};
	drawDetaile1=()=>{
		let  shopId=this.state.shopId;
		request(`${domain}pcsd-ordercenter-salesorder/fund/receipt/draw?shopId=${shopId}&orderSource=20`, {
			method: 'GET',
		}).then((res) => {
			if(res.data.code == 200) {
				let gold1="";
				let gold="";
				if(res.data.data){
					gold1=res.data.data.imprestFundAmount;
				}
				gold=this.state.gold-gold1;
				this.setState({gold});
			} 
		});
	}
	drawDetaile=()=>{
		let  shopId=this.state.shopId;
		request(`${domain}pcsd-ordercenter-salesorder/fund/receipt/draw?shopId=${shopId}&orderSource=20`, {
			method: 'GET',
		}).then((res) => {
			if(res.data.code == 200) {
				this.setState({visible1: true});
				
				let arr = [];
				if(res.data.data){
					arr.push(res.data.data)
				}
				if(arr.length!=0){
					this.setState({save: arr,});
				}
			} else {
				
				message.error(res.data.message, 2);
			}
		});
	}
	shopName=()=>{
		let token=loginInfo.token;
		let appKey=loginInfo.appKey;
		let dataIds="5f478c76af4e6d12";
        request(`${domain}pcsd-newretail-ac/newretail-acl/application/dataPermission?token=${token}&appKey=${appKey}&dataIds=${dataIds}`, {
			method: 'GET',
		}).then((res) => {
			this.setState({ loading: false });
			if(res.data.code == 200) {
				if(res.data.data[0].permission.length<=1){
					 this.setState({shopName:res.data.data[0].permission[0].label})
		             this.setState({shopId:res.data.data[0].permission[0].value},function(){
		             	this.search();
		             })
				}else{
					let data=res.data.data[0].permission;
					console.log(data)
					let shopName=[],shopId=[];
					for(let i=0;i<data.length;i++){
						shopId.push(data[i].value)
					}
				     let Id=shopId.join(",");
		             this.setState({shopId:Id,btn:true},function(){
		             	this.search();
		             });
				}
		     
			} else {
				message.error(res.data.msg, 5); 
			}
		});
	}
	handleSubmit = (e) => {
		e.preventDefault();
		let that = this;
		this.props.form.validateFields(["startTime","endTime"],(err, values) => {
				that.setState({ values1:values }, function() {
					that.search();	
				})
		});
	};
	collect=()=>{
		this.setState({loading: true});
		let rangeTimeValue1="",rangeTimeValue2="";
		this.props.form.validateFields(["startTime","endTime"],(err, values) => {
			 rangeTimeValue1 =values['startTime'];
		     rangeTimeValue2 =values['endTime'];
		});
		let startTime = this.time() + " 00:00:00";
		let endTime = this.time() + " 23:59:59";
		let  shopId=this.state.shopId;
		if(rangeTimeValue1) {
			startTime = rangeTimeValue1.format('YYYY-MM-DD HH:mm:ss');
		};
		if(rangeTimeValue2) {
			endTime = rangeTimeValue2.format('YYYY-MM-DD HH:mm:ss');
		};
	   request(`${domain}pcsd-ordercenter-salesorder/orderInfo/FundSum?ShopId=${shopId}&startTime=${startTime}&endTime=${endTime}`, {
			method: 'GET',
		}).then((res) => {
			this.setState({ loading: false });
			if(res.data.code == 200) {
				this.setState({visible2:true});
				let arr = [];
				if(res.data.data){
					arr.push(res.data.data)
				}
				if(arr.length!=0){
					this.setState({collectData:arr});
				}
				
			} else {
				message.error(res.data.message, 5);
			}
		});
	}
	search=(page=1)=>{
		let startTime = this.time() + " 00:00:00";
		let endTime = this.time() + " 23:59:59";
		const rangeTimeValue1 = this.state.values1['startTime'];
		const rangeTimeValue2 = this.state.values1['endTime'];
		this.setState({page,loading: true});
		let  shopId=this.state.shopId;
		if(rangeTimeValue1) {
			startTime = rangeTimeValue1.format('YYYY-MM-DD HH:mm:ss');
		};
		if(rangeTimeValue2) {
			endTime = rangeTimeValue2.format('YYYY-MM-DD HH:mm:ss');
		};
		request(`${domain}pcsd-ordercenter-salesorder/fund/list?currentPage=${page}&pageSize=${pageSize}&shopId=${shopId}&orderSource=20&startTime=${startTime}&endTime=${endTime}`, {
			method: 'GET',
		}).then((res) => {
			this.setState({ loading: false });
			if(res.data.code == 200) {
				this.setState({ data: res.data.data, total: parseInt(res.data.total) });
			} else {
				message.error(res.data.message, 5);
			}
		});
	}
	fineReport = (print) => {
		try {
			LODOP = getLodop();
			LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
			//LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
			LODOP.SET_PRINT_STYLE("FontSize", 10);
			LODOP.SET_PRINT_PAGESIZE(3, '48mm', 40, "");
			LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900, print.innerHTML);
			LODOP.SET_PRINTER_INDEX(-1);
			//LODOP.PREVIEW();
			LODOP.PRINT();
		} catch(e) {
			console.log(e);
		}
	};
	componentDidMount() {
		this.shopName();
	}
	showModal = (e) => {
		if(e.target.getAttribute("data-id")==1){
			this.setState({visible:true,dataId:"1"});
			this.setState({title1:"备用金存入",title2:"备用金存入预览",title3:"存入备用金",title4:"存入金额",style1:"none"})
		}else if(e.target.getAttribute("data-id")==2){
			this.setState({title1:"备用金取出",title2:"备用金取出预览",title3:"取出备用金",title4:"取出金额",style1:"block"})
		    this.setState({dataId:"2"})
		    this.saveDetaile();
		    
		}
	};
	showModal1 = () => {
			this.collect();
	};
	time = () => {
		let data = new Date();
		let year = data.getFullYear();
		let month = data.getMonth() + 1;
		let day = data.getDate();
		month = month > 10 ? month : "0" + month;
		day = day > 10 ? day : "0" + day;
		return year + "-" + month + "-" + day;
	};
	handleOk = () => {
		this.handleSearch();
		this.handleReset();
	};
	handleCancel = () => {
		this.setState({
			visible: false,
		});
		this.handleReset();
	};
	handleOk1 = () => {
		this.setState({visible1: false });
		if(this.state.save.length != 0) {
		var printGold=document.getElementById("printGold")
			this.fineReport(printGold);
		}
	};
	handleCancel1 = () => {
		this.setState({
			visible1: false,
		});
	};
	handleOk2 = () => {
		if(this.state.collectData.length != 0) {
		    var printCollect=document.getElementById("printCollect")
			this.fineReport(printCollect);
		}
	};
	handleCancel2 = () => {
		this.setState({
			visible2: false,
		});
	};
	handleReset = () => {
		this.props.form.resetFields();
	};
	time = () => {
		let data = new Date();
		let year = data.getFullYear();
		let month = data.getMonth() + 1;
		let day = data.getDate();
		month = month > 10 ? month : "0" + month;
		return year + "-" + month + "-" + day

	};
	   render() {
	   	const columns = [
             {
				title: '订单来源',
				dataIndex: 'orderSource',
				key: 'orderSource',

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
				title: '操作日期',
				dataIndex: 'operationDate',
				key: 'operationDate',
				render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss'),

			},
			{
				title: '操作',
				dataIndex: 'operation',
				key: 'operation',
				render: (text, record) => this.transformStatus(text, record),

			},
			{
				title: '备用金金额',
				dataIndex: 'imprestFundAmount',
				key: 'imprestFundAmount',

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
				title: '创建时间',
				dataIndex: 'createTime',
				render: (text) => text && moment(text).format('YYYY-MM-DD HH:mm:ss')
			},
			{
				title: '创建人',
				dataIndex: 'createBy',
				key: 'createBy',
			}
		];
	   	const pagination = {
			total: this.state.total,
			pageSize,
			showQuickJumper:false,
			current: this.state.page,
			onChange: (page, pageSize) => {
				this.search(page);
			}
		};
		let defultTime1=this.time();
		const { getFieldDecorator } = this.props.form;
		const config1 = {
			rules: [{ type: 'object', message: 'Please select time!' }],
		};
		const {style1,title1,btn,title2,title3, title4,visible,visible1,visible2,confirmLoading, ModalText,gold,shopName} = this.state;
	   	let inputgold1="",inputgold2="",inputgold3="",inputgold4="";
	   	if(this.state.save.length!=0){
		   	inputgold1=this.state.save.map((item,key)=>{
		   	   	return(
		   	   		<div key={key} style={{fontSize:"16px",paddingLeft:"80px",paddingRight:"80px"}}>
			   		            <h2 style={{borderBottom:"2px",textAlign:"center",borderBottomColor:"#989898",borderBottomStyle:"dashed",lineHeight:"50px",fontSize:"18px",fontWeight:"bold",}}>{title1}</h2>
			   	                <div style={{borderBottom:"2px",borderBottomColor:"#989898",borderBottomStyle:"dashed",fontSize:"16px",lineHeight:"35px",paddingTop:"5px",paddingBottom:"5px"}}>
			   	                   <p><span>店铺名称: </span><span>{item.shopName}</span></p>
			   	                   <p><span>销售日期: </span><span>{moment(item.operationDate).format('YYYY-MM-DD')}</span></p>
			   	                   <p><span>打印日期: </span><span>{this.time()}</span></p>
			   	                   <p><span>收银员名称: </span><span>{item.operatorNo}</span></p>
			   	                   <p><span>{title3}: </span><span>{item.imprestFundAmount}</span></p>
			   	                </div>
			   	                <div>
			   	                  <p>存入人签字:</p>
			   	                  <p>店长签字:</p>
			   	                </div>
		   	        </div>
		   	   	)
		   	  })
	   	   inputgold2=this.state.save.map((item,key)=>{
	   	   	return(
	   	   		<div key={key}>
		   	                <div style={{borderBottom:"2px",borderBottomColor:"#989898",width:"150px",borderBottomStyle:"dashed",fontSize:"12px",lineHeight:"30px",paddingTop:"5px",paddingBottom:"5px"}}>
		   	                   <p style={{paddingRight:"10px",textAlign: "center"}}><span>{item.shopName}</span></p>
		   	                   <p><span>销售日期: </span><span>{moment(item.operationDate).format('YYYY-MM-DD')}</span></p>
		   	                   <p><span>打印日期: </span><span>{this.time()}</span></p>
		   	                   <p><span>收银员名称: </span><span>{item.operatorNo}</span></p>
		   	                   <p><span>{title3}: </span><span>{item.imprestFundAmount}</span></p>
		   	                </div>
		   	                <div style={{fontSize:"12px",lineHeight:"30px"}}>
		   	                  <p>存入人签字:</p>
		   	                  <p>店长签字:</p>
		   	                </div>
	   	        </div>
	   	   	)
	   	   })
	   	   
	   	}
	   if(this.state.collectData.length!=0){
	   	inputgold3=this.state.collectData.map((item,key)=>{
	   	   	return(
	   	   		<div key={key} style={{fontSize:"16px",paddingLeft:"80px",paddingRight:"80px"}}>
			   		        <h2 style={{borderBottom:"2px",textAlign:"center",borderBottomColor:"#989898",borderBottomStyle:"dashed",lineHeight:"50px",fontSize:"18px",fontWeight:"bold",}}>{shopName}</h2>
			   	            <div style={{fontSize:"16px",lineHeight:"35px",paddingTop:"5px",paddingBottom:"5px",paddingLeft:"20px",}}>
		   	                   <p><span>日期:</span><span className={styles.collect}>{this.time()}</span></p>
		   	                   <p><span>存入:</span><span className={styles.collect}>{item.cr}</span></p>
		   	                   <p><span>取出:</span><span className={styles.collect}>{item.qc}</span></p>
		   	                   <p><span>实付:</span><span className={styles.collect}>{item.sf}</span></p>
		   	                   <p><span>找零:</span><span className={styles.collect}>{item.zl}</span></p>
		   	                </div> 
	   	        </div>
	   	   	)
	   	   })
	   	inputgold4=this.state.collectData.map((item,key)=>{
	   	   	return(	
	   	   		<div key={key} style={{fontSize:"12px",width:"200px"}}>
		   		            <h2 style={{borderBottom:"2px",paddingRight:"10px",paddingLeft:"10px",width:"150px",borderBottomColor:"#989898",borderBottomStyle:"dashed",lineHeight:"30px",fontSize:"12px",fontWeight:"bold",textAlign:"center"}}>{shopName}</h2>
		   	                <div style={{borderBottom:"2px",borderBottomColor:"#989898",width:"200px",borderBottomStyle:"dashed",fontSize:"10px",lineHeight:"30px",paddingTop:"5px",paddingBottom:"5px"}}>
		   	                   <p><span>日期:</span><span>{this.time()}</span></p>
		   	                   <p><span>存入:</span><span>{item.cr}</span></p>
		   	                   <p><span>取出:</span><span>{item.qc}</span></p>
		   	                   <p><span>实付:</span><span>{item.sf}</span></p>
		   	                   <p><span>找零:</span><span>{item.zl}</span></p>
		   	                </div>
		   	                
	   	        </div>
	   	   	)
	   	   })
	   }
	   	return(
	   		<div>
	   		     <Form
				    onSubmit={this.handleSubmit}
		            >
			        <Row gutter={13}>
	                     <Col span={10} >
			                <FormItem
		                        {...formItemLayout}
		                        label="开始时间"
		                        >
		                      {getFieldDecorator('startTime',{initialValue:moment(defultTime1+" 00:00:00", 'YYYY-MM-DD HH:mm:ss'),config1})(
		                      <DatePicker   style={{width:"100%"}} showTime format="YYYY-MM-DD HH:mm:ss" />
		                     )}
		                   </FormItem>
	                    </Col>
			            <Col span={10} >
			                <FormItem
		                        {...formItemLayout}
		                        label="结束时间"
		                        >
		                      {getFieldDecorator('endTime',{initialValue:moment(defultTime1+" 23:59:59", 'YYYY-MM-DD HH:mm:ss'),config1})(
		                      <DatePicker  style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm:ss" />
		                     )}
		                   </FormItem>
	                    </Col>
	                    <Col span={3} >
			                 <Button type="primary" className={styles.printer} htmlType="submit"  data-id="3">搜索</Button>
	                    </Col>
			        </Row>
	            </Form>
	            <div style={{marginLeft:"55px"}}>
		   		   <Button type="primary" data-id="1" className={styles.printer} onClick={this.showModal} disabled={btn}>备用金存入</Button>
	               <Button type="primary" data-id="2" className={styles.printer} onClick={this.showModal} disabled={btn}>备用金取出</Button>
		           <Button type="primary" className={styles.printer}  onClick={this.showModal1} disabled={btn}>汇总</Button>
		        </div>
	   		   <Table style={{ marginTop:30}}
			      	loading={this.state.loading}
			   		columns={columns} 
			   		rowKey="gold"
			       	dataSource={this.state.data}
			       	pagination={pagination}
			    />
	   		    <Modal title={title1}
		          visible={visible}
		          onOk={this.handleOk}
		          onCancel={this.handleCancel}
		          okText="确认"
		          cancelText="关闭"
		          style={{top:"0"}}
		        >   
		            
		        <div>
		            <Form>
			   		        <FormItem style={{display:style1}} {...formItemLayout} label="之前存入的备用金">
					                { getFieldDecorator('store',{
				                	   initialValue: "￥"+gold
				                    })(<Input disabled={true} placeholder="请输入存入的备用金金额"/>) }
			                </FormItem>
			   		        <FormItem {...formItemLayout} label={title4}>
					                { getFieldDecorator('imprestFundAmount', {rules: [{ required: true, message: '请输入存入金额' }]})(<Input type="number" placeholder="请输入存入的备用金金额"/>) }
			                </FormItem>
			                <FormItem {...formItemLayout} label="确认人">
					                  { getFieldDecorator('operatorName',{initialValue:"",rules: [{ required: true, message: '不能为空' }],})(<Input  placeholder="请输入确认人名称"/>) }
			                </FormItem>
			                <FormItem {...formItemLayout} label="密码">
					                { getFieldDecorator('password',{initialValue:"",rules: [{ required: true, message: '不能为空' }],})(<Input type="password" placeholder="请输入密码"/>) }
			                </FormItem> 
		               </Form>
		   	        </div>
	   		    </Modal>
	   		    <Modal title={title2}
		          visible={visible1}
		          onOk={this.handleOk1}
		          onCancel={this.handleCancel1}
		          okText="打印"
		          cancelText="关闭"
		          style={{top:"0"}}
		        >
		   		    {inputgold1}
		   		    
	   		    </Modal>
	   		     <Modal 
	   		      title="备用金统计汇总"
		          visible={visible2}
		          onOk={this.handleOk2}
		          onCancel={this.handleCancel2}
		          okText="打印"
		          cancelText="关闭"
		          style={{top:"0"}}
		        >
		   		    {inputgold3}
		   		    
	   		    </Modal>
	   		    <div id="printGold" style={{display:"none"}}>
                    {inputgold2}
                  </div>
                  <div id="printCollect" style={{display:"none"}}>
                    {inputgold4}
                  </div>
	   		</div>
	   	)
	   }
}
export default Form.create()(spareGold);
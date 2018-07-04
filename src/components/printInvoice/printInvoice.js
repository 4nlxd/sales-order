/**
 * Created by chaoqin on 18/4/16.
 */
import React from 'react';
import {hashHistory} from 'dva/router';
import {Row, Col} from 'antd';
import cartService from '../../services/cartService';
import moment from 'moment';

export default class PrintInvoice extends React.Component{
    constructor(props){
        super(props);
        
        this.data = this.props.data || {};
    }

    renderInvoice = () => {
        let list = [], data = this.data && this.data.items || [];

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

    print = () => {
        console.log(123);
    };

    invoice() {
        try{
            LODOP = getLodop();
            LODOP.PRINT_INIT("打印控件功能演示_Lodop功能_按ID摘取内容输出");
            //LODOP.SET_PRINT_STYLEA(0,"IDTagForPick",strID_Tag);
            LODOP.SET_PRINT_STYLE("FontSize", 10);
            LODOP.SET_PRINT_PAGESIZE(3,'48mm',40,"");
            LODOP.ADD_PRINT_HTM(0, 0, '48mm', 900,document.getElementById("printInvoiceModal").innerHTML);
            LODOP.SET_PRINTER_INDEX(-1);
            //LODOP.PREVIEW();
            LODOP.PRINT();
        }catch(e){
            console.log(e);
        }
    }
    
    render(){
        return (
            <div id="printInvoiceModal" style={{display: "none", width: '48mm'}}>
                <div style={{width: '100%', fontSize: '10px', textAlign: 'center'}}>
                    <h5>{ this.data.companyName }</h5>
                    <h6 style={{marginTop: '10px'}}>{ this.data.address }</h6>
                    <p>电话：{ this.data.telPhone }</p>
                    <p>{ this.data.webSite }</p>
                    <p>购物小票</p>
                </div>
                <table style={{width: '100%', fontSize: '10px', border: 0}}>
                    <tbody>
                    <tr>
                        <td width='50'>单据日期：</td>
                        <td>{ moment(this.data.createTime).format('YYYY-MM-DD HH:mm:ss') }</td>
                    </tr>
                    <tr>
                        <td>单据编号：</td>
                        <td>{ this.data.outSalesOrderNo }</td>
                    </tr>
                    <tr>
                        <td>制单人：</td>
                        <td>{ this.data.createBy }</td>
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
                        <td style={{textAlign:' right'}}>{ this.data.totalQuantity }</td>
                    </tr>
                    <tr>
                        <td>合计金额：</td>
                        <td style={{textAlign:' right'}}>{ this.data.totalPrice }</td>
                    </tr>
                    <tr>
                        <td>优惠合计：</td>
                        <td style={{textAlign:' right'}}>{ this.data.totalDiscount }</td>
                    </tr>
                    <tr>
                        <td>实销金额：</td>
                        <td style={{textAlign:' right'}}>{ this.data.payment }</td>
                    </tr>
                    </tbody>
                </table>
                <table style={{width: '100%', fontSize: '10px', borderTop: '1px dashed #e9e9e9', borderBottom: '1px dashed #e9e9e9'}}>
                    <tbody>
                    <tr>
                        <td colSpan="2">本次收款金额：</td></tr>
                    <tr>
                        <td>{ this.tranformType(this.data.paymentType) }</td>
                        <td style={{textAlign:' right'}}>{ this.data.payment }</td>
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
        )
    }
}


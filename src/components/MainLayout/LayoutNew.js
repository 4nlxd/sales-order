/**
 * Created by liuyc14 on 2017/12/12.
 */
import React from 'react';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import styles from './LayoutNew.css';
import {connect} from 'dva';
import {Link} from 'dva/router';
import apiDomain from '../../constant/ApiDomain';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const HashUrl_indexPage = apiDomain.hashUrl_indexPage;

/**
 * 获取选中的节点的所有父级节点
 */
const getAllParentIds = (sliderID, sliderArray) => {
    let allParentIds = [];

    const loopParent = (menuID) => {
        let currentMenu = null;
        for(let i = 0; i < sliderArray.length; i++){
            if(menuID == sliderArray[i].id){
                currentMenu = sliderArray[i];
                break;
            }
        }
        if(currentMenu){
            allParentIds.unshift(currentMenu);
            loopParent(currentMenu.parentId);
        }
    };
    loopParent(sliderID);
    return allParentIds;
};

/**
 * 查找左侧菜单树中指定的菜单集合
 * @param slider
 * @param lastMenuID
 * @returns {Array}
 */
const getBreadcrumb = (slider, lastMenuID)=>{
    let list = [];
    let isFind = false;

    slider.map((c)=>{
        c.isTop = true;
    });

    const loop = (menu) => {
        if (isFind) return false;
        for(let i = 0; i < menu.length; i++){
            if (isFind) break;
            //如果重新查找了一个顶级菜单，清空掉list
            if(menu[i].isTop){
                list = [];
            }
            if(menu[i].id == lastMenuID){
                //找到了对应的末级了，退出递归
                list.push(menu[i]);
                isFind = true;
                break;
            }
            else if(menu[i].child && menu[i].child.length > 0){
                //还有子集，继续递归
                list.push(menu[i]);
                loop(menu[i].child, lastMenuID);
            }
            else{
                //没有子集了，也没有找到对应的末级，继续循环
            }
        }
    };

    loop(slider);
    return list;
};

const loopSlider = (data) => {
    return data.map((menu)=>{
        if(menu.child && menu.child.length > 0){
            return (
                <SubMenu key={menu.id} title={<span className={styles.subMenuTitle}>{menu.menuName}</span>}>
                    {loopSlider(menu.child)}
                </SubMenu>
            );
        }else{
            return (
                <Menu.Item key={menu.id} route={menu.forwardUrl} forwardUrl={menu.forwardUrl}>{menu.menuName}</Menu.Item>
            );
        }
    });
};

export default class LayoutNew extends React.Component{
    constructor(props){
        super(props);
        this.state = {
             showLoginfo: "none"
        };
    }

    componentDidMount(){
        document.title = '新零售POS系统';
    }

    render(){
        const {slider, sliderChecked, nav, navChecked, curmb, label,
            hideSlider, hideBreadcrumb, hideContentTitle, isSaleOrder} = this.props.layout;
        const logUser = window.loginInfo;

        let mainStyle = { padding: '0 24px 24px', background:'#F2F6F9', height: "100%", overflowY: "auto" };
        let maincontentStyle = { background: '#fff', padding: 20, margin: 0 };
        let a_kaidan = {display:'block', height: '100%', color:'#ffffff'};

        if(isSaleOrder){
            mainStyle = {height: "100%", overflowY: "auto"};
            maincontentStyle = {margin: 0};
            a_kaidan = {display:'block', height: '100%', color: '#57ded6', backgroundColor: '#ffffff'}
        }
        return (
            <Layout id="frontendLayout">
                <Header className="header" style={{height:56, padding:0, backgroundColor: '#ffffff'}}>
                    <div className={styles.logo} onClick={()=>location.href = HashUrl_indexPage}><img src={require('../../assets/logo-200-56.jpg')} className={styles.logoImage}/></div>
                    <div className="nav_menu">
                        <div className={styles.notice}>
                            <span className={`${styles.message}`}><i className="nsfont nsicon-lingdang"></i>消息</span>
                            <span className={`${styles.user}`} onMouseOver={this.loginfoMouseOver.bind(this)} onMouseLeave={this.loginfoMouseLeave.bind(this)}>
                                <i className="nsfont nsicon-denglu"></i>
                                用户名
                                <div id="layoutnew_loginfo" style={{display: this.state.showLoginfo}}>
                                    <ul>
                                        <li>{logUser.loginId}</li>
                                        { logUser.terminal == 'frontend' ? (<li>{logUser.role}</li>) : null }
                                        { logUser.terminal == 'frontend' ? (<li>{logUser.shopName}</li>) : null }
                                        <li className={`${styles.topBorder} ${styles.pointer}`}>
                                            <a onClick={()=>{location.href = "/member/index.html#/account/pwd"}}>修改密码</a>
                                        </li>
                                        <li className={styles.pointer}><a onClick={this.changeAccount.bind(this)}>退出</a></li>
                                    </ul>

                                </div>
                            </span>
                        </div>
                        <ul className="navul">
                            { this.renderNav(nav, navChecked)}
                            <li className={isSaleOrder ? styles.kaidan_checked : styles.kaidan}><a id="a_kaidan" href="/sales-order/index.html#/order/NewSalesOrder" target="_blank" style={a_kaidan}>销售开单</a></li>
                        </ul>
                    </div>
                </Header>
                <Layout id="frontendLayout_content_box">
                    <Sider width={200} style={{ background: '#fff' }} collapsed={hideSlider} collapsedWidth={0}>
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={[]}
                            defaultOpenKeys={[]}
                            style={{ height: '100%', borderRight: 0 }}
                            onClick={this.sliderClickHandler.bind(this)}
                        >
                            {loopSlider(slider)}
                        </Menu>
                    </Sider>
                    <Layout style={mainStyle}>
                        <Breadcrumb style={{ margin: '10px 0', display: hideBreadcrumb ? "none" : "block" }}>
                            <Breadcrumb.Item>{nav[navChecked] && nav[navChecked].menuName}</Breadcrumb.Item>
                            {this.renderBreadcrumb(label)}
                        </Breadcrumb>
                        <div style={maincontentStyle} id="maincontent">
                            <div>
                                <div className={styles.contentTitle} style={{display: hideContentTitle ? "none" : "block"}}>{label && label.length>0 && label[label.length-1].name}</div>
                                <div id="frontendLayout_content">
                                    {this.props.children}
                                </div>
                            </div>
                        </div>
                    </Layout>
                </Layout>
            </Layout>
        );
    }

    renderNav(nav, navChecked){
        return nav.map((c,index)=>{
            return (
                <li key={c.id} className={index == navChecked? "selected":""} onClick={this.navClickHandler.bind(this, index, c.forwardUrl)}>
                    {c.buttonName}
                </li>
            )
        });
    }

    renderBreadcrumb(curmb){
        return curmb.map(c=>{
            return (<Breadcrumb.Item key={c.id} forwardUrl={c.forwardUrl}>{c.name}</Breadcrumb.Item>)
        });
    }

    /**
     * 横向导航按钮的单击事件
     * @param index
     * @param uri
     * @returns {boolean}
     */
    navClickHandler(index, uri){
        const {navChecked} = this.props.layout;
        if(index === navChecked) return false;
        this.props.dispatch({type: 'layout/checkNav', payload: { navChecked: index}});
        //不通过tab切换方式，直接改变url
        //this.props.dispatch({type: 'layout/fetchMenuWithNav', payload: { uri, navChecked: index}});
        location.href = uri;
    }

    /**
     * 左侧菜单按钮的单击事件
     * @param obj
     */
    sliderClickHandler(obj){
        const {item, key} = obj;
        const route = item.props.route;
        const pathname = location.pathname;

        const breadcrumbList = getBreadcrumb(this.props.layout.slider, parseInt(key));
        this.props.dispatch({type: 'layout/setCurmb', payload: {newCurmb: breadcrumbList}});
        this.props.dispatch({type: 'layout/fetchButtons', payload: {uri:`${pathname}#${item.props.forwardUrl}`, routeTo: route}});
    }

    changeAccount(){
        let log = window.loginInfo;
        log.clearInfo();
        location.href = '/member/index.html#/login';
    }

    loginfoMouseOver(){
        this.setState({showLoginfo: "block"});
    }

    loginfoMouseLeave(){
        this.setState({showLoginfo: "none"});
    }
}

function mapStateToProps(state) {
    const{layout} = state;
    return {layout: {...layout}};
}

const LayoutConnect = connect(mapStateToProps)(LayoutNew);

export {LayoutConnect};
import React from 'react';
import BreadHeader from '../components/BreadHeader';
import Menus from '../components/Menus';
import { Layout, Icon } from 'antd';
import { connect } from 'dva';
import styles from './index.css';

const { Content } = Layout;

function Index({ dispatch, access, children }) {
    let { navs, current, nav, label, menus, showMenus } = access, breadcrumbs = [{ name: nav.buttonName, forwardUrl: '' }].concat(label || []);
    navs = navs || [];
    const last = ((label || []).slice(-1))[0], name = last ? last.name : '';

    return (
        <Layout className="wrapper" id="layout_background">
            <div className="header">
                <div className={showMenus ? styles.biglogo : styles.smalllogo} onClick={()=>{location.href="/basis-platform/index.html#/index"}} style={{transition: 'all .2s'}}></div>
                <div className="userInfo">
                    <Icon type="c-yonghu" />
                    <span style={{paddingLeft: 10}}>用户名</span>
                    <div className="userMore">
                        <div>{ localStorage.getItem('loginId') }</div>
                        <div style={{borderBottom: 'solid 1px #999', paddingBottom: 5}}>{ localStorage.getItem('role') }</div>
                        <div><a href="/member/index.html#/account/pwd">修改密码</a></div>
                        <div><a href="/member/index.html">退出</a></div>
                    </div>
                </div>
            </div>
            <Layout className="ant-layout-has-sider">
                <div className="ant-layout-sider" style={{flex: '0 0 auto'}}>
                    <Menus nav={ nav } menus={ menus } dispatch={ dispatch } navs={ navs } current={ current } showMenus={showMenus} />
                </div>
                <Content style={{ marginLeft: 24 }}>
                    <BreadHeader breadcrumbs={ breadcrumbs } />
                    <Layout className="content-wrapper">
                        <div className="menuTitle">
                            <div>{ name }</div>
                        </div>
                        { children }
                    </Layout>
                </Content>
            </Layout>
        </Layout>
    );
}

export default connect(({ access }) => ({
    access
}))(Index);

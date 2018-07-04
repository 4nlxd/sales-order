/**
 * Created by liuyc14 on 2017/8/31.
 */

import React from 'react';
import {Menu, Icon} from 'antd';
import {Link} from 'dva/router';

function Header({location}) {
    return (
        <Menu
            selectedKeys={[location.pathname]}
            mode="horizontal"
            theme="dark"
        >            
            <Menu.Item key="/members">
                <Link to="/members"><Icon type="bars"/>会员列表</Link>
            </Menu.Item>
            <Menu.Item key="/">
                <Link to="/"><Icon type="home"/>Home</Link>
            </Menu.Item>
            <Menu.Item key="/login">
                <Link to="/login"><Icon type="home"/>登录</Link>
            </Menu.Item>
            <Menu.Item key="/account/pwd">
                <Link to="/account/pwd"><Icon type="home"/>修改密码</Link>
            </Menu.Item>            
        </Menu>
    );
}

export default Header;
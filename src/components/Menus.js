import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import style from './menu.css';
import {isBackHomePage} from '../utils/request';

const { Sider } = Layout;
const { SubMenu } = Menu;


const Menus = ({ dispatch, nav, navs, current, menus, showMenus }) => {
    const pathname = location.pathname;

    const loopMenu = (menus) => {
        return menus.map((menu)=>{
            if(menu.child && menu.child.length > 0){
                return (
                    <SubMenu key={menu.id} title={menu.menuName}>
                        {loopMenu(menu.child)}
                    </SubMenu>
                );
            }else{
                return (
                    <Menu.Item path={ menu.owner } key={ menu.id } route={ menu.forwardUrl }>{menu.menuName}</Menu.Item>
                );
            }
        });
    };

    const open = (e, button) => {
        let node = e.target;
        if(node.tagName.toLowerCase() != 'li') node = node.parentNode;
        node.className = style.current;
        console.log('button', button);
        if(!isBackHomePage() && button.id == nav.id){
            //当前页面，不再跳转
            dispatch({type: 'access/get', payload: {data: {showMenus: !showMenus}}});
        }else{
            location.href = button.forwardUrl;
        }        
        // dispatch({
        //     type: 'access/fetchMenus',
        //     payload: button
        // });
    };

    const goto = e => {
        const { route, path } = e.item.props;
        dispatch({
            type: 'access/fetchButtonsAndRouteTo',
            payload: {
                forwardUrl: path + '#' + route,
                routeTo: route
            }
        });
        // if(pathname == path){
        //     location.hash = route;
        //     dispatch({
        //         type: 'access/fetchMenus',
        //         payload: {
        //             forwardUrl: path + '#' + route
        //         }
        //     })
        // }else{
        //     location.href = 'http://' + document.domain + path + '#' + route;
        // }
    };

    let menuClasses = showMenus ? style.subMenus : `${style.subMenus} ${style.hideSubMenu}`;

    const routes = location.hash.match(/\/[^?#/]*/g) || [], top = routes.slice(0, 1).join(''), sub = routes.slice(0, 2).join('');
    const _menus = menus && menus.length > 0 && (
        <div className={ menuClasses }>
            <div className={ style.title }>{ nav && nav.buttonName  }</div>
            <Menu mode="inline" theme="dark" style={{background:'#232c33'}}
                defaultSelectedKeys={ [ sub ] }
                defaultOpenKeys={ [ top ] }
                onClick={ goto }>
            {loopMenu(menus)}
            </Menu>
        </div>
    );

    return (
        <div className={ style.sider }>
            <ul className={ style.nav }>
            {
                navs.map(n => {
                    if(!n.appear) return '';
                    const { forwardUrl, buttonName, property } = n;
                    const cls =  (!isBackHomePage() && nav.id == n.id) ? style.current : '';
                    return (
                        <li key={ forwardUrl } menuid={n.id} onClick={ (e) => open(e, n) } className={ cls }>
                            <Icon type={ property } />
                            <div>{ buttonName }</div>
                        </li>
                    )
                })
            }
            </ul>
            { _menus }
        </div>
    )
};

Menus.propTypes = {
};

export default Menus;

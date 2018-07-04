/**
 * Created by liuyc14 on 2017/8/30.
 */

import loginService from '../services/loginService';
import apiDomain from '../constant/ApiDomain';

const changeSliderTreeToArray = (slider) => {
    let result = [];
    if(slider && slider.length > 0){
        const loopSlider = menus => {
            menus.map((c)=>{
                result.push(c);
                if(c.child && c.child.length > 0){
                    loopSlider(c.child);
                }
            });
        };
        loopSlider(slider);
    }
    return result;
};

/**
 * 获取当前是哪个系统
 * @param nav
 * @param pathname
 * @returns {*}
 */
const getCurrentSystem = apiDomain.getCurrentSystem;

export default {
    namespace: 'layout',
    state: {
        slider: [],
        sliderArray: [],
        sliderChecked: -1,
        curmb: [],
        hideSlider: false,
        nav: [],
        navChecked: -1,
        buttons: [],/*当前页面拥有哪些按钮*/
        label: [],
        hideBreadcrumb: false,/*隐藏面包屑*/
        hideContentTitle: false,/*隐藏contentTitle*/
        isSaleOrder: false/*是否开单页面*/
    },
    reducers: {
        changeSlider(state, { payload: { slider, sliderChecked } }) {
            window.slider = slider;
            //slider变化时，同时更新对应的array
            //let sliderArray = changeSliderTreeToArray(slider);
            return { ...state, slider, sliderChecked, curmb: [], buttons: [] };
        },
        changeNav(state, {payload: { nav, navChecked }}){
            return {...state, nav, navChecked, buttons: []};
        },
        checkSlider(state, {payload: {sliderChecked}}){
            return {...state, sliderChecked};
        },
        checkNav(state, {payload: {navChecked}}){
            return {...state, navChecked};
        },
        setCurmb(state, {payload: {newCurmb}}){
            return {...state, curmb: newCurmb};
        },
        setSliderHide(state, {payload: {hideSlider}}){
            return {...state, hideSlider};
        },
        changeButtons(state, { payload: { buttons, label } }){
            return {...state, buttons, label};
        },
        setData(state, {payload: {data}}){
            return {...state, ...data}
        }
    },
    effects: {
        *fetchMenu({ payload: { uri } }, { call, put }) {
            const { data } = yield call(loginService.getMenuList, { uri, appId: window.loginInfo.appId, loginId: window.loginInfo.loginId });
            const d = data.data || {};
            const menu = d.menus || [];
            yield put({ type: 'changeSlider', payload: { slider: menu, sliderChecked: -1 } });
        },
        *fetchMenuWithNav({ payload: { uri, navChecked} }, { call, put }){
            yield put({ type: 'fetchMenu', payload: { uri } });
            yield put({ type: 'checkNav', payload: { navChecked } });
        },
        /**
         * 查询横向导航数据
         * @param uri
         * @param call
         * @param put
         */
        *fetchNav({ payload: { uri = '/member/#/account/dashboard' } }, { call, put }) {
            const { data } = yield call(loginService.getMenuList, { uri, appId: window.loginInfo.appId, loginId: window.loginInfo.loginId });
            const d = data.data || {};
            const _buttons = d.buttons || [];
            const buttons = _buttons.filter(c=>{
                if(c.appear){
                    return c;
                }
            });
            yield put({ type: 'changeNav', payload: { nav: buttons, navChecked: -1 } });
            const pathname = location.href;
            
            const nav = buttons;
            console.log('nav', nav);
            //匹配当前url，显示指定的nav
            if(nav && nav.length > 0){
                const currentNav = getCurrentSystem(nav || [], pathname);
                console.log('currentNav', currentNav);
                //不是首页，并且获得到当前系统了，获取二级菜单
                if(!apiDomain.isHomePage() && currentNav){
                    yield put({ type: 'fetchMenuWithNav', payload: { uri: currentNav.forwardUrl, navChecked: currentNav._index } });
                }
            }

        },
        *fetchButtons({ payload: { uri, routeTo } }, { call, put }){
            const { data } = yield call(loginService.getMenuList, { uri: uri, appId: window.loginInfo.appId, loginId: window.loginInfo.loginId });
            const d = data.data || {};
            const buttons = d.buttons || [];
            const label = d.label || [];
            yield put({ type: 'changeButtons', payload: { buttons, label } });
            if(routeTo){
                location.hash = routeTo;
            }
        }
    },
    subscriptions: {
        setup({ dispatch, history }) {
            if(window.loginInfo.terminal == 'frontend'){
                //如果是首页，不显示左侧菜单
                dispatch({type: 'fetchNav', payload:{}});
            }
            return history.listen(()=>{
                let isHomePage = apiDomain.isHomePage();
                console.log('isHomePage', isHomePage);
                if(isHomePage){
                    dispatch({type: 'setSliderHide', payload: {hideSlider: true}});
                }else{
                    dispatch({type: 'setSliderHide', payload: {hideSlider: false}});
                }

                if(location.hash.indexOf('NewSalesOrder') > -1){
                    dispatch({type: 'setData', payload: {data:{isSaleOrder: true, hideBreadcrumb: true, hideContentTitle: true, hideSlider: true}}});
                }

                if(location.hash.indexOf('/report/') > -1){
                    dispatch({type: 'fetchNav', payload:{}});
                }
            });
        }
    }

};
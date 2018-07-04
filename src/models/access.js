import * as accessService from '../services/access';
import {isBackHomePage} from '../utils/request';

export default {
    namespace: 'access',
    state:{
        menus: [],
        nav: {
            forwardUrl: location.pathname, 
            buttonName: ''
        },
        current: {
            buttons: []
        },
        navs: [],
        label: [],
        showMenus: true
    }, 

    subscriptions: {
        setup({ dispatch, history }) {  // eslint-disable-line
            const terminal = localStorage.getItem('terminal');
            if(terminal == 'background'){
                dispatch({ type: 'fetch' });
            }
            // dispatch({
            //     type: 'fetchMenus',
            //     payload: {
            //         forwardUrl: location.pathname + location.hash.replace(/\?.+$/, '')
            //     }
            // });

            return history.listen(({ pathname, query }) => {
                let isHomePage = isBackHomePage();
                console.log('isBackHomePage', isHomePage);
                if(isHomePage){
                    dispatch({type: 'get', payload: {data: {showMenus: false}}});
                }else{
                    dispatch({type: 'get', payload: {data: {showMenus: true}}});
                }

                if(location.href.indexOf("/basis-platform/index.html#/?") > -1){
                    dispatch({ type: 'fetch' });
                }
            })
        }
    },

    effects: {
        *fetch({ payload }, { call, put }) {  // eslint-disable-line
            const { data } = yield call(accessService.query, payload), d = data.data;
            let nav = {forwardUrl: '', buttonName: '', id:0};
            const navs = d.buttons.map(b => {
                const { forwardUrl, buttonName, id } = b;
                if((forwardUrl || '').indexOf(location.pathname) > -1){
                    nav = { forwardUrl, buttonName, id };
                }
                return b;
            });
            yield put({ type: 'get', payload: { data: { navs, nav } } });
            if(!isBackHomePage()){
                yield put({ type: 'fetchMenus', payload: { ...nav } });
            }
        },
        *fetchMenus({ payload }, { call, put }) {  // eslint-disable-line
            console.log('payload', payload);
            //获取menu信息，跳转信息
            const { forwardUrl, buttonName, id, routeTo } = payload;
            const { data } = yield call(accessService.getMenus, forwardUrl);
            let current = data.data || {}, { buttons, menus, label } = current, result = { current: { buttons } };
            //if(!menus && forwardUrl) location.href = 'http://' + document.domain + forwardUrl;
            if(buttonName){
                result.nav = { forwardUrl, buttonName, id }
            }
            if(label){
                result.label = label;
            }else{
                result.menus = menus;
            }
            yield put({ type: 'get', payload: { data: result } });

        },
        /**
         * 获取末级菜单的按钮权限，并且跳转路由
         * @param payload
         * @param call
         * @param put
         */
        *fetchButtonsAndRouteTo({payload}, {call, put}){
            const { forwardUrl, id, routeTo } = payload;
            const { data } = yield call(accessService.getMenus, forwardUrl);
            let d = data.data || {};
            let result = {};
            const label = d.label || [];
            if(label && label.length > 0){
                result.label = label;
            }
            yield put({ type: 'get', payload: { data: result } });
            //如果有路由，则跳转到对应路由
            if(routeTo){
                location.hash = routeTo;
            }
        }
    },

    reducers: {
        get(state, action) {
            const newState = { ...state, ...action.payload.data }
            return newState;
        }
    }

};

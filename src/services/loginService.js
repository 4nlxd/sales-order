/**
 * Created by liuyc14 on 2017/9/21.
 */
import request from '../utils/request';
import apiDomain from '../constant/ApiDomain';

const APPKEY = '9CB1F466629A4D84884C761DD370674A';
const loginDomain = apiDomain.loginApiDomain[apiDomain.env];
const userDomain = apiDomain.userApiDomain[apiDomain.env];

export default {
    appKey: APPKEY,
    login({username='', pwd='', vcode=''}){
        return request(`${loginDomain}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: `loginId=${username}&password=${pwd}&appKey=${this.appKey}`
        });
    },

    modifyPwd({oldPwd, newPwd, loginId, appId}){
        return request(`${userDomain}/applciation/user/pwd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: `loginId=${loginId}&appId=${appId}&oldPwd=${oldPwd}&newPwd=${newPwd}`
        });
    },

    getMenuList({uri = "/member/#/account/dashboard", appId, loginId}){
        uri = encodeURIComponent(uri);
        return request(`${userDomain}/getResourceByUri?uri=${uri}&appId=${appId}&loginId=${loginId}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8"
            }
        });
    },
    getMsgCode({phone}){
        return request(`${loginDomain}/getMsgCode?phone=${phone}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8"
            }
        });
    },
    ForgetPwd({code,phone, pwd}){
        return request(`${loginDomain}/pwd`, {
            method: 'PUT',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: `code=${code}&phone=${phone}&pwd=${pwd}`
        });
    }
};
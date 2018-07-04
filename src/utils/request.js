import { notification } from 'antd';
import fetch from 'dva/fetch';
import { domain } from '../models/config';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  if(response.status == 401){
      notification.error({ message: '认证信息已失效，重新认证中...' })
      request(`${domain}/pcsd-newretail-login/retail-login/reflushAuthKey`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'reflushToken=' + localStorage.getItem('reflushToken')
      }).then(res => {
          if(!res.err){
              localStorage.setItem('auth-key', res.data.data['auth-key']);
              setTimeout(function(){
                  location.reload();
              }, 3000)
          }
      })

      return;
  }else if(response.status == 403){
      notification.error({ message: '登录失败，3秒钟后将会跳转到登录页,请重新登录...' })
      setTimeout(function(){
          location.href = '/member/index.html#/login'
      }, 3000)
  }else if(response.status == 406){
      notification.error({ message: '重复登录了!' })
  }else if(response.status == 409){
      notification.error({ message: '没有权限哦!' })
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  let nOptions = options || {}, headers = nOptions.headers || {};
  const nHeaders = {
      ...headers,
      "MSP-AppKey": localStorage.getItem('appKey'),
      "MSP-AuthKey": localStorage.getItem('auth-key'),
      "token" : localStorage.getItem('token')
  };
  nOptions.headers = nHeaders;
  return fetch(url, nOptions)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => ({ data }))
    .catch(err => ({ err }));
}

const backHomePageUrl = '/basis-platform/index.html#/index';

const isBackHomePage = ()=>{
    return location.href.indexOf(backHomePageUrl) > -1;
};

export {
    isBackHomePage,
    backHomePageUrl
}

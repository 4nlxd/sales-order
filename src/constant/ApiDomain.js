/**
 * Created by liuyc14 on 2017/9/26.
 */
//const domain = "http://10.96.83.3:8080";
const devdomain = "https://api-dev.unifiedcloud.lenovo.com";
const boxdomain = "https://api-sandbox.unifiedcloud.lenovo.com";
const productDomain = "https://api.unifiedcloud.lenovo.com";

const HashUrl_indexPage = '/report-forms/index.html#/index';
const isHomePage = ()=> {
    return location.href.indexOf(HashUrl_indexPage) >= 0;
};

/**
 * 获取当前是哪个系统
 * @param nav
 * @param pathname
 * @returns {*}
 */
const getCurrentSystem = (nav, pathname)=>{
    let result = null;

    if(location.href.indexOf('/sales-order/index.html#/order/NewSalesOrder') > -1){
        return null;
    }

    for(let i = 0; i < nav.length; i++){
        let n = nav[i];
        if(n.forwardUrl && pathname.indexOf(n.forwardUrl) >= 0){
            result = n;
            result._index = i;
            break;
        }
    }
    
    
    
    // for(let i = 0; i < nav.length; i++){
    //     let n = nav[i];
    //     if(n.id == 150649419321858){
    //         result = n;
    //         result._index = i;
    //         break;
    //     }
    // }
    
    
    
    // if(!result){
    //     result = nav[0];
    //     result._index = 0;
    // }
    return result;
};

const getEnv = ()=>{
    const href = location.href;
    let env = 'production';
    if(href.indexOf('localhost') >= 0){
        env = 'local';
    }
    else if(href.indexOf('dev.nb.lenovo') >= 0){
        env = 'dev';
    }
    else if(href.indexOf('uat.nb.lenovo') >= 0){
        env = 'uat';
    }
    else{
        env = 'production';
    }
    return env;
};

let env = getEnv();

export default {
    env: env,
    domain:{
        local: 'localhost:8080',
        dev: devdomain,
        uat: boxdomain,
        production: productDomain
    },
    loginApiDomain: {
        local: '/retail-login',
        dev: devdomain + '/pcsd-newretail-login/retail-login',
        uat: boxdomain + '/pcsd-newretail-login/retail-login',
        production: productDomain + '/pcsd-newretail-login/retail-login'
    },
    userApiDomain: {
        local: '/newretail-acl',
        dev: devdomain + '/pcsd-newretail-ac/newretail-acl',
        uat: boxdomain + '/pcsd-newretail-ac/newretail-acl',
        production: productDomain + '/pcsd-newretail-ac/newretail-acl'
    },
    memberApiDomain: {
        local: '',
        dev: '',
        uat: '',
        production: ''
    },
    couponApiDomain: {
        local: '/coupon',
        dev: boxdomain + '/pcsd-hs-coupon-web',
        uat: boxdomain + '/pcsd-hs-coupon-web',
        production: productDomain + '/pcsd-hs-coupon-web'
    },
    orderApiDomain: {
        local: '/order',
        dev: boxdomain,
        uat: boxdomain,
        production: productDomain
    },
    getEnv: getEnv,
    isHomePage: isHomePage,
    getCurrentSystem: getCurrentSystem,
    hashUrl_indexPage: HashUrl_indexPage
};
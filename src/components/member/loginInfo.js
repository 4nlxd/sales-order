/**
 * Created by liuyc14 on 2017/9/27.
 */
const KEYMAP = {
    authKey: "auth-key",
    appKey: "appKey",
    appId: "appId",
    lastLoginAt: "lastLoginAt",
    loginId: "loginId",
    reflushToken: "reflushToken",
    token: "token",
    role: "role",
    shopName: "shopName",
    shopCode: "shopCode",
    terminal: "terminal"
};

class LoginInfo{
    constructor() {
        this.info = {};
    }
    get authKey(){
        if(this.info.authKey){
            return this.info.authKey;
        }else {
            this.info.authKey = localStorage.getItem(KEYMAP.authKey);
            return this.info.authKey || '';
        }
    }
    set authKey(authKey){
        this.info.authKey = authKey;
        localStorage.setItem(KEYMAP.authKey, authKey);
    }

    get appKey(){
        if(this.info.appKey){
            return this.info.appKey;
        }else {
            this.info.appKey = localStorage.getItem(KEYMAP.appKey);
            return this.info.appKey || '';
        }
    }
    set appKey(appKey){
        this.info.appKey = appKey;
        localStorage.setItem(KEYMAP.appKey, appKey);
    }

    get appId(){
        if(this.info.appId){
            return this.info.appId;
        }else {
            this.info.appId = localStorage.getItem(KEYMAP.appId);
            return this.info.appId || '';
        }
    }
    set appId(appId){
        this.info.appId = appId;
        localStorage.setItem(KEYMAP.appId, appId);
    }

    get lastLoginAt(){
        if(this.info.lastLoginAt){
            return this.info.lastLoginAt;
        }else {
            this.info.lastLoginAt = localStorage.getItem(KEYMAP.lastLoginAt);
            return this.info.lastLoginAt || '';
        }
    }
    set lastLoginAt(lastLoginAt){
        this.info.lastLoginAt = lastLoginAt;
        localStorage.setItem(KEYMAP.lastLoginAt, lastLoginAt);
    }

    get loginId(){
        if(this.info.loginId){
            return this.info.loginId;
        }else {
            this.info.loginId = localStorage.getItem(KEYMAP.loginId);
            return this.info.loginId || '';
        }
    }
    set loginId(loginId){
        this.info.loginId = loginId;
        localStorage.setItem(KEYMAP.loginId, loginId);
    }

    get reflushToken(){
        if(this.info.reflushToken){
            return this.info.reflushToken;
        }else {
            this.info.reflushToken = localStorage.getItem(KEYMAP.reflushToken);
            return this.info.reflushToken || '';
        }
    }
    set reflushToken(reflushToken){
        this.info.reflushToken = reflushToken;
        localStorage.setItem(KEYMAP.reflushToken, reflushToken);
    }

    get token(){
        if(this.info.token){
            return this.info.token;
        }else {
            this.info.token = localStorage.getItem(KEYMAP.token);
            return this.info.token || '';
        }
    }
    set token(token){
        this.info.token = token;
        localStorage.setItem(KEYMAP.token, token);
    }

    get role(){
        if(this.info.role){
            return this.info.role;
        }else {
            this.info.role = localStorage.getItem(KEYMAP.role);
            return this.info.role || '';
        }
    }
    set role(role){
        this.info.role = role;
        localStorage.setItem(KEYMAP.role, role);
    }

    get shopName(){
        if(this.info.shopName){
            return this.info.shopName;
        }else {
            this.info.shopName = localStorage.getItem(KEYMAP.shopName);
            return this.info.shopName || '';
        }
    }
    set shopName(shopName){
        this.info.shopName = shopName;
        localStorage.setItem(KEYMAP.shopName, shopName);
    }

    get shopCode(){
        if(this.info.shopCode){
            return this.info.shopCode;
        }else {
            this.info.shopCode = localStorage.getItem(KEYMAP.shopCode);
            return this.info.shopCode || '';
        }
    }
    set shopCode(shopCode){
        this.info.shopCode = shopCode;
        localStorage.setItem(KEYMAP.shopCode, shopCode);
    }

    get terminal(){
        if(this.info.terminal){
            return this.info.terminal;
        }else {
            this.info.terminal = localStorage.getItem(KEYMAP.terminal);
            return this.info.terminal || '';
        }
    }
    set terminal(terminal){
        this.info.terminal = terminal;
        localStorage.setItem(KEYMAP.terminal, terminal);
    }

    clearInfo(){
        for(let key in KEYMAP){
            localStorage.removeItem(KEYMAP[key]);
        }
    }
}

export default LoginInfo;
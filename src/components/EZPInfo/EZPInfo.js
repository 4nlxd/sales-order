/**
 * Created by chaoqin on 18/1/19.
 */
import moment from 'moment';
const CryptoJS = require('crypto-js');

class EzpInfo{
    constructor(){
        this.info = {};
    }

    get token(){
        return '4c5b1f3ab0eb8c4b';
    }

    get appId(){
        return 'lenovo_test';
    }

    get timestamp(){
        return moment().format('YYYYMMDDHHmmss');
    }

    get sign(){
        let signstring = "AppId=" + String(this.appId) + "&Timestamp=" + this.timestamp + "&Token=" + String(this.token);
        return CryptoJS.SHA1(signstring).toString().toUpperCase();
    }
}

export default EzpInfo;
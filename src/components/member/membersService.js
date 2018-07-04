/**
 * Created by liuyc14 on 2017/8/30.
 */
import request from '../../utils/request';
import md5 from 'blueimp-md5';

const method = 'lenovo.cerpglobal.findUser';
const appKey = 'LI8PHT';
const appSecret = '0bWLBNRShxyyJJjtX1do';
const ticket = '0ac3bb8d-28e9-4f02-a46f-84ce4ab82b42';

const getSignString = (timestamp, body)=>{
    let str = appSecret + 'app_key' + appKey + 'lenovo_param_json' + body + 'method' + method + 'timestamp' + timestamp + appSecret;
    return md5(str);
};

export default {
    getList({mobile, page = 1, pageSize = 10}){
        let timestamp = (new Date() - 0);
        let body = `{"ticket":"${ticket}", "pageNum":"${page}","pageSize":"${pageSize}","mobile":"${mobile}"}`;
        let sign = getSignString(timestamp, body);
        return request(`/openapi/router/json.jhtm?method=${method}&app_key=${appKey}&timestamp=${timestamp}&lenovo_param_json=${body}&sign=${sign}`, {
            method: 'GET'
        });
    }
};
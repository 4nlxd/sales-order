import request from '../utils/request';
import { domain } from '../models/config';

export function query() {
    const appid = localStorage.appId, loginId = localStorage.loginId, uri = encodeURIComponent('/member/#/account/dashboard');
    return request(domain + 'pcsd-newretail-ac/newretail-acl/getResourceByUri?appId=' + appid + '&uri=' + uri + '&loginId=' + loginId);
}
export function getMenus(str) {
    const appid = localStorage.appId, loginId = localStorage.loginId, uri = encodeURIComponent(str);
    return request(domain + 'pcsd-newretail-ac/newretail-acl/getResourceByUri?appId=' + appid + '&uri=' + uri + '&loginId=' + loginId);
}

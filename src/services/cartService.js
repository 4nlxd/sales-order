import request from '../utils/request';
import { domain } from '../models/config';

const loginId = loginInfo.loginId;

export default {
    searchMaterial(v, shopId){
        let requestBody = {
            "pageIndex":0,
            "pageSize":10,
            "userType":"zhangyj",
            "products": {
                "materialID": "",
                "fabaseinfoesID": "",
                "productGroupId": "",
                "productGroupNo": "",
                "faid": shopId,
                "materialNumber": "",
                "name": v.replace(/(^\s*)|(\s*$)/g, ""),
                "code": '',
                "mallType": 20
            }
        };

        return request(`${domain}lenovo-pcsd-products-query/products/queryProductsByCondition`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: `${JSON.stringify(requestBody)}`
        });
    },

    getCart(member, shopId){
        return request(`${domain}pcsd-ordercenter-cart/cart/getCart?shopId=${shopId}&customerId=${member}&orderSource=20`, {
            method: 'POST',
        })
    },

    addCart(custormId, code, id, shopId){
        let packid = id ? id : '';
        return request(`${domain}pcsd-ordercenter-cart/cart/add?shopId=${shopId}&createBy=${loginId}&customerId=${custormId}&productCode=${code}&terminal=11&orderSource=20&packid=${packid}`, {
            method: 'POST',
        })
    },

    getSnList(code, shopId){
        return request(`${domain}pcsd-ordercenter-cart/cart/getsnlist?shopId=${shopId}&productCode=${code}&orderSource=20`, {
            method: 'POST',
        })
    },

    editNum(record, num){
        return request(`${domain}pcsd-ordercenter-cart/cart/updateQuantity?shoppingCartDetailId=${record.key}&quantity=${num}&orderSource=20`, {
            method: 'POST',
        })
    },

    delHandler(key){
        return request(`${domain}pcsd-ordercenter-cart/cart/delete?shoppingCartDetailId=${key}&orderSource=20`, {
            method: 'POST',
        })
    },

    submitSn(detailId, barCodes){
        return request(`${domain}pcsd-ordercenter-cart/cart/updateBarcode?shoppingCartDetailId=${detailId}&barcode=${barCodes}&orderSource=20`, {
            method: 'POST',
        })
    },

    getMemberInfo(values){
        return request(`/alenovo/api/member/code2vid/${values}`, {
            method: 'GET',
        })
    },

    updateCustormId(cartNo, oldVid, vid){
        return request(`${domain}pcsd-ordercenter-cart/cart/updateCustomerId?orderSource=20`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `cartNo=${cartNo}&oldCustomerId=${oldVid}&newCustomerId=${vid}`,
        })
    },

    editPrice(record, val){
        return request(`${domain}pcsd-ordercenter-cart/cart/updatePrice?shoppingCartDetailId=${record.key}&price=${val}&orderSource=20`, {
            method: 'POST',
        })
    },

    hxfwq(vid, code){
        return request(`${domain}pcsd-hs-coupon-web/couponOpenApi/salesCouponsToServicePaid.jhtm`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `shopId=20&terminal=1&userId=${vid}&couponCode=${code}&orderSource=20`,
        })
    },

    submit(no, ckCouponid, memberName, jifen, ckSales, storeName){
        return request(`${domain}pcsd-ordercenter-cart/cart/submitOrder?cartNo=${no}&couponid=${ckCouponid.join(',')}&customerId=${memberName}&orderSource=20&point=${jifen}&operatorNo=${ckSales.id || ''}&operatorName=${ckSales.userName || ''}&shopName=${storeName}`, {
            method: 'POST',
        })
    },

    getMemberJf(vid){
        return request(`${domain}pcsd-mempoints-domain/mempointsDomain/v1/getPoints?userId=${vid}&tenantId=20`, {
            method: 'GET'
        })
    },

    getSalers(shopId){
        return request(`${domain}pcsd-newretail-ac/newretail-acl/v2/user?shopCode=${shopId}&type=1`, {
            method: 'GET'
        })
    },

    getProvinceData(){
        return request(`${domain}pcsd-ordercenter-cart/cart/AllProvince`, {
            method: 'GET',
        })
    },

    getCityData(code){
        return request(`${domain}pcsd-ordercenter-cart/cart/AllCity?code=${code}`, {
            method: 'GET',
        })
    },

    getTownData(code){
        return request(`${domain}pcsd-ordercenter-cart/cart/Allcounty?code=${code}`, {
            method: 'GET',
        })
    },

    saveAddress(addressInfo){
        return request(`${domain}pcsd-ordercenter-cart/cart/SaveAllcounty`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `deliveryType=${addressInfo.deliveryType || ''}&receiverName=${addressInfo.receiverName || ''}&receiverPhone=${addressInfo.receiverPhone || ''}&receiverProvince=${addressInfo.receiverProvince && addressInfo.receiverProvince.name || ''}&receiverCity=${addressInfo.receiverCity && addressInfo.receiverCity.name || ''}&receiverDistrict=${addressInfo.receiverDistrict && addressInfo.receiverDistrict.name || ''}&receiverAddress=${addressInfo.receiverAddress || ''}&receiverPostCode=&orderSource=20&ShoppingCartNo=${addressInfo.ShoppingCartNo}`,
        })
    },

    saveInvoice(invoiceInfo){
        return request(`${domain}pcsd-ordercenter-cart/cart/SaveAllinvoce`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'},
            body: `invoiceType=${invoiceInfo.invoiceType || ''}&invoiceTitle=${invoiceInfo.invoiceTitle || ''}&invoiceCode=${invoiceInfo.invoiceCode || ''}&invoiceNo=${invoiceInfo.invoiceNo || ''}&companyName=${invoiceInfo.companyName || ''}&taxpayerCode=${invoiceInfo.taxpayerCode || ''}&taxpayerBank=${invoiceInfo.taxpayerBank || ''}&bankAccount=${invoiceInfo.bankAccount || ''}&registeredAddress=${invoiceInfo.registeredAddress || ''}&registeredTel=${invoiceInfo.registeredTel || ''}&orderSource=20&ShoppingCartNo=${invoiceInfo.ShoppingCartNo}`,
        })
    },

    getFaInfo(){
        let appkey = loginInfo.appKey;
        return request(`${domain}pcsd-newretail-ac/newretail-acl/application/dataPermission?dataIds=5f478c76af4e6d12&appKey=${appkey}`, {
            method: 'GET',
        })
    },

    getShopCode(){
        let code = [];

        this.getFaInfo().then((res)=>{
            if(res.data.code == 200){
                let data = res.data.data[0].permission;

                for(let i=0; i<data.length; i++){
                    code.push(data[i].value);
                }
            }
        });

        return code.join(',');
    },


    getApprove(id, pwd, val, key){
        return request(`${domain}pcsd-ordercenter-cart/cart/getApproveTj?userid=${id}&password=${pwd}&shoppingCartDetailId=${key}&price=${val}&orderSource=20`, {
            method: 'PUT'
        })
    }
}

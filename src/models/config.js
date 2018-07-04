const domain = document.domain;
let base = "https://" + (/dev\./.test(domain) ? "api-dev" : (/uat\./.test(domain) ? "api-sandbox" : "api" )) + ".unifiedcloud.lenovo.com/";

if(domain.indexOf('localhost') != -1){
    base = '/api/';
}

export default {
    "domain": base,
    /*"domain": "https://api.unifiedcloud.lenovo.com/",*/
    "/order": "订单管理",
    "/order/list": "订单查询",
    "/order/createOrder": "销售开单",
    "/order/detail/:id": "订单详情",
    "/order/pay": "订单支付",

    "/returnOrder": "退换货管理",
    "/returnOrder/return": "退货申请",
    "/returnOrder/search": "退货退款查询"
}

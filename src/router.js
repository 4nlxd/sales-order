import React from 'react';
import {Router, Route, IndexRoute} from 'dva/router';
// import Index from './routes/app';
import {LayoutConnect} from './components/MainLayout/LayoutNew';
import LayoutBack from './routes/Index';

import OrderList from './routes/Order/OrderList';
import OrderDetail from './routes/Order/OrderDetail';

import OrderSubmit from './routes/SalesOrder/OrderSubmit';
import SalesPay from './routes/SalesOrder/SalesPay';

import NewSalesOrder from './routes/SalesOrder/NewSalesOrder';

import Return from './routes/returnOrder/return/Return';
import ReturnSearch from './routes/returnOrder/return_search';

import Report from './routes/Report/Report';
import spareGold from './routes/spareGold/spareGold';
function RouterConfig({ history }) {
    const terminal = localStorage.getItem('terminal');

    const renderLayout = props => {
        if(terminal == 'frontend'){
            return <LayoutConnect { ...props } />
        }else{
            return <LayoutBack { ...props } />
        }
    };

    return (
        <Router history={history}>
            <Route path="/" component={renderLayout}>
                <Route path="index" component={OrderList}/>
                /*order相关Route*/
                <Route path="/order/list" component={OrderList} />
                <Route path="/order/detail/:id" component={OrderDetail} />

                <Route path="/returnOrder/return" component={Return} />
                <Route path="/returnOrder/search" component={ReturnSearch} />
                
            	<Route path="/order/Report" component={Report} />

            	<Route path="/order/spareGold" component={spareGold} />

                <Route path="/order/NewSalesOrder" component={NewSalesOrder} />
                <Route path="/order/NewSalesOrder/submit" component={OrderSubmit} />
                <Route path="/order/NewSalesOrder/pay" component={SalesPay} />
            </Route>
        </Router>
    );
}

export default RouterConfig;

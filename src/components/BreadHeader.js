import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import * as config from '../models/config';

const BreadHeader = ({ breadcrumbs }) => {

    const selected = breadcrumbs.map((breadcrumb, index) => {
        const { name, forwardUrl } = breadcrumb;

        return (
            <Breadcrumb.Item key={ index }>
                <a href={ '#' + forwardUrl }>{ name }</a>
            </Breadcrumb.Item>
        )
    });
    return (
        <Breadcrumb className="breadcrumb-wrapper">
            { selected }
        </Breadcrumb>
    )
}

BreadHeader.propTypes = {
};

export default BreadHeader;

/**
 * Created by chaoqin on 17/9/22.
 */

import { Layout } from 'antd';
import BreadHeader from '../components/BreadHeader';
import Menus from '../components/Menus';
import styles from '../components/Layout.css';
import { connect } from 'dva';
const { Footer, Content } = Layout;

class Index extends React.Component {
    render() {
        const { menus } = this.props.access;

        return (
            <Layout className="ant-layout ant-layout-has-sider wrapper">
                <Menus menus={ menus }/>
                <Layout>
                    <BreadHeader />
                    <Content className={styles.containerLayout}>
                        <div className={styles.containerMain}>
                            { this.props.children }
                        </div>
                    </Content>
                    <Footer className={styles.footerLayout}>
                        Ant Design ©2016 Created by Ant UED
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

export default connect(({ access }) => ({
    access
}))(Index);



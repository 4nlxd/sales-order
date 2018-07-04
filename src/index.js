import dva from 'dva';
import './index.css';
import createLoading from 'dva-loading';
import LoginInfo from './components/member/loginInfo';
import EzpInfo from './components/EZPInfo/EZPInfo';

let loginInfo = new LoginInfo();
window.loginInfo = loginInfo;

window.EzpInfo = new EzpInfo();

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});
app.use(createLoading());

// 3. Model
// app.model(require('./models/example'));
app.model(require('./models/access'));
app.model(require('./models/layoutModel'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

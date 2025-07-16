import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom'; // 添加路由上下文
import App from './app';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* 添加路由包装器 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
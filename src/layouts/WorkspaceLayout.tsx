import { Layout, Menu, Divider, Button, Tooltip } from 'antd';
import { history, useLocation } from 'umi';
import {
  MailTwoTone,
  HeartTwoTone,
  RestTwoTone,
  FileTextTwoTone,
  QuestionCircleOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';

import WorkspaceHeader from '@/components/WorkspaceHeader';
import style from './WorkspaceLayout.less';
import { useEffect, useState } from 'react';

const { Header, Sider, Content } = Layout;

interface IWorkspaceLayoutProps {
  children: JSX.Element;
}

const pageTitleMap = {
  '/collaboration': '我的协作',
  '/star': '我的收藏',
  '/desktop': '我的桌面',
  '/trash': '回收站',
};

function SiderMenu() {
  const location = useLocation();
  const [key, setKey] = useState('/');

  useEffect(() => {
    if (location.pathname === '/') history.push('/desktop');
    const key = /\/folder/.test(location.pathname)
      ? '/desktop'
      : location.pathname;
    setKey(key);
  }, [location]);

  return (
    <Menu
      mode="inline"
      selectedKeys={[key]}
      onClick={({ key }) => {
        history.push(key as string);
      }}
    >
      <Menu.Item key="/collaboration" icon={<MailTwoTone />}>
        {pageTitleMap['/collaboration']}
      </Menu.Item>
      <Menu.Item key="/star" icon={<HeartTwoTone />}>
        {pageTitleMap['/star']}
      </Menu.Item>
      <Menu.Item key="/desktop" icon={<FileTextTwoTone />}>
        {pageTitleMap['/desktop']}
      </Menu.Item>
      <Divider />
      <Menu.Item key="/trash" icon={<RestTwoTone />}>
        {pageTitleMap['/trash']}
      </Menu.Item>
    </Menu>
  );
}

function WorkspaceLayout({ children }: IWorkspaceLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Layout className={style.layout}>
      <Header
        style={{
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <WorkspaceHeader
          buttons={
            <>
              <Tooltip title="帮助">
                <Button type="text" icon={<QuestionCircleOutlined />}></Button>
              </Tooltip>
              <Tooltip title="反馈建议">
                <a href="https://support.qq.com/product/315603" target="_blank">
                  <Button type="text" icon={<WhatsAppOutlined />}></Button>
                </a>
              </Tooltip>
            </>
          }
        />
      </Header>
      <Layout>
        <Sider
          theme="light"
          className={`${collapsed ? undefined : style.SiderCollapsed} ${
            style.Sider
          }`}
          breakpoint="sm"
          collapsedWidth="0"
          onCollapse={setCollapsed}
        >
          <SiderMenu />
        </Sider>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}

export default WorkspaceLayout;

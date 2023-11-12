import {
  Avatar,
  Button,
  Space,
  Popover,
  Divider,
  Modal,
  Input,
  message,
  Tooltip,
} from 'antd';
import { ExclamationCircleOutlined, LeftOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';
import Login from '@/components/Login';
import { updateEmail } from '@/api/user';
import { connect, Link, history } from 'umi';
import ReactAvatar from 'react-avatar';

import style from './style.less';
import Search from '../Search';
import { useState } from 'react';

export function CustomAvatar({ size = 40, user, onClick = () => null }) {
  return user.avatar ? (
    <Avatar
      size={size}
      style={{ border: '1px solid #ddd' }}
      src={user.avatar}
      alt="avatar"
      onClick={onClick}
    />
  ) : (
    <ReactAvatar name={user.nickname} size={size} round onClick={onClick} />
  );
}

function WorkspaceHeader({ token, user, dispatch, buttons }: any) {
  const [visibleUserCenter, setVisibleUserCenter] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);

  function EmailModal() {
    const [email, setEmail] = useState<string | undefined>();

    return (
      <Modal
        title="修改邮箱号"
        visible={isEmailModalVisible}
        zIndex={9999}
        onOk={(e) => {
          updateEmail({
            email,
          })
            .then(() => {
              message.success('修改邮箱成功');
              dispatch({
                type: 'login/queryUserInfo',
                payload: token,
              });
              setIsEmailModalVisible(false);
            })
            .catch(() => message.error('修改邮箱失败！'));
        }}
        onCancel={() => setIsEmailModalVisible(false)}
        okButtonProps={{ disabled: !email }}
      >
        <Input
          placeholder={`请输入邮箱号`}
          maxLength={64}
          allowClear
          type="email"
          defaultValue={user.email}
          onChange={(e) => setEmail(e.target.value.trim())}
        />
      </Modal>
    );
  }

  return (
    <>
      <div
        style={{
          marginRight: 'auto',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Space>
          {window.isMobile ? (
            <LeftOutlined
              style={{ fontSize: 24 }}
              onClick={history.goBack}
            />
          ) : (
            <h1 className={style.TextLogo}>
              <Link to="/">实时协同编辑器</Link>
            </h1>
          )}

          {!window.isMobile && <Search />}
        </Space>
      </div>
      <Space size={30}>
        <Space>{buttons}</Space>
        {token ? (
          <Popover
            content={
              <div className={style.CustomAvatar}>
                <CustomAvatar size={60} user={user} />
                <Tooltip title={user.nickname}>
                  <p
                    style={{ width: 190, cursor: 'pointer', marginTop: 20 }}
                    className="ellipsis"
                  >
                    昵称：{user.nickname}
                  </p>
                </Tooltip>
                <p style={{ display: 'flex', alignItems: 'center' }}>
                  <div>ID：</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 110 }} className="ellipsis">
                      {user.id}
                    </div>
                    <Button
                      style={{ marginLeft: 5 }}
                      size="small"
                      type="primary"
                    >
                      <CopyToClipboard text={user.id}>
                        <div>复制</div>
                      </CopyToClipboard>
                    </Button>
                  </div>
                </p>
                <p style={{ display: 'flex', alignItems: 'center' }}>
                  <div>邮箱：</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 100 }} className="ellipsis">
                      {user.email}
                    </div>
                    <Button
                      style={{ marginLeft: 5 }}
                      size="small"
                      type="primary"
                    >
                      <CopyToClipboard text={user.email}>
                        <div>复制</div>
                      </CopyToClipboard>
                    </Button>
                  </div>
                </p>
                {/* <Button
                  style={{ marginTop: 10 }}
                  size="small"
                  type="primary"
                  onClick={() => setIsEmailModalVisible(true)}
                >
                  修改邮箱号
                </Button> */}
                <Divider />
                <Button
                  danger
                  block
                  onClick={() => {
                    Modal.confirm({
                      title: '是否退出登录?',
                      icon: <ExclamationCircleOutlined />,
                      okText: '是',
                      okType: 'danger',
                      cancelText: '否',
                      onOk() {
                        dispatch({
                          type: 'login/logout',
                        });
                      },
                    });
                  }}
                >
                  退出登录
                </Button>
              </div>
            }
            visible={visibleUserCenter}
            trigger="click"
            placement="bottomLeft"
          >
            <CustomAvatar
              user={user}
              onClick={() => setVisibleUserCenter(!visibleUserCenter)}
            />
          </Popover>
        ) : (
          <Button
            onClick={() => {
              dispatch({
                type: 'global/changeLoginPaneVisible',
                payload: true,
              });
            }}
            type="primary"
          >
            登录/注册
          </Button>
        )}

        <Login />
      </Space>
      <EmailModal />
    </>
  );
}

export default connect(({ login, editor }) => ({
  token: login.token,
  user: login.user,
  editor,
}))(WorkspaceHeader);

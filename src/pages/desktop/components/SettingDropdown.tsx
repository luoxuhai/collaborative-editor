import {
  SettingOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import {
  message,
  Dropdown,
  Menu,
  Modal,
  Input,
  List,
  Button,
  Tooltip,
  Space,
  Divider,
  Row,
  Col,
  Checkbox,
} from 'antd';
import { history, Link } from 'umi';
import CopyToClipboard from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';
import { CustomAvatar } from '../../../components/WorkspaceHeader';

import { deleteFile, updateFile, sharePermission } from '@/api/file';
import { starFile } from '@/api/user';
import {
  getCollaborator,
  addCollaborator,
  deleteCollaborator,
} from '@/api/collaboration';
import style from './SettingDropdown.less';

export function CollaborativeModal({ visible, onVisible, fileId }) {
  const [email, setEmail] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [collaborator, setCollaborator] = useState([]);

  useEffect(() => {
    if (visible)
      getCollaborator({ id: fileId })
        .then((res) => {
          setCollaborator(res.users);
        })
        .finally(() => setLoading(false));
  }, [visible, loading]);

  return (
    <Modal
      title="协作者管理"
      visible={visible}
      zIndex={9999}
      footer={null}
      onCancel={() => onVisible(false)}
      okButtonProps={{ disabled: !email }}
    >
      <Input.Search
        prefix={<UserOutlined />}
        placeholder="输入 邮箱｜用户ID 添加协作权限"
        maxLength={64}
        allowClear
        enterButton="添加"
        onChange={(e) => setEmail(e.target.value.trim())}
        onSearch={() => {
          addCollaborator({
            id: fileId,
            email,
          })
            .then(() => {
              message.success('添加成功');
              setLoading(true);
            })
            .catch(() => message.error('添加失败，该用户不存在！'));
        }}
      />
      <List
        itemLayout="horizontal"
        dataSource={collaborator}
        header="协作者"
        loading={loading}
        renderItem={(user) => (
          <List.Item>
            <List.Item.Meta
              avatar={<CustomAvatar user={user} size={40} />}
              title={user.nickname}
              description={user.email || user.id}
            />
            <Tooltip placement="top" title="删除">
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  deleteCollaborator({
                    fileId: fileId,
                    userId: user.id,
                  })
                    .then(() => {
                      message.success('删除协作者成功');
                      setLoading(true);
                      history.replace(location.pathname);
                    })
                    .catch(() => {
                      message.error('删除失败');
                    });
                }}
              />
            </Tooltip>
          </List.Item>
        )}
      />
    </Modal>
  );
}

export default function ({ item }) {
  const menu = () => {
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [
      isCollaborativeModalVisible,
      setIsCollaborativeModalVisible,
    ] = useState(false);

    function FolderNameModal() {
      const [folderName, setFolderName] = useState<string | undefined>();
      const typeText = item.type === 'folder' ? '文件夹' : '文件';

      return (
        <Modal
          title={typeText}
          visible={isRenameModalVisible}
          zIndex={9999}
          onOk={(e) => {
            e.stopPropagation();
            updateFile({
              id: item.id,
              name: folderName,
            }).then(() => {
              history.replace(location.pathname);
              setIsRenameModalVisible(false);
            });
          }}
          onCancel={() => setIsRenameModalVisible(false)}
          okButtonProps={{ disabled: !folderName }}
        >
          <Input
            placeholder={`请输入${typeText}名称`}
            maxLength={64}
            allowClear
            defaultValue={item.name}
            onChange={(e) => setFolderName(e.target.value.trim())}
          />
        </Modal>
      );
    }

    function ShareModal() {
      const [permission, setPermission] = useState<any[]>(
        Object.keys(item.permission ?? {}).filter(
          (key) => item.permission[key] || key === 'readable',
        ),
      );
      const url = `${location.origin}/docs/${item.id}`;

      return (
        <Modal
          title="分享"
          visible={isShareModalVisible}
          zIndex={9999}
          footer={
            <Space>
              {(item.permission.readable ||
                item.permission.commentable ||
                item.permission.copyable) && (
                <Button
                  danger
                  onClick={async () => {
                    await sharePermission({
                      id: item.id,
                      readable: 0,
                      commentable: 0,
                      copyable: 0,
                    });
                    message.success('已取消分享');
                    history.replace(location.pathname);
                  }}
                >
                  取消分享
                </Button>
              )}

              <Button
                type="primary"
                onClick={async () => {
                  await sharePermission({
                    id: item.id,
                    readable: 1,
                    commentable: permission.includes('commentable') ? 1 : 0,
                    copyable: permission.includes('copyable') ? 1 : 0,
                  });
                  message.success('分享成功');
                  history.replace(location.pathname);
                }}
              >
                分享
              </Button>
            </Space>
          }
          onCancel={() => {
            setIsShareModalVisible(false);
          }}
        >
          <Row>
            <Col span={24}>
              <Input.Search
                value={url}
                enterButton={
                  <CopyToClipboard text={url}>
                    <div>复制链接</div>
                  </CopyToClipboard>
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: 20 }}>
              <Checkbox.Group
                options={[
                  { label: '允许阅读', value: 'readable', disabled: true },
                  { label: '允许评论', value: 'commentable' },
                  { label: '允许复制', value: 'copyable' },
                ]}
                value={permission}
                onChange={setPermission}
              />
            </Col>
            <Divider />
            <Col
              span={24}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h3>微信 扫码分享</h3>
              <QRCode value={url} />
            </Col>
          </Row>
        </Modal>
      );
    }

    return (
      <>
        <Menu
          selectable={false}
          onClick={(e) => {
            e.domEvent.stopPropagation();
            switch (e.key) {
              case 'remove':
                deleteFile({ id: item.id })
                  .then(() => {
                    message.success('删除成功');
                    history.replace(location.pathname);
                    setIsRenameModalVisible(false);
                  })
                  .catch(() => message.error('删除失败'));
                break;
              case 'rename':
                {
                  setIsRenameModalVisible(true);
                }
                break;
              case 'collaborative':
                {
                  setIsCollaborativeModalVisible(true);
                }
                break;
              case 'share':
                {
                  setIsShareModalVisible(true);
                }
                break;
              case 'star': {
                starFile({
                  id: item.id,
                  operate: item.isStar ? 'remove' : 'add',
                }).then(() => {
                  history.replace(location.pathname);
                  item.isStar
                    ? message.success('已取消收藏')
                    : message.success('已收藏');
                });
              }
            }
          }}
        >
          {item.type !== 'folder' && (
            <>
              <Menu.Item key="collaborative">协作</Menu.Item>
              <Menu.Item key="share">分享</Menu.Item>
            </>
          )}
          <Menu.Item key="rename">重命名</Menu.Item>
          <Menu.Item key="star" danger={item.isStar}>
            {item.isStar && '取消'}收藏
          </Menu.Item>
          <Menu.Item key="remove" danger>
            删除
          </Menu.Item>
        </Menu>
        <FolderNameModal />
        <CollaborativeModal
          visible={isCollaborativeModalVisible}
          onVisible={setIsCollaborativeModalVisible}
          fileId={item.id}
        />
        <ShareModal />
      </>
    );
  };

  return (
    <Dropdown overlay={menu()} trigger={['click']} placement="bottomLeft" arrow>
      <SettingOutlined className={style.setting} />
    </Dropdown>
  );
}

import {
  Row,
  Col,
  Divider,
  Dropdown,
  Button,
  Menu,
  Space,
  Empty,
  Spin,
  Modal,
  Input,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { history, Link } from 'umi';
import { cloneDeep } from 'lodash';

import { getFilesByParent, createFile, deleteFile } from '@/api/file';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import SettingDropdown from './components/SettingDropdown';
import PageHeader from '@/components/PageHeader';
import docCover from '@/assets/doc.png';
import folderCover from '@/assets/folder.png';

import style from './style.less';

function Desktop() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [fileLoading, setFileLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState([
    {
      title: '桌面',
      url: '/desktop',
      id: null,
    },
  ]);
  const [isFolderNameModalVisible, setIsFolderNameModalVisible] = useState(
    false,
  );
  const location = useLocation();

  const parentId = /folder/.test(location.pathname)
    ? location.pathname.replace('/folder/', '')
    : null;

  useEffect(() => {
    setFileLoading(true);
    getFilesByParent({
      parentId,
    })
      .then((res: any) => {
        setFiles(res.files?.filter((item) => item.type === 'doc'));
        setFolders(res.files?.filter((item) => item.type === 'folder'));
        setBreadcrumbs((prev) => {
          const index = prev.findIndex((item) => item.id === parentId);
          let newBreadcrumbs = cloneDeep(prev);

          if (index >= 0 && index <= breadcrumbs.length - 1) {
            newBreadcrumbs = newBreadcrumbs.slice(0, index + 1);
          } else {
            newBreadcrumbs = [
              ...prev,
              {
                title:
                  folders?.find((folder) => folder.id === parentId)?.name ??
                  '新建文件夹',
                url: `/folder/${parentId}`,
                id: parentId,
              },
            ];
          }
          return newBreadcrumbs;
        });
      })
      .finally(() => {
        setFileLoading(false);
      });
  }, [location]);

  function FolderNameModal() {
    const [folderName, setFolderName] = useState<string | undefined>();

    return (
      <Modal
        title="新文件夹"
        visible={isFolderNameModalVisible}
        onOk={() => {
          createFile({
            parentId,
            name: folderName,
            type: 'folder',
          }).then((res) => {
            if (res.folder) {
              setIsFolderNameModalVisible(false);
              history.push(`/folder/${res.folder.id}`);
            }
          });
        }}
        onCancel={() => setIsFolderNameModalVisible(false)}
        okButtonProps={{ disabled: !folderName }}
      >
        <Input
          placeholder="请输入文件夹名称"
          maxLength={64}
          onChange={(e) => setFolderName(e.target.value.trim())}
          allowClear
        />
      </Modal>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={breadcrumbs}
        extra={
          <Space>
            <Button
              onClick={() => {
                message.warn('该功能正在开发中～');
              }}
            >
              添加
            </Button>
            <Dropdown.Button
              type="primary"
              onClick={() => {
                createFile({ parentId }).then((res) => {
                  if (res.doc) {
                    history.push(`/docs/${res.doc.id ?? 'desktop'}`);
                  }
                });
              }}
              overlay={
                <Menu>
                  <Menu.Item
                    key="1"
                    onClick={() => {
                      createFile({
                        parentId,
                      }).then((res) => {
                        if (res.doc) {
                          history.push(`/docs/${res.doc.id}`);
                        }
                      });
                    }}
                  >
                    新建文档
                  </Menu.Item>
                  <Menu.Item
                    key="2"
                    onClick={() => setIsFolderNameModalVisible(true)}
                  >
                    新建文件夹
                  </Menu.Item>
                </Menu>
              }
            >
              新建
            </Dropdown.Button>
          </Space>
        }
      />
      <Spin spinning={fileLoading} tip="加载中">
        <Row>
          {!folders.length && !files.length && !fileLoading && (
            <Col
              span={24}
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty description="这里空空如也，点击右上角按钮增添内容吧！" />
            </Col>
          )}
          {folders.map((item) => (
            <Col xs={8} sm={6} md={4} lg={3} xl={3} className={style.container}>
              <SettingDropdown item={item} />
              <img
                onClick={() => {
                  history.push(`/folder/${item.id}`);
                }}
                style={{ width: 80, height: 80 }}
                src={folderCover}
              />
              <div style={{ width: 115, textAlign: 'center' }}>
                {item.name || '新建文件夹'}
              </div>
            </Col>
          ))}
          {folders.length > 0 && <Divider />}
          {files.map((item) => (
            <Col xs={8} sm={6} md={4} lg={3} xl={3} className={style.container}>
              <SettingDropdown item={item} />
              <img
                onClick={() => {
                  history.push(`/docs/${item.id}`);
                }}
                style={{ width: 80, height: 80 }}
                src={docCover}
              />
              <div style={{ width: 115, textAlign: 'center' }}>
                {item.name || '无标题'}
              </div>
            </Col>
          ))}
        </Row>
      </Spin>
      <FolderNameModal />
    </div>
  );
}

export default Desktop;

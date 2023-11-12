import {
  Row,
  Col,
  Divider,
  Dropdown,
  Button,
  Menu,
  Empty,
  Spin,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { history } from 'umi';
import { SettingOutlined } from '@ant-design/icons';

import { getTrashFiles, deleteTrashFile, restoreTrashFile } from '@/api/trash';
import { useLocation } from 'react-router-dom';

import PageHeader from '@/components/PageHeader';
import docCover from '@/assets/doc.png';
import folderCover from '@/assets/folder.png';
import style from './style.less';

function Desktop() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [fileLoading, setFileLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setFileLoading(true);
    getTrashFiles().then((res: any) => {
      setFiles(res.files?.filter((item) => item.type === 'doc'));
      setFolders(res.files?.filter((item) => item.type === 'folder'));
      setFileLoading(false);
    });
  }, [location]);

  function SettingDropdown({ item }) {
    return (
      <Dropdown
        overlay={
          <Menu
            selectable={false}
            onClick={(e) => {
              switch (e.key) {
                case 'restore':
                  restoreTrashFile({ id: item.id })
                    .then(() => {
                      message.success('还原成功');
                      history.replace(location.pathname);
                    })
                    .catch(() => message.error('还原失败'));
                  break;
                case 'remove': {
                  handleDelete({ id: item.id });
                }
              }
            }}
          >
            <Menu.Item key="restore">还原</Menu.Item>
            <Menu.Item key="remove" danger>
              彻底删除
            </Menu.Item>
          </Menu>
        }
        trigger={['click']}
        placement="bottomLeft"
        arrow
      >
        <SettingOutlined className={style.setting} />
      </Dropdown>
    );
  }

  function handleDelete({ id, empty = '0' }: { id?: string }) {
    deleteTrashFile({ id, empty })
      .then(() => {
        message.success('删除成功');
        history.replace(location.pathname);
      })
      .catch(() => message.error('删除失败'));
  }

  const isEmpty = !folders.length && !files.length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          {
            title: '回收站',
            url: '/trash',
            parentId: null,
          },
        ]}
        extra={
          <Button
            disabled={isEmpty}
            danger
            onClick={() => handleDelete({ empty: '1' })}
          >
            清空回收站
          </Button>
        }
      />
      <Spin spinning={fileLoading} tip="加载中">
        <Row>
          {isEmpty && !fileLoading && (
            <Col
              span={24}
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty description="还没有任何垃圾文件" />
            </Col>
          )}
          {folders.map((item) => (
            <Col xs={8} sm={6} md={4} lg={3} xl={3} className={style.container}>
              <SettingDropdown item={item} />
              <img style={{ width: 80, height: 80 }} src={folderCover} />
              <div style={{ width: 115, textAlign: 'center' }}>
                {item.name || '新建文件夹'}
              </div>
            </Col>
          ))}
          {folders.length > 0 && <Divider />}
          {files.map((item) => (
            <Col xs={8} sm={6} md={4} lg={3} xl={3} className={style.container}>
              <SettingDropdown item={item} />
              <img style={{ width: 80, height: 80 }} src={docCover} />
              <div style={{ width: 115, textAlign: 'center' }}>
                {item.name || '无标题'}
              </div>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
}

export default Desktop;
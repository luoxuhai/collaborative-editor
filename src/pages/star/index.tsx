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

import { getStarFiles } from '@/api/file';
import { starFile } from '@/api/user';
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
    getStarFiles().then((res: any) => {
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
                case 'restar':
                  starFile({ id: item.id, operate: 'remove' })
                    .then(() => {
                      message.success('已取消收藏');
                      history.replace(location.pathname);
                    })
                    .catch(() => message.error('取消收藏失败'));
              }
            }}
          >
            <Menu.Item key="restar" danger>
              从我的收藏移出
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

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          {
            title: '我的收藏',
            url: '/star',
            parentId: null,
          },
        ]}
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
              <Empty description="还没有任何收藏文件" />
            </Col>
          )}
          {folders.map((item) => (
            <Col xs={8} sm={6} md={4} lg={3} xl={3} className={style.container}>
              <SettingDropdown item={item} />
              <img
                style={{ width: 80, height: 80 }}
                src={folderCover}
                onClick={() => {
                  history.push(`/folder/${item.id}?name=${item.name}`);
                }}
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
                style={{ width: 80, height: 80 }}
                src={docCover}
                onClick={() => {
                  history.push(`/docs/${item.id}`);
                }}
              />
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

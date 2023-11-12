import { Select, Space, Input, Dropdown, List, Empty } from 'antd';
import {
  SearchOutlined,
  FileWordTwoTone,
  FolderTwoTone,
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { getFilesByName } from '@/api/file';
import { useState } from 'react';
import { Link } from 'umi';
import style from './index.less';

export default function Search() {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const { run } = useDebounceFn(
    (e) => {
      let name = e;
      if (typeof e === 'object') name = e.target.value;

      getFilesByName({
        name,
      })
        .then((res) => {
          setFiles(res.files.filter((file) => !!file.name));
        })
        .finally(() => setIsLoading(false));
    },
    {
      wait: 200,
    },
  );

  function handleSearch(e) {
    setIsLoading(true);
    run(e);
  }

  return (
    <Dropdown
      overlay={
        <List
          bordered
          dataSource={files}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              />
            ),
          }}
          renderItem={(item) => {
            const isDoc = item.type === 'doc';

            return (
              <List.Item style={{ padding: 0 }}>
                <Link
                  className={style.Link}
                  to={`/${isDoc ? 'docs' : 'folder'}/${item.id}`}
                >
                  <List.Item.Meta
                    avatar={
                      isDoc ? (
                        <FileWordTwoTone style={{ fontSize: 24 }} />
                      ) : (
                        <FolderTwoTone style={{ fontSize: 24 }} />
                      )
                    }
                    title={item.name}
                    description={item.created_at}
                  />
                </Link>
              </List.Item>
            );
          }}
        />
      }
      trigger={['click']}
    >
      <Input.Search
        allowClear
        className={style.Search}
        placeholder="搜索"
        onSearch={handleSearch}
        onChange={handleSearch}
        enterButton
        loading={isLoading}
      />
    </Dropdown>
  );
}

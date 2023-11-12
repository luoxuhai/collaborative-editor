import { useEffect, useState } from 'react';
import { Row, Card, Col, Empty, Spin, Tooltip } from 'antd';
import { history } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

import PageHeader from '@/components/PageHeader';
import { getCollaboration } from '@/api/collaboration';
import style from './index.less';
import docCover from '@/assets/doc.png';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: '在 %s',
    past: '%s前',
    s: '1 秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 月',
    MM: '%d 月',
    y: '1 年',
    yy: '%d 年',
  },
});

export default function CollaborationPage() {
  const [fileLoading, setFileLoading] = useState(true);

  const [collaborationList, setCollaborationList] = useState([]);

  useEffect(() => {
    getCollaboration()
      .then((res) => {
        setCollaborationList(res.collaborationList);
      })
      .finally(() => setFileLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          {
            title: '我的协作',
            url: '/share',
            id: null,
          },
        ]}
      />
      <Spin spinning={fileLoading} tip="加载中">
        <Row gutter={15}>
          {!collaborationList.length && !fileLoading && (
            <Col
              span={24}
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty description="暂无内容" />
            </Col>
          )}
          {collaborationList.map((collaboration) => (
            <Col
              className={style.Col}
              xs={12}
              sm={12}
              md={8}
              lg={8}
              xl={6}
              span={12}
              onClick={() => {
                history.push(`/docs/${collaboration.file.id}`);
              }}
            >
              <Card>
                <Card.Meta
                  avatar={
                    <img style={{ width: 50, height: 50 }} src={docCover} />
                  }
                  title={collaboration.file.name}
                  description={
                    <Tooltip
                      title={dayjs(collaboration.created_at).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}
                    >
                      <span>{dayjs(collaboration.created_at).fromNow()}</span>
                    </Tooltip>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
}

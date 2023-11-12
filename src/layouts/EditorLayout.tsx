import { useEffect, useState } from 'react';
import {
  Layout,
  Drawer,
  Button,
  Tooltip,
  Modal,
  Popconfirm,
  Table,
  message,
} from 'antd';
import { connect } from 'umi';
import dayjs from 'dayjs';
import Quill from 'quill';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { orderBy } from 'lodash';

import WorkspaceHeader from '@/components/WorkspaceHeader';
import Comment from '@/pages/editor/components/Comment';
import { db, editor } from '@/pages/editor/Editor';
import { noLoginError } from '@/utils/request';
import style from './EditorLayout.less';

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

export const drawerPlacement = window.isMobile ? 'bottom' : 'right';
export const drawerWidth = window.isMobile ? '100vw' : 450;
export const commentListHeight = window.isMobile
  ? 'calc(((100%)) - 178px)'
  : 'calc(100vh - 24px * 2 - 55px - 178px)';
const { Header, Content } = Layout;

interface IWorkspaceLayoutProps {
  children: JSX.Element;
}

function bytes(str) {
  var count = str.length;
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      count++;
    }
  }
  return count;
}

function EditorLayout({
  children,
  user,
  editor: editorInfo,
}: IWorkspaceLayoutProps) {
  const [visible, setVisible] = useState(false);
  const [visibleHistory, setVisibleHistory] = useState(false);
  const [visibleEditor, setVisibleEditor] = useState(false);
  const [curCommit, setCurCommit] = useState({});
  const [commitList, setCommitList] = useState<any>([]);

  const columns = [
    {
      title: '时间',
      dataIndex: 'date',
      align: 'center',
      key: 'date',
      render: (time) => (
        <Tooltip title={dayjs(time).format('YYYY-MM-DD HH:mm:ss')}>
          {<span style={{ cursor: 'pointer' }}>{dayjs(time).fromNow()}</span>}
        </Tooltip>
      ),
    },
    {
      title: '大小',
      align: 'center',
      dataIndex: 'size',
      key: 'size',
      render: (size) => Math.floor(size) + ' KB',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setCurCommit(record);
              setVisibleEditor(true);
            }}
          >
            预览
          </Button>
          <Popconfirm
            title="确认还原"
            onConfirm={() => {
              recover(record.content.ops);
              setVisibleEditor(false);
            }}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small">
              还原
            </Button>
          </Popconfirm>
          <Button
            type="link"
            size="small"
            danger
            onClick={async () => {
              await db.delete('doc-commit', record.id);
              const commitList = await getAllCommit();
              setCommitList(commitList);
              message.success('已删除该文档版本');
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  async function getAllCommit() {
    if (!user.id) {
      noLoginError();
      return;
    }
    const keys = await db.getAllKeys('doc-commit');
    const values = await db.getAll('doc-commit');

    return orderBy(
      values
        .map((item, index) => ({
          ...item,
          id: keys[index],
          size: bytes(JSON.stringify(item?.content)) / 1024,
        }))
        .filter(
          ({ fileId, owner }) =>
            fileId === editorInfo.docInfo.id && owner === user.id,
        ),
      ['date'],
      ['desc'],
    );
  }

  function recover(commit) {
    editor.quill.setContents(commit);
    message.success('还原成功');
    setVisibleHistory(false);
  }

  return (
    <Layout className={style.Layout}>
      <Header className={style.Header}>
        <WorkspaceHeader
          buttons={
            <>
              <Button
                disabled={!editorInfo.docInfo.id}
                onClick={async () => {
                  const commitList = await getAllCommit();
                  setCommitList(commitList);
                  setVisibleHistory(true);
                }}
              >
                版本管理
              </Button>
              <Button
                disabled={!editorInfo.docInfo.id}
                onClick={() => setVisible(true)}
              >
                评论
              </Button>
            </>
          }
        />
      </Header>
      <Layout>
        <Content className={style.Content}>{children}</Content>
        <Drawer
          destroyOnClose
          width={drawerWidth}
          height={'70vh'}
          title="评论"
          placement={drawerPlacement}
          closable
          onClose={() => setVisible(false)}
          visible={visible}
        >
          <Comment docInfo={editorInfo.docInfo} user={user} />
        </Drawer>
        <Drawer
          placement={drawerPlacement}
          style={{ padding: 0 }}
          destroyOnClose
          closable
          width={drawerWidth}
          height="70vh"
          title="版本管理"
          onClose={() => {
            setVisibleHistory(false);
          }}
          visible={visibleHistory}
        >
          <Table
            columns={columns}
            size="small"
            dataSource={commitList}
            pagination={false}
            scroll={{ y: 'calc(100vh - 55px - 48px)' }}
          />
        </Drawer>
        <Modal
          title={dayjs(curCommit.date).format('YYYY-MM-DD HH:mm:ss')}
          visible={visibleEditor}
          destroyOnClose
          closable={false}
          width={drawerWidth}
          onOk={() => {
            recover(curCommit.content.ops);
            setVisibleEditor(false);
          }}
          okText="恢复"
          onCancel={() => setVisibleEditor(false)}
        >
          <EditorModal content={curCommit.content} />
        </Modal>
      </Layout>
    </Layout>
  );
}

function EditorModal({ content }) {
  useEffect(() => {
    var quill = new Quill('#editor-modal');
    quill.enable(false);
    quill.setContents(content);
  }, []);

  return (
    <div
      id="editor-modal"
      style={{
        height: '60vh',
        overflowY: 'auto',
        border: '1px solid #ddd',
        fontSize: 18,
      }}
    ></div>
  );
}

export default connect(({ login, editor }) => ({
  token: login.token,
  user: login.user,
  editor,
}))(EditorLayout);

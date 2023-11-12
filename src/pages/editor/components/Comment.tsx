import {
  Comment,
  Tooltip,
  List,
  Form,
  Input,
  Button,
  Space,
  Drawer,
  Empty,
  Tag,
  message,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import {
  createComment,
  queryComments,
  queryReplyList,
  deleteComment,
} from '@/api/comment';
import { CustomAvatar } from '@/components/WorkspaceHeader';
import {
  drawerWidth,
  drawerPlacement,
  commentListHeight,
} from '@/layouts/EditorLayout';

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

const Editor = forwardRef(
  ({ groupId, parentId, onLoad, reply, docInfo }, ref) => {
    const inputRef = useRef<any>();

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current.focus();
      },
    }));

    return (
      <>
        <Form.Item>
          <Input.TextArea
            placeholder="请输入评论内容"
            maxLength={250}
            showCount
            ref={inputRef}
            rows={4}
          />
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            onClick={() => {
              if (!docInfo.permission.commentable) {
                message.error('无评论权限！');
                return;
              }
              const content = inputRef.current.resizableTextArea.props.value?.trim();
              if (!content) {
                message.error('评论内容不能为空');
                return;
              }
              createComment({
                groupId,
                parentId,
                replyId: reply?.id,
                content,
              })
                .then(() => {
                  message.success('评论成功');
                  onLoad();
                })
                .catch(() => message.error('评论失败！'));
            }}
            type="primary"
          >
            确认
          </Button>
        </Form.Item>
      </>
    );
  },
);

const actionButtonStyle = {
  padding: '1px 2px',
};

function DeleteButton({ commentId, setIsLoading }) {
  return (
    <Button
      type="text"
      danger
      style={actionButtonStyle}
      onClick={() => {
        deleteComment({ commentId })
          .then(() => {
            message.success('已删除该评论');
            setIsLoading(true);
          })
          .catch(() => message.error('删除评论失败！'));
      }}
    >
      删除
    </Button>
  );
}

export default function CommentContainer({ docInfo, user }) {
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [currentComment, setCurrentComment] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef();
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const fileId = docInfo.id;

  useEffect(() => {
    queryComments({ groupId: fileId })
      .then((res) => {
        setComments(res.comments);
        setCommentCount(res.count);
      })
      .finally(() => setIsLoading(false));
  }, [isLoading]);

  function openSubCommentDrawer(comment) {
    setCurrentComment(comment);
    setVisibleDrawer(true);
  }

  return (
    <>
      <List
        style={{
          height: commentListHeight,
          overflowY: 'auto',
        }}
        header={`共 ${commentCount} 个评论`}
        itemLayout="horizontal"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无评论"
            />
          ),
        }}
        loading={isLoading}
        dataSource={comments.map((comment) => ({
          actions: [
            <Space size={5}>
              <Button
                type="text"
                style={actionButtonStyle}
                onClick={() => openSubCommentDrawer(comment)}
              >
                回复
              </Button>
              <Button
                type="text"
                style={actionButtonStyle}
                onClick={() => openSubCommentDrawer(comment)}
              >
                查看所有回复
              </Button>
              {user?.id === comment.owner.id && (
                <DeleteButton
                  commentId={comment.id}
                  setIsLoading={setIsLoading}
                />
              )}
            </Space>,
          ],
          author: comment.owner.nickname,
          avatar: <CustomAvatar user={comment.owner} size={32} />,
          content: <p>{comment.content}</p>,
          datetime: (
            <Tooltip
              title={dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
            >
              <span>{dayjs(comment.created_at).fromNow()}</span>
            </Tooltip>
          ),
        }))}
        renderItem={(item) => (
          <li>
            <Comment
              actions={item.actions}
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              datetime={item.datetime}
            />
          </li>
        )}
      />
      <Drawer
        destroyOnClose
        width={drawerWidth}
        height="70vh"
        title="所有回复"
        placement={drawerPlacement}
        closable
        onClose={() => setVisibleDrawer(false)}
        visible={visibleDrawer}
      >
        <SubContainer
          groupId={fileId}
          parentComment={currentComment}
          user={user}
          docInfo={docInfo}
        />
      </Drawer>
      <div style={{ position: 'absolute', bottom: 0, left: 10, right: 10 }}>
        <Editor
          ref={inputRef}
          groupId={fileId}
          parentId={fileId}
          docInfo={docInfo}
          onLoad={() => setIsLoading(true)}
        />
      </div>
    </>
  );
}

function SubContainer({ groupId, parentComment, user, docInfo }) {
  const inputRef = useRef();
  const [reply, setReply] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    queryReplyList({ commentId: parentComment.id })
      .then((res) => {
        setComments(res.comments);
      })
      .finally(() => setIsLoading(false));
  }, [isLoading]);

  return (
    <>
      <List
        style={{
          height: commentListHeight,
          overflowY: 'auto',
        }}
        header={`${parentComment.owner.nickname}: ${parentComment.content}`}
        itemLayout="horizontal"
        loading={isLoading}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无评论"
            />
          ),
        }}
        dataSource={comments.map((comment) => ({
          actions: [
            <Space>
              <Button
                type="text"
                style={actionButtonStyle}
                onClick={() => {
                  setReply({ id: comment.id, owner: comment.owner });
                  inputRef.current?.focus();
                }}
              >
                回复
              </Button>
              {user?.id === comment.owner.id && (
                <DeleteButton
                  commentId={comment.id}
                  setIsLoading={setIsLoading}
                />
              )}
            </Space>,
          ],
          author: comment.owner.nickname,
          avatar: (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {comment.reply && (
                <Tooltip title={comment.reply.owner.nickname}>
                  <Button
                    type="link"
                    className="ellipsis"
                    size="small"
                    style={{ width: '3em', marginBottom: 5, padding: 0 }}
                  >
                    @{comment.reply.owner.nickname}
                  </Button>
                </Tooltip>
              )}
              <CustomAvatar user={comment.owner} size={32} />
            </div>
          ),
          content: <p>{comment.content}</p>,
          datetime: (
            <Tooltip
              title={dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
            >
              <span>{dayjs(comment.created_at).fromNow()}</span>
            </Tooltip>
          ),
        }))}
        renderItem={(item) => (
          <li>
            <Comment
              actions={item.actions}
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              datetime={item.datetime}
            />
          </li>
        )}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 10,
          right: 10,
        }}
      >
        <Tag
          closable
          style={{
            marginBottom: 10,
          }}
          visible={!!reply.id}
          color="blue"
          onClose={() => setReply({})}
        >
          @{reply.owner?.nickname}
        </Tag>
        <Editor
          ref={inputRef}
          groupId={groupId}
          parentId={parentComment.id}
          reply={reply}
          docInfo={docInfo}
          onLoad={() => setIsLoading(true)}
        />
      </div>
    </>
  );
}

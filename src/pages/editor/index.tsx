import { useEffect, useState } from 'react';
import EditorLayout from '@/layouts/EditorLayout';
import { useParams } from 'umi';
import { Spin, Result } from 'antd';
import { getFileById } from '@/api/file';
import { connect } from 'umi';

import Editor from './Editor';

function EditorWrapper(props) {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [docInfo, setDocInfo] = useState({});
  const [error, setError] = useState(false);

  useEffect(() => {
    getFileById({ id }).then((res) => {
      if (res.file.permission.readable) {
        setDocInfo(res.file);
        setLoading(false);
        props.dispatch({
          type: 'editor/changeDocInfo',
          payload: res.file,
        });
      } else setError(true);
    });
  }, []);

  return error ? (
    <Result status="warning" title="抱歉，您无权访问此页面。" />
  ) : (
    <Spin spinning={loading}>
      {!loading && <Editor docInfo={docInfo} user={props.user} />}
    </Spin>
  );
}

export default connect(({ login }) => ({
  token: login.token,
  user: login.user,
}))(EditorWrapper);

import { useEffect, useRef, useState } from 'react';
import '@/lib/editor/modules/task-list';
import ReconnectingWebSocket from 'reconnecting-websocket';
import ShareDB from 'sharedb/lib/client';
import richText from 'rich-text';
import { Input, Divider, notification, message } from 'antd';
import chroma from 'chroma-js';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import { v4 as uuidv4 } from 'uuid';

import Editor from '@/lib/editor';
import EditorEvents from '@/lib/editor/editor-events';
import 'quill/dist/quill.snow.css';
import './Editor.less';
import ToolBar from './components/ToolBar';
import { useDebounceFn, useInterval } from 'ahooks';
import { updateFile } from '@/api/file';
import { uploadImage } from '@/api/editor';
import { getUserInfoById } from '@/api/user';

ShareDB.types.register(richText.type);

// hljs.configure({   // optionally configure hljs
//   languages: ['javascript', 'ruby', 'python']
// });

const COLLECTION_NAME = 'docs';

interface DB extends DBSchema {
  'doc-commit': {
    key: string;
    value: {
      date: number;
      content: object;
      owner: string;
      fileId: string;
    };
  };
}

let editorOptions: any = {
  authorship: {
    authorColor: '#1890ff',
    colors: Array.from({ length: 20 }, () => chroma.random()),
    handlers: {
      getAuthorInfoById: (authorId: any) => {
        return getUserInfoById({ id: authorId }).then((res) => res.user);
      },
    },
  },
  image: {
    handlers: {
      imageDataURIUpload: async (file) => {
        const data = new FormData();
        data.append('file', file);
        const res = await uploadImage(data);

        return Promise.resolve(res.imgUrl);
      },
      imageSrcUpload: (src: any) => {
        return new Promise((resolve) => {
          resolve(src);
        });
      },
      imageUploadError: (err: any) => {
        message.error('图片上传失败！');
        console.log('image upload error: ' + err);
      },
    },
  },
};

export let editor: any;

export let db: IDBPDatabase<DB>;

export async function saveDocToLocal(owner, fileId) {
  const keys = await db.getAllKeys('doc-commit');
  const oldContent = keys[keys.length - 1]
    ? (await db.get('doc-commit', keys[keys.length - 1]))?.content
    : {};
  const content = editor.quill.getContents();

  const isEqual = JSON.stringify(content) === JSON.stringify(oldContent);
  if (!isEqual)
    await db.put(
      'doc-commit',
      {
        date: Date.now(),
        content,
        owner,
        fileId,
      },
      uuidv4(),
    );
}

(async function name() {
  db = await openDB<DB>('editor', undefined, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore('doc-commit');
    },
    blocked() {},
    blocking() {},
    terminated() {},
  });
})();

let isContentChanged = false;

function EditorPage(props: { docInfo: any; user: any }) {
  const [docInfo, setDocInfo] = useState({});
  const { id: docID } = props.docInfo;

  useEffect(() => {
    document.title = `${props.docInfo.name || '无标题'}-实时协同编辑器`;
    setDocInfo(props.docInfo);
    return () => {
      document.title = '实时协同编辑器';
    };
  }, [props.docInfo]);

  useInterval(() => {
    handleUnLoad();
  }, 1000 * 60 * 5);

  function handleUnLoad() {
    if (isContentChanged) saveDocToLocal(props.user.id, props.docInfo.id);
  }

  useEffect(() => {
    window.addEventListener('unload', handleUnLoad);
    editorOptions.authorship.author = props.user;
    isContentChanged = false;
    editor = new Editor('#container', editorOptions, {
      modules: {
        toolbar: '#toolbar',
        'task-list': true,
      },
      theme: 'snow',
    });

    editor.on(EditorEvents.editorTextChanged, ({ oldDelta }) => {
      if (!(oldDelta.ops.length === 1 && oldDelta.ops[0].insert === '\n'))
        isContentChanged = true;
    });

    editor.on(EditorEvents.documentLoaded, () => {
      console.log('document loaded');
    });

    editor.on(EditorEvents.synchronizationError, async (err: any) => {
      console.log('connection error:', err);
    });

    editor.quill.on('selection-change', function (range: any) {
      console.log('selection-change');
      // if (range) {
      //   console.log(editor.quill.getFormat(range.index, range.length));
      // }
    });

    if (!props.docInfo?.permission?.editable) {
      editor.quill.enable(false);
    }

    const websocketEndpoint =
      process.env.NODE_ENV === 'development'
        ? 'ws://127.0.0.1:8080'
        : 'wss://editor.fastools.cn/api/';

    editor.syncThroughWebsocket(websocketEndpoint, COLLECTION_NAME, docID);

    const socket = new ReconnectingWebSocket(websocketEndpoint);
    const connection = new ShareDB.Connection(socket);

    const doc = connection.get(COLLECTION_NAME, docID);
    let socketError = false;
    socket.onerror = function () {
      socketError = true;
      notification.error({
        key: 'socket',
        message: '警告',
        description: '当前网络异常，已禁止修改文档，请检查网络！',
      });
      editor.quill.enable(false);
      handleUnLoad();
    };

    socket.onmessage = () => {
      if (socketError) {
        notification.success({
          key: 'socket',
          message: '提示',
          description: '网络已恢复正常',
        });
        editor.quill.enable(true);
        socketError = false;
      }
    };
    doc.fetch((err: any) => {
      if (err) {
        console.log(err);
        return;
      }

      doc.destroy();
    });
    return () => {
      console.log('exit editor');
      connection.close();
      editor.close();
      handleUnLoad();
      window.removeEventListener('unload', handleUnLoad);
    };
  }, []);

  const { run: handleChangeName } = useDebounceFn(
    (e) => {
      const name = e.target.value ?? '';
      updateFile({
        id: docID,
        name,
      });
    },
    {
      wait: 500,
    },
  );

  return (
    <div className="page">
      <div id="toolbar">
        <ToolBar />
      </div>
      <div
        className="editor"
        style={{
          userSelect: props.docInfo?.permission?.copyable ? 'auto' : 'none',
        }}
      >
        <Input
          className="input-title"
          value={docInfo.name}
          placeholder="无标题"
          bordered={false}
          disabled={!props.docInfo.permission.editable}
          onChange={(e) => {
            handleChangeName(e);
            setDocInfo({ ...docInfo, name: e.target.value ?? '' });
          }}
        />
        <Divider />
        <div
          className="editor-container"
          id="container"
          onClick={() => {
            if (!props.docInfo.permission.editable)
              message.error('无编辑权限！');
          }}
        ></div>
      </div>
    </div>
  );
}

export default EditorPage;

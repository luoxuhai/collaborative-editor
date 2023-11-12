import { useEffect, useState } from 'react';
import '@/lib/editor/modules/task-list';
import ReconnectingWebSocket from 'reconnecting-websocket';
import ShareDB from 'sharedb/lib/client';
import richText from 'rich-text';
import {
  Dropdown,
  IDropdownStyles,
  IDropdownOption,
} from 'office-ui-fabric-react/lib/Dropdown';
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import Editor from '@/lib/editor';
import EditorEvents from '@/lib/editor/editor-events';
import 'quill/dist/quill.snow.css';
import './Editor.css';
import { BoldIcon } from '@fluentui/react-icons';
import ToolBar from './ToolBar';

ShareDB.types.register(richText.type);

const options: IDropdownOption[] = [
  {
    key: '1',
    text: 'A',
  },
  { key: '2', text: 'B' },
  { key: '3', text: 'C' },
  { key: '4', text: 'D' },
  { key: '5', text: 'E' },
];

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 100 },
};

let authors = [
  {
    id: '1',
    name: 'A',
  },
  {
    id: '2',
    name: 'B',
  },
  {
    id: '3',
    name: 'C',
  },
  {
    id: '4',
    name: 'D',
  },
  {
    id: '5',
    name: 'E',
  },
];

let testUrl = 'https://s1.ax1x.com/2020/10/08/00DCwQ.png';

let editorOptions: any = {
  authorship: {
    authorColor: '#ed5634',
    colors: ['#8e6ed5'],
    handlers: {
      getAuthorInfoById: (authorId: any) => {
        return new Promise((resolve, reject) => {
          let author = authors.find((a) => a.id === authorId);

          if (author) {
            resolve(author);
          } else {
            reject('user not found: ' + authorId);
          }
        });
      },
    },
  },
  image: {
    handlers: {
      imageDataURIUpload: (dataURI: any) => {
        return new Promise((resolve) => {
          resolve(testUrl);
        });
      },
      imageSrcUpload: (src: any) => {
        return new Promise((resolve) => {
          resolve(testUrl);
        });
      },
      imageUploadError: (err: any) => {
        console.log('image upload error: ' + err);
      },
    },
  },
};

let toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'],
  [{ list: 'ordered' }, { list: 'bullet' }, 'task-list'],
];

let quillOptions = {
  modules: {
    toolbar: '#toolbar',
    'task-list': true,
  },
  theme: 'snow',
};

let editor: any;
function EditorPage() {
  const [curAuthor, setCurAuthor] = useState(window.name || '1');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    console.log('useEffect');
    editorOptions.authorship.author = authors.find(
      (item) => item.id === curAuthor,
    );
    editor = new Editor('#container', editorOptions, quillOptions);

    editor.on(EditorEvents.imageSkipped, () => {
      console.log('image skipped');
    });

    editor.on(EditorEvents.documentLoaded, () => {
      console.log('document loaded');
    });

    editor.on(EditorEvents.synchronizationError, (err: any) => {
      console.log('connection error');
      console.log(err);
    });

    editor.quill.on('selection-change', function (range: any) {
      if (range) {
        console.log(editor.quill.getFormat(range.index, range.length));
      }
    });

    const websocketEndpoint = 'ws://127.0.0.1:8080';

    editor.syncThroughWebsocket(websocketEndpoint, 'examples', 'test-doc');

    const socket: any = new ReconnectingWebSocket(websocketEndpoint);
    const connection = new ShareDB.Connection(socket);
    const doc = connection.get('examples', 'test-doc');

    doc.fetch((err: any) => {
      if (err) {
        console.log(err);
        return;
      }

      doc.destroy();
      socket.close();
    });
  }, []);

  return (
    <div className="page">
      <h1>{t('title')}</h1>
      <Dropdown
        label="当前用户"
        options={options}
        styles={dropdownStyles}
        selectedKey={curAuthor}
        onChange={(e, _, index) => {
          setCurAuthor(authors[index || 0].id);
          window.name = authors[index || 0].id;
          window.location.reload();
        }}
      />
      <Dropdown
        label="切换语言"
        options={[
          {
            key: 'zh',
            text: '中文',
          },
          {
            key: 'en',
            text: '英文',
          },
        ]}
        styles={dropdownStyles}
        onChange={(e, _, index) => {
          index === 0 ? i18n.changeLanguage('zh') : i18n.changeLanguage('en');
        }}
      />
      <div id="toolbar">
        <ToolBar />
        <button className="ql-script" value="sub"></button>
        <button className="ql-script" value="super"></button>
      </div>
      <div
        className="editor"
        style={{
          overflow: 'auto',
          height: '100%',
        }}
      >
        <div className="editor-container" id="container"></div>
      </div>
    </div>
  );
}

export default EditorPage;

import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.core.css';
import Authorship from './authorship';
import ImageHandlers from './image-handlers';
import Composition from './composition';
import shareDB from 'sharedb/lib/client';
import richText from 'rich-text';
import lodashObject from 'lodash/fp/object';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import ImagePlaceholder from './blot/image-placeholder';
import Synchronizer from './synchronizer';
import History from './modules/history';
import MiksClipboard from './modules/miks-clipboard';

shareDB.types.register(richText.type);

Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
Quill.register(ImagePlaceholder);
Quill.register('modules/history', History);
Quill.register('modules/clipboard', MiksClipboard);

const Size = Quill.import('attributors/style/size');
Size.whitelist = [
  '10pt',
  '11pt',
  '12pt',
  '13pt',
  '14pt',
  '16pt',
  '18pt',
  '20pt',
  '22pt',
  '24pt',
  '30pt',
  '36pt',
];
Quill.register(Size, true);

// For icons of header value 3
const icons = Quill.import('ui/icons');
// eslint-disable-next-line import/no-webpack-loader-syntax
icons['header'][3] = require('quill/assets/icons/header-3.svg');

class Editor {
  constructor(container, editorOptions, quillOptions) {
    this.options = editorOptions;
    this.eventHandlers = {};

    this.imageHandlers = new ImageHandlers(this);

    let options = this.mergeQuillOptions(quillOptions);
    this.quill = new Quill(container, options);
    this.composition = new Composition(this);
    this.synchronizer = new Synchronizer(this, this.composition);
    this.composition.setSynchronizer(this.synchronizer);

    this.authorship = new Authorship(
      this,
      this.composition,
      editorOptions.authorship || {},
    );

    // Add image upload toolbar button handler
    this.quill
      .getModule('toolbar')
      .addHandler('image', this.imageHandlers.imageUploadButtonHandler);

    // Initialize clipboard module
    this.quill.getModule('clipboard').setEditor(this);
  }

  mergeQuillOptions(options) {
    let self = this;

    return lodashObject.merge(options, {
      modules: {
        imageDropAndPaste: {
          handler: self.imageHandlers.imageDropAndPasteHandler,
        },
      },
    });
  }

  syncThroughWebsocket(endpoint, collection, docId) {
    this.composition.clear();
    return this.synchronizer.syncThroughWebsocket(endpoint, collection, docId);
  }

  quill() {
    return this.quill;
  }

  getEditorContents() {
    return this.composition.getEditorContents();
  }

  on(event, handler) {
    let handlerId = Math.ceil(Math.random() * 10000);

    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = {};
    }

    this.eventHandlers[event][handlerId] = handler;

    return handlerId;
  }

  off(event, handlerId) {
    if (this.eventHandlers[event] && this.eventHandlers[event][handlerId]) {
      delete this.eventHandlers[event][handlerId];
    }
  }

  dispatchEvent(event, payload) {
    if (this.eventHandlers[event]) {
      Object.keys(this.eventHandlers[event]).forEach((handlerId) => {
        let handler = this.eventHandlers[event][handlerId];
        handler(payload);
      });
    }
  }

  update() {
    this.quill.update();
  }

  close() {
    this.eventHandlers = {};
    this.synchronizer.close();
  }
}

export default Editor;

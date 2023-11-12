import style from './ToolBar.less';
import { Space, Divider } from 'antd';

function ToolBar() {
  return (
    <div className={style.ToolBar}>
      <div>
        <select className="ql-header">
          <option value="1">一级标题</option>
          <option value="2">二级标题</option>
          <option value="3">三级标题</option>
          <option value="4">四级标题</option>
          <option value="5">五级标题</option>
          <option value="6">六级标题</option>
        </select>
        <select className="ql-font"></select>
        <select className="ql-size" style={{ width: 55 }}>
          <option value="10pt">10</option>
          <option value="11pt">11</option>
          <option value="12pt">12</option>
          <option value="13pt">13</option>
          <option value="14pt" selected>
            14
          </option>
          <option value="16pt">16</option>
          <option value="18pt">18</option>
          <option value="20pt">20</option>
          <option value="22pt">22</option>
          <option value="24pt">24</option>
          <option value="30pt">30</option>
          <option value="36pt">36</option>
        </select>
      </div>
      <Divider type="vertical" />
      <div>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
        <select className="ql-color"></select>
        <select className="ql-background"></select>
      </div>
      <Divider type="vertical" />
      <div>
        <button className="ql-code"></button>
        <button className="ql-blockquote"></button>
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
        <select className="ql-align"></select>
      </div>
      <Divider type="vertical" />
      <div>
        <button className="ql-link"></button>
        <button className="ql-image"></button>
        <button className="ql-code-block"></button>
        <button className="ql-script" value="sub"></button>
        <button className="ql-script" value="super"></button>
        <button className="ql-list" value="task-list"></button>
      </div>
    </div>
  );
}

export default ToolBar;

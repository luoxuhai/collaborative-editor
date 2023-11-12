import { Row, Col, Breadcrumb, Tooltip } from 'antd';
import { Link } from 'umi';

export default function PageHeader({ breadcrumbs, extra }) {
  return (
    <Row style={{ padding: 20 }} align="middle">
      <Col span={12}>
        <Breadcrumb>
          {breadcrumbs?.map((item) => (
            <Breadcrumb.Item>
              <Tooltip title={item.title}>
                <Link to={item.url}>{item.title}</Link>
              </Tooltip>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </Col>
      <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {extra}
      </Col>
    </Row>
  );
}

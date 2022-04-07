/**
 * 审批流展示页面-入口
 */
import React, { useState } from 'react';
import {
  Button,
  Space,
} from 'antd';

import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import dataObj from './mock.js';


import NodeBox from './components/nodeBox';
import Style from './index.module.less';

const WorkFlowIndex = () => {
  // 渲染成表单的源数据
  const [dataSource, setDataSource] = useState(dataObj);
  // 缩放比例
  const [scale, setScale] = useState(100);

  // 变小
  const onChangeSmall = () => {
    setScale(scale - 10);
  };

  // 变大
  const onChangeBig = () => {
    setScale(scale + 10);
  };

  const topFixedElement = (
    <Space>
      <Button icon={<MinusOutlined />} onClick={onChangeSmall} />
      <Button icon={<PlusOutlined />} onClick={onChangeBig} />
      当前缩放比例：{scale} %
    </Space>
  );

  return (
    <div className={Style['page-wrap']}>
      <div className={Style['header-operate']}>{topFixedElement}</div>
      <div className={Style['workflow-wrap']} style={{ transform: `scale(${scale / 100})` }}>
        <div className={Style['start-flag']}>开始</div>
        <NodeBox currentData={dataSource} dataSource={dataSource} onSetDataSource={setDataSource} />
        <div className={Style['last-node-box-wrap']}>
          <div className={Style['last-node-box-circle']} />
          <div className={Style['last-node-box-text']}>流程结束</div>
        </div>
      </div>
    </div>
  );
};

export default WorkFlowIndex;

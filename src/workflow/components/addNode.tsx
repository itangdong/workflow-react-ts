/**
 * 审批流组件 - 添加节点组件
 */
import React from 'react';
import { PlusCircleTwoTone } from '@ant-design/icons';

import Style from './index.module.less';

const AddNode = ({ parentNodeData, dataSource, onSetDataSource }: any) => {
  // 寻找nodeId
  const loopFn = (arr: any, id: any) => {
    arr.forEach((item: any) => {
      // 找到了这个节点就开始添加新的子节点
      if (item.nodeId === id) {
        const oldNode = item.childNode;
        item.childNode = {
          nodeId: +new Date(),
          nodeName: '审核人',
          type: 1,
          childNode: oldNode,
        };
      } else if (item.childNode) {
        // 当前节点不是目标节点，但是有子节点，则继续遍历子节点
        loopFn([item.childNode], id);
      }
      // 当前节点不是目标节点，但是有条件节点，则继续遍历条件节点
      if (item.nodeId !== id && item.conditionNodes && item.conditionNodes.length > 0) {
        loopFn(item.conditionNodes, id);
      }
    });
    return arr;
  };

  // 点击添加节点
  const onAddNode = () => {
    const { nodeId } = parentNodeData;
    const result = loopFn([dataSource], nodeId)[0];
    onSetDataSource(JSON.parse(JSON.stringify(result)));
  };

  return (
    <div className={Style['add-node-btn-box']}>
      <div className={Style['add-node-btn']}>
        <PlusCircleTwoTone className={Style['create-btn']} onClick={onAddNode} />
      </div>
    </div>
  );
};

export default AddNode;

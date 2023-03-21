/**
 * 审批流组件 - 节点组件
 */
import React, { useRef } from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';

import AddNode from './addNode';

import Style from './index.module.less';

const NodeBox = ({ currentData, dataSource, onSetDataSource }: any) => {
  const normalNodeId = useRef(0);
  // 找到普通节点并把它删除掉(非条件节点)
  const removeNormalNodeFn = (arr: any, id: any) => {
    arr.forEach((item: any) => {
      // 找到了这个节点就开始添加新的子节点
      // item的子节点nodeId匹配上了，那么就是要删除这个子节点，item的child指向子节点的子节点
      if (item.childNode && item.childNode.nodeId === id) {
        item.childNode = item.childNode.childNode;
      } else if (item.childNode) {
        // 当前节点不是目标节点，但是有子节点，则继续遍历子节点
        removeNormalNodeFn([item.childNode], id);
      }
      // 当前节点不是目标节点，但是有条件节点，则继续遍历条件节点
      if ((item.childNode && item.childNode.nodeId) !== id && item.conditionNodes
        && item.conditionNodes.length > 0) {
        removeNormalNodeFn(item.conditionNodes, id);
      }
    });
    return arr;
  };

  // 找到条件节点把它删除
  const removeConditionNodeFn = (arr: any, id: any) => {
    arr.forEach((item: any) => {
      let flag =  true;
      if (item.conditionNodes && item.conditionNodes.length > 0 && flag) {
        // 在条件列表中找到目标条件节点的索引
        const findIndex = item.conditionNodes.findIndex(
          (conditionItem: any) => conditionItem.nodeId === id,
        );
        // 如果找到了这个节点，则不需要再往下遍历了
        if (findIndex !== -1) {
          flag = false;
          // 如果条件节点只有2个，那么删除掉一个，则要删除的不光是条件节点，而是整个路由节点
          if (item.conditionNodes.length === 2) {
            normalNodeId.current = item.nodeId;
          } else {
            // 条件有多个，直接删除这一个
            item.conditionNodes.splice(findIndex, 1);
          }
        }
      }
      if (item.childNode && flag) {
        removeConditionNodeFn([item.childNode], id);
      }
      // 需要删除的条件节点，可能在条件节点下
      if (item.conditionNodes?.length && flag) {
        removeConditionNodeFn(item.conditionNodes, id);
      }
    });
    return arr;
  };

  // 点击添加条件按钮
  const onAddCondition = () => {
    const { nodeId } = currentData;
    const addConditionFn = (arr: any, id: number) => {
      arr.forEach((item: any) => {
        // 找到对应路由节点
        console.log(item.nodeId)
        if (item.nodeId === id) {
          return item.conditionNodes.push({
            nodeName: '条件N',
            type: 3,
            nodeId: +new Date(),
            conditionList: [],
            nodeUserList: [],
            conditionNodes: [],
            childNode: null,
          });
        } 
        if (item.childNode) {
          addConditionFn([item.childNode], id);
        }
        // 条件节点下可能直接还是条件节点
        if (item.conditionNodes?.length) {
          addConditionFn(item.conditionNodes, id);
        }
      });
      return arr;
    };
    const [result] = addConditionFn([dataSource], nodeId);
    // 刷新state
    onSetDataSource(JSON.parse(JSON.stringify(result)));
  };

  // 渲染一般节点(非路由节点)
  const renderNormalNode = (normalNodeData: any) => {
    // 删除节点
    const onDeleteCard = () => {
      const { nodeId, type } = normalNodeData;
      // 最终需要渲染的结果数据
      let result = {};
      // 如果是删除的是条件节点，则需要从它的父节点的conditionList中删除它
      // 并且判断如果只有2个条件，删除了一个，那么父节点的conditionList直接置空
      if (type === 3) {
        // 删除条件节点并得到最终删除后的数据
        [result] = removeConditionNodeFn([dataSource], nodeId);
        // normalNodeId.current 如果有值，则说明需要删除的是路由节点(没有值则说明是删除的是路由节点下的某一个条件节点)
        if (normalNodeId.current) {
          [result] = removeNormalNodeFn([dataSource], normalNodeId.current);
          normalNodeId.current = 0;
        }
      } else {
        // 删除的是普通节点并得到最终删除后的数据
        [result] = removeNormalNodeFn([dataSource], nodeId);
      }
      // 刷新state
      onSetDataSource(JSON.parse(JSON.stringify(result)));
    };
    // 基础样式
    let computedClass = Style['node-title'];
    // 发起人
    if (normalNodeData.type === 0) {
      computedClass = `${computedClass} ${Style['initiator']}`;
    }
    // 审批人
    if (normalNodeData.type === 1) {
      computedClass = `${computedClass} ${Style['auditor']}`;
    }
    // 抄送人
    if (normalNodeData.type === 2) {
      computedClass = `${computedClass} ${Style['copy']}`;
    }
    // 条件
    if (normalNodeData.type === 3) {
      computedClass = `${computedClass} ${Style['condition']}`;
    }

    return (
      <div className={Style['node-wrap']}>
        <div className={Style['node-card']}>
          <div className={computedClass}>
            <span>{normalNodeData.nodeName}</span>
            {
              normalNodeData.type !== 0
                ? <CloseCircleOutlined className={Style['node-close-icon']} onClick={onDeleteCard} />
                : null
            }
          </div>
        </div>
        {/* 添加子节点 */}
        <AddNode
          parentNodeData={normalNodeData}
          dataSource={dataSource}
          onSetDataSource={onSetDataSource}
        />
      </div>
    );
  };

  // 渲染遮盖线条
  const renderLineDom = (index: number) => {
    // 如果是渲染的第一个节点，则遮盖住左上与左下两条边线
    if (index === 0) {
      return (
        <>
          <div className={Style['top-left-cover-line']} />
          <div className={Style['bottom-left-cover-line']} />
        </>
      );
    }
    // 如果渲染的是最后一个节点，则遮盖住右上与右下两条边线
    if (index === currentData.conditionNodes.length - 1) {
      return (
        <>
          <div className={Style['top-right-cover-line']} />
          <div className={Style['bottom-right-cover-line']} />
        </>
      );
    }
    return null;
  };

  // 渲染路由节点
  const renderRouteNode = () => (
    <div className={Style['route-node-wrap']}>
      {/* 条件分支节点 */}
      <div className={Style['branch-wrap']}>
        <div className={Style['add-branch-btn']} role="none" onClick={onAddCondition}>添加条件</div>
        {/* 渲染多列条件节点 */}
        {
          currentData.conditionNodes.map((item: any, index: number) => (
            // 路由节点整个包裹dom元素
            <div className={Style['col-box']} key={item.nodeId}>
              {/* 条件节点 */}
              <div className={Style['condition-node']}>
                {/* 每一个条件 */}
                <div className={Style['condition-node-card']}>
                  {/* 条件盒子里面的节点 */}
                  {
                    renderNormalNode(item)
                  }
                </div>
              </div>
              {/* 条件节后面可以是任意节点，所以自调用本组件 */}
              {
                item.childNode
                  ? (
                    <NodeBox
                      currentData={item.childNode}
                      dataSource={dataSource}
                      onSetDataSource={onSetDataSource}
                    />
                  )
                  : null
              }
              {/* 渲染遮盖线条，需要遮盖住四个角的边线 */}
              {renderLineDom(index)}
            </div>
          ))
        }
      </div>
      {/* 添加子节点 */}
      <AddNode
        parentNodeData={currentData}
        dataSource={dataSource}
        onSetDataSource={onSetDataSource}
      />
    </div>
  );
  return (
    <>
      {/* 渲染一般节点或者路由节点 */}
      {currentData.type === 4 ? renderRouteNode() : renderNormalNode(currentData)}
      {/* 如果有子节点，继续递归调用本组件 */}
      {
        currentData.childNode
          ? (
            <NodeBox
              currentData={currentData.childNode}
              dataSource={dataSource}
              onSetDataSource={onSetDataSource}
            />
          )
          : null
      }
    </>
  );
};

export default NodeBox;

import React, { useState } from 'react';
import styled from 'styled-components';
import dataset from './dataset';
import Column from './Column';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const Conatainer = styled.div`
  display: flex;
`;

const App = () => {
  const [data, setData] = useState(dataset);

  //Handle when drag element end
  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    //if there is no destination
    if (!destination) {
      return;
    }

    //if source and destination is the same
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    //if you're dragging columns will re-order columns
    if (type === 'column') {
      const newColumnOrder = Array.from(data.columnOrder);
      //remove older order of index
      newColumnOrder.splice(source.index, 1);
      //add new order of index
      newColumnOrder.splice(destination.index, 0, draggableId);
      const newState = {
        ...data,
        columnOrder: newColumnOrder,
      };
      setData(newState);
      return;
    }

    //if you're dragging tasks inside or between columns(droppableId is key of Droppable) ---------------------------------
    // 'column-1': {
    //   id: 'column-1',
    //   title: 'Todo',
    //   taskIds: ['task-1'],
    // },
    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    //if dropped inside the same column
    //   taskIds: ['task-1',..],---------------------------------
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);
      return;
    }

    //if dropped in a different columns
    //remove task from source column ---------------------------------
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = {
      ...start,
      taskIds: startTaskIds,
    };

    //add taskid into new taskIds
    const finishedTaskIds = Array.from(finish.taskIds);
    finishedTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finish,
      taskIds: finishedTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    };
    setData(newState);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='all-columns' direction='horizontal' type='column'>
        {(provided) => (
          <Conatainer {...provided.droppableProps} ref={provided.innerRef}>
            {data.columnOrder.map((id, index) => {
              const column = data.columns[id];
              const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  index={index}
                />
              );
            })}
            {provided.placeholder}
          </Conatainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default App;

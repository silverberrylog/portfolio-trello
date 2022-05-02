import { addTempTask, deleteList, update } from '@/store/project'
import { useDispatch } from 'react-redux'
import { List, Task } from '@/types'
import ConfirmLink from '@/components/ConfirmLink'
import TaskListHeader from './TaskListHeader'
import TaskComponent from './Task'

interface TaskListProps {
    tasks: Task[]
    list: List
}

export default function TaskList(props: TaskListProps) {
    const dispatch = useDispatch()

    return (
        <div className="list">
            <TaskListHeader list={props.list} />
            <div className="mbc-8 px-16">
                {props.tasks.map(task => (
                    <TaskComponent key={task.id} task={task} />
                ))}
            </div>
            <div className="p-16 flex justify-between">
                <a
                    onClick={() => {
                        dispatch(
                            addTempTask({
                                listId: props.list.id,
                                projectId: props.list.project,
                            })
                        )
                        dispatch(
                            update({
                                selectedTaskId: 'temp_task',
                                selectedTaskListId: props.list.id,
                            })
                        )
                    }}
                    className="link">
                    Add task
                </a>
                <ConfirmLink
                    onClick={() => dispatch(deleteList(props.list.id))}>
                    Delete list
                </ConfirmLink>
            </div>
        </div>
    )
}

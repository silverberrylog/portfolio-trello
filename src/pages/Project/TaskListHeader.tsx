import { RootState } from '@/store'
import { update, updateList } from '@/store/project'
import { List } from '@/types'
import { PencilIcon } from '@heroicons/react/solid'
import { useDispatch, useSelector } from 'react-redux'

interface TaskListHeaderProps {
    list: List
}

export default function TaskListHeader(props: TaskListHeaderProps) {
    const focusedListId = useSelector(
        (state: RootState) => state.project.focusedListId
    )
    const focusedListName = useSelector(
        (state: RootState) => state.project.focusedListName
    )
    const dispatch = useDispatch()

    return (
        <>
            <form
                className="h-min gap-8 flex justify-between items-center p-16"
                onSubmit={e => {
                    e.preventDefault()
                    dispatch(updateList(focusedListId, focusedListName))
                }}>
                <input
                    value={
                        focusedListId == props.list.id
                            ? focusedListName
                            : props.list.name
                    }
                    className="ghost-input"
                    onChange={e =>
                        dispatch(
                            update({
                                focusedListName: e.target.value,
                            })
                        )
                    }
                    onBlur={() =>
                        dispatch(updateList(focusedListId, focusedListName))
                    }
                    disabled={focusedListId != props.list.id}
                    id={`list-${props.list.id}`}
                    autoFocus
                />
                <PencilIcon
                    className="button-icon w-42 h-42"
                    onClick={() => {
                        dispatch(
                            update({
                                focusedListName: props.list.name,
                                focusedListId: props.list.id,
                            })
                        )
                    }}
                />
            </form>
        </>
    )
}

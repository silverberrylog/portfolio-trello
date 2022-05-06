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

    const updateListLocally = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(update({ focusedListName: event.target.value }))
    }

    const commitListChanges = () => {
        dispatch(updateList(focusedListId, focusedListName))
    }

    const focusListName = () => {
        dispatch(
            update({
                focusedListName: props.list.name,
                focusedListId: props.list.id,
            })
        )
    }

    return (
        <>
            <form
                className="h-min gap-8 flex justify-between items-center p-16"
                onSubmit={event => {
                    event.preventDefault()
                    commitListChanges()
                }}>
                <input
                    value={
                        focusedListId == props.list.id
                            ? focusedListName
                            : props.list.name
                    }
                    className="ghost-input"
                    onChange={updateListLocally}
                    onBlur={commitListChanges}
                    disabled={focusedListId != props.list.id}
                    id={`list-${props.list.id}`}
                    autoFocus
                />
                <PencilIcon
                    className="button-icon w-42 h-42"
                    onClick={focusListName}
                />
            </form>
        </>
    )
}

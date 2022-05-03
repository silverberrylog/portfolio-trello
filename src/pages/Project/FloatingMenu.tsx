// interface FloatingMenuProps {
//     isHidden: boolean
//     coords: {
//         x: number
//         y: number
//     }
//     onDelete: () => void
//     onClose: () => void
// }

import { RootState } from '@/store'
import { deleteTask, update } from '@/store/project'
import { useDispatch, useSelector } from 'react-redux'

// export default function FloatingMenu(props: FloatingMenuProps) {
//     return (
//         <div
//             className={`fixed top-0 left-0 right-0 bottom-0 bg-primary-shadow${
//                 props.isHidden ? ' hidden' : ''
//             }`}
//             onClick={props.onClose}>
//             <div
//                 className="absolute rounded border-none mbc-8"
//                 style={{
//                     left: props.coords.x + 'px',
//                     top: props.coords.y + 'px',
//                 }}>
//                 <button
//                     onClick={props.onDelete}
//                     className="block button-primary">
//                     Delete task
//                 </button>
//                 <button className="block button-primary">Cancel</button>
//             </div>
//         </div>
//     )
// }

export default function FloatingMenu() {
    const showFloatingMenu = useSelector(
        (state: RootState) => state.project.showFloatingMenu
    )
    const floatingMenuX = useSelector(
        (state: RootState) => state.project.floatingMenuX
    )
    const floatingMenuY = useSelector(
        (state: RootState) => state.project.floatingMenuY
    )

    const selectedTaskId = useSelector(
        (state: RootState) => state.project.selectedTaskId
    )
    const selectedTaskListId = useSelector(
        (state: RootState) => state.project.selectedTaskListId
    )

    const dispatch = useDispatch()

    return (
        <div
            className={`fixed top-0 left-0 right-0 bottom-0 bg-primary-shadow z-100${
                !showFloatingMenu ? ' hidden' : ''
            }`}>
            <div
                className="absolute rounded border-none mbc-8"
                style={{
                    left: floatingMenuX + 'px',
                    top: floatingMenuY + 'px',
                }}>
                <button
                    onClick={() =>
                        dispatch(deleteTask(selectedTaskListId, selectedTaskId))
                    }
                    className="block button-primary">
                    Delete task
                </button>
                <button className="block button-primary">Cancel</button>
            </div>
        </div>
    )
}

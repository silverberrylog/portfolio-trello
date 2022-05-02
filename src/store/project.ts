import { List, ListData, Task, TaskData, Tasks } from '@/types'
import { db } from '@/utils/firebase'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { addDoc, collection, setDoc, doc, deleteDoc } from 'firebase/firestore'
import { AppDispatch, RootState } from './'

export interface ProjectState {
    selectedTaskId: string
    selectedTaskName: string
    tasks: Tasks
    showFloatingMenu: boolean
    lists: List[]
    focusedListName: string
    focusedListId: string
    newListName: string
    floatingMenuX: number
    floatingMenuY: number
}

const initialState: ProjectState = {
    selectedTaskId: '',
    selectedTaskName: '',
    tasks: {},
    showFloatingMenu: false,
    lists: [],
    focusedListName: '',
    focusedListId: '',
    newListName: '',
    floatingMenuX: 0,
    floatingMenuY: 0,
}

export const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        update(state, action: PayloadAction<Partial<ProjectState>>) {
            for (const key in action.payload) {
                if (
                    action.payload[key] === 'object' ||
                    Array.isArray(action.payload[key])
                ) {
                    state[key] = [...action.payload[key]]
                } else {
                    state[key] = action.payload[key]
                }
            }
        },
        setSelectedTaskId(state, action: PayloadAction<string>) {
            state.selectedTaskId = action.payload
        },
        setSelectedTaskName(state, action: PayloadAction<string>) {
            state.selectedTaskName = action.payload
        },
        addTempTask(
            state,
            action: PayloadAction<{ listId: string; projectId: string }>
        ) {
            if (!state.tasks[action.payload.listId]) {
                state.tasks[action.payload.listId] = []
            }

            state.tasks[action.payload.listId].push({
                id: 'temp_task',
                name: '',
                createdAt: Date.now(),
                list: action.payload.listId,
                project: action.payload.projectId,
            })
        },
        setShowFloatingMenu(state, action: PayloadAction<boolean>) {
            state.showFloatingMenu = action.payload
        },
    },
})

export const {
    update,
    setSelectedTaskId,
    setSelectedTaskName,
    addTempTask,
    setShowFloatingMenu,
} = projectSlice.actions
export default projectSlice.reducer

export const addTask =
    (task: TaskData) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState()
        let tasks = { ...state.project.tasks }
        tasks[task.list] = tasks[task.list].filter(
            task => task.id != 'temp_task'
        )

        const taskRef = await addDoc(collection(db, 'tasks'), task)
        tasks[task.list].push({ ...task, id: taskRef.id })

        dispatch(update({ tasks }))
    }

export const deleteList =
    (listId: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        await deleteDoc(doc(db, 'lists', listId))

        const state = getState()
        dispatch(
            update({
                lists: state.project.lists.filter(list => list.id != listId),
            })
        )
    }

export const updateList =
    (listId: string, newName: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const updates = { name: newName.trim() }
        await setDoc(doc(db, 'lists', listId), updates, {
            merge: true,
        })

        const state = getState()
        dispatch(
            update({
                lists: state.project.lists.map(list =>
                    list.id == state.project.focusedListId
                        ? { ...list, ...updates }
                        : list
                ),
                focusedListId: '',
                focusedListName: '',
            })
        )
    }

export const addNewList =
    (projectId: string, newListName: string) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const listData: ListData = {
            project: projectId,
            name: newListName,
            createdAt: Date.now(),
        }

        const listRef = await addDoc(collection(db, 'lists'), listData)

        const state = getState()
        dispatch(
            update({
                lists: [
                    ...state.project.lists,
                    { ...listData, id: listRef.id },
                ],
                newListName: '',
            })
        )
    }

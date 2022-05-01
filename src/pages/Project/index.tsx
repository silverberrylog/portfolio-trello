import '../styles/Project.scss'
import {
    collection,
    doc,
    deleteDoc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    query,
    where,
    writeBatch,
} from 'firebase/firestore'
import { sortBy } from '../utils/sorting'
import { lazy, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Project, Color, List, Tasks, TaskData } from '../types'
import ConfirmButton from '../components/ConfirmButton'
import ConfirmLink from '../components/ConfirmLink'
import { db } from '../utils/firebase'
import { PencilIcon, PlusIcon, DotsVerticalIcon } from '@heroicons/react/solid'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import SingleInputModal from '../components/SingleInputModal'
import { fixFocus } from '../utils/misc'

const NotFound = lazy(() => import('./NotFound'))

const colors: Color[] = ['blue', 'brown', 'green', 'purple', 'red', 'yellow']
export default function ProjectPage() {
    const [project, setProject] = useState<Project>()
    const [isUndefined, setIsUndefined] = useState(false)
    const [lists, setLists] = useState<List[]>([])
    // const [lists, setLists] = useState(['hello', 'world', 'how', 'are', 'you'])

    const [showUpdateMenu, setShowUpdateMenu] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectColor, setNewProjectColor] = useState('')

    const [showAddListModal, setShowAddListModal] = useState(false)
    const [newListName, setNewListName] = useState('')

    const [focusedListId, setFocusedListId] = useState('')

    const [focusedListName, setFocusedListName] = useState('')

    const [tasks, setTasks] = useState<Tasks>({})
    const [selectedTaskId, setSelectedTaskId] = useState('')
    const [selectedTaskName, setSelectedTaskName] = useState('')

    const [floatingMenuCoords, setFloatingMenuCoords] = useState({
        x: -1,
        y: -1,
    })

    const navigate = useNavigate()
    let params = useParams()

    const deleteProject = async (projectId: string) => {
        const lists = await getDocs(
            query(collection(db, 'lists'), where('project', '==', projectId))
        )

        const batch = writeBatch(db)
        lists.forEach(project => batch.delete(project.ref))
        await batch.commit()

        await deleteDoc(doc(db, 'projects', projectId))
        navigate('/')
    }

    useEffect(() => {
        const getInitialData = async () => {
            const projectSnapshot = await getDoc(
                doc(collection(db, 'projects'), params.projectId)
            )
            const projectData = projectSnapshot.data()

            if (!projectData) setIsUndefined(true)

            setProject({
                id: projectSnapshot.id,
                name: projectData.name,
                color: projectData.color,
                workspace: projectData.workspace,
            })

            updateBgColor(projectData.color)

            const listsSnapshot = await getDocs(
                query(
                    collection(db, 'lists'),
                    where('project', '==', params.projectId)
                )
            )

            let lists: List[] = []
            listsSnapshot.forEach(list => {
                const listData = list.data()
                lists.push({
                    id: list.id,
                    name: listData.name,
                    createdAt: listData.createdAt,
                })
            })

            setLists(lists)
        }
        getInitialData()

        return () => {
            updateBgColor('')
        }
    }, [])

    const updateBgColor = (color: string | null) => {
        let el = document.getElementById('root').children[0]

        if (el.className.indexOf('bg-custom-') === -1) {
            el.className += ` bg-custom-${color}`
            return
        }

        el.className = el.className.replace(/ [^ ]+$/, '')

        if (color) el.className += ` bg-custom-${color}`
    }

    const updateProject = async () => {
        const updates = { name: newProjectName, color: newProjectColor }

        await setDoc(doc(db, 'projects', project.id), updates, { merge: true })

        setProject(project => ({
            ...project,
            ...updates,
        }))

        updateBgColor(newProjectColor)
        setShowUpdateMenu(false)
        // setNewProjectName('')
        // setNewProjectColor('')
    }

    const EditProjectMenu = () => {
        return (
            <div className="mbc-16">
                <h2 className="title-2">Edit project</h2>
                <div>
                    <p className="paragraph mb-4">Project name</p>
                    <input
                        value={newProjectName}
                        onChange={event => {
                            setNewProjectName(event.target.value)
                        }}
                        className="input"
                        autoFocus
                    />
                </div>
                <div>
                    <p className="paragraph mb-4">Project color</p>
                    <div className="grid cols-2 gap-8">
                        {colors.map(color => (
                            <div
                                className={`bg-custom-${color} h-50 cursor-pointer border-none rounded border-box hover:brightness-95 ${
                                    newProjectColor == color && 'border-dashed'
                                }`}
                                key={color}
                                onClick={() => {
                                    updateBgColor(color)
                                    setNewProjectColor(color)
                                }}></div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-12">
                    <button onClick={updateProject} className="button-primary">
                        Update
                    </button>
                    <button
                        onClick={() => {
                            updateBgColor(project.color)
                            setShowUpdateMenu(false)
                        }}
                        className="button-primary">
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    const addNewList = async () => {
        const createdAt = new Date()

        const listRef = await addDoc(collection(db, 'lists'), {
            project: project.id,
            name: newListName,
            createdAt,
        })

        setLists(lists => [
            ...lists,
            {
                id: listRef.id,
                project: project.id,
                name: newListName,
                createdAt,
            },
        ])

        setNewListName('')
    }

    useEffect(() => {
        if (focusedListId.length > 0) {
            document.getElementById(`list-${focusedListId}`).focus()
        }
    }, [focusedListId])

    useEffect(() => {
        if (selectedTaskId.length > 0) {
            document.getElementById(`task-${selectedTaskId}`).focus()
            setSelectedTaskName(
                document.getElementById(`task-${selectedTaskId}`).value
            )
        }
    }, [selectedTaskId])

    const updateList = async () => {
        const updates = { name: focusedListName.trim() }
        await setDoc(doc(db, 'lists', focusedListId), updates, { merge: true })

        setLists(lists =>
            lists.map(list =>
                list.id == focusedListId ? { ...list, ...updates } : list
            )
        )

        setFocusedListId('')
        setFocusedListName('')
    }

    const deleteList = async (listId: string) => {
        await deleteDoc(doc(db, 'lists', listId))

        setLists(lists => lists.filter(list => list.id != listId))
    }

    const addTempTask = (listId: string) => {
        setTasks(tasks => {
            let updatedTasks = { ...tasks }

            if (!updatedTasks[listId]) updatedTasks[listId] = []
            updatedTasks[listId].push({
                id: 'temp_task',
                name: '',
                createdAt: new Date(),
                list: listId,
                project: project.id,
            })

            return updatedTasks
        })

        setSelectedTaskId('temp_task')
    }

    const addTask = async (listId: string) => {
        if (selectedTaskName.length == 0) {
            // remove task from local list
            setTasks(tasks => {
                let updatedTasks = { ...tasks }

                const indexOfTempTask = updatedTasks[listId].findIndex(
                    task => task.id == 'temp_task'
                )
                updatedTasks[listId].splice(indexOfTempTask, 1)

                return updatedTasks
            })
        } else {
            const tempTask = tasks[listId].filter(
                task => task.id == 'temp_task'
            )[0]
            const taskData: TaskData = {
                name: selectedTaskName,
                createdAt: new Date(),
                list: tempTask.list,
                project: tempTask.project,
            }

            const newTask = await addDoc(collection(db, 'tasks'), taskData)

            setTasks(tasks => {
                let updatedTasks = { ...tasks }

                if (!updatedTasks[listId]) updatedTasks[listId] = []
                for (const i in updatedTasks[listId]) {
                    if (updatedTasks[listId][i].id == 'temp_task') {
                        updatedTasks[listId][i] = {
                            ...taskData,
                            id: newTask.id,
                        }
                    }
                }

                return updatedTasks
            })
        }

        setSelectedTaskId('')
        setSelectedTaskName('')
    }

    const resizeTextArea = (event: FormEventHandler<HTMLTextAreaElement>) => {
        event.target.style.height = event.target.scrollHeight + 'px'
        // event.target.style.height = 'auto'
    }

    //         function auto_height(elem) {  /* javascript */
    //     elem.style.height = "1px";
    // }
    // .auto_height { /* CSS */
    //   width: 100%;
    // <textarea rows="1" class="auto_height" oninput="auto_height(this)"></textarea>
    //    }

    const openFloatingMenu = (taskId: string) => {
        const taskBoundingRect = document
            .getElementById(`task-${taskId}`)
            .getBoundingClientRect()

        setSelectedTaskId(taskId)

        setFloatingMenuCoords({
            x: taskBoundingRect.x + taskBoundingRect.width + 16,
            y: taskBoundingRect.y,
        })

        // setTimeout(() => setFloatingMenuCoords({ x: -1, y: -1 }), 2000)
    }

    const DisplayProject = () => {
        return (
            <>
                <SingleInputModal
                    title="Add a list"
                    inputPlaceholder="List name"
                    submitButtonText="Add"
                    show={showAddListModal}
                    nameValue={newListName}
                    onNameUpdate={setNewListName}
                    onClose={() => setShowAddListModal(false)}
                    onSubmit={addNewList}
                />
                <div
                    className={`fixed top-0 left-0 right-0 bottom-0 bg-primary-shadow ${
                        floatingMenuCoords.x == -1 && 'hidden'
                    }`}
                    onClick={() => setFloatingMenuCoords({ x: -1, y: -1 })}>
                    <div
                        className={`absolute rounded border-none mbc-8`}
                        style={{
                            left: floatingMenuCoords.x + 'px',
                            top: floatingMenuCoords.y + 'px',
                        }}>
                        <button
                            // onClick={() => setSelectedTaskId(task.id)}
                            onClick={() => console.log('edit')}
                            className="block button-primary">
                            Edit task
                        </button>
                        <button
                            onClick={() => console.log('delete')}
                            className="block button-primary">
                            Delete task
                        </button>
                        <button
                            onClick={() => console.log('cancel')}
                            className="block button-primary">
                            Cancel
                        </button>
                    </div>
                </div>
                <div className="w-1-1 h-1-1 flex flex-column justify-between gap-32 border-box">
                    <div className="relative">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="title-1">{project.name}</h1>
                                <Link to="/" className="link">
                                    Back to projects
                                </Link>
                            </div>
                            <div className="flex gap-12">
                                <button className="button-primary">
                                    Filter tasks
                                </button>
                                <button
                                    onClick={() => {
                                        setNewProjectName(project.name)
                                        setNewProjectColor(project.color)
                                        setShowUpdateMenu(true)
                                    }}
                                    className="button-primary">
                                    Update project
                                </button>
                                <ConfirmButton
                                    onClick={() => deleteProject(project.id)}>
                                    Delete project
                                </ConfirmButton>
                            </div>
                        </div>
                        {showUpdateMenu && (
                            <div className="absolute right-0 top-64 overflow-y bg-primary-background w-1-3 border-none rounded p-24 border-box shadow-menu h-menu">
                                {/* {showUpdateMenu && <EditProjectMenu />} */}
                                {/* {showUpdateMenu && <EditProjectMenu />} */}
                                <EditProjectMenu />
                            </div>
                        )}
                    </div>

                    <div className="h-1-1 w-1-1 border-box overflow-x">
                        <div className="flex h-fit gap-12 w-fit pb-16 pr-16">
                            {sortBy(lists, 'createdAt', 'asc').map(list => (
                                <div className="list" key={list.id}>
                                    <form
                                        className="h-min gap-8 flex justify-between items-center p-16"
                                        onSubmit={e => {
                                            e.preventDefault()
                                            updateList()
                                        }}>
                                        <input
                                            value={
                                                focusedListId == list.id
                                                    ? focusedListName
                                                    : list.name
                                            }
                                            className="ghost-input"
                                            onChange={e =>
                                                setFocusedListName(
                                                    e.target.value
                                                )
                                            }
                                            onBlur={() => updateList()}
                                            disabled={focusedListId != list.id}
                                            id={`list-${list.id}`}
                                            autoFocus
                                        />
                                        <PencilIcon
                                            className="button-icon w-42 h-42"
                                            onClick={() => {
                                                setFocusedListName(list.name)
                                                setFocusedListId(list.id)
                                            }}
                                        />
                                    </form>
                                    <div className="mbc-8 px-16">
                                        {(tasks[list.id] || []).map(task => (
                                            <div
                                                key={task.id}
                                                className="relative">
                                                <textarea
                                                    value={
                                                        selectedTaskId ==
                                                        task.id
                                                            ? selectedTaskName
                                                            : task.name
                                                    }
                                                    className="task-base resize-none ghost-input py-20"
                                                    placeholder="Task title"
                                                    onInput={resizeTextArea}
                                                    onChange={event =>
                                                        setSelectedTaskName(
                                                            event.target.value
                                                        )
                                                    }
                                                    id={`task-${task.id}`}
                                                    disabled={
                                                        selectedTaskId !=
                                                        task.id
                                                    }
                                                    onBlur={() =>
                                                        addTask(list.id)
                                                    }
                                                    onFocus={e => {
                                                        fixFocus(e)
                                                    }}
                                                    autoFocus></textarea>
                                                <DotsVerticalIcon
                                                    // onClick={() =>
                                                    //     setSelectedTaskId(
                                                    //         task.id
                                                    //     )
                                                    // }
                                                    onClick={() =>
                                                        openFloatingMenu(
                                                            task.id
                                                        )
                                                    }
                                                    className="absolute top-12 right-12 w-32 h-32 button-icon"
                                                />
                                                <div className="floating-menu hidden">
                                                    <button className="button-primary">
                                                        Save
                                                    </button>
                                                    <button className="button-primary">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {/* <div className="task p-20">Lorem</div> */}
                                    </div>
                                    <div className="p-16 flex justify-between">
                                        <a
                                            onClick={() => addTempTask(list.id)}
                                            className="link">
                                            Add task
                                        </a>
                                        <ConfirmLink
                                            onClick={() => deleteList(list.id)}>
                                            Delete list
                                        </ConfirmLink>
                                    </div>
                                </div>
                            ))}
                            <div className="list">
                                <div
                                    onClick={() => setShowAddListModal(true)}
                                    className="task-base p-20 cursor-pointer flex gap-8">
                                    <PlusIcon className="w-16 h-16" />
                                    <p className="paragraph">Add list</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            {isUndefined ? (
                <NotFound />
            ) : !project ? (
                <Loading />
            ) : (
                <DisplayProject />
            )}
        </>
    )
}

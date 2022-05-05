import '../../styles/Project.scss'
import {
    collection,
    doc,
    deleteDoc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where,
    writeBatch,
} from 'firebase/firestore'
import { sortArr } from '@/utils/sorting'
import { lazy, useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Project, Color, List } from '@/types'
import ConfirmButton from '@/components/ConfirmButton'
import { db } from '@/utils/firebase'
import { PlusIcon, XIcon } from '@heroicons/react/solid'
import { useNavigate } from 'react-router-dom'
import Loading from '@/components/Loading'
import SingleInputModal from '@/components/SingleInputModal'
import FloatingMenu from './FloatingMenu'
import TaskList from './TaskList'
import { RootState } from '@/store'
import { useDispatch, useSelector } from 'react-redux'
import { addNewList, deleteTask, update, updateTask } from '@/store/project'
import FloatingSideMenu from './FloatingSideMenu'
import Dropdown from '@/components/Dropdown'
import { filterTasks } from '@/utils/filtering'
import ButtonWithAddon from '@/components/ButtonWithAddon'

const NotFound = lazy(() => import('@/pages/NotFound'))

const colors: Color[] = ['blue', 'brown', 'green', 'purple', 'red', 'yellow']
export default function ProjectPage() {
    const [project, setProject] = useState<Project>()
    const [isUndefined, setIsUndefined] = useState(false)

    const [showUpdateMenu, setShowUpdateMenu] = useState(false)
    const [showFilterAndSortMenu, setShowFilterAndSortMenu] = useState(false)

    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectColor, setNewProjectColor] = useState('')

    const [showAddListModal, setShowAddListModal] = useState(false)

    const newListName = useSelector(
        (state: RootState) => state.project.newListName
    )

    const focusedListId = useSelector(
        (state: RootState) => state.project.focusedListId
    )
    const selectedTaskId = useSelector(
        (state: RootState) => state.project.selectedTaskId
    )

    const lists = useSelector((state: RootState) => state.project.lists)
    const tasks = useSelector((state: RootState) => state.project.tasks)

    const sortOptions = [
        {
            value: 'createdAt-asc',
            title: 'Creation date - oldest to newest',
        },
        {
            value: 'createdAt-desc',
            title: 'Creation date - newest to oldest',
        },
        {
            value: 'name-asc',
            title: 'Name - A to Z',
        },
        {
            value: 'name-desc',
            title: 'Name - Z to A',
        },
    ]

    const [sortTasksBy, setSortTasksBy] = useState(sortOptions[0].value)
    const [filterTasksBy, setFilterTasksBy] = useState('')

    const dispatch = useDispatch()

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
                    project: listData.project,
                    createdAt: listData.createdAt,
                })
            })

            const tasksSnapshot = await getDocs(
                query(
                    collection(db, 'tasks'),
                    where('project', '==', params.projectId)
                )
            )

            let tasks: Tasks = {}
            tasksSnapshot.forEach(task => {
                const listData = task.data()

                if (!tasks[listData.list]) tasks[listData.list] = []

                tasks[listData.list].push({
                    id: task.id,
                    name: listData.name,
                    list: listData.list,
                    project: listData.project,
                    createdAt: listData.createdAt,
                })
            })

            dispatch(update({ lists, tasks }))
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
        setProject(project => ({ ...project, ...updates }))

        updateBgColor(newProjectColor)
        setShowUpdateMenu(false)
    }

    const sortedLists = useMemo(
        () => sortArr(lists, 'createdAt', 'asc'),
        [lists, filterTasksBy, sortTasksBy]
    )

    const UpdateMenu = () => {
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
                                onClick={event => {
                                    updateBgColor(color)
                                    setNewProjectColor(color)
                                    event.currentTarget.focus()
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

    interface FilterAndSortMenuProps {
        filterTasksBy: string
        sortTasksBy: string
    }
    const FilterAndSortMenu = (props: FilterAndSortMenuProps) => {
        const [tempFilterTaskBy, setTempFilterTaskBy] = useState(
            props.filterTasksBy
        )
        const [tempSortTasksBy, setTempSortTasksBy] = useState(
            props.sortTasksBy
        )

        return (
            <div className="mbc-16">
                <h2 className="title-2">Filter and sort tasks</h2>
                <div>
                    <p className="paragraph mb-4">Search tasks</p>
                    <input
                        value={tempFilterTaskBy}
                        onChange={event =>
                            setTempFilterTaskBy(event.target.value)
                        }
                        className="input"
                    />
                </div>
                <div>
                    <p className="paragraph mb-4">Sort by</p>
                    <Dropdown
                        options={sortOptions}
                        selectedValue={tempSortTasksBy}
                        onChange={value => setTempSortTasksBy(value)}
                    />
                </div>
                <div className="flex gap-12">
                    <button
                        onClick={() => {
                            setFilterTasksBy(tempFilterTaskBy)
                            setSortTasksBy(tempSortTasksBy)
                            setShowFilterAndSortMenu(false)
                        }}
                        className="button-primary">
                        Apply
                    </button>
                    <button
                        onClick={() => setShowFilterAndSortMenu(false)}
                        className="button-primary">
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (focusedListId.length > 0) {
            document.getElementById(`list-${focusedListId}`).focus()
        }
    }, [focusedListId])

    useEffect(() => {
        if (selectedTaskId.length > 0) {
            const taskEl = document.getElementById(`task-${selectedTaskId}`)

            taskEl.focus()
            dispatch(
                update({
                    selectedTaskName: taskEl.value,
                })
            )
        }
    }, [selectedTaskId])

    const DisplayProject = () => {
        return (
            <>
                <SingleInputModal
                    title="Add a list"
                    inputPlaceholder="List name"
                    submitButtonText="Add"
                    show={showAddListModal}
                    nameValue={newListName}
                    onNameUpdate={value =>
                        dispatch(update({ newListName: value }))
                    }
                    onClose={() => setShowAddListModal(false)}
                    onSubmit={() =>
                        dispatch(addNewList(project.id, newListName))
                    }
                />
                <FloatingMenu />
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
                                <ButtonWithAddon
                                    onClick={() =>
                                        setShowFilterAndSortMenu(true)
                                    }
                                    onAddonClick={() => setFilterTasksBy('')}
                                    addon={XIcon}
                                    showAddon={filterTasksBy != ''}>
                                    Filter/sort tasks
                                </ButtonWithAddon>
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
                        <FloatingSideMenu isVisible={showUpdateMenu}>
                            <UpdateMenu />
                        </FloatingSideMenu>
                        <FloatingSideMenu isVisible={showFilterAndSortMenu}>
                            <FilterAndSortMenu
                                filterTasksBy={filterTasksBy}
                                sortTasksBy={sortTasksBy}
                            />
                        </FloatingSideMenu>
                    </div>
                    <div className="h-1-1 w-1-1 border-box overflow-x">
                        <div className="flex h-fit gap-12 w-fit pb-16 pr-16">
                            {sortedLists.map(list => (
                                <TaskList
                                    key={list.id}
                                    list={list}
                                    tasks={sortArr(
                                        filterTasks(
                                            tasks[list.id] || [],
                                            filterTasksBy
                                        ),
                                        ...sortTasksBy.split('-')
                                    )}
                                />
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

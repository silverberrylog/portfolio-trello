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
import { Project, Color, List } from '../types'
import ConfirmButton from '../components/ConfirmButton'
import ConfirmLink from '../components/ConfirmLink'
import { db } from '../utils/firebase'
import { PencilIcon, PlusIcon, DotsVerticalIcon } from '@heroicons/react/solid'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'
import SingleInputModal from '../components/SingleInputModal'

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
                                            className="button-icon"
                                            onClick={() => {
                                                setFocusedListName(list.name)
                                                setFocusedListId(list.id)
                                            }}
                                        />
                                    </form>
                                    <div className="mbc-8 px-16">
                                        <div className="task">Lorem</div>
                                        <div className="task">Lorem</div>
                                        <div className="task">Lorem</div>
                                    </div>
                                    <div className="p-16 text-right">
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
                                    className="task-base cursor-pointer flex gap-8">
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

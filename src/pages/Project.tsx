import '../styles/Project.scss'
import { collection, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { lazy, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Project, Color } from '../types'
import ConfirmButton from '../components/ConfirmButton'
import { db } from '../utils/firebase'
import { PencilIcon } from '@heroicons/react/solid'
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading'

const NotFound = lazy(() => import('./NotFound'))

const colors: Color[] = ['blue', 'brown', 'green', 'purple', 'red', 'yellow']
export default function ProjectPage() {
    const [project, setProject] = useState<Project>()
    const [isUndefined, setIsUndefined] = useState(false)
    // const [lists, setLists] = useState([])
    const [lists, setLists] = useState(['hello', 'world', 'how', 'are', 'you'])

    const [showUpdateMenu, setShowUpdateMenu] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectColor, setNewProjectColor] = useState('')

    const navigate = useNavigate()

    let params = useParams()

    let firstChildOfRoot: string
    let initialClass: string

    const deleteProject = async (projectId: string) => {
        await deleteDoc(doc(db, 'projects', projectId))
        navigate('/')
    }

    useEffect(() => {
        const getProjectData = async () => {
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
            console.log('1')
        }
        getProjectData()

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

    const DisplayProject = () => {
        return (
            <div className="w-1-1 h-1-1 flex flex-column justify-between h-1-1 w-1-1 gap-32 border-box">
                <div className="relative">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="title-1">{project.name}</h1>
                            <Link to="/" className="link">Back to projects</Link>
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
                    <div className="flex h-1-1 gap-12 w-fit">
                        {lists.map((list, index) => (
                            <div
                                className="w-300 h-fit border-box bg-primary-highlight border-none rounded"
                                key={index}>
                                <div className="h-min gap-8 flex justify-between items-center p-16">
                                    <input
                                        value={list}
                                        className="ghost-input"
                                        onChange={() => {}}
                                        disabled
                                    />
                                    <PencilIcon
                                        className="button-icon"
                                        onClick={() =>
                                            console.log(
                                                'Enable input, focus on it'
                                            )
                                        }
                                    />
                                </div>
                                <div className="mbc-8 p-16 pt-0">
                                    <div className="task">Lorem</div>
                                    <div className="task">Lorem</div>
                                    <div className="task">Lorem</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {isUndefined ? (
                <NotFound />
            ) : project ? (
                <DisplayProject />
            ) : (
                <Loading />
            )}
        </>
    )
}

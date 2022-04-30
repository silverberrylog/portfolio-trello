import '../styles/Project.scss'
import { collection, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { lazy, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Project, Color } from '../types'
import ConfirmButton from '../components/ConfirmButton'
import { db } from '../utils/firebase'
import { PencilIcon } from '@heroicons/react/solid'
import { useNavigate } from 'react-router-dom'

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
        }
        getProjectData()

        return () => {
            updateBgColor('')
        }
    }, [])

    const updateBgColor = (color: string | null) => {
        let el = document.getElementById('root').children[0]

        el.className = el.className.split(' ')[0]
        if (color) el.className += ` bg--${color}`
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
            <div className="mb--16--children">
                <h2 className="text--bold">Edit project</h2>
                <div>
                    <p className="mb--4">Project name</p>
                    <input
                        autoFocus="autoFocus"
                        value={newProjectName}
                        onChange={event => {
                            setNewProjectName(event.target.value)
                        }}
                    />
                </div>
                <div>
                    <p className="mb--4">Project color</p>
                    <div className="grid--2-columns">
                        {colors.map(color => (
                            <div
                                className={`bg--${color} grid-color-item ${
                                    newProjectColor == color && 'selected'
                                }`}
                                key={color}
                                onClick={() => {
                                    updateBgColor(color)
                                    setNewProjectColor(color)
                                }}></div>
                        ))}
                    </div>
                </div>
                <div className="button--group">
                    <button onClick={updateProject}>Update</button>
                    <button
                        onClick={() => {
                            updateBgColor(project.color)
                            setShowUpdateMenu(false)
                        }}>
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    const DisplayProject = () => {
        return (
            <div className="project-page">
                <div className="relative">
                    <div className="flex--between--center">
                        <div>
                            <h1 className="text--bold">{project.name}</h1>
                            <Link to="/">Back to projects</Link>
                        </div>
                        <div className="button--group">
                            <button>Filter tasks</button>
                            <button
                                onClick={() => {
                                    setNewProjectName(project.name)
                                    setNewProjectColor(project.color)
                                    setShowUpdateMenu(true)
                                }}>
                                Update project
                            </button>
                            <ConfirmButton
                                onClick={() => deleteProject(project.id)}>
                                Delete project
                            </ConfirmButton>
                        </div>
                    </div>
                    {showUpdateMenu && (
                        <div className="menu">
                            {/* {showUpdateMenu && <EditProjectMenu />} */}
                            {/* {showUpdateMenu && <EditProjectMenu />} */}
                            <EditProjectMenu />
                        </div>
                    )}
                </div>

                <div className="lists-container">
                    <div className="lists">
                        {lists.map((list, index) => (
                            <div className="list" key={index}>
                                <div className="list__title flex--between--center">
                                    <input
                                        value={list}
                                        className="ghost-input text--bold"
                                        disabled
                                    />
                                    <PencilIcon
                                        className="icon icon--16--16"
                                        onClick={() =>
                                            console.log(
                                                'Enable input, focus on it'
                                            )
                                        }
                                    />
                                </div>
                                <div className="mb--8--children list__content">
                                    <div className="list__item">Lorem</div>
                                    <div className="list__item">Lorem</div>
                                    <div className="list__item">Lorem</div>
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
                'Loading'
            )}
        </>
    )
}

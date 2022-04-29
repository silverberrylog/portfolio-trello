import {
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import ConfirmButton from '../components/ConfirmButton'
import Modal from '../components/Modal'
import '../styles/homepage.scss'
import { db } from '../utils/firebase'
import { preventDefault } from '../utils/misc'

type Color = 'blue' | 'brown' | 'green' | 'purple' | 'red' | 'yellow'

interface Project {
    id: string
    name: string
    color: Color
}

interface Workspace {
    id: string
    name: string
}

interface HomepageModalProps {
    show: boolean
    onClose: () => void
    onSubmit: () => void
    nameValue: string
    onNameUpdate: (newValue: string) => void
}

const HomepageModal = (props: HomepageModalProps) => {
    return (
        <Modal isHidden={!props.show}>
            <div className="homepage__modal">
                <h1 className="homepage__modal__title">Create a workspace</h1>
                <form
                    className="homepage__modal__content"
                    onSubmit={preventDefault}>
                    <input
                        value={props.nameValue}
                        onChange={event =>
                            props.onNameUpdate(event.target.value)
                        }
                        type="text"
                        placeholder="Workspace name"
                    />
                    <div className="button--group">
                        <button onClick={props.onSubmit}>Create</button>
                        <button onClick={props.onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default function Homepage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    // const [projects, setProjects] = useState<Project[]>([])

    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [showCrateModal, setShowCrateModal] = useState(false)

    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceId, setWorkspaceId] = useState('')

    useEffect(() => {
        const getWorkspaces = async () => {
            const workspacesSnapshot = await getDocs(
                collection(db, 'workspaces')
            )

            let workspaces: Workspace[] = []
            workspacesSnapshot.forEach(workspace => {
                workspaces.push({
                    id: workspace.id,
                    name: workspace.data().name,
                })
            })
            console.log(workspaces)

            setWorkspaces(workspaces)
        }
        getWorkspaces()
    }, [])

    const createWorkspace = async () => {
        const workspaceRef = await addDoc(collection(db, 'workspaces'), {
            name: workspaceName,
        })

        setWorkspaces(workspaces => [
            ...workspaces,
            { id: workspaceRef.id, name: workspaceName },
        ])

        setShowCrateModal(false)
        setWorkspaceName('')
    }

    const updateWorkspace = async () => {
        const workspaceRef = doc(db, 'workspaces', workspaceId)
        await setDoc(workspaceRef, { name: workspaceName }, { merge: true })

        setWorkspaces(workspaces => {
            return workspaces.map(workspace =>
                workspace.id == workspaceId
                    ? { ...workspace, name: workspaceName }
                    : workspace
            )
        })

        setShowUpdateModal(false)
        setWorkspaceId('')
    }

    const deleteWorkspace = async (workspaceId: string) => {
        await deleteDoc(doc(db, 'workspaces', workspaceId))

        setWorkspaces(workspaces =>
            workspaces.filter(workspace => workspace.id != workspaceId)
        )
    }

    return (
        <div className="homepage">
            <HomepageModal
                show={showCrateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowCrateModal(false)}
                onSubmit={createWorkspace}
            />
            <HomepageModal
                show={showUpdateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowUpdateModal(false)}
                onSubmit={updateWorkspace}
            />
            <div className="flex--between--center mb--16">
                <h1 className="text--bold">Homepage</h1>
                <button onClick={() => setShowCrateModal(true)}>
                    Create workspace
                </button>
            </div>
            {workspaces.map(workspace => (
                <div key={workspace.id}>
                    <div className="flex--between--center mb--16">
                        <h2 className="text--bold">{workspace.name}</h2>
                        <div className="button--group">
                            <button
                                onClick={() => {
                                    setWorkspaceName(workspace.name)
                                    setWorkspaceId(workspace.id)
                                    setShowUpdateModal(true)
                                }}>
                                Update
                            </button>
                            <ConfirmButton
                                onClick={() => deleteWorkspace(workspace.id)}>
                                Delete
                            </ConfirmButton>
                        </div>
                    </div>

                    <div className="projects-grid">
                        <div className="project--blue">Project lorem ipsum</div>
                        <div className="project--blue">Project lorem ipsum</div>
                        <div className="project--blue">Project lorem ipsum</div>
                        <div className="project--blue">Project lorem ipsum</div>
                        <div className="project--blue">Project lorem ipsum</div>
                        <div className="project--blue">Project lorem ipsum</div>
                        {/* {projects.map((project, index) => (
                            <div
                                key={index}
                                className="project--blue">
                                <p>{project.name}</p>
                                <p>Delete project</p>
                            </div>
                        ))} */}
                    </div>
                </div>
            ))}
        </div>
    )
}

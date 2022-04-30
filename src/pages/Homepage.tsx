import {
    collection,
    addDoc,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    writeBatch,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmButton from '../components/ConfirmButton'
import SingleInputModal from '../components/SingleInputModal'
import '../styles/Homepage.scss'
import { ProjectData, Projects, Workspace } from '../types'
import { db } from '../utils/firebase'

export default function Homepage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [projects, setProjects] = useState<Projects>({})

    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [showCrateModal, setShowCrateModal] = useState(false)
    const [showProjectModal, setShowProjectModal] = useState(false)

    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceId, setWorkspaceId] = useState('')
    const [projectName, setProjectName] = useState('')
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const getInitialData = async () => {
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

            setWorkspaces(workspaces)

            const projectsSnapshot = await getDocs(collection(db, 'projects'))

            let projectsByWorkspaceId: Projects = {}
            projectsSnapshot.forEach(project => {
                const projectData = project.data()

                if (!projectsByWorkspaceId[projectData.workspace]) {
                    projectsByWorkspaceId[projectData.workspace] = []
                }

                projectsByWorkspaceId[projectData.workspace].push({
                    id: project.id,
                    // ...projectData,
                    workspace: projectData.workspace,
                    name: projectData.name,
                    color: projectData.color,
                })
            })

            setProjects(projectsByWorkspaceId)
        }
        getInitialData()
    }, [])

    const createWorkspace = async () => {
        const workspaceRef = await addDoc(collection(db, 'workspaces'), {
            name: workspaceName,
        })

        setWorkspaces(workspaces => [
            ...workspaces,
            { id: workspaceRef.id, name: workspaceName },
        ])

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

        setWorkspaceId('')
    }

    const deleteWorkspace = async (workspaceId: string) => {
        const projects = await getDocs(
            query(
                collection(db, 'projects'),
                where('workspace', '==', workspaceId)
            )
        )

        const batch = writeBatch(db)
        projects.forEach(project => batch.delete(project.ref))
        await batch.commit()

        await deleteDoc(doc(db, 'workspaces', workspaceId))

        setWorkspaces(workspaces =>
            workspaces.filter(workspace => workspace.id != workspaceId)
        )
    }

    const createProject = async () => {
        const projectData: ProjectData = {
            workspace: currentWorkspaceId,
            name: projectName,
            color: 'blue',
        }

        const projectRef = await addDoc(collection(db, 'projects'), projectData)

        navigate(`/project/${projectRef.id}`)
    }

    return (
        <>
            <SingleInputModal
                title="Create a workspace"
                inputPlaceholder="Workspace name"
                submitButtonText="Create"
                show={showCrateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowCrateModal(false)}
                onSubmit={createWorkspace}
            />
            <SingleInputModal
                title="Update workspace"
                inputPlaceholder="Workspace name"
                submitButtonText="Update"
                show={showUpdateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowUpdateModal(false)}
                onSubmit={updateWorkspace}
            />
            <SingleInputModal
                title="Create a project"
                inputPlaceholder="Project name"
                submitButtonText="Create"
                show={showProjectModal}
                nameValue={projectName}
                onNameUpdate={setProjectName}
                onClose={() => setShowProjectModal(false)}
                onSubmit={createProject}
            />
            <div className="flex justify-between items-center mb-16">
                <h1 className="title-1">Homepage</h1>
                <button
                    className="button-primary"
                    onClick={() => setShowCrateModal(true)}>
                    Create workspace
                </button>
            </div>
            {workspaces.map(workspace => (
                <div key={workspace.id}>
                    <div className="flex justify-between items-center mb-16">
                        <h2 className="title-2">{workspace.name}</h2>
                        <div className="flex gap-12">
                            <button
                                className="button-primary"
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
                    <div className="grid cols-4 gap-12 mb-32 border-box w-1-1">
                        {(projects[workspace.id] || []).map(project => (
                            <div
                                onClick={() =>
                                    navigate(`/project/${project.id}`)
                                }
                                key={project.id}
                                className={`project-card flex justify-between flex-column bg-custom-${project.color}`}>
                                <p className="paragraph">{project.name}</p>
                                {/* <p>Delete project</p> */}
                            </div>
                        ))}
                        <div
                            onClick={() => {
                                setCurrentWorkspaceId(workspace.id)
                                setShowProjectModal(true)
                            }}
                            className="project-card flex justify-center items-center bg-custom-blue">
                            <p className="paragraph">Create project</p>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

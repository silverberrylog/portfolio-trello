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
import SingleInputModal from '@/components/SingleInputModal'
import '@/styles/Homepage.scss'
import { ProjectData, Projects, Workspace } from '@/types'
import { db } from '@/utils/firebase'
import WorkspaceComponent from './Workspace'

export default function Homepage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [projects, setProjects] = useState<Projects>({})

    const [showWorkspaceUpdateModal, setShowWorkspaceUpdateModal] =
        useState(false)
    const [showWorkspaceCreateModal, setShowWorkspaceCreateModal] =
        useState(false)
    const [showProjectCreateModal, setShowProjectCreateModal] = useState(false)

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

        setWorkspaceName('')
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

        setWorkspaceId('')
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

    const openProjectCreateModal = (workspaceId: string) => {
        setCurrentWorkspaceId(workspaceId)
        setShowProjectCreateModal(true)
    }

    const openWorkspaceUpdateModal = (
        workspaceName: string,
        workspaceId: string
    ) => {
        setWorkspaceName(workspaceName)
        setWorkspaceId(workspaceId)
        setShowWorkspaceUpdateModal(true)
    }

    return (
        <>
            <SingleInputModal
                title="Create a workspace"
                inputPlaceholder="Workspace name"
                submitButtonText="Create"
                show={showWorkspaceCreateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowWorkspaceCreateModal(false)}
                onSubmit={createWorkspace}
            />
            <SingleInputModal
                title="Update workspace"
                inputPlaceholder="Workspace name"
                submitButtonText="Update"
                show={showWorkspaceUpdateModal}
                nameValue={workspaceName}
                onNameUpdate={setWorkspaceName}
                onClose={() => setShowWorkspaceUpdateModal(false)}
                onSubmit={updateWorkspace}
            />
            <SingleInputModal
                title="Create a project"
                inputPlaceholder="Project name"
                submitButtonText="Create"
                show={showProjectCreateModal}
                nameValue={projectName}
                onNameUpdate={setProjectName}
                onClose={() => setShowProjectCreateModal(false)}
                onSubmit={createProject}
            />
            <div className="flex justify-between items-center mb-16">
                <h1 className="title-1">Workspaces</h1>
                <button
                    className="button-primary"
                    onClick={() => setShowWorkspaceCreateModal(true)}>
                    New
                </button>
            </div>
            {workspaces.map(workspace => (
                <WorkspaceComponent
                    key={workspace.id}
                    workspace={workspace}
                    projects={projects[workspace.id] || []}
                    onUpdateWorkspaceClick={openWorkspaceUpdateModal}
                    onDeleteWorkspaceClick={deleteWorkspace}
                    onCreateProjectClick={openProjectCreateModal}
                />
            ))}
        </>
    )
}

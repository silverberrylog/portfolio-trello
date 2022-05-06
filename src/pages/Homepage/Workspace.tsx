import ConfirmButton from '@/components/ConfirmButton'
import { Project, Workspace } from '@/types'
import { useNavigate } from 'react-router-dom'

interface WorkspaceComponentProps {
    workspace: Workspace
    projects: Project[]
    onUpdateWorkspaceClick: (workspaceName: string, workspaceId: string) => void
    onDeleteWorkspaceClick: (workspaceId: string) => void
    onCreateProjectClick: (workspaceId: string) => void
}

export default function WorkspaceComponent(props: WorkspaceComponentProps) {
    const navigate = useNavigate()

    return (
        <>
            <div className="flex justify-between items-center mb-16">
                <h2 className="title-2">{props.workspace.name}</h2>
                <div className="flex gap-12">
                    <button
                        className="button-primary"
                        onClick={() =>
                            props.onUpdateWorkspaceClick(
                                props.workspace.name,
                                props.workspace.id
                            )
                        }>
                        Update
                    </button>
                    <ConfirmButton
                        onClick={() =>
                            props.onDeleteWorkspaceClick(props.workspace.id)
                        }>
                        Delete
                    </ConfirmButton>
                </div>
            </div>
            <div className="grid cols-4 gap-12 mb-32 border-box w-1-1">
                {props.projects.map(project => (
                    <div
                        onClick={() => navigate(`/project/${project.id}`)}
                        key={project.id}
                        className={`project-card flex justify-between flex-column bg-custom-${project.color}`}>
                        <p className="paragraph">{project.name}</p>
                    </div>
                ))}
                <div
                    onClick={() =>
                        props.onCreateProjectClick(props.workspace.id)
                    }
                    className="project-card flex justify-center items-center bg-custom-blue">
                    <p className="paragraph">Create project</p>
                </div>
            </div>
        </>
    )
}

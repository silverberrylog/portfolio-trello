import { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import '../styles/homepage.scss'

type Color = 'blue' | 'brown' | 'green' | 'purple' | 'red' | 'yellow'

interface Project {
    id: string
    name: string
    color: Color
}

export default function Homepage() {
    const [workspaces, setWorkspaces] = useState<string[]>([])
    const [projects, setProjects] = useState<Project[]>([])

    const [showModal, setShowModal] = useState(true)

    useEffect(() => {
        console.log('mounted')

        setWorkspaces(['Hello', 'Lorem ipsum', 'My workspace'])
        const project: Project = {
            id: 'foo_id',
            name: 'foo name',
            color: 'red',
        }

        setProjects(
            Array(10)
                .fill(null)
                .map(() => project)
        )
    }, [])

    return (
        <div className="homepage">
            <Modal isHidden={!showModal}>
                <div className="homepage__modal">
                    <h1 className="text--bold">Create a project</h1>
                    <form>
                        <button onClick={setShowModal.bind({}, false)}>
                            Hello
                        </button>
                    </form>
                </div>
            </Modal>
            {workspaces.map(workspace => (
                <>
                    <div className="workspace__header">
                        <h1 key={workspace} className="text--bold">
                            {workspace}
                        </h1>
                        <button>Hello world</button>
                    </div>
                    <div className="workspace__content">
                        {projects.map((project, index) => (
                            <div
                                key={index}
                                className="projects__project--blue">
                                <p>{project.name}</p>
                                <p>Delete project</p>
                            </div>
                        ))}
                    </div>
                </>
            ))}
        </div>
    )
}

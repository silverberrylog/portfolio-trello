import { useParams } from 'react-router-dom'

export default function Project() {
    let params = useParams()

    return <h1>Project {params.projectId}</h1>
}

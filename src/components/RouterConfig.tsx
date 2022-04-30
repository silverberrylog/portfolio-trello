import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Homepage = lazy(() => import('../pages/Homepage'))
const Project = lazy(() => import('../pages/Project'))
const NotFound = lazy(() => import('../pages/NotFound'))

const WorkInProgress = () => {
    return (
        <div>
            <h1 className="text--bold">This page is a work in progress</h1>
            <p>Thanks for your patience</p>
        </div>
    )
}

export default function RouterConfig() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/project/:projectId" element={<Project />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

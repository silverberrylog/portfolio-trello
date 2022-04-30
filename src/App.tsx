import { Suspense } from 'react'
import RouterConfig from './components/RouterConfig'
import Loading from './components/Loading'

export default function App() {
    return (
        <div className="page">
            <Suspense fallback={<Loading />}>
                <RouterConfig />
            </Suspense>
        </div>
    )
}

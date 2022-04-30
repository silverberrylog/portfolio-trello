import { Suspense } from 'react'
import RouterConfig from './components/RouterConfig'
import Loading from './components/Loading'

export default function App() {
    return (
        <div className="w-1-1 h-1-1 border-box py-40 px-80">
            <Suspense fallback={<Loading />}>
                <RouterConfig />
            </Suspense>
        </div>
    )
}

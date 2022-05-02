import { Suspense } from 'react'
import RouterConfig from './components/RouterConfig'
import Loading from './components/Loading'
import { store } from '@/store'
import { Provider } from 'react-redux'
import './styles/reset.css'
import './styles/index.scss'

export default function App() {
    return (
        <Provider store={store}>
            <Suspense fallback={<Loading />}>
                <div className="w-1-1 h-1-1 border-box py-40 px-80">
                    <RouterConfig />
                </div>
            </Suspense>
        </Provider>
    )
}

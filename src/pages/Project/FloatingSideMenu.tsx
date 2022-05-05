import { PropsWithChildren } from 'react'

interface FloatingSideMenuProps {
    isVisible: boolean
}

export default function FloatingSideMenu(
    props: PropsWithChildren<FloatingSideMenuProps>
) {
    return (
        <>
            {props.isVisible && (
                <div className="absolute right-0 top-64 overflow-y bg-primary-background w-1-3 border-none rounded p-24 border-box shadow-menu h-menu z-100">
                    {props.children}
                </div>
            )}
        </>
    )
}

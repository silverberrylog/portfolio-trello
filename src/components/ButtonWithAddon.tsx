import { PropsWithChildren } from 'react'

interface ButtonWithAddonProps {
    addon: JSX.Element
    showAddon: boolean
    onClick: () => void
    onAddonClick: () => void
}

export default function ButtonWithAddon(
    props: PropsWithChildren<ButtonWithAddonProps>
) {
    const Icon = props.addon
    return (
        <>
            {!props.showAddon ? (
                <button
                    onClick={() => props.onClick()}
                    className="button-primary">
                    {props.children}
                </button>
            ) : (
                <div className="flex">
                    <button
                        onClick={() => props.onClick()}
                        className="button-addon-base rounded-left border-right-2">
                        {props.children}
                    </button>
                    <button
                        onClick={() => props.onAddonClick()}
                        className="button-addon-base rounded-right flex items-center">
                        <Icon className="w-16 h-16" />
                    </button>
                </div>
            )}
        </>
    )
}

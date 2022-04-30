import { PropsWithChildren, useState } from 'react'

interface ConfirmLinkProps {
    onClick: () => void
}

export default function ConfirmLink(
    props: PropsWithChildren<ConfirmLinkProps>
) {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

    const handleClick = () => {
        if (!showConfirmation) {
            setShowConfirmation(true)
            setTimer(setTimeout(() => setShowConfirmation(false), 2500))
        } else {
            setShowConfirmation(false)
            props.onClick()
        }
    }

    return (
        <a onClick={handleClick} className="link">
            {showConfirmation ? 'Are you sure?' : props.children}
        </a>
    )
}

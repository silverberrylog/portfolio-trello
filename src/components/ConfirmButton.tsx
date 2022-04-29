import { PropsWithChildren, useState } from 'react'

interface ConfirmButtonProps {
    onClick: () => void
}

export default function ConfirmButton(
    props: PropsWithChildren<ConfirmButtonProps>
) {
    const [showConfirmation, setShowConfirmation] = useState(false)

    const handleClick = () => {
        if (!showConfirmation) {
            setShowConfirmation(true)
        } else {
            setShowConfirmation(false)
            props.onClick()
        }
    }

    return (
        <button onClick={handleClick}>
            {showConfirmation ? 'Are you sure?' : props.children}
        </button>
    )
}

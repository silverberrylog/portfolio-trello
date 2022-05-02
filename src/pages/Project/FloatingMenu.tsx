interface FloatingMenuProps {
    isHidden: boolean
    coords: {
        x: number
        y: number
    }
    onEdit: () => void
    onDelete: () => void
    onClose: () => void
}

export default function FloatingMenu(props: FloatingMenuProps) {
    return (
        <div
            className={`fixed top-0 left-0 right-0 bottom-0 bg-primary-shadow${
                props.isHidden ? ' hidden' : ''
            }`}
            onClick={props.onClose}>
            <div
                className="absolute rounded border-none mbc-8"
                style={{
                    left: props.coords.x + 'px',
                    top: props.coords.y + 'px',
                }}>
                <button onClick={props.onEdit} className="block button-primary">
                    Edit task
                </button>
                <button
                    onClick={props.onDelete}
                    className="block button-primary">
                    Delete task
                </button>
                <button className="block button-primary">Cancel</button>
            </div>
        </div>
    )
}

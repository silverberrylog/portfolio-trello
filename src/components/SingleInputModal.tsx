import Modal from './Modal'
import { preventDefault } from '../utils/misc'

interface SingleInputModalProps {
    show: boolean
    onClose: () => void
    onSubmit: () => void
    nameValue: string
    onNameUpdate: (newValue: string) => void
    title: string
    inputPlaceholder: string
    submitButtonText: string
}

export default function SingleInputModal(props: SingleInputModalProps) {
    return (
        <Modal isHidden={!props.show}>
            <h1 className="title-1 mb-16">{props.title}</h1>
            <form className="mbc-12" onSubmit={preventDefault}>
                <input
                    className="input"
                    value={props.nameValue}
                    onChange={event => props.onNameUpdate(event.target.value)}
                    placeholder={props.inputPlaceholder}
                    type="text"
                    autoFocus
                />
                <div className="flex gap-12">
                    <button
                        className="button-primary"
                        onClick={() => {
                            props.onSubmit()
                            props.onClose()
                        }}>
                        {props.submitButtonText}
                    </button>
                    <button className="button-primary" onClick={props.onClose}>
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    )
}

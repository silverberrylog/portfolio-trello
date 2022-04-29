import '../styles/modal.scss'
import { PropsWithChildren, useState } from 'react'

interface ModalProps {
    isHidden: boolean
}

export default function Modal(props: PropsWithChildren<ModalProps>) {
    return (
        <div className={'modal ' + (props.isHidden && 'modal--hidden')}>
            <div className="modal__content">{props.children}</div>
        </div>
    )
}

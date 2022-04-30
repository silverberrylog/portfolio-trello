import { PropsWithChildren, useState } from 'react'

interface ModalProps {
    isHidden: boolean
}

export default function Modal(props: PropsWithChildren<ModalProps>) {
    return (
        <div
            className={`fixed top-0 right-0 bottom-0 left-0 bg-primary-shadow flex justify-center items-center ${
                props.isHidden && 'hidden'
            }`}>
            <div className="bg-primary-background border-none rounded p-16 w-1-3">
                {props.children}
            </div>
        </div>
    )
}

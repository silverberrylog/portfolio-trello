import { MouseEvent, Ref, useEffect } from 'react'

export default function useClickOutside(
    ref: Ref<HTMLElement>,
    onClickOutside: () => void
) {
    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent<HTMLDivElement, MouseEvent>
        ) => {
            if (!ref?.current) return
            if (ref.current.contains(event.target)) return

            onClickOutside()
        }

        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [ref])
}

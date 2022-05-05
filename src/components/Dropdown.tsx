import { useRef, useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'
import useClickOutside from '@/utils/useClickOutside'

interface DropdownOption<T> {
    value: T
    title: string
}

interface DropdownProps<T> {
    options: DropdownOption<T>[]
    selectedValue: T
    onChange: (value: T) => void
}

export default function Dropdown<T>(props: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [width, setWidth] = useState(0)

    const dropdownRef = useRef(null)
    useClickOutside(dropdownRef, () => setIsOpen(false))

    useEffect(() => {
        console.log(props)
    }, [props])

    return (
        <div
            ref={dropdownRef}
            className={`relative overflow-hidden ${
                isOpen ? 'rounded-top' : 'rounded'
            }`}>
            <div
                onClick={event => {
                    setIsOpen(!isOpen)
                    setWidth(event.currentTarget.getBoundingClientRect().width)
                }}
                className="dropdown-option flex justify-between items-center">
                <p>
                    {
                        props.options.filter(
                            option => option.value == props.selectedValue
                        )[0].title
                    }
                </p>
                {isOpen ? (
                    <ChevronUpIcon className="h-16 w-16" />
                ) : (
                    <ChevronDownIcon className="h-16 w-16" />
                )}
            </div>
            <div
                className={`fixed h-menu overflow-hidden rounded-bottom ${
                    !isOpen ? 'hidden' : 'z-100'
                }`}
                style={{ width }}>
                {props.options
                    .filter(option => option.value != props.selectedValue)
                    .map(option => (
                        <div
                            key={option.title}
                            onClick={() => {
                                setIsOpen(false)
                                props.onChange(option.value)
                            }}
                            className="dropdown-option">
                            {option.title}
                        </div>
                    ))}
            </div>
        </div>
    )
}

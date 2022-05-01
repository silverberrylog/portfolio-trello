export const preventDefault = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
}

export const fixFocus = (
    event: React.FocusEvent<HTMLTextAreaElement, Element>
) => {
    event.target.selectionEnd = 0
    // setTimeout(() => (event.target.selectionEnd = 0), 0)
}

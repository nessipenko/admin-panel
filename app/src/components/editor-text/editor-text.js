const EditorText = (element, virtualElement) => {
    element.addEventListener('click', () => onClick())
    element.addEventListener('blur', () => onBlur())
    element.addEventListener('keypress', (e) => onKeypress(e))
    element.addEventListener('input', () => onTextEdit())
    if (element.parentNode.nodeName === "A" || element.parentNode.nodeName === "BUTTON") {
        element.addEventListener("contextmenu", (e) => onCtxMenu(e));
    }

    const onClick = () => {
        element.contentEditable = 'true'
        element.focus()
    }
    const onBlur = () => {
        element.removeAttribute('contenteditable')
    }
    const onKeypress = (e) => {
        if (e.keyCode === 13) {
            element.blur();
        }
    }
    const onTextEdit = () => {
        virtualElement.innerHTML = element.innerHTML;
        ('edit', element.innerHTML);
    }
    const onCtxMenu = (e) => {
        e.preventDefault();
        onClick();
    }

}
export default EditorText;

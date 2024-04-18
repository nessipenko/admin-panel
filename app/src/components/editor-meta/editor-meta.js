import React, { useEffect, useRef, useState } from "react";

const EditorMeta = ({ modal, target, virtualDom }) => {
    const [meta, setMeta] = useState({
        title: "",
        keywords: "",
        description: ""
    })
    useEffect(() => {
        getMeta(virtualDom);
    }, [virtualDom])


    const getMeta = (virtualDom) => {
        const title = virtualDom.head.querySelector('title') || virtualDom.head.appendChild(virtualDom.createElement('title'));

        let keywords = virtualDom.head.querySelector('meta[name="keywords"]')
        if (!keywords) {
            keywords = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            keywords.setAttribute('name', 'keywords');
            keywords.setAttribute("content", "");
        }

        let description = virtualDom.head.querySelector('meta[name="description"]')
        if (!description) {
            description = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            description.setAttribute('name', 'description');
            description.setAttribute("content", "");
        }
        setMeta({
            title: title.innerHTML,
            keywords: keywords.getAttribute("content"),
            description: description.getAttribute("content")
        })
    }

    const applyMeta = () => {
        let title = virtualDom.head.querySelector('title');
        if (title) title.innerHTML = meta.title;
        let keywords = virtualDom.head.querySelector('meta[name="keywords"]');
        if (keywords) keywords.setAttribute("content", meta.keywords);
        let description = virtualDom.head.querySelector('meta[name="description"]');
        if (description) description.setAttribute("content", meta.description);
    };


    const onValueChange = (e) => {
        const { name, value } = e.target;
        setMeta(prevMeta => ({
            ...prevMeta,
            [name]: value
        }));
    };

    return (
        <div id={target} uk-modal={modal.toString()} container='false'>
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">META-tags editing</h2>

                <form>
                    <div className="uk-margin">
                        <input
                            data-title
                            className="uk-input"
                            name="title"
                            type="text"
                            placeholder="Title"
                            value={meta.title}
                            onChange={onValueChange} />
                    </div>

                    <div className="uk-margin">
                        <textarea
                            data-key
                            name="keywords"
                            className="uk-textarea"
                            rows="5"
                            placeholder="Keywords"
                            value={meta.keywords}
                            onChange={onValueChange}>

                        </textarea>
                    </div>
                    <div className="uk-margin">
                        <textarea
                            data-descr
                            name='description'
                            className="uk-textarea"
                            rows="5"
                            placeholder="Description"
                            value={meta.description}
                            onChange={onValueChange}>

                        </textarea>
                    </div>
                </form>
                <p className="uk-text-right">
                    <button
                        className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">Cancel</button>

                    <button
                        className="uk-button uk-button-primary uk-modal-close"
                        type="button"
                        onClick={applyMeta}>Apply</button>
                </p>
            </div>
        </div >
    )
}
export default EditorMeta;
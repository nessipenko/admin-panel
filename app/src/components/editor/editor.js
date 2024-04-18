import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import '../../helpers/iframeLoader.js';
import { parseStrToDOM, serializeDomToStr, unwrapTextNodes, wrapTextNodes } from "../../helpers/dom-helper.js";
import EditorText from "../editor-text";
import UIkit from "uikit";
import Spinner from "../spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";

const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [newPageName, setNewPageName] = useState("");
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);
    const [backupsList, setBackupsList] = useState([]);

    const iframe = useRef(null);
    const virtualDom = useRef(null);

    useEffect(() => {
        init(null, currentPage);
    }, [currentPage]);

    const init = (e, page) => {
        if (e) {
            e.preventDefault();
        }
        isLoading();
        open(page, isLoaded, iframe);
        loadPageList();
        loadBackupsList();
    };

    const open = (page, cb) => {
        setCurrentPage(page);

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => parseStrToDOM(res.data))
            .then(wrapTextNodes)
            .then(dom => {
                virtualDom.current = dom;
                return dom;
            })
            .then(serializeDomToStr)
            .then(html => axios.post('./api/saveTempPage.php', { html }))
            .then(() => iframe.current.load('../123o7y3o48ilh.html'))
            .then(() => axios.post('./api/deleteTempPage.php'))
            .then(() => enableEditing())
            .then(() => injectStyles())
            .then(cb)

            .catch(error => {
                console.error("Error loading page:", error);
            });
        loadBackupsList()
    };

    const save = (onSuccess, onError) => {
        isLoading();
        const newDom = virtualDom.current.cloneNode(true);
        unwrapTextNodes(newDom);
        const html = serializeDomToStr(newDom);
        axios
            .post('./api/savePage.php', { pageName: currentPage, html })
            .then(() => {
                loadBackupsList();
                onSuccess()
            })
            .catch(onError)
            .finally(isLoaded);
    };


    const enableEditing = () => {
        const iframeContent = iframe.current.contentDocument;
        iframeContent.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = virtualDom.current.body.querySelector(`[nodeid="${id}"]`);
            new EditorText(element, virtualElement);
        });
    };

    const injectStyles = () => {
        const style = iframe.current.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }`;
        iframe.current.contentDocument.head.appendChild(style);
    };

    const loadPageList = () => {
        axios
            .get('./api/pageList.php')
            .then(res => {
                setPageList(res.data);
            })
            .catch(err => console.error("Error loading page list:", err));
    };

    const loadBackupsList = () => {
        axios
            .get('./backups/backups.json')
            .then(res => {
                setBackupsList(res.data.filter(backup => backup.page === currentPage));
            })
            .catch(err => console.error("Error loading backups list:", err));
    };

    const restoreBackup = (e, backup) => {
        if (e) {
            e.preventDefault();
        }
        UIkit.modal.confirm('Are you sure you want to restore this backup? Сhanges will not be saved!', { labels: { ok: 'Yes', cancel: 'No' } })
            .then(() => {
                isLoading();
                return axios.post('./api/restoreBackup.php', { 'page': currentPage, 'file': backup });
            })
            .then(() => {
                open(currentPage, isLoaded);
            })
            .catch(error => {
                console.error("Error restoring backup:", error);
            });
    };

    const isLoading = () => {
        setLoading(true);
    };

    const isLoaded = () => {
        setLoading(false);
    };

    const handleSaveButtonClick = () => {
        save(() => {
            UIkit.notification({ message: 'Successfully saved', status: 'success' });
        }, () => {
            UIkit.notification({ message: 'Save error', status: 'danger' });
        });
    };

    const modal = true;
    const spinner = loading ? <Spinner active={true} /> : null;

    return (
        <>
            <iframe ref={iframe} src=''></iframe>
            {spinner}
            <Panel />
            <ConfirmModal modal={modal} target={'modal-save'} method={handleSaveButtonClick} />
            <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={init} />
            <ChooseModal modal={modal} target={'modal-backup'} data={backupsList} redirect={restoreBackup} />
        </>
    );
};

export default Editor;

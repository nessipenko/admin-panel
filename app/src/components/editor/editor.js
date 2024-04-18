import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import '../../helpers/iframeLoader.js';
import { parseStrToDOM, serializeDomToStr, unwrapImages, unwrapTextNodes, wrapImages, wrapTextNodes } from "../../helpers/dom-helper.js";
import EditorText from "../editor-text";
import UIkit from "uikit";
import Spinner from "../spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";
import EditorImages from "../editor-images";
import Login from "../login";


const Editor = () => {
    const [pageList, setPageList] = useState([]);
    const [currentPage, setCurrentPage] = useState("index.html");
    const [loading, setLoading] = useState(true);
    const [backupsList, setBackupsList] = useState([]);
    const [auth, setAuth] = useState(false);
    const [loginError, setLoginError] = useState(false);
    const [loginLenthError, setLoginLenthError] = useState(false);

    const iframe = useRef(null);
    const virtualDom = useRef(null);

    useEffect(() => {
        checkAuth()
        init(null, currentPage);
    }, [currentPage, auth]);

    const checkAuth = () => {
        axios
            .get('./api/checkAuth.php')

            .then(res => {
                setAuth(res.data.auth);
            })

            .catch(error => {
                console.error("Error authorization", error);
            });
    }

    const login = (pass) => {
        if (pass.length > 5) {
            axios
                .post('./api/login.php', { 'password': pass })
                .then(res => {
                    setAuth(res.data.auth);
                    setLoginError(!res.data.auth);
                    setLoginLenthError(false);
                })
        } else {
            setLoginError(false);
            setLoginLenthError(true);
        }
    }

    const logout = () => {
        axios
            .get('./api/logout.php')
            .then(() => {
                window.location.replace('/')
            })
            .catch(error => {
                console.error("Error authorization", error);
            });
    }

    const init = (e, page) => {
        if (e) {
            e.preventDefault();
        }
        if (auth) {
            isLoading();
            open(page, isLoaded, iframe);
            loadPageList();
            loadBackupsList();
        }
    };

    const open = (page, cb) => {
        setCurrentPage(page);

        axios
            .get(`../${page}?rnd=${Math.random()}`)
            .then(res => parseStrToDOM(res.data))
            .then(wrapTextNodes)
            .then(wrapImages)
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

    const save = () => {
        isLoading();
        const newDom = virtualDom.current.cloneNode(true);
        unwrapTextNodes(newDom);
        unwrapImages(newDom);
        const html = serializeDomToStr(newDom);
        axios
            .post('./api/savePage.php', { pageName: currentPage, html })
            .then(() => {
                loadBackupsList();
                showNotifications('Successfully saved', 'success');

            })
            .catch(() => showNotifications('Error saving', 'danger'))
            .finally(isLoaded);
    };


    const enableEditing = () => {
        const iframeContent = iframe.current.contentDocument;
        iframeContent.body.querySelectorAll("text-editor").forEach(element => {
            const id = element.getAttribute("nodeid");
            const virtualElement = virtualDom.current.body.querySelector(`[nodeid="${id}"]`);
            new EditorText(element, virtualElement);
        });

        iframeContent.body.querySelectorAll("[editableimgid]").forEach(element => {
            const id = element.getAttribute("editableimgid");
            const virtualElement = virtualDom.current.body.querySelector(`[editableimgid="${id}"]`);
            new EditorImages(element, virtualElement, isLoading, isLoaded, showNotifications);
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
            }
            [editableimgid]:hover{
                outline: 3px solid orange;
                outline-offset: 8px;
            }`
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

    const showNotifications = (message, status) => {
        UIkit.notification({ message, status });
    }
    const handleSaveButtonClick = () => {
        save(() => {
            UIkit.notification({ message: 'Successfully saved', status: 'success' });
        }, () => {
            UIkit.notification({ message: 'Save error', status: 'danger' });
        });
    };

    const modal = true;
    const spinner = loading ? <Spinner active={true} /> : null;

    if (!auth) {
        return (
            <Login login={login} lengthErr={loginLenthError} logErr={loginError} />
        )
    }
    return (
        <>
            <iframe ref={iframe} src=''></iframe>
            <input id='img-upload' type="file" accept="image/*" style={{ display: 'none' }}></input>
            {spinner}
            <Panel />
            <ConfirmModal
                modal={modal}
                target={'modal-save'}
                method={handleSaveButtonClick}
                text={{
                    title: 'Saving',
                    descr: 'Do you want to save changes?',
                    btn: 'Save'
                }} />

            <ConfirmModal
                modal={modal}
                target={'modal-logout'}
                method={logout}
                text={{
                    title: 'Logout',
                    descr: 'Do you want to logout?',
                    btn: 'Log out'
                }} />
            <ChooseModal modal={modal} target={'modal-open'} data={pageList} redirect={init} />
            <ChooseModal modal={modal} target={'modal-backup'} data={backupsList} redirect={restoreBackup} />
            {virtualDom.current ? <EditorMeta modal={modal} target={'modal-meta'} virtualDom={virtualDom.current} /> : false}
        </>
    );
};

export default Editor;

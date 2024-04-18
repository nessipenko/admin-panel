import axios from "axios";
import React from "react";

const EditorImages = (element, virtualElement) => {

    element.addEventListener('click', () => onClick())
    const imgUploader = document.querySelector('#img-upload');

    const onClick = () => {
        imgUploader.click()
        imgUploader.addEventListener('change', () => {
            if (imgUploader.files && imgUploader.files[0]) {
                let formData = new FormData();
                formData.append('image', imgUploader.files[0]);
                axios
                    .post('./api/uploadImage.php', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }

                    })
                    .then((res) => {
                        virtualElement.src = element.src = `./img/${res.data.src}`
                        imgUploader.value = ''
                    })
            }
        })

    }

}

export default EditorImages;
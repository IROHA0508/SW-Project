import React, { useState } from 'react';
import './photoUpload.css'

function UploadModal({ closeModal }){
    const [photo, setPhoto] = useState(null);
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');

    const handlePhotoUpload = (e) => {
        const photo = e.target.files[0];
        setPhoto(photo);
    }

    const handleSubmit = async() => {
        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('description', description);
        formData.append('keywords', keywords);

        try{
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if(response.ok){
                closeModal();   //모달 닫기
                window.location.reload();
            } else {
                console.error('사진 업로드에 실패했습니다');
            }
        } catch (error){
            console.error('사진 업로드 중 오류 발생', error);
        }
    };

    return (
        <div className='modal'>
            <div className='modal-content'>
                <h2>Upload Photo</h2>
                <div className='preview-image'>
                    {photo && <img src={URL.createObjectURL(photo)} alt='Preview' />}
                </div>
                <input type='file' accept='image/*' onChange={handlePhotoUpload} />
                <textarea
                    placeholder='Description'
                    value={description}
                    onChange={(e)=>setDescription(e.target.value)}
                />
                <input
                    type='text'
                    placeholder='Keywords (comma separated)'
                    value={keywords}
                    onChange={(e)=>setKeywords(e.target.value)}
                />
                <div className='button-container'>
                    <button onClick={handleSubmit}>Upload</button>
                    <button onClick={closeModal}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default UploadModal;
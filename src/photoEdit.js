import React, { useState, useEffect } from 'react';
import './photoEdit.css';

function PhotoEdit({ photoId, closeModal }) {
    const [photo, setPhoto] = useState('');
    const [description, setDescription] = useState('');
    const [keywords, setKeywords] = useState('');

        //게시물 정보 가져오기
    useEffect(() => {
        const fetchPhotoInfo = async () => {
            try {
                const response = await fetch(`/api/photo/${photoId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if(response.ok) {
                    const data = await response.json();
                    console.log('서버에서 받은 데이터:', data);                 //서버에서 받은 데이터 출력
                    setDescription(data.description);
                    if (Array.isArray(data.keywords)) {
                        setKeywords(data.keywords.join(', '));
                    }
                    setPhoto(data.photo_data);
                } else {
                    console.error('게시물 정보를 가져오지 못했습니다');
                }
            } catch (error) {
                console.error('게시물 정보 가져오는 중 오류 발생', error);
            }
        };

        fetchPhotoInfo();
    }, [photoId]);

    // 내용이 수정될 때마다 상태 업데이트
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    };

    const handleKeywordsChange = (e) => {
        setKeywords(e.target.value);
    };

    // 수정된 내용을 다시 서버로 전송하는 함수
    const handleSubmit = async() => {
        
        const updatedData = {
            description: description,
            keywords: keywords.split(',').map(keyword => keyword.trim())
        }
        
        try {
            const response = await fetch(`/api/photo/${photoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData),
                credentials: 'include'
            });
            
            if (response.ok){
                const result = await response.json();
                console.log(result);
                closeModal();
                window.location.reload();
            } else {
                console.error('게시물 수정에 실패했습니다');
            }
        } catch (error) {
            console.error('게시물 수정 중 오류가 발생', error)
        }
    };

    return (
        <div className='modal'>
            <div className='modal-content'>
                <h2>Edit Photo</h2>
                <div className='preview-image'>
                    <img src={`data:image/jpeg;base64,${photo}`} alt='' />
                </div>
                <textarea
                placeholder='Description'
                value={description}
                onChange={handleDescriptionChange}
                />
                <input
                type="text"
                placeholder="Keywords (comma separated)"
                value={keywords}
                onChange={handleKeywordsChange}
                />
                <div className="button-container">
                <button onClick={handleSubmit}>Save</button>
                <button onClick={closeModal}>Cancel</button>
                </div>
            </div>
        </div>
    )

}

export default PhotoEdit;
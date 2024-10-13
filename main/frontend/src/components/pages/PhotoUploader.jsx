import React, { useState } from "react";
import axios from "axios";

export default function PhotoUploader({ addedPhotos = [], onChange, placeId }) {
    const [photoLink, setPhotoLink] = useState('');

    function handleDeletePhoto(index) {
        onChange(prev => prev.filter((_, i) => i !== index));
    }

    function selectAsMain(ev, filename) {
        ev.preventDefault();
        const updatedPhotos = [filename, ...addedPhotos.filter(photo => photo !== filename)];
        onChange(updatedPhotos);

        axios.put(`http://localhost:3000/places/${placeId}/photos`, { photos: updatedPhotos })
            .then(() => {
                console.log('Photos updated successfully');
            })
            .catch(error => {
                console.error('Error updating photos:', error);
            });
    }

    function uploadPhoto(ev) {
        const files = ev.target.files;
        const data = new FormData();

        for (let i = 0; i < files.length; i++) {
            data.append('photos', files[i]);
        }

        axios.post('http://localhost:3000/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(response => {
            const filePaths = response.data;
            onChange(prev => [...prev, ...filePaths]);
        })
        .catch(error => {
            console.error('Error uploading photos:', error);
        });
    }

    async function addPhotoByLink(ev) {
        ev.preventDefault();
        try {
            const { data: filename } = await axios.post('http://localhost:3000/upload-by-link', { link: photoLink });
            onChange(prev => [...prev, filename]);
            setPhotoLink('');
        } catch (error) {
            console.error('Error adding photo by link:', error);
        }
    }

    return (
        <>
            <div className="link-adder">
                <input value={photoLink} onChange={ev => setPhotoLink(ev.target.value)} type="text" className="input-text" placeholder="Add using a link.... jpg" />
                <button onClick={addPhotoByLink} className="add-place-link">Add&nbsp;photo</button>
            </div>
            <div className="photo-grid">
                {addedPhotos.length > 0 && addedPhotos.map((link, index) => (
                    <div key={index} className="photo-item">
                        <img src={link} alt={`Uploaded Photo ${index}`} className="uploaded-photo" />
                        <button className="delete-button" onClick={() => handleDeletePhoto(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <button className="fav-button" onClick={ev => selectAsMain(ev, link)}>
                            {link === addedPhotos[0] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon-small">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                ))}
                <label className="add-photo-button">
                    <input type="file" className="hidden" onChange={uploadPhoto} multiple />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-small">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload
                </label>
            </div>
        </>
    );
}

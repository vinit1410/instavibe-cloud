import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { X, Image as ImageIcon, Upload } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [caption, setCaption] = useState('');
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [taggedPeople, setTaggedPeople] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const resetForm = useCallback(() => {
        setCaption('');
        setTitle('');
        setLocation('');
        setTaggedPeople('');
        setFile(null);
        setPreview(null);
        setError('');
        setUploading(false);
        setDragOver(false);
    }, []);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    const processFile = (selectedFile) => {
        if (!selectedFile) return;
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select an image file (JPG, PNG, GIF, etc.)');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('Image must be smaller than 10 MB.');
            return;
        }
        setError('');
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const handleFileChange = (e) => {
        processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        processFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an image first.');
            return;
        }

        setUploading(true);
        setError('');
        try {
            // 1. Upload the image
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadRes.data.url;

            // 2. Create the post with metadata
            await axios.post('/api/posts', {
                title: title || null,
                caption,
                imageUrl,
                location: location || null,
                taggedPeople: taggedPeople ? taggedPeople.split(',').map(p => p.trim()).filter(p => p) : []
            });

            onPostCreated();
            resetForm();
            onClose();
        } catch (err) {
            console.error("Post creation failed", err);
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to create post. Please try again.';
            setError(typeof msg === 'string' ? msg : 'Failed to create post.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Create New Post</h3>
                    <button
                        id="close-post-modal-btn"
                        onClick={handleClose}
                        className="icon-btn"
                        title="Close"
                        disabled={uploading}
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Image upload area */}
                    <div
                        className="upload-section"
                        style={{ borderColor: dragOver ? 'var(--ig-primary)' : undefined }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {preview ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <img src={preview} alt="Preview" className="upload-preview" />
                                <button
                                    type="button"
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Remove image"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label
                                className="upload-label"
                                htmlFor="post-image-input"
                                style={{ width: '100%', height: '100%', justifyContent: 'center' }}
                            >
                                <ImageIcon size={52} />
                                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                    {dragOver ? 'Drop image here' : 'Select from computer'}
                                </span>
                                <span style={{ fontSize: '12px' }}>or drag and drop</span>
                                <input
                                    id="post-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    hidden
                                    disabled={uploading}
                                />
                            </label>
                        )}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="caption-input"
                        style={{ minHeight: 'auto', height: '40px', resize: 'none' }}
                        disabled={uploading}
                    />

                    {/* Caption */}
                    <textarea
                        id="post-caption-input"
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="caption-input"
                        maxLength={2200}
                        disabled={uploading}
                    />
                    <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--ig-secondary-text)', marginTop: '-8px' }}>
                        {caption.length}/2200
                    </div>

                    {/* Location */}
                    <input
                        type="text"
                        placeholder="Location (e.g. London, UK)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="caption-input"
                        style={{ minHeight: 'auto', height: '40px', resize: 'none' }}
                        disabled={uploading}
                    />

                    {/* Tagged People */}
                    <input
                        type="text"
                        placeholder="Tag people (comma separated)"
                        value={taggedPeople}
                        onChange={(e) => setTaggedPeople(e.target.value)}
                        className="caption-input"
                        style={{ minHeight: 'auto', height: '40px', resize: 'none' }}
                        disabled={uploading}
                    />

                    {error && <p className="auth-error" style={{ marginTop: 0 }}>{error}</p>}

                    <button
                        id="share-post-btn"
                        type="submit"
                        className="btn-primary"
                        disabled={uploading || !file}
                    >
                        {uploading ? (
                            <>
                                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '6px' }}></span>
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Share
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;

'use client';

import { useState, useRef } from 'react';
import styles from './IngestionPanel.module.css';

export default function IngestionPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'uploading' | null, message: string }>({ type: null, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setStatus({ type: 'uploading', message: `Uploading ${file.name}...` });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:4000/rag/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            setStatus({ type: 'success', message: result.message });

            // Clear success message after 5 seconds
            setTimeout(() => setStatus({ type: null, message: '' }), 5000);

        } catch (error: any) {
            console.error('Upload Error:', error);
            setStatus({ type: 'error', message: error.message || 'Failed to upload file' });
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.title}>
                    📚 Knowledge Base Ingestion
                </div>
                <div>{isOpen ? '▼' : '▶'}</div>
            </div>

            {isOpen && (
                <div className={styles.content}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.md"
                    />

                    <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                        <p>Drag & drop or <button className={styles.browseButton}>Browse</button></p>
                        <p className={styles.info}>Supported: PDF, TXT, MD</p>
                    </div>

                    {status.type && (
                        <div className={`${styles.status} ${status.type === 'error' ? styles.error : styles.success}`}>
                            {status.type === 'uploading' && <span className={styles.typingDot}>⏳</span>}
                            <span>{status.message}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

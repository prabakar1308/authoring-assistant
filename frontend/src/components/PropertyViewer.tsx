'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import styles from './PropertyViewer.module.css';

// Dynamic import for react-json-view because it doesn't support SSR
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface PropertyViewerProps {
    data: any;
    name: string;
    onSave?: (newData: any) => Promise<void>;
}

export default function PropertyViewer({ data, name, onSave }: PropertyViewerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [currentData, setCurrentData] = useState(() => {
        if (typeof data === 'string') {
            try { return JSON.parse(data); } catch (e) { return { error: 'Failed to parse JSON string', raw: data }; }
        }
        return data;
    });

    const handleEdit = (edit: any) => {
        setCurrentData(edit.updated_src);
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        setStatus(null);
        try {
            await onSave(currentData);
            setStatus({ type: 'success', message: 'Data saved to current session!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save data.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <span className={styles.label}>Component:</span>
                    <span className={styles.value}>{name}</span>
                </div>
                {onSave && (
                    <button
                        className={styles.saveSessionButton}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? '⏳ Saving...' : '💾 Save to Session'}
                    </button>
                )}
            </div>

            {status && (
                <div className={`${styles.status} ${styles[status.type]}`}>
                    {status.message}
                </div>
            )}

            <div className={styles.jsonWrapper}>
                <ReactJson
                    src={currentData}
                    name={false}
                    theme="monokai"
                    displayDataTypes={false}
                    enableClipboard={true}
                    collapsed={1}
                    onEdit={handleEdit}
                    onAdd={handleEdit}
                    onDelete={handleEdit}
                    style={{ background: 'transparent', fontSize: '14px' }}
                />
            </div>
            <p className={styles.hint}>Tip: You can click values or keys to edit them.</p>
        </div>
    );
}

'use client';

import dynamic from 'next/dynamic';
import styles from './PropertyViewer.module.css';

// Dynamic import for react-json-view because it doesn't support SSR
const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface PropertyViewerProps {
    data: any;
    name: string;
}

export default function PropertyViewer({ data, name }: PropertyViewerProps) {
    let parsedData = data;
    if (typeof data === 'string') {
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            parsedData = { error: 'Failed to parse JSON string', raw: data };
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <span className={styles.label}>Component:</span>
                <span className={styles.value}>{name}</span>
            </div>
            <div className={styles.jsonWrapper}>
                <ReactJson
                    src={parsedData}
                    name={false}
                    theme="monokai"
                    displayDataTypes={false}
                    enableClipboard={true}
                    collapsed={1}
                    style={{ background: 'transparent', fontSize: '14px' }}
                />
            </div>
        </div>
    );
}

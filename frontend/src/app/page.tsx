'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import IngestionPanel from '@/components/IngestionPanel';
import Dashboard from '@/components/Dashboard';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'ingestion'>('chat');

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>✨</span> AEM Authoring Assistant
        </div>
      </div>

      <div className={styles.chatWrapper}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'chat' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            AI Assistant
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            AEM Setup
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'ingestion' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ingestion')}
          >
            Ingestion
          </button>
        </div>

        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'ingestion' && <IngestionPanel />}
      </div>
    </main>
  );
}

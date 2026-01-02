import ChatInterface from '@/components/ChatInterface';
import IngestionPanel from '@/components/IngestionPanel';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>✨</span> AEM Authoring Assistant
        </div>
      </div>

      <div className={styles.chatWrapper}>
        <IngestionPanel />
        <ChatInterface />
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

interface StoreData {
    environments: { id: string, value: string }[];
    availableTenants: { id: string, value: string, domain: string, selector: string }[];
    urls: { id: number, value: string, tenant: string }[];
    components: { id: number, name: string, selector: string, helperProps?: string[] }[];
}

export default function Dashboard() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:4000/aem/store')
            .then(res => res.json())
            .then(data => {
                setStore(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error fetching store:', err);
                setIsLoading(false);
            });
    }, []);

    const filteredUrls = store?.urls.filter(u =>
        u.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.tenant.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredComponents = store?.components.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.selector.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) return <div className={styles.loading}>Loading AEM configuration...</div>;
    if (!store) return <div className={styles.loading}>Failed to load configuration.</div>;

    return (
        <div className={styles.dashboard}>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search tenants, components, or URLs..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🏢 Available Tenants</h2>
                <div className={styles.grid}>
                    {store.availableTenants.filter(t => t.value.toLowerCase().includes(searchTerm.toLowerCase())).map(tenant => (
                        <div key={tenant.id} className={styles.card}>
                            <div className={styles.cardTitle}>{tenant.value} ({tenant.id})</div>
                            <div className={styles.cardContent}>
                                <div>Domain: {tenant.domain}</div>
                                <div>Path: {tenant.selector}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🧱 AEM Components</h2>
                <div className={styles.grid}>
                    {filteredComponents.map(comp => (
                        <div key={comp.id} className={styles.card}>
                            <div className={styles.cardTitle}>{comp.name}</div>
                            <div className={styles.cardContent}>
                                <div>Selector: <code>{comp.selector}</code></div>
                                {comp.helperProps && (
                                    <div className={styles.badge}>
                                        Props: {comp.helperProps.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🔗 Tracked URLs</h2>
                <div className={styles.grid}>
                    {filteredUrls.slice(0, 12).map(url => (
                        <div key={url.id} className={styles.card}>
                            <div className={styles.cardTitle}>Page ID: {url.id}</div>
                            <div className={styles.cardContent}>
                                <div style={{ wordBreak: 'break-all' }}>{url.value}</div>
                                <div className={styles.badge}>{url.tenant}</div>
                            </div>
                        </div>
                    ))}
                    {filteredUrls.length > 12 && (
                        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ color: 'var(--muted-foreground)' }}>+ {filteredUrls.length - 12} more pages</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

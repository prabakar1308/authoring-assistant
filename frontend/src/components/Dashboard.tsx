'use client';

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import ManageComponents from './aem/ManageComponents';
import ManageList from './aem/ManageList';
import Modal from './Modal';
import PropertyViewer from './PropertyViewer';

interface StoreData {
    environments: { id: string, value: string }[];
    availableTenants: { id: string, value: string, domain: string, selector: string }[];
    urls: { id: number, value: string, tenant: string }[];
    components: { id: number, name: string, selector: string, tenant: string, helperProps?: string[] }[];
}

export default function Dashboard() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'view' | 'manage'>('view');

    // Selection State
    const [selectedTenantId, setSelectedTenantId] = useState<string>('EW');

    // Analysis State
    const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);
    const [analyzingComponent, setAnalyzingComponent] = useState<string | null>(null);
    const [analysisResults, setAnalysisResults] = useState<any[]>([]);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Property Viewer State
    const [selectedPropData, setSelectedPropData] = useState<{ name: string, selector: string, data: string, url?: string } | null>(null);

    const handleSaveProps = async (newData: any) => {
        const targetUrl = selectedPropData?.url || analyzingUrl;
        if (!selectedPropData || !targetUrl) return;

        try {
            const res = await fetch('http://localhost:4000/aem/update-page-props', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: analyzingUrl,
                    selector: selectedPropData.selector,
                    props: newData
                })
            });
            if (!res.ok) throw new Error('Failed to save');

            // Refresh analysis results to reflect changes
            if (analyzingUrl) {
                handleAnalyzePage(analyzingUrl);
            } else if (analyzingComponent) {
                const comp = store?.components.find(c => c.name === analyzingComponent);
                if (comp) handleAnalyzeComponent(comp);
            }
        } catch (err) {
            console.error('Error saving props:', err);
            throw err;
        }
    };

    const fetchStore = async () => {
        try {
            const res = await fetch('http://localhost:4000/aem/store');
            const data = await res.json();
            setStore(data);
        } catch (err) {
            console.error('Error fetching store:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzePage = async (url: string) => {
        setAnalyzingUrl(url);
        setAnalyzingComponent(null);
        setIsAnalyzing(true);
        setIsAnalysisModalOpen(true);
        try {
            const res = await fetch(`http://localhost:4000/aem/analyze-page?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            setAnalysisResults(data);
        } catch (err) {
            console.error('Error analyzing page:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeComponent = async (comp: any) => {
        setAnalyzingComponent(comp.name);
        setAnalyzingUrl(null);
        setIsAnalyzing(true);
        setIsAnalysisModalOpen(true);
        try {
            // Need a way to search for component across all URLs
            const res = await fetch(`http://localhost:4000/aem/search-component?selector=${comp.selector}`);
            const data = await res.json();
            // Transform data to match the analysis modal expected format
            const transformed = data.pages.map((p: any) => ({
                name: comp.name,
                selector: comp.selector,
                url: p.url,
                rawProps: p.rawProps
            }));
            setAnalysisResults(transformed);
        } catch (err) {
            console.error('Error searching component:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        fetchStore();
    }, []);

    const selectedTenant = store?.availableTenants.find(t => t.id === selectedTenantId);

    const filteredUrls = store?.urls.filter(u =>
        u.tenant === selectedTenantId && (
            u.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.tenant.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || [];

    const filteredComponents = store?.components.filter(c =>
        c.tenant === selectedTenantId && (
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.selector.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || [];

    if (isLoading) return <div className={styles.loading}>Loading AEM configuration...</div>;
    if (!store) return <div className={styles.loading}>Failed to load configuration.</div>;

    return (
        <div className={styles.dashboard}>
            {/* 1. Tenant Details & Selector (TOP) */}
            {selectedTenant && (
                <div className={styles.section} style={{ marginBottom: '0' }}>
                    <div className={styles.sectionHeaderRow}>
                        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>🏢 {selectedTenant.value} Details</h2>
                        <div className={styles.inlineTenantSelector}>
                            <label htmlFor="tenant-select">Switch Tenant: </label>
                            <select
                                id="tenant-select"
                                value={selectedTenantId}
                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                className={styles.dropdown}
                            >
                                {store.availableTenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.value} ({t.id})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.grid} style={{ marginTop: '16px' }}>
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <div><strong>Domain:</strong> {selectedTenant.domain}</div>
                                <div><strong>Base Path:</strong> {selectedTenant.selector}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Global Search & View Toggle */}
            <div className={styles.searchBar}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Search tenants, components, or URLs..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '70%' }}
                    />
                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.toggleButton} ${activeView === 'view' ? styles.toggleButtonActive : ''}`}
                            onClick={() => setActiveView('view')}
                        >
                            View
                        </button>
                        <button
                            className={`${styles.toggleButton} ${activeView === 'manage' ? styles.toggleButtonActive : ''}`}
                            onClick={() => setActiveView('manage')}
                        >
                            Manage
                        </button>
                    </div>
                </div>
            </div>

            {activeView === 'view' ? (
                <>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🧱 {selectedTenant?.value} Components</h2>
                        <div className={styles.grid}>
                            {filteredComponents.length > 0 ? filteredComponents.map(comp => (
                                <div key={comp.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{comp.name}</div>
                                        <button
                                            className={styles.analyzeButton}
                                            onClick={() => handleAnalyzeComponent(comp)}
                                            title="Find Instances"
                                        >
                                            🔍 Analyze
                                        </button>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div>Selector: <code>{comp.selector}</code></div>
                                        {comp.helperProps && (
                                            <div className={styles.badge}>
                                                Props: {comp.helperProps.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.noData}>No components registered for this tenant.</div>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔗 {selectedTenant?.value} Tracked URLs</h2>
                        <div className={styles.grid}>
                            {filteredUrls.length > 0 ? filteredUrls.map(url => (
                                <div key={url.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>Page ID: {url.id}</div>
                                        <button
                                            className={styles.analyzeButton}
                                            onClick={() => handleAnalyzePage(url.value)}
                                            title="Analyze Page"
                                        >
                                            🔍 Analyze
                                        </button>
                                    </div>
                                    <div className={styles.cardContent}>
                                        <div style={{ wordBreak: 'break-all' }}>{url.value}</div>
                                        <div className={styles.badge}>{url.tenant}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.noData}>No URLs tracked for this tenant.</div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>⚙️ Manage Components</h2>
                        <ManageComponents selectedTenantId={selectedTenantId} />
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🌐 Manage Tracked URLs</h2>
                        <ManageList selectedTenantId={selectedTenantId} />
                    </div>
                </>
            )}

            {/* Analysis Results Modal */}
            <Modal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                title={analyzingUrl ? `Page Analysis: ${analyzingUrl}` : `Component Analysis: ${analyzingComponent}`}
            >
                {isAnalyzing ? (
                    <div className={styles.analysisLoading}>
                        <div className={styles.spinner}>⏳</div>
                        <p>{analyzingUrl ? 'Scanning page for components...' : 'Searching for component across all pages...'}</p>
                    </div>
                ) : (
                    <div className={styles.analysisResults}>
                        <p className={styles.analysisCount}>
                            {analyzingUrl ? (
                                <>Found <strong>{analysisResults.length}</strong> self-developed components on this page.</>
                            ) : (
                                <>Found <strong>{analysisResults.length}</strong> instances of this component across tracked pages.</>
                            )}
                        </p>
                        <div className={styles.resultList}>
                            {analysisResults.map((result, idx) => (
                                <div key={idx} className={styles.resultItem}>
                                    <div className={styles.resultInfo}>
                                        <div className={styles.resultName}>{analyzingComponent ? result.url : result.name}</div>
                                        <div className={styles.resultSelector}><code>{result.selector}</code></div>
                                    </div>
                                    <button
                                        className={styles.viewDataButton}
                                        onClick={() => setSelectedPropData({
                                            name: result.name,
                                            selector: result.selector,
                                            data: result.rawProps,
                                            url: result.url
                                        })}
                                    >
                                        View & Edit Data
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Property Viewer Modal */}
            <Modal
                isOpen={!!selectedPropData}
                onClose={() => setSelectedPropData(null)}
                title="Data Props Inspector"
            >
                {selectedPropData && (
                    <PropertyViewer
                        name={selectedPropData.name}
                        data={selectedPropData.data}
                        onSave={handleSaveProps}
                    />
                )}
            </Modal>
        </div>
    );
}

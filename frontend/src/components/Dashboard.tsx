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
    components: { id: number, name: string, selector: string, helperProps?: string[] }[];
}

export default function Dashboard() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeView, setActiveView] = useState<'view' | 'manage'>('view');

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
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔗 Tracked URLs</h2>
                        <div className={styles.grid}>
                            {filteredUrls.slice(0, 12).map(url => (
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
                            ))}
                            {filteredUrls.length > 12 && (
                                <div className={styles.card} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ color: 'var(--muted-foreground)' }}>+ {filteredUrls.length - 12} more pages</div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>⚙️ Manage Components</h2>
                        <ManageComponents />
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🌐 Manage Tracked URLs</h2>
                        <ManageList />
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

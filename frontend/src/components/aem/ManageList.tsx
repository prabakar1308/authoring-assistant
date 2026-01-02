'use client';

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';

interface UrlEntry {
    id: number;
    value: string;
    tenant: string;
}

export default function ManageList() {
    const [urls, setUrls] = useState<UrlEntry[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ value: '', tenant: 'EW' });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:4000/aem/store');
            const data = await res.json();
            setUrls(data.urls);
            setTenants(data.availableTenants);
            if (data.availableTenants.length > 0 && !formData.tenant) {
                setFormData(prev => ({ ...prev, tenant: data.availableTenants[0].id }));
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({ value: '', tenant: tenants[0]?.id || 'EW' });
        setEditingId(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:4000/aem/urls/${editingId}`
                : 'http://localhost:4000/aem/urls';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchData();
                resetForm();
            }
        } catch (err) {
            console.error('Error saving URL:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this URL?')) return;
        try {
            const res = await fetch(`http://localhost:4000/aem/urls/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Error deleting URL:', err);
        }
    };

    const handleEdit = (entry: UrlEntry) => {
        setEditingId(entry.id);
        setFormData({ value: entry.value, tenant: entry.tenant });
    };

    if (isLoading) return <div className={styles.loading}>Loading URLs...</div>;

    return (
        <div className={styles.manageSection}>
            <div className={styles.formCard}>
                <h3>{editingId ? 'Edit Tracked URL' : 'Add New Tracked URL'}</h3>
                <form onSubmit={handleSave} className={styles.formGrid}>
                    <input
                        type="url"
                        placeholder="Page URL (e.g. https://...)"
                        className={styles.searchInput}
                        value={formData.value}
                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                        required
                    />
                    <select
                        className={styles.searchInput}
                        value={formData.tenant}
                        onChange={e => setFormData({ ...formData, tenant: e.target.value })}
                        required
                    >
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.value} ({t.id})</option>
                        ))}
                    </select>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton}>
                            {editingId ? 'Update' : 'Add URL'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className={styles.cancelButton}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.grid}>
                {urls.map(entry => (
                    <div key={entry.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>Page ID: {entry.id}</div>
                            <div className={styles.cardActions}>
                                <button onClick={() => handleEdit(entry)} title="Edit" className={styles.editButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button onClick={() => handleDelete(entry.id)} title="Delete" className={styles.deleteButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <div style={{ wordBreak: 'break-all' }}>{entry.value}</div>
                            <div className={styles.badge}>{entry.tenant}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

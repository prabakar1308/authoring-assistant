'use client';

import { useState, useEffect } from 'react';
import styles from '../Dashboard.module.css';

interface Component {
    id: number;
    name: string;
    selector: string;
    helperProps?: string[];
}

export default function ManageComponents() {
    const [components, setComponents] = useState<Component[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', selector: '', helperProps: '' });

    const fetchComponents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:4000/aem/store');
            const data = await res.json();
            setComponents(data.components);
        } catch (err) {
            console.error('Error fetching components:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', selector: '', helperProps: '' });
        setEditingId(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            helperProps: formData.helperProps.split(',').map(p => p.trim()).filter(p => p)
        };

        try {
            const url = editingId
                ? `http://localhost:4000/aem/components/${editingId}`
                : 'http://localhost:4000/aem/components';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchComponents();
                resetForm();
            }
        } catch (err) {
            console.error('Error saving component:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this component?')) return;
        try {
            const res = await fetch(`http://localhost:4000/aem/components/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchComponents();
        } catch (err) {
            console.error('Error deleting component:', err);
        }
    };

    const handleEdit = (comp: Component) => {
        setEditingId(comp.id);
        setFormData({
            name: comp.name,
            selector: comp.selector,
            helperProps: comp.helperProps?.join(', ') || ''
        });
    };

    if (isLoading) return <div className={styles.loading}>Loading components...</div>;

    return (
        <div className={styles.manageSection}>
            <div className={styles.formCard}>
                <h3>{editingId ? 'Edit Component' : 'Add New Component'}</h3>
                <form onSubmit={handleSave} className={styles.formGrid}>
                    <input
                        type="text"
                        placeholder="Component Name (e.g. Hero V1)"
                        className={styles.searchInput}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Selector (e.g. heroV1)"
                        className={styles.searchInput}
                        value={formData.selector}
                        onChange={e => setFormData({ ...formData, selector: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Helper Props (comma separated)"
                        className={styles.searchInput}
                        value={formData.helperProps}
                        onChange={e => setFormData({ ...formData, helperProps: e.target.value })}
                    />
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveButton}>
                            {editingId ? 'Update' : 'Add Component'}
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
                {components.map(comp => (
                    <div key={comp.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardTitle}>{comp.name}</div>
                            <div className={styles.cardActions}>
                                <button onClick={() => handleEdit(comp)} title="Edit" className={styles.editButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button onClick={() => handleDelete(comp.id)} title="Delete" className={styles.deleteButton}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            <div>Selector: <code>{comp.selector}</code></div>
                            {comp.helperProps && comp.helperProps.length > 0 && (
                                <div className={styles.badge}>
                                    Props: {comp.helperProps.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

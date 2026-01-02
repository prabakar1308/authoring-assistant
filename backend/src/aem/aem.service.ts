import { Injectable } from '@nestjs/common';
import { AEM_STORE } from './aem-store.constants';

@Injectable()
export class AemService {
    private store = { ...AEM_STORE };

    getStore() {
        return this.store;
    }

    // Components
    addComponent(component: any) {
        const newId = Math.max(...this.store.components.map(c => c.id), 0) + 1;
        const newComponent = { ...component, id: newId };
        this.store.components.push(newComponent);
        return newComponent;
    }

    updateComponent(id: number, component: any) {
        const index = this.store.components.findIndex(c => c.id === id);
        if (index !== -1) {
            this.store.components[index] = { ...this.store.components[index], ...component, id };
            return this.store.components[index];
        }
        return null;
    }

    deleteComponent(id: number) {
        this.store.components = this.store.components.filter(c => c.id !== id);
        return { success: true };
    }

    // URLs (Pages)
    addUrl(url: any) {
        const newId = Math.max(...this.store.urls.map(u => u.id), 0) + 1;
        const newUrl = { ...url, id: newId };
        this.store.urls.push(newUrl);
        return newUrl;
    }

    updateUrl(id: number, url: any) {
        const index = this.store.urls.findIndex(u => u.id === id);
        if (index !== -1) {
            this.store.urls[index] = { ...this.store.urls[index], ...url, id };
            return this.store.urls[index];
        }
        return null;
    }

    deleteUrl(id: number) {
        this.store.urls = this.store.urls.filter(u => u.id !== id);
        return { success: true };
    }
}

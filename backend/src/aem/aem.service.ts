import { Injectable } from '@nestjs/common';
import { AEM_STORE } from './aem-store.constants';

@Injectable()
export class AemService {
    getStore() {
        return AEM_STORE;
    }
}

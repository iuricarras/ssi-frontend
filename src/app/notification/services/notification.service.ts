// src/app/notification/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';
import { HMACPayload , signwithHMAC} from '../../utils/hmac';

export interface Notification {
    notification_id: string;
    requester_id: string;
    requester_name: string;
    type: 'CERTIFICATE_ADDITION' | 'VERIFICATION_REQUEST'; // Adicionado VERIFICATION_REQUEST
    payload: {
        certificate_name?: string;
        verification_id?: string;
        verification_type?: string; // Nome amigável do dado solicitado
    };
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly API = 'http://localhost:5000/api';

    constructor(private http: HttpClient) {}

    getPendingNotifications(): Observable<HMACPayload<any>> {
        return this.http.get<HMACPayload<any>>(`${this.API}/notifications/pending`, { withCredentials: true });
    }

    /**
     * Responde a uma notificação (Aceitar/Rejeitar).
     * @param notificationId ID da notificação.
     * @param action "ACCEPT" ou "REJECT".
     * @param masterKey Necessária para ACCEPT de certificados e VERIFICATION_REQUEST.
     */
    respondToNotification(notificationId: string, action: 'ACCEPT' | 'REJECT', masterKey: string | null = null): Observable<HMACPayload<any>> {
        const body: any = {
            notification_id: notificationId,
            action: action.toUpperCase()
        };
        
        // A chave mestra é necessária para qualquer ACCEPT
        if (action === 'ACCEPT' && masterKey) {
            body.master_key = masterKey;
        }

        return this.http.post<HMACPayload<any>>(`${this.API}/notifications/respond`, {data: body, hmac: signwithHMAC(body)}, { withCredentials: true });
    }
}
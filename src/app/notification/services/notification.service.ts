import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';

export interface Notification {
    notification_id: string;
    requester_id: string;
    requester_name: string;
    type: 'CERTIFICATE_ADDITION' | 'VERIFICATION_REQUEST'; 
    payload: {
        certificate_name: string;
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

    getPendingNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.API}/notifications/pending`, { withCredentials: true });
    }

    /**
     * Responde a uma notificação (Aceitar/Rejeitar).
     * @param notificationId ID da notificação.
     * @param action "ACCEPT" ou "REJECT".
     * @param masterKey Necessária apenas para ACCEPT de certificados.
     */
    respondToNotification(notificationId: string, action: 'ACCEPT' | 'REJECT', masterKey: string | null = null): Observable<HttpResponse<any>> {
        const body: any = {
            notification_id: notificationId,
            action: action.toUpperCase()
        };
        
        if (action === 'ACCEPT' && masterKey) {
            body.master_key = masterKey;
        }

        return this.http.post<any>(`${this.API}/notifications/respond`, body, { observe: "response", withCredentials: true });
    }
}
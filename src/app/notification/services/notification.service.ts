import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Observable } from 'rxjs';

export interface Notification {
    notification_id: string;
    requester_id: string;
    requester_name: string;
    // Adicionado VERIFICATION_REQUEST
    type: 'CERTIFICATE_ADDITION' | 'VERIFICATION_REQUEST'; 
    payload: {
        certificate_name: string; // Usado para nome de certificado E nome do dado para VERIFICATION_REQUEST
        verification_id?: string; // Usado apenas para VERIFICATION_REQUEST
        data_type_name?: string; // Usado apenas para VERIFICATION_REQUEST
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
     * @param masterKey Necessária para ACCEPT, tanto para certificados quanto para verificação (chave do utilizador).
     */
    respondToNotification(notificationId: string, action: 'ACCEPT' | 'REJECT', masterKey: string | null = null): Observable<HttpResponse<any>> {
        const body: any = {
            notification_id: notificationId,
            action: action.toUpperCase()
        };
        
        // A chave mestra é necessária para a ação ACCEPT, independentemente do tipo, no novo modelo.
        if (action === 'ACCEPT' && masterKey) {
            body.master_key = masterKey;
        }

        return this.http.post<any>(`${this.API}/notifications/respond`, body, { observe: "response", withCredentials: true });
    }
}
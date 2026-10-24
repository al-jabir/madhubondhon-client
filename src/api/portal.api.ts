import api from './client';
import type {ApiResponse} from '../types';
export interface Ticket{_id:string;subject:string;message:string;status:string;replies:Array<{role:'customer'|'staff';message:string;createdAt:string}>;createdAt:string;updatedAt:string;}
export interface DeviceSession{id:string;device:string;current:boolean;createdAt:string;expiresAt:string;}
export interface NotificationChoices{matches:boolean;interests:boolean;announcements:boolean;}
export interface ReconciliationRow{_id:string;trxId?:string;credits:number;amountBDT:number;check:'matched'|'unverified_legacy'|'mismatch';settlement:Array<{balanceAfter:number}>;}
export const portalApi={
 async tickets(page=1){return (await api.get<ApiResponse<{tickets:Ticket[]}>>('/tickets',{params:{page}})).data;},
 async ticket(id:string){return (await api.get<ApiResponse<{ticket:Ticket}>>('/tickets/'+id)).data.data!.ticket;},
 async createTicket(subject:string,message:string){return (await api.post('/tickets',{subject,message})).data;},
 async reply(id:string,message:string,staff=false){return (await api.post('/tickets/'+id+(staff?'/staff-replies':'/replies'),{message})).data;},
 async sessions(){return (await api.get<ApiResponse<{sessions:DeviceSession[]}>>('/security/sessions')).data.data!.sessions;},
 async revoke(id:string){return api.delete('/security/sessions/'+id);},
 async revokeAll(){return api.post('/security/sessions/revoke-all');},
 async preferences(){return (await api.get<ApiResponse<{preferences:NotificationChoices;twoFactorEnabled:boolean}>>('/security/preferences')).data.data!;},
 async savePreferences(preferences:NotificationChoices){return api.put('/security/preferences',preferences);},
 async setup2fa(password:string){return (await api.post<ApiResponse<{secret:string;uri:string}>>('/security/2fa/setup',{password})).data.data!;},
 async enable2fa(code:string){return (await api.post<ApiResponse<{recoveryCodes:string[]}>>('/security/2fa/enable',{code})).data.data!;},
 async disable2fa(password:string,code:string){return api.post('/security/2fa/disable',{password,code});},
 async alerts(id:string,enabled:boolean){return api.patch('/saved-searches/'+id+'/alerts',{enabled});},
 async reconciliation(page=1){return (await api.get<ApiResponse<{rows:ReconciliationRow[]}>>('/payments/admin/reconciliation',{params:{page}})).data;},
 async reviewers(){return (await api.get<ApiResponse<{reviewers:Array<{_id:string;name:string;role:string}>}>>('/biodata/reviewers')).data.data!.reviewers;},
 async reviewWork(id:string,revision:number,assignedReviewer:string|null|undefined,checklist?:Record<string,boolean>){return api.put('/biodata/'+id+'/review-work',{revision,assignedReviewer,checklist});},
};

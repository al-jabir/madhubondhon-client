import api from './client';
import type {ApiResponse} from '../types';
export type Visibility='public'|'registered_only'|'private';
export interface AccountSettings{name:string;email:string;phone:string;isEmailVerified:boolean;isPhoneVerified:boolean;visibility:Visibility;paused:boolean;hasBiodata:boolean;isApproved:boolean;}
export const accountApi={
 async get(){return (await api.get<ApiResponse<{account:AccountSettings}>>('/account')).data.data!.account;},
 async name(name:string){return api.patch('/account/name',{name});},
 async privacy(visibility:Visibility,paused:boolean){return api.put('/account/privacy',{visibility,paused});},
 async requestContact(kind:'email'|'phone',target:string,password:string){return (await api.post<ApiResponse<{challengeId:string;expiresIn:number}>>('/account/contact/request',{kind,target,password})).data.data!;},
 async confirmContact(kind:'email'|'phone',challengeId:string,code:string,password:string){return api.post('/account/contact/confirm',{kind,challengeId,code,password});},
 async deactivate(password:string){return api.post('/account/deactivate',{password,confirmed:true});},
};

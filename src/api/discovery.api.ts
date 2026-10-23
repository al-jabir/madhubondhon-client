import apiClient from './client';
import type { ApiResponse } from '../types';
export interface SavedSearch { _id:string; name:string; filters:Record<string,string|number|boolean>; createdAt:string; }
export interface Journey { _id:string; peer:{id:string;biodataId?:string;name:string}|null; direction:'sent'|'received';interestStatus:string;contactStatus:string|null;viewed:boolean;canRequest:boolean;createdAt:string; }
export const discoveryApi={
 async listSearches(){return (await apiClient.get<ApiResponse<{searches:SavedSearch[]}>>('/saved-searches')).data;},
 async saveSearch(name:string,filters:SavedSearch['filters']){return (await apiClient.post<ApiResponse<{search:SavedSearch}>>('/saved-searches',{name,filters})).data;},
 async deleteSearch(id:string){return (await apiClient.delete('/saved-searches/'+id)).data;},
 async journey(page:number){return (await apiClient.get<ApiResponse<{journeys:Journey[]}>>('/journey',{params:{page}})).data;},
};
export function savedSearchUrl(filters:SavedSearch['filters']){const params=new URLSearchParams();Object.entries(filters??{}).forEach(([key,value])=>params.set(key,String(value)));return '/search?'+params.toString();}

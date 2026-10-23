import {createContext,useContext} from 'react';
export interface CompareItem { id:string; label:string; }
export const CompareContext=createContext<{items:CompareItem[];toggle:(item:CompareItem)=>void;clear:()=>void}|null>(null);
export function useCompare(){const value=useContext(CompareContext);if(!value)throw Error('Comparison provider missing');return value;}

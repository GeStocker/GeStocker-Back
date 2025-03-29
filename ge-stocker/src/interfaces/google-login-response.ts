// src/auth/interfaces/google-response.interface.ts
export interface GoogleLoginResponse {
    token?: string;   
    tempToken?: string;   
    requiresSubscription: boolean; 
    redirectTo?: string;    
}
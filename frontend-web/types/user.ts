export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: 'm' | 'f' | 'o'; 
    address: string;
    role:'super_admin' | 'artist_manager' | 'artist';
    is_verified: boolean | number;
    created_at: string; 
    updated_at: string; 
  };
  
// types/auth.ts

export interface LoginCredentials {
  username: string;
  password: string;
}


export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;

}

export interface User {
  name: string;
  email: string;
}

// React tiplemeleri
declare module 'react' {
  export default any;
  export const createContext: any;
  export const useState: any;
  export const useEffect: any;
  export const useContext: any;
}

declare module 'react-router-dom' {
  export const Link: any;
  export const Navigate: any;
  export const useParams: any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
}

// Supabase tiplemeleri
declare module '@supabase/supabase-js' {
  export const createClient: any;
  export type User = any;
  export type Session = any;
} 
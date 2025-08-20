import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';

// Types
export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  team?: string;
  description?: string;
  photo?: string;
  isManager?: boolean;
  parentId?: string;
  count?: number;
  visible?: boolean;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  employees: Employee[];
  visible?: boolean;
}

export interface SiteSettings {
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  introText: string;
  carouselImages: string[];
}

interface AppState {
  siteSettings: SiteSettings;
  employees: Employee[];
  departments: Department[];
  isAdmin: boolean;
  currentView: 'home' | 'orgchart' | 'admin';
  selectedDepartment?: string;
}

// Actions
type AppAction =
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_VIEW'; payload: 'home' | 'orgchart' | 'admin' }
  | { type: 'SET_SELECTED_DEPARTMENT'; payload: string | undefined }
  | { type: 'UPDATE_SITE_SETTINGS'; payload: Partial<SiteSettings> }
  | { type: 'SET_SITE_SETTINGS'; payload: SiteSettings }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { id: string; updates: Partial<Employee> } }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: { id: string; updates: Partial<Department> } }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] };

// Initial state
const initialState: AppState = {
  siteSettings: {
    companyName: 'Cazanga',
    primaryColor: '#1f4e78',
    secondaryColor: '#548235',
    introText: 'Explore nossa estrutura organizacional de forma interativa e detalhada.',
    carouselImages: []
  },
  employees: [],
  departments: [],
  isAdmin: false,
  currentView: 'home'
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_DEPARTMENT':
      return { ...state, selectedDepartment: action.payload };
    case 'UPDATE_SITE_SETTINGS':
      const updatedSettings = { ...state.siteSettings, ...action.payload };
      // Auto-sync to Google Sheets if configured
      if (localStorage.getItem('google_sheets_connected') === 'true') {
        googleSheetsService.updateSiteSettings(updatedSettings).catch(error => {
          console.warn('Failed to auto-sync site settings:', error);
        });
      }
      return { 
        ...state, 
        siteSettings: updatedSettings
      };
    case 'SET_SITE_SETTINGS':
      return { 
        ...state, 
        siteSettings: action.payload
      };
    case 'ADD_EMPLOYEE':
      return { 
        ...state, 
        employees: [...state.employees, action.payload] 
      };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id 
            ? { ...emp, ...action.payload.updates }
            : emp
        )
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_DEPARTMENT':
      return { 
        ...state, 
        departments: [...state.departments, action.payload] 
      };
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map(dept =>
          dept.id === action.payload.id 
            ? { ...dept, ...action.payload.updates }
            : dept
        )
      };
    case 'DELETE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.filter(dept => dept.id !== action.payload)
      };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Google Sheets on initialization
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check if Google Sheets is properly configured
        const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
        
        if (!isConnected) {
          console.log('Google Sheets not connected, keeping empty initial data');
          return; // Keep empty initial data
        }

        await googleSheetsService.loadAllData(dispatch);
        console.log('Data loaded from Google Sheets successfully');
        
      } catch (error) {
        console.error('Failed to load initial data from Google Sheets:', error);
        // Keep initial empty data if Google Sheets fails
      }
    };

    loadInitialData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
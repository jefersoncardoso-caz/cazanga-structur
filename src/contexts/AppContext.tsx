import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { googleSheetsService } from '@/services/googleSheetsService';
import { errorHandlingService } from '@/services/errorHandlingService';

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

export interface OrgChart {
  id: string;
  name: string;
  type: 'macro' | 'departamental' | 'hierarquico' | 'gente-gestao';
  description?: string;
  data: any;
  visible?: boolean;
  createdAt: string;
  updatedAt?: string;
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
  orgCharts: OrgChart[];
  isAdmin: boolean;
  currentView: 'home' | 'orgchart' | 'admin';
  selectedDepartment?: string;
  selectedOrgChart?: string;
  isDataLoaded: boolean;
  lastSyncTime?: Date;
}

// Actions
type AppAction =
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_VIEW'; payload: 'home' | 'orgchart' | 'admin' }
  | { type: 'SET_SELECTED_DEPARTMENT'; payload: string | undefined }
  | { type: 'SET_SELECTED_ORGCHART'; payload: string | undefined }
  | { type: 'UPDATE_SITE_SETTINGS'; payload: Partial<SiteSettings> }
  | { type: 'SET_SITE_SETTINGS'; payload: SiteSettings }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { id: string; updates: Partial<Employee> } }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: { id: string; updates: Partial<Department> } }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'ADD_ORGCHART'; payload: OrgChart }
  | { type: 'UPDATE_ORGCHART'; payload: { id: string; updates: Partial<OrgChart> } }
  | { type: 'DELETE_ORGCHART'; payload: string }
  | { type: 'SET_ORGCHARTS'; payload: OrgChart[] }
  | { type: 'SET_DATA_LOADED'; payload: boolean }
  | { type: 'SET_LAST_SYNC_TIME'; payload: Date };

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
  orgCharts: [],
  isAdmin: false,
  currentView: 'home',
  isDataLoaded: false
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
    case 'SET_SELECTED_ORGCHART':
      return { ...state, selectedOrgChart: action.payload };
    case 'UPDATE_SITE_SETTINGS':
      // Note: No more localStorage dependency - all handled by Google Sheets service
      return { 
        ...state, 
        siteSettings: { ...state.siteSettings, ...action.payload }
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
    case 'ADD_ORGCHART':
      return { 
        ...state, 
        orgCharts: [...state.orgCharts, action.payload] 
      };
    case 'UPDATE_ORGCHART':
      return {
        ...state,
        orgCharts: state.orgCharts.map(org =>
          org.id === action.payload.id 
            ? { ...org, ...action.payload.updates }
            : org
        )
      };
    case 'DELETE_ORGCHART':
      return {
        ...state,
        orgCharts: state.orgCharts.filter(org => org.id !== action.payload)
      };
    case 'SET_ORGCHARTS':
      return { ...state, orgCharts: action.payload };
    case 'SET_DATA_LOADED':
      return { ...state, isDataLoaded: action.payload };
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
const AppProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Google Sheets on initialization
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Check if Google Sheets is properly configured
        const spreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
        const isConnected = localStorage.getItem('google_sheets_connected') === 'true';
        
        if (!isConnected || !spreadsheetId) {
          console.log('Google Sheets not connected, keeping empty initial data');
          dispatch({ type: 'SET_DATA_LOADED', payload: true });
          return;
        }
        
        // Load all data
        await googleSheetsService.loadAllData(dispatch);
        
        dispatch({ type: 'SET_DATA_LOADED', payload: true });
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
        
        console.log('Data loaded from Google Sheets successfully');
        
      } catch (error) {
        console.error('Failed to load initial data from Google Sheets:', error);
        dispatch({ type: 'SET_DATA_LOADED', payload: true });
        
        const appError = errorHandlingService.handleGoogleSheetsError(error);
        errorHandlingService.logError(appError);
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppProviderInner>
      {children}
    </AppProviderInner>
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
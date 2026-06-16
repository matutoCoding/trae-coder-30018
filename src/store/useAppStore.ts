import { create } from 'zustand';
import type {
  FuneralOrder,
  Staff,
  Schedule,
  Material,
  RitualTemplate,
  Band,
  BandScheduleItem,
  Communication,
  Expense,
  StaffShare,
  DashboardStats,
} from '../types';
import {
  mockOrders,
  mockStaff,
  mockSchedules,
  mockMaterials,
  mockRitualTemplates,
  mockBands,
  mockBandSchedules,
  mockCommunications,
  mockExpenses,
  mockStaffShares,
} from '../data/mockData';
import { loadFromStorage, saveToStorage, generateId, generateOrderNo } from '../utils/storage';

interface AppState {
  orders: FuneralOrder[];
  staff: Staff[];
  schedules: Schedule[];
  materials: Material[];
  ritualTemplates: RitualTemplate[];
  bands: Band[];
  bandSchedules: BandScheduleItem[];
  communications: Communication[];
  expenses: Expense[];
  staffShares: StaffShare[];

  addOrder: (order: Omit<FuneralOrder, 'id' | 'orderNo' | 'createdAt'>) => FuneralOrder;
  updateOrderStatus: (orderId: string, status: FuneralOrder['status']) => void;
  addStaff: (staff: Omit<Staff, 'id'>) => void;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  removeSchedule: (scheduleId: string) => void;
  addCommunication: (comm: Omit<Communication, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  addStaffShare: (share: Omit<StaffShare, 'id'>) => void;
  updateStaffShare: (shareId: string, updates: Partial<StaffShare>) => void;
  updateMaterialStock: (materialId: string, change: number, operator: string, notes?: string) => void;
  getOrderById: (orderId: string) => FuneralOrder | undefined;
  getStaffById: (staffId: string) => Staff | undefined;
  getDashboardStats: () => DashboardStats;
}

export const useAppStore = create<AppState>((set, get) => {
  const storedOrders = loadFromStorage('funeral_orders', mockOrders);
  const storedStaff = loadFromStorage('funeral_staff', mockStaff);
  const storedSchedules = loadFromStorage('funeral_schedules', mockSchedules);
  const storedMaterials = loadFromStorage('funeral_materials', mockMaterials);
  const storedRituals = loadFromStorage('funeral_rituals', mockRitualTemplates);
  const storedBands = loadFromStorage('funeral_bands', mockBands);
  const storedBandSchedules = loadFromStorage('funeral_band_schedules', mockBandSchedules);
  const storedComms = loadFromStorage('funeral_communications', mockCommunications);
  const storedExpenses = loadFromStorage('funeral_expenses', mockExpenses);
  const storedShares = loadFromStorage('funeral_shares', mockStaffShares);

  return {
    orders: storedOrders,
    staff: storedStaff,
    schedules: storedSchedules,
    materials: storedMaterials,
    ritualTemplates: storedRituals,
    bands: storedBands,
    bandSchedules: storedBandSchedules,
    communications: storedComms,
    expenses: storedExpenses,
    staffShares: storedShares,

    addOrder: (orderData) => {
      const newOrder: FuneralOrder = {
        ...orderData,
        id: `order-${generateId()}`,
        orderNo: generateOrderNo(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const orders = [...state.orders, newOrder];
        saveToStorage('funeral_orders', orders);
        return { orders };
      });
      return newOrder;
    },

    updateOrderStatus: (orderId, status) => {
      set((state) => {
        const orders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
        saveToStorage('funeral_orders', orders);
        return { orders };
      });
    },

    addStaff: (staffData) => {
      const newStaff: Staff = {
        ...staffData,
        id: `staff-${generateId()}`,
      };
      set((state) => {
        const staff = [...state.staff, newStaff];
        saveToStorage('funeral_staff', staff);
        return { staff };
      });
    },

    updateStaff: (staffId, updates) => {
      set((state) => {
        const staff = state.staff.map((s) =>
          s.id === staffId ? { ...s, ...updates } : s
        );
        saveToStorage('funeral_staff', staff);
        return { staff };
      });
    },

    addSchedule: (scheduleData) => {
      const newSchedule: Schedule = {
        ...scheduleData,
        id: `sched-${generateId()}`,
      };
      set((state) => {
        const schedules = [...state.schedules, newSchedule];
        saveToStorage('funeral_schedules', schedules);
        return { schedules };
      });
    },

    removeSchedule: (scheduleId) => {
      set((state) => {
        const schedules = state.schedules.filter((s) => s.id !== scheduleId);
        saveToStorage('funeral_schedules', schedules);
        return { schedules };
      });
    },

    addCommunication: (commData) => {
      const newComm: Communication = {
        ...commData,
        id: `comm-${generateId()}`,
      };
      set((state) => {
        const communications = [...state.communications, newComm];
        saveToStorage('funeral_communications', communications);
        return { communications };
      });
    },

    addExpense: (expenseData) => {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${generateId()}`,
      };
      set((state) => {
        const expenses = [...state.expenses, newExpense];
        saveToStorage('funeral_expenses', expenses);
        return { expenses };
      });
    },

    updateExpense: (expenseId, updates) => {
      set((state) => {
        const expenses = state.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        );
        saveToStorage('funeral_expenses', expenses);
        return { expenses };
      });
    },

    addStaffShare: (shareData) => {
      const newShare: StaffShare = {
        ...shareData,
        id: `share-${generateId()}`,
      };
      set((state) => {
        const staffShares = [...state.staffShares, newShare];
        saveToStorage('funeral_shares', staffShares);
        return { staffShares };
      });
    },

    updateStaffShare: (shareId, updates) => {
      set((state) => {
        const staffShares = state.staffShares.map((s) =>
          s.id === shareId ? { ...s, ...updates } : s
        );
        saveToStorage('funeral_shares', staffShares);
        return { staffShares };
      });
    },

    updateMaterialStock: (materialId, change, _operator, _notes) => {
      set((state) => {
        const materials = state.materials.map((m) =>
          m.id === materialId ? { ...m, stock: Math.max(0, m.stock + change) } : m
        );
        saveToStorage('funeral_materials', materials);
        return { materials };
      });
    },

    getOrderById: (orderId) => {
      return get().orders.find((o) => o.id === orderId);
    },

    getStaffById: (staffId) => {
      return get().staff.find((s) => s.id === staffId);
    },

    getDashboardStats: () => {
      const state = get();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyOrders = state.orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalRevenue = monthlyOrders.reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0
      );

      const pendingSettlements = state.staffShares.filter(
        (s) => !s.settled
      ).length;

      const lowStockItems = state.materials.filter(
        (m) => m.stock <= m.minStock
      ).length;

      return {
        totalOrders: state.orders.length,
        activeOrders: state.orders.filter(
          (o) => o.status === 'pending' || o.status === 'scheduled' || o.status === 'in-progress'
        ).length,
        totalStaff: state.staff.length,
        monthlyRevenue: totalRevenue,
        pendingSettlements,
        lowStockItems,
      };
    },
  };
});

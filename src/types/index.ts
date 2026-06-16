export type OrderStatus = 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type FuneralSpec = 'standard' | 'deluxe' | 'premium';
export type StaffRole = '司仪' | '执事' | '抬棺' | '法事' | '后勤' | '乐队';
export type StaffStatus = 'available' | 'busy' | 'leave';
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'full';
export type MaterialCategory = '孝服' | '纸扎' | '香烛' | '鲜花' | '其他';
export type BandLevel = '普通' | '资深' | '金牌';
export type CommunicationMethod = '电话' | '微信' | '面谈';
export type ExpenseCategory = '服务费' | '物资费' | '乐队费' | '场地费' | '其他';

export interface FuneralOrder {
  id: string;
  orderNo: string;
  deceased: {
    name: string;
    gender: 'male' | 'female';
    age: number;
    birthDate: string;
    deathDate: string;
    deathPlace: string;
  };
  family: {
    contactName: string;
    relationship: string;
    phone: string;
    address: string;
  };
  funeralSpec: FuneralSpec;
  auspiciousDates: {
    funeralDate: string;
    funeralTime: string;
    ritualTimes: string[];
  };
  route?: RoutePoint[];
  status: OrderStatus;
  createdAt: string;
  remarks?: string;
  totalAmount?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  skills: string[];
  status: StaffStatus;
  avatar?: string;
  dailyRate: number;
}

export interface Schedule {
  id: string;
  orderId: string;
  staffId: string;
  date: string;
  shift: ShiftType;
  task: string;
  position?: string;
}

export interface PallbearerGroup {
  orderId: string;
  mainBearers: string[];
  backupBearers: string[];
  positions: { [staffId: string]: string };
}

export interface RoutePoint {
  name: string;
  address: string;
  arriveTime?: string;
  leaveTime?: string;
  notes?: string;
}

export interface RitualTemplate {
  id: string;
  name: string;
  region: string;
  description: string;
  steps: RitualStep[];
}

export interface RitualStep {
  id: string;
  order: number;
  title: string;
  duration: number;
  description: string;
  notes: string;
  responsibleRole: string;
}

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  spec: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
}

export interface StockRecord {
  id: string;
  materialId: string;
  type: 'in' | 'out';
  quantity: number;
  orderId?: string;
  operator: string;
  date: string;
  notes?: string;
}

export interface Band {
  id: string;
  name: string;
  leader: string;
  members: BandMember[];
  level: BandLevel;
  fee: number;
}

export interface BandMember {
  id: string;
  name: string;
  instrument: string;
  phone: string;
}

export interface BandScheduleItem {
  id: string;
  orderId: string;
  bandId: string;
  date: string;
  timeSlot: string;
  location: string;
  setlist: string[];
}

export interface Communication {
  id: string;
  orderId: string;
  date: string;
  method: CommunicationMethod;
  content: string;
  operator: string;
  attachments?: string[];
  followUp?: string;
}

export interface Expense {
  id: string;
  orderId: string;
  category: ExpenseCategory;
  item: string;
  amount: number;
  paid: boolean;
}

export type PaymentMethod = '现金' | '微信' | '支付宝' | '银行转账' | '其他';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  remark?: string;
  operator: string;
}

export interface StaffShare {
  id: string;
  orderId: string;
  staffId: string;
  baseAmount: number;
  bonus: number;
  total: number;
  settled: boolean;
  paidOut: boolean;
  paidMethod?: string;
  paidDate?: string;
  paidOperator?: string;
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  totalStaff: number;
  monthlyRevenue: number;
  pendingSettlements: number;
  lowStockItems: number;
}

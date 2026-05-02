import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home, ShoppingCart, Calculator, Users, List, Settings,
  UserCircle, RefreshCw, Copy, Trash2, Edit2, Plus,
  Search, CheckCircle2, XCircle, TrendingUp, DollarSign,
  AlertCircle, Cloud, Menu, X, Camera, Save, Heart,
  Clock, PieChart, UploadCloud
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// --- Firebase 設定（已綁定你的專案）---
const firebaseConfig = {
  apiKey: "AIzaSyCRb0BmeCtaFf9KKirUtSYHD33XeV3OtJ4",
  authDomain: "girlboss-revenue-system.firebaseapp.com",
  projectId: "girlboss-revenue-system",
  storageBucket: "girlboss-revenue-system.firebasestorage.app",
  messagingSenderId: "66317415248",
  appId: "1:66317415248:web:612a87f41e64eaf469b255",
  measurementId: "G-D8TWK2M2B5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'jeROSSE-revenue-system';

// --- 總部連動試算表網址 ---
const GLOBAL_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMc5u-jjvzsSHW3v7vmnS0kxbmxYAlJ_6kJU3gcODsSMME_sJZWBcZaGnCHKewvs22m-HaF4EAx6bk/pub?gid=1234591167&single=true&output=csv";

// --- 預設商品資料 ---
const MOCK_PRODUCTS = [
  { id: 'p1', name: '纖纖飲X', retailPrice: 1480, promoPrice: 1380, vipPrice: 1280, 'cost實習加盟': 1160, 'cost三級零售': 990, 'cost三級輔導督導': 955, 'cost二級輔導督導': 880 },
  { id: 'p2', name: '纖飄錠', retailPrice: 1480, promoPrice: 1380, vipPrice: 1280, 'cost實習加盟': 1160, 'cost三級零售': 990, 'cost三級輔導督導': 955, 'cost二級輔導督導': 880 },
  { id: 'p3', name: '爆纖錠', retailPrice: 880, promoPrice: 800, vipPrice: 740, 'cost實習加盟': 660, 'cost三級零售': 580, 'cost三級輔導督導': 560, 'cost二級輔導督導': 520 },
  { id: 'p4', name: '爆纖錠體驗包', retailPrice: 240, promoPrice: 240, vipPrice: 240, 'cost實習加盟': 190, 'cost三級零售': 164, 'cost三級輔導督導': 158, 'cost二級輔導督導': 146 },
  { id: 'p5', name: '植萃纖酵宿', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p6', name: '植萃纖酵宿體驗包', retailPrice: 190, promoPrice: 190, vipPrice: 190, 'cost實習加盟': 145, 'cost三級零售': 117, 'cost三級輔導督導': 113, 'cost二級輔導督導': 103 },
  { id: 'p7', name: '肽纖飲(可可)', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p8', name: '肽纖飲(厚焙奶茶)', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p9', name: '水光錠', retailPrice: 1680, promoPrice: 1580, vipPrice: 1480, 'cost實習加盟': 1260, 'cost三級零售': 1080, 'cost三級輔導督導': 1040, 'cost二級輔導督導': 920 },
  { id: 'p10', name: '婕肌零', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p11', name: '水光繃帶面膜', retailPrice: 700, promoPrice: 650, vipPrice: 600, 'cost實習加盟': 550, 'cost三級零售': 500, 'cost三級輔導督導': 485, 'cost二級輔導督導': 450 },
  { id: 'p12', name: '婕肌零體驗包', retailPrice: 40, promoPrice: 40, vipPrice: 40, 'cost實習加盟': 30, 'cost三級零售': 25, 'cost三級輔導督導': 24, 'cost二級輔導督導': 20 },
  { id: 'p13', name: '雪聚露', retailPrice: 1280, promoPrice: 1180, vipPrice: 1100, 'cost實習加盟': 990, 'cost三級零售': 860, 'cost三級輔導督導': 830, 'cost二級輔導督導': 770 },
  { id: 'p14', name: '玻尿酸原液', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p15', name: '急救小白瓶', retailPrice: 1280, promoPrice: 1180, vipPrice: 1100, 'cost實習加盟': 990, 'cost三級零售': 860, 'cost三級輔導督導': 830, 'cost二級輔導督導': 770 },
  { id: 'p16', name: '雪花紫纖飲', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p17', name: '法樂蓬洗髮露', retailPrice: 1280, promoPrice: 1180, vipPrice: 1100, 'cost實習加盟': 990, 'cost三級零售': 860, 'cost三級輔導督導': 830, 'cost二級輔導督導': 770 },
  { id: 'p18', name: '法樂蓬養髮液', retailPrice: 1100, promoPrice: 1000, vipPrice: 900, 'cost實習加盟': 840, 'cost三級零售': 720, 'cost三級輔導督導': 695, 'cost二級輔導督導': 640 },
  { id: 'p19', name: '法樂蓬洗髮露體驗包', retailPrice: 40, promoPrice: 40, vipPrice: 40, 'cost實習加盟': 24, 'cost三級零售': 21, 'cost三級輔導督導': 20, 'cost二級輔導督導': 17 },
  { id: 'p20', name: '高機能益生菌', retailPrice: 1280, promoPrice: 1180, vipPrice: 1100, 'cost實習加盟': 990, 'cost三級零售': 860, 'cost三級輔導督導': 830, 'cost二級輔導督導': 770 },
  { id: 'p21', name: '9國英雄TURBO極速錠', retailPrice: 700, promoPrice: 650, vipPrice: 600, 'cost實習加盟': 530, 'cost三級零售': 455, 'cost三級輔導督導': 440, 'cost二級輔導督導': 410 },
  { id: 'p22', name: '葉黃素EX飲', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 840, 'cost三級零售': 720, 'cost三級輔導督導': 695, 'cost二級輔導督導': 640 },
  { id: 'p23', name: '葉黃素晶亮凍', retailPrice: 700, promoPrice: 650, vipPrice: 600, 'cost實習加盟': 530, 'cost三級零售': 455, 'cost三級輔導督導': 440, 'cost二級輔導督導': 410 },
  { id: 'p24', name: '療肺草正冠茶', retailPrice: 990, promoPrice: 900, vipPrice: 830, 'cost實習加盟': 780, 'cost三級零售': 660, 'cost三級輔導督導': 635, 'cost二級輔導督導': 580 },
  { id: 'p25', name: '積雪草護手霜', retailPrice: 700, promoPrice: 650, vipPrice: 600, 'cost實習加盟': 530, 'cost三級零售': 455, 'cost三級輔導督導': 440, 'cost二級輔導督導': 410 },
  { id: 'p26', name: '固樂纖', retailPrice: 1680, promoPrice: 1580, vipPrice: 1480, 'cost實習加盟': 1260, 'cost三級零售': 1080, 'cost三級輔導督導': 1040, 'cost二級輔導督導': 920 }
];

const normalizeHeader = (header) => {
  const h = header.toLowerCase().trim();
  if (h === 'id' || h === '編號') return 'id';
  if (h === 'name' || h === '產品名稱' || h === '商品名稱' || h === '名稱' || h === '品項') return 'name';
  if (h === 'retailprice' || h === '零售價' || h === '原價') return 'retailPrice';
  if (h === 'promoprice' || h === '優惠價' || h === '折扣價') return 'promoPrice';
  if (h === 'vipprice' || h === 'vip價') return 'vipPrice';
  if (h.includes('實習加盟')) return 'cost實習加盟';
  if (h.includes('三級零售')) return 'cost三級零售';
  if (h.includes('三級輔導督導')) return 'cost三級輔導督導';
  if (h.includes('二級輔導督導')) return 'cost二級輔導督導';
  return header;
};

const parseCSV = (str) => {
  const result = [];
  const lines = str.split(/\r?\n/);
  if (lines.length < 2) return result;
  const headers = lines[0].split(',').map(h => normalizeHeader(h.replace(/^"|"$/g, '').replace(/^\uFEFF/, '')));
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj = {};
    let hasValidData = false;
    for (let j = 0; j < headers.length; j++) {
      const headerKey = headers[j];
      if (!headerKey) continue;
      let val = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
      obj[headerKey] = isNaN(Number(val)) || val === '' ? val : Number(val);
      if (val !== '') hasValidData = true;
    }
    if (hasValidData && obj.name) {
      if (!obj.id) obj.id = `p_auto_${i}`;
      result.push(obj);
    }
  }
  return result;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Auth error:', err);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const ordersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
    const customersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'customers');
    const productsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'products');

    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile({ isSetup: false, level: '實習加盟', name: '', backupUrl: '' });
      }
      setLoading(false);
    }, (err) => console.error(err));

    const unsubProducts = onSnapshot(productsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().data && docSnap.data().data.length > 0) {
        const dbProducts = docSnap.data().data;
        if (dbProducts.some(p => p.name)) setProducts(dbProducts);
        else setProducts(MOCK_PRODUCTS);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    }, (err) => console.error(err));

    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(data);
    }, (err) => console.error(err));

    const unsubCustomers = onSnapshot(customersRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(data);
    }, (err) => console.error(err));

    return () => { unsubProfile(); unsubProducts(); unsubOrders(); unsubCustomers(); };
  }, [user]);

  const handleSyncSheets = async () => {
    setSyncStatus(false);
    showToast('正在與總部資料庫連動更新產品...');
    try {
      const cacheBusterUrl = `${GLOBAL_SHEET_CSV_URL}&_t=${Date.now()}`;
      const res = await fetch(cacheBusterUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed');
      const csvText = await res.text();
      if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
        showToast('⚠️ 連線錯誤：試算表未設定為 CSV 發佈');
        setSyncStatus(false);
        return;
      }
      const parsedProducts = parseCSV(csvText);
      if (parsedProducts.length > 0) {
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'products'), { data: parsedProducts });
        setSyncStatus(true);
        showToast('已成功同步總部最新產品資料！');
      } else {
        showToast('⚠️ 試算表格式不正確或無有效產品資料');
        setSyncStatus(false);
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ 連線失敗，請確認網路狀態');
      setSyncStatus(false);
    }
  };

  const calculatePricing = (cartItems, franchiseeLevel, productsList) => {
    if (!cartItems || cartItems.length === 0) {
      return { totalRetail: 0, finalTotal: 0, saved: 0, profit: 0, appliedTier: '零售價', cost: 0 };
    }
    let totalRetail = 0, totalQty = 0, totalCost = 0;
    cartItems.forEach(item => {
      const prod = productsList.find(p => p.id === item.productId);
      if (!prod) return;
      totalRetail += (Number(prod.retailPrice) || 0) * item.qty;
      totalQty += item.qty;
      totalCost += (Number(prod[`cost${franchiseeLevel}`]) || 0) * item.qty;
    });
    let appliedTier = '零售價', finalTotal = 0;
    if (totalRetail > 4000) {
      appliedTier = 'VIP價';
      finalTotal = cartItems.reduce((sum, item) => {
        const prod = productsList.find(p => p.id === item.productId);
        return sum + (prod ? (Number(prod.vipPrice) || 0) * item.qty : 0);
      }, 0);
    } else if (totalQty >= 2) {
      appliedTier = '優惠價';
      finalTotal = cartItems.reduce((sum, item) => {
        const prod = productsList.find(p => p.id === item.productId);
        return sum + (prod ? (Number(prod.promoPrice) || 0) * item.qty : 0);
      }, 0);
    } else {
      appliedTier = '零售價';
      finalTotal = totalRetail;
    }
    return { totalRetail, finalTotal, saved: totalRetail - finalTotal, profit: finalTotal - totalCost, appliedTier, totalCost };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAF8]" style={{fontFamily:"'Noto Sans TC', sans-serif"}}>
        <div className="text-center">
          <Heart size={48} className="text-[#AD8B73] mx-auto mb-4 animate-pulse" fill="rgba(173,139,115,0.2)" />
          <p className="text-[#725B4A] font-medium tracking-wider">優雅載入中...</p>
        </div>
      </div>
    );
  }

  if (profile && !profile.isSetup) {
    return <OnboardingView user={user} setProfile={setProfile} />;
  }

  return (
    <div className="flex h-screen bg-[#FCFAF8] text-gray-700 overflow-hidden" style={{fontFamily:"'Noto Sans TC', sans-serif"}}>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#725B4A] text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 font-medium tracking-wide" style={{zIndex:9999}}>
          <CheckCircle2 size={18} className="text-[#F5EFE9]" />
          {toastMessage}
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{background:'rgba(114,91,74,0.1)',backdropFilter:'blur(4px)'}} onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EBE5DF] shadow-sm flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart size={26} className="text-[#AD8B73]" fill="rgba(173,139,115,0.2)" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-[#725B4A] tracking-wider leading-none mt-1">JERÔSSE</h1>
              <span className="text-[10px] text-[#A39184] tracking-widest mt-1 font-medium">少女團專屬營收系統</span>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X size={24} className="text-[#C2A38A]" /></button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {[
            { id: 'dashboard', icon: Home, label: '營收分析' },
            { id: 'orders', icon: ShoppingCart, label: '銷售訂單' },
            { id: 'quote', icon: Calculator, label: '報價試算' },
            { id: 'customers', icon: Users, label: '客戶資料庫' },
            { id: 'products', icon: List, label: '產品價目' },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${activeTab === item.id ? 'bg-[#AD8B73] text-white shadow-md' : 'text-[#968476] hover:bg-[#F5EFE9] hover:text-[#725B4A]'}`}>
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="font-medium tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#EBE5DF]">
          <button onClick={handleSyncSheets} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#EBE5DF] text-sm font-medium text-[#725B4A] transition-colors hover:bg-[#F5EFE9]">
            {syncStatus
              ? <><span className="w-2 h-2 rounded-full bg-[#829271]"></span>已連動試算表</>
              : <><span className="w-2 h-2 rounded-full bg-[#D49A89] animate-pulse"></span>試算表未更新</>}
            <RefreshCw size={14} className={syncStatus ? 'text-[#C2A38A]' : 'text-[#D49A89]'} />
          </button>
        </div>

        <div className="p-4 border-t border-[#EBE5DF] flex items-center gap-3 cursor-pointer hover:bg-[#F9F7F5] transition-colors m-2 rounded-2xl" onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}>
          {profile?.avatar
            ? <img src={profile.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#EBE5DF]" />
            : <div className="w-10 h-10 rounded-full bg-[#F5EFE9] text-[#725B4A] flex items-center justify-center font-bold text-lg border-2 border-[#EBE5DF]">{profile?.name?.charAt(0) || 'U'}</div>}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-[#725B4A] truncate">{profile?.name || '品牌主理人'}</p>
            <p className="text-xs text-[#968476]">級別：{profile?.level || '實習加盟'}</p>
          </div>
          <Settings size={18} className="text-[#C2A38A]" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="md:hidden bg-white/80 px-4 py-3 border-b border-[#EBE5DF] flex items-center justify-between z-30 sticky top-0" style={{backdropFilter:'blur(12px)'}}>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#725B4A] bg-[#F5EFE9] rounded-full"><Menu size={20} /></button>
          <div className="flex flex-col items-center mt-1">
            <span className="font-bold text-[#725B4A] tracking-wider leading-none">JERÔSSE</span>
            <span className="text-[9px] text-[#A39184] tracking-widest mt-0.5 font-medium">少女團專屬營收系統</span>
          </div>
          <div className="w-9 h-9"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && <DashboardView orders={orders} customers={customers} products={products} />}
          {activeTab === 'orders' && <OrdersView user={user} orders={orders} customers={customers} products={products} calculatePricing={calculatePricing} profile={profile} showToast={showToast} />}
          {activeTab === 'quote' && <QuoteView calculatePricing={calculatePricing} products={products} profile={profile} showToast={showToast} />}
          {activeTab === 'customers' && <CustomersView user={user} customers={customers} orders={orders} showToast={showToast} profile={profile} />}
          {activeTab === 'products' && <ProductsView profile={profile} products={products} />}
          {activeTab === 'settings' && <SettingsView user={user} profile={profile} showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ orders, customers }) {
  const [filterMode, setFilterMode] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredOrders = useMemo(() => orders.filter(order => {
    if (!order.createdAt) return false;
    if (filterMode === 'all') return true;
    const d = new Date(order.createdAt);
    const orderMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return orderMonth === selectedMonth;
  }), [orders, filterMode, selectedMonth]);

  const stats = useMemo(() => filteredOrders.reduce((acc, order) => {
    acc.revenue += order.finalTotal || 0;
    acc.profit += order.profit || 0;
    acc.count += 1;
    return acc;
  }, { revenue: 0, profit: 0, count: 0 }), [filteredOrders]);

  const customersNeedingCare = useMemo(() => {
    const now = Date.now();
    if (!customers) return [];
    return customers.map(c => {
      const daysSince = Math.floor((now - (c.lastPurchaseDate || now)) / (1000 * 60 * 60 * 24));
      return { ...c, daysSince };
    }).filter(c => c.daysSince > 30).sort((a, b) => b.daysSince - a.daysSince);
  }, [customers]);

  const topProducts = useMemo(() => {
    const counts = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!counts[item.productName]) counts[item.productName] = { name: item.productName, qty: 0 };
        counts[item.productName].qty += item.qty;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredOrders]);

  const recentActivity = useMemo(() => [...filteredOrders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [filteredOrders]);

  const annualRepurchase = useMemo(() => {
    const years = {};
    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const yName = `${date.getFullYear()}年`;
      if (!years[yName]) years[yName] = {};
      if (!years[yName][order.customerName]) years[yName][order.customerName] = 0;
      years[yName][order.customerName]++;
    });
    return Object.entries(years).map(([yName, customersMap]) => {
      const total = Object.keys(customersMap).length;
      const repurchased = Object.values(customersMap).filter(count => count > 1).length;
      return { year: yName, rate: total === 0 ? 0 : Math.round((repurchased / total) * 100), total, repurchased };
    }).sort((a, b) => b.year.localeCompare(a.year)).slice(0, 4);
  }, [orders]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#725B4A] tracking-wide">營收分析統計</h2>
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-[#EBE5DF] items-center">
          <input type="month" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setFilterMode('month'); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold outline-none cursor-pointer transition-all ${filterMode === 'month' ? 'bg-[#F5EFE9] text-[#725B4A]' : 'bg-transparent text-[#968476]'}`} />
          <div className="w-px h-4 bg-[#EBE5DF] mx-1"></div>
          <button onClick={() => setFilterMode('all')} className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${filterMode === 'all' ? 'bg-[#F5EFE9] text-[#725B4A]' : 'bg-transparent text-[#968476]'}`}>全部</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: '總營業額', amount: stats.revenue, icon: DollarSign, color: 'text-[#9A8174]', bg: 'bg-[#F6F4F2]', border: 'border-[#D49A89]/60' },
          { title: '淨利潤', amount: stats.profit, icon: TrendingUp, color: 'text-[#829271]', bg: 'bg-[#F4F6F3]', border: 'border-[#829271]/60' },
          { title: '訂單數', amount: stats.count, icon: ShoppingCart, color: 'text-[#B58B94]', bg: 'bg-[#FAF4F5]', border: 'border-[#B58B94]/60', prefix: '' },
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl shadow-sm border-2 ${s.border} flex items-center gap-5`}>
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}><s.icon size={26} strokeWidth={2.5} /></div>
            <div>
              <p className="text-sm text-[#968476] font-medium mb-1">{s.title}</p>
              <h4 className="text-2xl font-bold text-[#725B4A]">{s.prefix !== '' ? '$' : ''}{(s.amount || 0).toLocaleString()}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#EBE5DF]">
          <h3 className="text-lg font-bold text-[#725B4A] mb-6 flex items-center gap-2"><List size={20} className="text-[#AD8B73]" />熱門商品排行</h3>
          <div className="space-y-5">
            {topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-[#AD8B73] text-white' : 'bg-[#F5EFE9] text-[#A39184]'}`}>{i + 1}</span>
                  <span className="font-medium text-[#725B4A]">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-[#725B4A]">{p.qty} 件</span>
              </div>
            ))}
            {topProducts.length === 0 && <div className="text-center text-[#C2A38A] py-8">尚無資料</div>}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#EBE5DF]">
          <h3 className="text-lg font-bold text-[#725B4A] mb-6 flex items-center gap-2"><Clock size={20} className="text-[#8A7361]" />近期交易活動</h3>
          <div className="space-y-4">
            {recentActivity.map((order, i) => (
              <div key={i} className="flex justify-between items-center bg-[#FCFAF8] p-4 rounded-2xl border border-[#EBE5DF]">
                <div>
                  <span className="font-bold text-[#725B4A] block text-sm">{order.customerName}</span>
                  <span className="text-xs text-[#968476]">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="text-sm font-bold text-[#829271]">+${(order.finalTotal || 0).toLocaleString()}</div>
              </div>
            ))}
            {recentActivity.length === 0 && <div className="text-center text-[#C2A38A] py-8 border border-dashed border-[#EBE5DF] rounded-2xl">尚無近期交易紀錄</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#EBE5DF]">
          <h3 className="text-lg font-bold text-[#725B4A] mb-6 flex items-center gap-2"><AlertCircle size={20} className="text-[#D49A89]" />待關心客戶 <span className="text-sm font-normal text-[#A39184]">(超過 30 天未回購)</span></h3>
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {customersNeedingCare.length > 0 ? customersNeedingCare.map((c, i) => (
              <div key={i} className="flex justify-between items-center bg-[#FCFAF8] p-4 rounded-2xl border border-[#EBE5DF]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDF4F2] flex items-center justify-center text-[#C47E6B] font-bold border-2 border-white shadow-sm">{c.name?.charAt(0) || 'C'}</div>
                  <div>
                    <span className="font-bold text-[#725B4A] block">{c.name}</span>
                    <span className="text-xs text-[#968476]">{c.ig ? `IG: ${c.ig}` : '未填寫 IG'}</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-[#D49A89]">{c.daysSince} 天未購</div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center text-[#C2A38A] bg-[#FCFAF8] rounded-2xl border border-dashed border-[#EBE5DF] py-10">
                <Heart size={32} className="text-[#EBE5DF] mb-2" />
                目前沒有待關心的客戶！
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#EBE5DF]">
          <h3 className="text-lg font-bold text-[#725B4A] mb-6 flex items-center gap-2"><PieChart size={20} className="text-[#B58B94]" />年度回購率</h3>
          <div className="space-y-6">
            {annualRepurchase.map((y, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-bold text-[#725B4A] text-sm">{y.year}</span>
                  <span className="text-sm font-bold text-[#AD8B73]">{y.rate}%</span>
                </div>
                <div className="w-full bg-[#F5EFE9] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#AD8B73] h-full rounded-full transition-all duration-500" style={{ width: `${y.rate}%` }}></div>
                </div>
                <div className="text-xs text-[#A39184] mt-1.5 text-right">{y.repurchased} 人回購 / 共 {y.total} 位客源</div>
              </div>
            ))}
            {annualRepurchase.length === 0 && <div className="text-center text-[#C2A38A] py-12 border border-dashed border-[#EBE5DF] rounded-2xl">尚無足夠年度資料</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ user, orders, customers, products, calculatePricing, profile, showToast }) {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [exportFrom, setExportFrom] = useState(firstDay);
  const [exportTo, setExportTo] = useState(today);

  const filteredOrders = orders.filter(o => o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleExportXLSX = () => {
    const filtered = orders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d >= exportFrom && d <= exportTo;
    });
    if (!filtered.length) { showToast('⚠️ 該區間沒有訂單資料'); return; }

    const header = ['日期','客戶姓名','產品內容','消費金額','淨利潤','優惠類型'];
    const rows = filtered.map(o => [
      new Date(o.createdAt).toLocaleDateString('zh-TW'),
      o.customerName||'',
      o.items?.map(i=>i.productName+'x'+i.qty).join('、')||'',
      o.finalTotal||0, o.profit||0, o.appliedTier||'零售價'
    ]);

    let xml = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml += '<Worksheet ss:Name="訂單備份"><Table>';
    xml += '<Row>' + header.map(h=>`<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';
    rows.forEach(r => {
      xml += '<Row>' + r.map((v,i)=>`<Cell><Data ss:Type="${i>=3&&i<=4?'Number':'String'}">${v}</Data></Cell>`).join('') + '</Row>';
    });
    xml += '</Table></Worksheet></Workbook>';

    const blob = new Blob([xml], {type:'application/vnd.ms-excel;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;
    a.download=`訂單備份_${exportFrom}_至_${exportTo}.xls`;
    a.click(); URL.revokeObjectURL(url);
    showToast('✅ Excel 已下載！');
    setShowExport(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'orders', deletingId));
    showToast('訂單已刪除');
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      {isCreating ? (
        <OrderForm user={user} customers={customers} products={products} calculatePricing={calculatePricing} profile={profile} onClose={() => setIsCreating(false)} showToast={showToast} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
            <h2 className="text-2xl font-bold text-[#725B4A] tracking-wide">銷售訂單</h2>
            <div className="flex gap-3">
              <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#AD8B73] border-2 border-[#EBE5DF] rounded-2xl hover:bg-[#F5EFE9] transition-all font-medium">
                <UploadCloud size={18} />匯出 Excel
              </button>
              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#AD8B73] text-white rounded-2xl hover:bg-[#8F705A] transition-all font-medium shadow-md">
                <Plus size={18} />新增訂單
              </button>
            </div>
          </div>

          {showExport && (
            <div className="bg-white rounded-3xl shadow-sm border border-[#AD8B73] p-6 space-y-4">
              <h3 className="font-bold text-[#725B4A]">選擇匯出日期區間</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <label className="text-xs text-[#968476] mb-1 block">開始日期</label>
                  <input type="date" value={exportFrom} onChange={e=>setExportFrom(e.target.value)} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl outline-none focus:ring-2 focus:ring-[#AD8B73] text-[#725B4A]" />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs text-[#968476] mb-1 block">結束日期</label>
                  <input type="date" value={exportTo} onChange={e=>setExportTo(e.target.value)} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl outline-none focus:ring-2 focus:ring-[#AD8B73] text-[#725B4A]" />
                </div>
                <button onClick={handleExportXLSX} className="flex items-center gap-2 px-6 py-3 bg-[#AD8B73] text-white rounded-2xl font-bold hover:bg-[#8F705A] transition-all shadow-md whitespace-nowrap mt-4 sm:mt-5">
                  <UploadCloud size={18} />下載 Excel
                </button>
              </div>
              <p className="text-xs text-[#A39184]">預設為本月資料，可自由調整日期範圍</p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-[#EBE5DF] overflow-hidden">
            <div className="p-4 border-b border-[#EBE5DF] flex items-center gap-3 bg-[#FCFAF8]">
              <Search size={18} className="text-[#C2A38A] ml-2" />
              <input type="text" placeholder="輸入客戶姓名搜尋訂單..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm text-[#725B4A] placeholder:text-[#C2A38A]" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F8F5F1] text-[#968476] text-sm border-b border-[#EBE5DF]">
                    <th className="p-5 font-medium whitespace-nowrap">日期</th>
                    <th className="p-5 font-medium whitespace-nowrap">客戶姓名</th>
                    <th className="p-5 font-medium min-w-[200px]">產品內容</th>
                    <th className="p-5 font-medium whitespace-nowrap">消費金額</th>
                    <th className="p-5 font-medium text-[#829271] whitespace-nowrap">單筆淨利</th>
                    <th className="p-5 font-medium text-right whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE5DF]">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#FCFAF8] transition-colors group">
                      <td className="p-5 text-sm text-[#968476]">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</td>
                      <td className="p-5 text-sm font-bold text-[#725B4A]">{order.customerName}</td>
                      <td className="p-5 text-sm text-[#968476]">{order.items?.map(i => `${i.productName}x${i.qty}`).join(', ')}</td>
                      <td className="p-5 text-sm font-bold text-[#725B4A]">${(order.finalTotal || 0).toLocaleString()}</td>
                      <td className="p-5 text-sm font-bold text-[#829271]">${(order.profit || 0).toLocaleString()}</td>
                      <td className="p-5 flex justify-end">
                        <button onClick={() => setDeletingId(order.id)} className="p-2 text-[#D49A89] hover:text-[#C47E6B] hover:bg-[#FDF4F2] rounded-xl transition-colors"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan="6" className="p-12 text-center text-[#C2A38A]">尚無訂單紀錄</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {deletingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(114,91,74,0.2)',backdropFilter:'blur(4px)'}}>
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-lg border border-[#EBE5DF]">
                <h3 className="text-xl font-bold text-[#725B4A] mb-3">確定要刪除這筆訂單嗎？</h3>
                <p className="text-sm text-[#A39184] mb-8">刪除後將無法復原。</p>
                <div className="flex gap-4">
                  <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-2xl bg-[#FCFAF8] text-[#968476] font-bold border border-[#EBE5DF]">取消</button>
                  <button onClick={confirmDelete} className="flex-1 py-3 rounded-2xl bg-[#D49A89] text-white font-bold">確認刪除</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderForm({ user, customers, products, calculatePricing, profile, onClose, showToast }) {
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [orderDate, setOrderDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const pricingResult = useMemo(() => calculatePricing(cart, profile?.level || '實習加盟', products), [cart, profile, products, calculatePricing]);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    if (!productId) return;
    const existing = cart.find(c => c.productId === productId);
    if (existing) setCart(cart.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { productId, qty: 1 }]);
    e.target.value = '';
  };

  const updateItemQty = (productId, delta) => {
    setCart(cart.map(c => {
      if (c.productId === productId) { const newQty = c.qty + delta; return newQty > 0 ? { ...c, qty: newQty } : c; }
      return c;
    }));
  };

  const handleSaveOrder = async () => {
    if (!customerName.trim() || cart.length === 0) { showToast('⚠️ 請填寫客戶姓名並加入至少一項商品'); return; }
    try {
      const orderTimestamp = new Date(`${orderDate}T12:00:00`).getTime();
      const orderData = {
        customerName: customerName.trim(),
        items: cart.map(c => ({ productId: c.productId, productName: products.find(p => p.id === c.productId)?.name || '未知商品', qty: c.qty })),
        ...pricingResult,
        createdAt: orderTimestamp
      };
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderData);
      const existingCustomer = customers.find(c => c.name === customerName.trim());
      if (existingCustomer) {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', existingCustomer.id), { lastPurchaseDate: Math.max(existingCustomer.lastPurchaseDate || 0, orderTimestamp) });
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'customers'), { name: customerName.trim(), createdAt: Date.now(), lastPurchaseDate: orderTimestamp, birthday: '', ig: '', interests: '' });
      }
      showToast('訂單建立成功！');
      onClose();
    } catch (error) { showToast(`⚠️ 儲存失敗：${error.message}`); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#EBE5DF] overflow-hidden flex flex-col md:flex-row">
      <div className="p-6 md:p-8 md:w-[55%] border-b md:border-b-0 md:border-r border-[#EBE5DF]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-[#725B4A]">新增訂單</h3>
          <button onClick={onClose} className="text-[#C2A38A] bg-[#FCFAF8] p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#968476] mb-2">訂單日期</label>
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full p-3.5 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#968476] mb-2">客戶姓名</label>
              <input type="text" list="customer-list" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-3.5 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A]" placeholder="輸入或選擇客戶" />
              <datalist id="customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
            </div>
          </div>
          <div className="p-5 bg-[#FCFAF8] rounded-3xl border border-[#EBE5DF] space-y-4">
            <h4 className="font-bold text-[#725B4A] text-sm">加入商品</h4>
            <select defaultValue="" onChange={handleProductSelect} className="w-full p-3.5 bg-white border border-[#EBE5DF] rounded-2xl text-sm focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A] cursor-pointer">
              <option value="" disabled>+ 點擊選取商品</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (原價 ${p.retailPrice})</option>)}
            </select>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {cart.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                if (!prod) return null;
                return (
                  <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-[#EBE5DF] text-sm">
                    <span className="font-bold text-[#725B4A]">{prod.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#FCFAF8] border border-[#EBE5DF] rounded-xl overflow-hidden">
                        <button onClick={() => updateItemQty(item.productId, -1)} className="px-3 py-1.5 text-[#A39184] hover:bg-[#F5EFE9] font-bold">-</button>
                        <span className="w-8 text-center text-[#725B4A] font-bold">{item.qty}</span>
                        <button onClick={() => updateItemQty(item.productId, 1)} className="px-3 py-1.5 text-[#A39184] hover:bg-[#F5EFE9] font-bold">+</button>
                      </div>
                      <button onClick={() => setCart(cart.filter(c => c.productId !== item.productId))} className="text-[#D49A89] p-2 bg-[#FDF4F2] rounded-xl"><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
              {cart.length === 0 && <div className="text-center text-[#C2A38A] py-6 text-sm bg-white rounded-2xl border border-dashed border-[#EBE5DF]">清單目前空空的</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 md:w-[45%] bg-[#FAF8F5] flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#725B4A] mb-6 border-b border-[#EBE5DF] pb-3">金額試算</h3>
          <div className="space-y-5">
            <div className="flex justify-between text-[#968476] font-medium"><span>原價總計</span><span>${(pricingResult.totalRetail || 0).toLocaleString()}</span></div>
            <div className="p-4 rounded-2xl bg-white border border-[#EBE5DF] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#AD8B73]"></div>
              <div className="flex justify-between items-center mb-2 pl-2">
                <span className="text-sm text-[#725B4A] font-bold">適用方案</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pricingResult.appliedTier === 'VIP價' ? 'bg-[#C8A98B] text-white' : pricingResult.appliedTier === '優惠價' ? 'bg-[#D7BAA3] text-white' : 'bg-[#EBE5DF] text-[#725B4A]'}`}>{pricingResult.appliedTier}</span>
              </div>
              <p className="text-xs text-[#A39184] pl-2">
                {pricingResult.appliedTier === 'VIP價' && '原價滿 $4000，享最優 VIP 價格！'}
                {pricingResult.appliedTier === '優惠價' && '任選兩件以上，享優惠折扣價！'}
                {pricingResult.appliedTier === '零售價' && '未達折扣門檻，以零售價計算。'}
              </p>
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-[#725B4A] pt-4 border-t border-[#EBE5DF]">
              <span>結帳總額</span><span>${(pricingResult.finalTotal || 0).toLocaleString()}</span>
            </div>
            {pricingResult.saved > 0 && (
              <div className="text-center bg-[#FDF4F2] text-[#C47E6B] rounded-2xl py-3 font-bold flex items-center justify-center gap-2 border border-[#FADCD5]">
                🎉 共為客戶省下 <span className="text-xl px-1">${pricingResult.saved.toLocaleString()}</span> 元！
              </div>
            )}
            <div className="text-right text-sm text-[#A39184] pt-4 border-t border-dashed border-[#EBE5DF]">
              預估淨利：<span className="text-[#829271] font-bold text-lg ml-1">${(pricingResult.profit || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <button onClick={handleSaveOrder} className="w-full mt-8 bg-[#AD8B73] text-white py-3.5 rounded-2xl font-bold hover:bg-[#8F705A] transition-all shadow-md tracking-wide">確認儲存訂單</button>
      </div>
    </div>
  );
}

function QuoteView({ calculatePricing, products, profile, showToast }) {
  const [cart, setCart] = useState([]);
  const pricingResult = useMemo(() => calculatePricing(cart, profile?.level || '實習加盟', products), [cart, profile, products, calculatePricing]);

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    if (!productId) return;
    const existing = cart.find(c => c.productId === productId);
    if (existing) setCart(cart.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { productId, qty: 1 }]);
    e.target.value = '';
  };

  const updateItemQty = (productId, delta) => setCart(cart.map(c => c.productId === productId ? { ...c, qty: Math.max(1, c.qty + delta) } : c));

  const handleCopy = () => {
    if (cart.length === 0) return;
    const itemsText = cart.map(c => { const p = products.find(prod => prod.id === c.productId); return p ? `- ${p.name} x${c.qty}` : ''; }).filter(Boolean).join('\n');
    let text = `您好！這是為您整理的專屬報價明細：\n\n【選購商品】\n${itemsText}\n\n`;
    text += `商品原價總計：$${(pricingResult.totalRetail || 0).toLocaleString()}\n`;
    if (pricingResult.appliedTier !== '零售價') text += `🎉 恭喜您符合【${pricingResult.appliedTier}】優惠資格！\n`;
    text += `-----------------\n💰 結帳總額：$${(pricingResult.finalTotal || 0).toLocaleString()}\n`;
    if (pricingResult.saved > 0) text += `🔥 這次購買總共為您省下了 $${pricingResult.saved.toLocaleString()} 元！\n`;
    navigator.clipboard.writeText(text).then(() => showToast('報價訊息已複製！可直接貼上至 LINE')).catch(() => showToast('複製成功！'));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-[#725B4A] mb-6 tracking-wide">報價組合試算</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#EBE5DF]">
          <h3 className="font-bold text-[#725B4A] mb-6">加入試算商品</h3>
          <select defaultValue="" onChange={handleProductSelect} className="w-full p-3.5 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl text-sm focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A] cursor-pointer mb-6">
            <option value="" disabled>+ 點擊選取商品</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="space-y-3 border-t border-[#EBE5DF] pt-6 max-h-64 overflow-y-auto">
            {cart.map((item, idx) => {
              const prod = products.find(p => p.id === item.productId);
              if (!prod) return null;
              return (
                <div key={idx} className="flex justify-between items-center bg-[#FCFAF8] p-4 rounded-2xl border border-[#EBE5DF] text-sm">
                  <span className="font-bold text-[#725B4A]">{prod.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-[#EBE5DF] rounded-xl overflow-hidden">
                      <button onClick={() => updateItemQty(item.productId, -1)} className="px-3 py-1.5 text-[#A39184] hover:bg-[#F5EFE9] font-bold">-</button>
                      <span className="w-8 text-center text-[#725B4A] font-bold">{item.qty}</span>
                      <button onClick={() => updateItemQty(item.productId, 1)} className="px-3 py-1.5 text-[#A39184] hover:bg-[#F5EFE9] font-bold">+</button>
                    </div>
                    <button onClick={() => setCart(cart.filter(c => c.productId !== item.productId))} className="text-[#D49A89] p-2 bg-white rounded-xl shadow-sm"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
            {cart.length === 0 && <div className="text-center text-[#C2A38A] py-8 text-sm bg-[#FCFAF8] rounded-2xl border border-dashed border-[#EBE5DF]">尚未加入試算商品</div>}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-6 md:p-8 rounded-3xl shadow-sm border border-[#C2A38A] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#725B4A] mb-6 border-b border-[#EBE5DF] pb-3 flex items-center gap-2"><Calculator size={22} className="text-[#AD8B73]" />最終報價試算</h3>
            <div className="space-y-5">
              <div className="flex justify-between text-[#968476] font-medium"><span>原價總計</span><span>${(pricingResult.totalRetail || 0).toLocaleString()}</span></div>
              <div className="p-4 rounded-2xl bg-white border border-[#EBE5DF] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#AD8B73]"></div>
                <div className="flex justify-between items-center mb-2 pl-2">
                  <span className="text-sm text-[#725B4A] font-bold">適用方案</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pricingResult.appliedTier === 'VIP價' ? 'bg-[#C8A98B] text-white' : pricingResult.appliedTier === '優惠價' ? 'bg-[#D7BAA3] text-white' : 'bg-[#EBE5DF] text-[#725B4A]'}`}>{pricingResult.appliedTier}</span>
                </div>
                <p className="text-xs text-[#A39184] pl-2">
                  {pricingResult.appliedTier === 'VIP價' && '原價滿 $4000，享最優 VIP 價格！'}
                  {pricingResult.appliedTier === '優惠價' && '任選兩件以上，享優惠折扣價！'}
                  {pricingResult.appliedTier === '零售價' && '未達折扣門檻，以零售價計算。'}
                </p>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-[#725B4A] pt-4 border-t border-[#EBE5DF]"><span>結帳總額</span><span>${(pricingResult.finalTotal || 0).toLocaleString()}</span></div>
              {pricingResult.saved > 0 && <div className="text-center bg-[#FDF4F2] text-[#C47E6B] rounded-2xl py-3 font-bold flex items-center justify-center gap-2 border border-[#FADCD5]">🎉 共為客戶省下 <span className="text-xl px-1">${pricingResult.saved.toLocaleString()}</span> 元！</div>}
              <div className="text-right text-sm text-[#A39184] pt-4 border-t border-dashed border-[#EBE5DF]">預估淨利：<span className="text-[#829271] font-bold text-lg ml-1">${(pricingResult.profit || 0).toLocaleString()}</span></div>
            </div>
          </div>
          <button onClick={handleCopy} disabled={cart.length === 0} className={`w-full mt-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md tracking-wide ${cart.length > 0 ? 'bg-[#829271] hover:bg-[#6D7D5E] text-white' : 'bg-[#EBE5DF] text-[#A39184] cursor-not-allowed'}`}>
            <Copy size={18} />一鍵複製報價訊息 (傳送LINE)
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomersView({ user, customers, orders, showToast, profile }) {
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [exportFrom, setExportFrom] = useState(firstDay);
  const [exportTo, setExportTo] = useState(today);

  const handleExportXLSX = () => {
    const filtered = enrichedCustomers.filter(c => {
      if (!c.lastPurchaseDate) return true;
      const d = new Date(c.lastPurchaseDate).toISOString().split('T')[0];
      return d >= exportFrom && d <= exportTo;
    });
    if (!filtered.length) { showToast('⚠️ 該區間沒有客戶資料'); return; }
    const header = ['姓名','身份','生日','IG帳號','興趣筆記','上次購買'];
    const rows = filtered.map(c => [
      c.name||'', c.type||'', c.birthday||'', c.ig||'', c.interests||'',
      c.daysSince===0?'今天':c.daysSince+'天前'
    ]);
    let xml = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml += '<Worksheet ss:Name="客戶備份"><Table>';
    xml += '<Row>'+header.map(h=>`<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')+'</Row>';
    rows.forEach(r=>{xml+='<Row>'+r.map(v=>`<Cell><Data ss:Type="String">${v}</Data></Cell>`).join('')+'</Row>';});
    xml += '</Table></Worksheet></Workbook>';
    const blob = new Blob([xml],{type:'application/vnd.ms-excel;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=`客戶備份_${exportFrom}_至_${exportTo}.xls`;
    a.click(); URL.revokeObjectURL(url);
    showToast('✅ Excel 已下載！');
    setShowExport(false);
  };

  const enrichedCustomers = useMemo(() => {
    const now = Date.now();
    return customers.map(c => {
      const daysSince = Math.floor((now - (c.lastPurchaseDate || now)) / (1000 * 60 * 60 * 24));
      return { ...c, daysSince, needsCare: daysSince > 30 };
    }).filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  }, [customers, search]);

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'customers', editingCustomer.id), { birthday: editingCustomer.birthday, ig: editingCustomer.ig, interests: editingCustomer.interests });
      setEditingCustomer(null);
      showToast('客戶資料更新成功！');
    } catch (err) { showToast('⚠️ 更新失敗'); }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#725B4A] tracking-wide">客戶售後管理</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-[#EBE5DF] rounded-2xl px-4 py-2.5 flex-1 md:w-72 shadow-sm">
            <Search size={18} className="text-[#C2A38A] mr-2" />
            <input type="text" placeholder="搜尋客戶姓名..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-[#725B4A] placeholder:text-[#C2A38A]" />
          </div>
          <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#AD8B73] border-2 border-[#EBE5DF] rounded-2xl hover:bg-[#F5EFE9] transition-all whitespace-nowrap text-sm font-bold shadow-sm">
            <UploadCloud size={16} />匯出 Excel
          </button>
        </div>
      </div>

      {showExport && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#AD8B73] p-6 space-y-4">
          <h3 className="font-bold text-[#725B4A]">選擇匯出日期區間（依上次購買日）</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-xs text-[#968476] mb-1 block">開始日期</label>
              <input type="date" value={exportFrom} onChange={e=>setExportFrom(e.target.value)} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl outline-none focus:ring-2 focus:ring-[#AD8B73] text-[#725B4A]" />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-[#968476] mb-1 block">結束日期</label>
              <input type="date" value={exportTo} onChange={e=>setExportTo(e.target.value)} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl outline-none focus:ring-2 focus:ring-[#AD8B73] text-[#725B4A]" />
            </div>
            <button onClick={handleExportXLSX} className="flex items-center gap-2 px-6 py-3 bg-[#AD8B73] text-white rounded-2xl font-bold hover:bg-[#8F705A] transition-all shadow-md whitespace-nowrap mt-4 sm:mt-5">
              <UploadCloud size={18} />下載 Excel
            </button>
          </div>
          <p className="text-xs text-[#A39184]">預設為本月，可自由調整日期範圍</p>
        </div>
      )}

      {editingCustomer ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#EBE5DF] max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6 border-b border-[#EBE5DF] pb-4">
            <h3 className="font-bold text-lg text-[#725B4A]">編輯：{editingCustomer.name}</h3>
            <button onClick={() => setEditingCustomer(null)} className="bg-[#FCFAF8] p-2 rounded-full text-[#C2A38A]"><X size={20} /></button>
          </div>
          <form onSubmit={handleSaveCustomer} className="space-y-5">
            <div><label className="text-sm font-medium text-[#968476] block mb-2">生日</label><input type="text" value={editingCustomer.birthday || ''} onChange={e => setEditingCustomer({ ...editingCustomer, birthday: e.target.value })} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none" placeholder="例如: 10/25" /></div>
            <div><label className="text-sm font-medium text-[#968476] block mb-2">IG 帳號</label><input type="text" value={editingCustomer.ig || ''} onChange={e => setEditingCustomer({ ...editingCustomer, ig: e.target.value })} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none" placeholder="@username" /></div>
            <div><label className="text-sm font-medium text-[#968476] block mb-2">興趣 / 喜好筆記</label><textarea value={editingCustomer.interests || ''} onChange={e => setEditingCustomer({ ...editingCustomer, interests: e.target.value })} className="w-full p-3 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none resize-none" rows="4" /></div>
            <button type="submit" className="w-full bg-[#AD8B73] text-white py-3.5 rounded-2xl font-bold hover:bg-[#8F705A] transition-all shadow-md mt-4 tracking-wide">儲存資料</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-6 rounded-3xl shadow-sm border border-[#EBE5DF] relative group hover:shadow-md transition-shadow">
              {customer.needsCare && <div className="absolute -top-3 -right-2 bg-[#D49A89] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border-2 border-white"><AlertCircle size={14} />待關心</div>}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5EFE9] flex items-center justify-center text-[#AD8B73] font-bold text-lg border-2 border-white shadow-sm">{customer.name?.charAt(0) || 'C'}</div>
                  <div>
                    <h4 className="font-bold text-[#725B4A] text-lg">{customer.name}</h4>
                    <p className="text-xs text-[#A39184] font-medium mt-0.5">上次購買: {customer.daysSince === 0 ? '今天' : `${customer.daysSince}天前`}</p>
                  </div>
                </div>
                <button onClick={() => setEditingCustomer(customer)} className="text-[#C2A38A] hover:text-[#725B4A] p-2 bg-[#FCFAF8] rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16} /></button>
              </div>
              <div className="text-sm text-[#725B4A] space-y-2.5 bg-[#FCFAF8] p-4 rounded-2xl border border-[#EBE5DF]/60">
                <p className="flex items-center gap-2"><span className="text-[#C2A38A]">🎂 生日:</span>{customer.birthday || <span className="text-[#D3CBC3]">未填寫</span>}</p>
                <p className="flex items-center gap-2"><span className="text-[#C2A38A]">📱 IG:</span>{customer.ig || <span className="text-[#D3CBC3]">未填寫</span>}</p>
                <p className="truncate flex items-center gap-2"><span className="text-[#C2A38A]">💡 筆記:</span>{customer.interests || <span className="text-[#D3CBC3]">無</span>}</p>
              </div>
            </div>
          ))}
          {enrichedCustomers.length === 0 && <div className="col-span-3 text-center text-[#C2A38A] py-16 bg-white rounded-3xl border border-dashed border-[#EBE5DF]">目前尚無客戶資料</div>}
        </div>
      )}
    </div>
  );
}

function ProductsView({ profile, products }) {
  const displayLevel = profile?.level || '實習加盟';
  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#725B4A] mb-3 tracking-wide">產品價目表</h2>
        <p className="text-sm text-[#968476]">目前加盟級別：<strong className="text-[#AD8B73] text-base bg-[#F5EFE9] px-2 py-0.5 rounded-md ml-1">{displayLevel}</strong></p>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-[#EBE5DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F5F1] text-[#725B4A] text-sm border-b border-[#EBE5DF]">
                <th className="p-5 font-bold whitespace-nowrap">產品名稱</th>
                <th className="p-5 font-bold whitespace-nowrap">零售價</th>
                <th className="p-5 font-bold whitespace-nowrap">優惠價<br /><span className="text-xs font-normal text-[#A39184]">(滿2件)</span></th>
                <th className="p-5 font-bold whitespace-nowrap text-[#AD8B73]">VIP價<br /><span className="text-xs font-normal text-[#C2A38A]">(滿$4000)</span></th>
                <th className="p-5 font-bold text-[#8A7361] bg-[#F3EFEA] border-l border-[#EBE5DF] whitespace-nowrap">您的成本價</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DF]">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-[#FCFAF8] transition-colors group">
                  <td className="p-5 text-sm font-bold text-[#725B4A]">{p.name}</td>
                  <td className="p-5 text-sm text-[#968476]">${p.retailPrice}</td>
                  <td className="p-5 text-sm text-[#968476]">${p.promoPrice}</td>
                  <td className="p-5 text-sm text-[#AD8B73] font-bold">${p.vipPrice}</td>
                  <td className="p-5 text-sm font-bold text-[#8A7361] bg-[#FCFAF8] border-l border-[#EBE5DF]">${p[`cost${displayLevel}`] || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ user, profile, showToast }) {
  const [name, setName] = useState(profile?.name || '');
  const [level, setLevel] = useState(profile?.level || '實習加盟');
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [backupUrl, setBackupUrl] = useState(profile?.backupUrl || '');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setAvatar(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), { name, level, avatar, backupUrl, isSetup: true }, { merge: true });
      showToast('個人設定已更新！');
    } catch (err) { showToast('⚠️ 儲存失敗'); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h2 className="text-2xl font-bold text-[#725B4A] mb-6 tracking-wide">個人專屬設定</h2>
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-[#EBE5DF] space-y-8">
        <div className="flex flex-col items-center gap-4 border-b border-[#EBE5DF] pb-8">
          <div className="relative">
            {avatar ? <img src={avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-[#F5EFE9] shadow-sm" />
              : <div className="w-28 h-28 rounded-full bg-[#F5EFE9] text-[#AD8B73] flex items-center justify-center font-bold text-4xl shadow-sm border-4 border-white">{name?.charAt(0) || 'U'}</div>}
            <button onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-md border border-[#EBE5DF] text-[#A39184] hover:text-[#AD8B73]"><Camera size={18} /></button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>
          <p className="text-sm text-[#C2A38A]">點擊圖示上傳個人頭貼</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#725B4A] mb-3">您的姓名或品牌名稱</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A]" />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#725B4A] mb-3">成本級別設定</label>
          <div className="grid grid-cols-2 gap-4">
            {['實習加盟', '三級零售', '三級輔導督導', '二級輔導督導'].map(lvl => (
              <label key={lvl} className={`flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all text-sm font-medium ${level === lvl ? 'bg-[#F5EFE9] border-[#AD8B73] text-[#725B4A]' : 'border-[#EBE5DF] text-[#A39184] hover:bg-[#FCFAF8]'}`}>
                <input type="radio" name="level" value={lvl} checked={level === lvl} onChange={() => setLevel(lvl)} className="hidden" />{lvl}
              </label>
            ))}
          </div>
          <p className="text-xs text-[#A39184] mt-4 flex items-center gap-1.5 bg-[#FCFAF8] p-3 rounded-xl border border-[#EBE5DF]"><AlertCircle size={16} className="text-[#C2A38A]" />升級後變更級別，歷史訂單紀錄不受影響，僅套用於未來成本試算。</p>
        </div>
        <button onClick={handleSave} className="w-full bg-[#AD8B73] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#8F705A] transition-all flex items-center justify-center gap-2 mt-8 shadow-md tracking-wide">
          <Save size={20} />儲存設定
        </button>
      </div>
    </div>
  );
}

function OnboardingView({ user, setProfile }) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('實習加盟');
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim()) { setError('請輸入您的名稱'); return; }
    setError('');
    const newProfile = { name: name.trim(), level, isSetup: true, avatar: null, backupUrl: '' };
    try {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile'), newProfile);
      setProfile(newProfile);
    } catch (e) { setError('初始化失敗，請稍後再試'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAF8] p-4" style={{fontFamily:"'Noto Sans TC', sans-serif"}}>
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-md border border-[#EBE5DF] text-center">
        <div className="w-20 h-20 bg-[#F5EFE9] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm rotate-3 border-2 border-white">
          <Heart size={36} className="text-[#AD8B73]" fill="rgba(173,139,115,0.2)" />
        </div>
        <h1 className="text-3xl font-bold text-[#725B4A] mb-1 tracking-wider">JERÔSSE</h1>
        <p className="text-sm text-[#AD8B73] font-bold tracking-widest mb-6">少女團專屬營收系統</p>
        <p className="text-[#A39184] text-sm mb-10 leading-relaxed">請設定您的專屬資料，資料將安全存放於雲端。</p>
        <div className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-bold text-[#725B4A] mb-2">您的姓名或品牌名稱</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例如：質感美學 宣宣" className="w-full p-4 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none placeholder:text-[#D3CBC3] text-[#725B4A]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#725B4A] mb-2">專屬加盟級別</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-4 bg-[#FCFAF8] border border-[#EBE5DF] rounded-2xl focus:ring-2 focus:ring-[#AD8B73] outline-none text-[#725B4A]">
              <option value="實習加盟">實習加盟</option>
              <option value="三級零售">三級零售</option>
              <option value="三級輔導督導">三級輔導督導</option>
              <option value="二級輔導督導">二級輔導督導</option>
            </select>
          </div>
          {error && <div className="text-[#D49A89] text-sm font-bold bg-[#FDF4F2] p-3 rounded-xl border border-[#FADCD5]">{error}</div>}
          <button onClick={handleStart} className="w-full bg-[#AD8B73] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#8F705A] transition-all mt-8 shadow-md tracking-wide">開始我的婕樂纖旅程</button>
        </div>
      </div>
    </div>
  );
}

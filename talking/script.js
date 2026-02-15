import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  MessageCircle, 
  Send, 
  LogOut, 
  User, 
  Mail, 
  Lock, 
  Loader2,
  AlertCircle,
  ChevronRight,
  UserCircle
} from 'lucide-react';

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCARqKQjjpzTSiPoXzf5eHBeXsvmV6pOY8",
  authDomain: "my-chat-7e514.firebaseapp.com",
  projectId: "my-chat-7e514",
  storageBucket: "my-chat-7e514.firebasestorage.app",
  messagingSenderId: "774116529786",
  appId: "1:774116529786:web:410858f35201026e4b8dc3",
  measurementId: "G-CE235JY3H0"
};

// --- Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Components ---

const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
    <p className="text-slate-500 font-medium">연결 중입니다...</p>
  </div>
);

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (err) {
      console.error("Auth Error:", err.code);
      switch (err.code) {
        case 'auth/email-already-in-use': setError('이미 등록된 이메일입니다.'); break;
        case 'auth/weak-password': setError('비밀번호를 6자 이상 입력하세요.'); break;
        case 'auth/invalid-email': setError('이메일 형식이 올바르지 않습니다.'); break;
        case 'auth/operation-not-allowed': setError('서버에서 이메일 인증이 비활성화되어 있습니다. 비회원으로 접속해 보세요.'); break;
        default: setError('인증에 실패했습니다. (서버 설정을 확인하세요)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setAnonLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Anon Auth Error:", err);
      setError('비회원 접속에 실패했습니다.');
    } finally {
      setAnonLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{isLogin ? '반갑습니다' : '가입하기'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" placeholder="닉네임" value={name} onChange={e => setName(e.target.value)} required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" disabled={loading || anonLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center shadow-md active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <span className="relative bg-white px-4 text-xs text-slate-400 uppercase tracking-widest">Or</span>
        </div>

        <button 
          onClick={handleAnonymousLogin}
          disabled={loading || anonLoading}
          className="w-full border border-slate-200 text-slate-600 py-3.5 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          {anonLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserCircle className="w-5 h-5" /> 비회원으로 시작하기</>}
        </button>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-600 font-semibold text-sm hover:underline inline-flex items-center"
          >
            {isLogin ? '계정이 없으신가요? 가입하기' : '이미 계정이 있으신가요? 로그인'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatScreen = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
        text,
        senderId: user.uid,
        senderName: user.displayName || (user.isAnonymous ? `익명_${user.uid.slice(0, 4)}` : user.email.split('@')[0]),
        createdAt: serverTimestamp()
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <nav className="h-16 border-b flex items-center justify-between px-6 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-800">오픈 톡</span>
        </div>
        <button onClick={() => signOut(auth)} className="p-2 text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === user.uid;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[80%] ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && <span className="text-[11px] font-bold text-slate-400 mb-1 ml-1">{msg.senderName}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
          <input 
            type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-slate-100 border-none rounded-2xl py-3 px-5 outline-none text-sm"
          />
          <button type="submit" disabled={!input.trim()} className="bg-indigo-600 text-white p-3 rounded-xl shadow-md"><Send className="w-5 h-5" /></button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) {}
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;
  return user ? <ChatScreen user={user} /> : <AuthScreen />;
}



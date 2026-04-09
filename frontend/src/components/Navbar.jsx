import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Plus, History, Bell, Zap, LogOut, Droplet, User, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NavLink = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className="relative group block">
        <motion.div 
            whileHover={{ x: 4 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                active 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            <Icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-blue-400' : ''}`} />
            <span className="hidden md:block font-bold tracking-tight">{label}</span>
            {active && (
                <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
        </motion.div>
    </Link>
);

const Navbar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <nav 
                className="fixed left-0 top-0 h-screen w-20 md:w-64 glass p-4 hidden sm:flex flex-col items-center md:items-stretch gap-8 z-50 transition-all duration-300"
                style={{ transform: 'translateZ(0)' }}
            >
                <div className="flex items-center gap-3 px-2 shrink-0">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <Droplet className="text-white w-6 h-6" />
                    </div>
                    <span className="hidden md:block font-bold text-xl tracking-tight">AquaSmart</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
                    <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
                    <NavLink to="/usage" icon={Plus} label="Add Usage" active={location.pathname === '/usage'} />
                    <NavLink to="/history" icon={History} label="History" active={location.pathname === '/history'} />
                    <NavLink to="/reports" icon={FileText} label="Reports" active={location.pathname === '/reports'} />
                    <NavLink to="/insights" icon={BarChart3} label="Insights" active={location.pathname === '/insights'} />
                    <NavLink to="/bills" icon={History} label="Billing" active={location.pathname === '/bills' || location.pathname.startsWith('/bills/')} />
                    <NavLink to="/alerts" icon={Bell} label="Alerts" active={location.pathname === '/alerts'} />
                    <NavLink to="/suggestions" icon={Zap} label="Save Water" active={location.pathname === '/suggestions'} />
                    <NavLink to="/profile" icon={User} label="Profile" active={location.pathname === '/profile'} />
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4 shrink-0 pb-10">
                    <div className="hidden md:flex items-center gap-3 px-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.firstName} {user?.lastName}</p>
                            <p className="text-gray-400 text-xs truncate capitalize">{user?.role || 'User'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="hidden md:block font-semibold">Logout</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 sm:hidden flex items-center justify-around px-4 pb-2 z-50">
                <Link to="/dashboard" className={`flex flex-col items-center gap-1 ${location.pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Dash</span>
                </Link>
                <Link to="/usage" className={`flex flex-col items-center gap-1 ${location.pathname === '/usage' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Add</span>
                </Link>
                <Link to="/reports" className={`flex flex-col items-center gap-1 ${location.pathname === '/reports' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <FileText className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Reports</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-400'}`}>
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Profile</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500/80">
                    <LogOut className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Exit</span>
                </button>
            </nav>
        </>
    );
};

export default Navbar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Plus, History, Bell, Zap, LogOut, Droplet, User, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ to, icon: Icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <Icon className="w-6 h-6" />
        <span className="hidden md:block font-semibold">{label}</span>
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
        <nav className="fixed left-0 top-0 h-screen w-20 md:w-64 glass border-r border-white/10 p-4 flex flex-col items-center md:items-stretch gap-8 z-50">
            <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                    <Droplet className="text-white w-6 h-6" />
                </div>
                <span className="hidden md:block font-bold text-xl tracking-tight">AquaSmart</span>
            </div>

            <div className="flex-1 space-y-2">
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

            <div className="pt-6 border-t border-white/10 space-y-4">
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
    );
};

export default Navbar;

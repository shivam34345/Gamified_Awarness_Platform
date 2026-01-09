import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Shield, Target, Play, BookOpen, Trophy, Gift, Settings, LogOut
} from "lucide-react";
import { useState } from "react";

interface DashboardSidebarProps {
    onLogout: () => void;
}

const SideBarItems = [
    { name: 'Dashboard', icon: Target, path: '/dashboard' },
    { name: 'Play Now', icon: Play, path: '/play' },
    { name: 'Knowledge Hub', icon: BookOpen, path: '/topics' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Reward Shop', icon: Gift, path: '/shop' },
];

export const DashboardSidebar = ({ onLogout }: DashboardSidebarProps) => {
    const [idx , setIndex] = useState(Number(localStorage.getItem('sidebarIndex')) || 0);
    const setSidebarIndex = (index: number) => {
        localStorage.setItem('sidebarIndex', index.toString());
        setIndex(index);
    };
    return (
        <motion.aside
            className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 p-4 hidden lg:flex flex-col z-20 shadow-sm"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20">
                    <Shield size={24} className="text-white" />
                </div>
                <span className="font-display font-bold text-xl text-dark">
                    Edu<span className="text-primary">Rights</span>
                </span>
            </Link>

            {/* Nav items */}
            <nav className="flex-1 space-y-2">
                {SideBarItems.map((item, index) => (
                    <Link to={item.path.toLowerCase()} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-dark-lighter hover:bg-gray-50 font-nunito font-bold transition-colors ${idx !== index ? 'bg-gray-50' : 'bg-gradient-hero'}`} onClick={() => setSidebarIndex(index)}>
                        <item.icon size={20} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Bottom nav */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-lighter hover:bg-gray-50 font-nunito font-bold transition-colors">
                    <Settings size={20} />
                    Settings
                </Link>
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-lighter hover:bg-red-50 hover:text-red-500 font-nunito font-bold transition-colors">
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>
        </motion.aside>
    );
};

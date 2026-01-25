
export default function Header({ title = 'Dashboard' }) {
    return (
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-[#111722]/80 backdrop-blur-md px-6 py-4">
            <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-[#92a4c9]">
                <a className="hover:text-slate-900 dark:hover:text-white transition-colors" href="#">Home</a>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-900 dark:text-white">{title}</span>
            </nav>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-1.5 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111722]"></span>
                </button>
                <button className="md:hidden p-2 text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48] rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
            </div>
        </header>
    );
}

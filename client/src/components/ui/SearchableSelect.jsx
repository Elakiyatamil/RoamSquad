import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchableSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select an option", 
    label, 
    error,
    disabled = false,
    className = "",
    loading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value || opt.id === value);
    const filteredOptions = options.filter(opt => 
        (opt.label || opt.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!disabled && !loading) {
            setIsOpen(!isOpen);
            setSearchTerm('');
        }
    };

    const handleSelect = (option) => {
        onChange(option.value || option.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`space-y-1.5 ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 flex justify-between">
                    {label}
                    {loading && <span className="animate-pulse">Loading...</span>}
                </label>
            )}
            
            <div className="relative">
                <button
                    type="button"
                    onClick={toggleDropdown}
                    disabled={disabled || loading}
                    className={`
                        w-full px-4 py-3 bg-ink/5 rounded-xl border-2 transition-all flex items-center justify-between font-medium
                        ${isOpen ? 'border-red/20 bg-white shadow-lg' : 'border-transparent'}
                        ${error ? 'border-red/50 bg-red/5' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-ink/10'}
                    `}
                >
                    <span className={selectedOption ? 'text-ink' : 'text-ink/30'}>
                        {selectedOption ? (selectedOption.label || selectedOption.name) : placeholder}
                    </span>
                    <ChevronDown size={18} className={`text-ink/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-[70] mt-2 w-full bg-white rounded-2xl shadow-2xl border border-ink/5 overflow-hidden"
                        >
                            <div className="p-3 border-b border-ink/5">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-ink/5 rounded-lg border-none outline-none text-sm font-medium focus:ring-2 focus:ring-red/10"
                                    />
                                </div>
                            </div>

                            <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                                {filteredOptions.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-ink/40 font-bold uppercase tracking-widest">
                                        No matches found
                                    </div>
                                ) : (
                                    filteredOptions.map((option) => (
                                        <button
                                            key={option.value || option.id}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`
                                                w-full px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium transition-colors
                                                ${(option.value === value || option.id === value) ? 'bg-red/5 text-red font-bold' : 'text-ink hover:bg-ink/5'}
                                            `}
                                        >
                                            {option.label || option.name}
                                            {(option.value === value || option.id === value) && <Check size={14} />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {error && <p className="text-[10px] text-red font-bold uppercase tracking-wider pl-1">{error}</p>}
        </div>
    );
};

export default SearchableSelect;

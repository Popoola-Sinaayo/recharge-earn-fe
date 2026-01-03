'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ className = '', hover = false, children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`
        bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm
        border border-gray-200 dark:border-[#334155]
        p-6 transition-all duration-200
        ${hover ? 'cursor-pointer hover:shadow-xl hover:border-gray-300 dark:hover:border-[#475569]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}


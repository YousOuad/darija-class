import { motion } from 'framer-motion';
import { MessageCircle, Construction } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

export default function Conversation() {
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-sand-100 p-10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={40} className="text-teal-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark mb-3">Conversation Practice</h1>
          <div className="flex items-center justify-center gap-2 text-terracotta-500 mb-4">
            <Construction size={18} />
            <span className="text-sm font-semibold">Coming Soon</span>
          </div>
          <p className="text-dark-400 text-sm leading-relaxed">
            We're working on an immersive Darija conversation experience where you'll be able to
            practice real-life scenarios like ordering at a cafe, bargaining at the souk, and more.
          </p>
          <p className="text-dark-300 text-xs mt-4">Stay tuned!</p>
        </motion.div>
      </div>
    </AppLayout>
  );
}

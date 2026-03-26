import React from 'react';
import { X, FileText, Shield, HelpCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'help-center' | 'terms' | 'privacy' | 'refund';
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, contentType }) => {
  const { isDarkMode } = useTheme();
  const getModalContent = () => {
    switch (contentType) {
      case 'help-center':
        return {
          icon: HelpCircle,
          title: 'Help Center',
          subtitle: 'How can we help you?',
          content: (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Support</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">✉</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email Support</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">support@tripbooking.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">💬</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Live Chat</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">📞</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Phone Support</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">+1 (234) 567-890</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <details className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
                    <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">How do I book a trip?</summary>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">Simply browse our destinations, select your preferences, and follow the booking process. You'll receive confirmation via email.</p>
                  </details>
                  <details className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
                    <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">Can I cancel my booking?</summary>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">Yes, you can cancel your booking up to 24 hours before your trip for a full refund.</p>
                  </details>
                  <details className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
                    <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">What payment methods do you accept?</summary>
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">We accept all major credit cards, PayPal, and bank transfers.</p>
                  </details>
                </div>
              </div>
            </div>
          )
        };

      case 'terms':
        return {
          icon: FileText,
          title: 'Terms of Service',
          subtitle: 'Our terms and conditions',
          content: (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  By accessing and using Trip Booking, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Use License</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  Permission is granted to temporarily download one copy of the materials on Trip Booking for personal, non-commercial transitory viewing only.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Disclaimer</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  The materials on Trip Booking are provided on an 'as is' basis. Trip Booking makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Limitations</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  In no event shall Trip Booking or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Privacy Policy</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  Your Privacy Policy will also govern your use of Trip Booking and you agree to be bound by the terms outlined in our Privacy Policy.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Revisions and Errata</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  The materials appearing on Trip Booking could include technical, typographical, or photographic errors. Trip Booking does not promise that any of the materials on its web site are accurate, complete, or current.
                </p>
              </div>
            </div>
          )
        };

      case 'privacy':
        return {
          icon: Shield,
          title: 'Privacy Policy',
          subtitle: 'Your privacy is important to us',
          content: (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information We Collect</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, make a reservation, or contact us for support.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How We Use Your Information</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information Sharing</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Security</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Rights</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  You have the right to access, update, or delete your personal information. You can manage your account settings or contact us for assistance.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@tripbooking.com.
                </p>
              </div>
            </div>
          )
        };

      case 'refund':
        return {
          icon: RotateCcw,
          title: 'Refund Policy',
          subtitle: 'Our refund and cancellation policy',
          content: (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cancellation Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">✓</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">30+ days before trip</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">Full refund (100%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">!</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">14-29 days before trip</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">50% refund</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">✗</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Less than 14 days</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">No refund</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Refund Process</h3>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                  <li>1. Submit cancellation request through your account</li>
                  <li>2. Receive confirmation email within 24 hours</li>
                  <li>3. Refund processed within 5-7 business days</li>
                  <li>4. Funds returned to original payment method</li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Exceptions</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  Full refunds may be provided for medical emergencies, natural disasters, or other extenuating circumstances with proper documentation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Support</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  For refund inquiries, please contact our support team at refunds@tripbooking.com or call +1 (234) 567-890.
                </p>
              </div>
            </div>
          )
        };

      default:
        return null;
    }
  };

  const modalContent = getModalContent();
  if (!modalContent) return null;

  const Icon = modalContent.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className={`relative p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r ${isDarkMode ? 'from-slate-900 via-sky-800 to-sky-600' : 'from-slate-800 via-sky-700 to-sky-500'}`}>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-white/80 group-hover:text-white" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{modalContent.title}</h2>
                  <p className={`${isDarkMode ? 'text-sky-100/80' : 'text-sky-50'} mt-1`}>{modalContent.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50 dark:bg-slate-900/60">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                {modalContent.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={onClose}
                className={`w-full bg-gradient-to-r ${isDarkMode ? 'from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400' : 'from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600'} text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

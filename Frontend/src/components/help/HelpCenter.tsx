import React, { useState } from 'react';
import { X, MessageCircle, Mail, Phone, Clock, Shield, FileText, ArrowRight, Check, AlertCircle, HelpCircle } from 'lucide-react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'help' | 'terms' | 'privacy' | 'refund'>('help');

  console.log('🔍 HelpCenter rendered, isOpen:', isOpen);

  if (!isOpen) {
    console.log('🔍 HelpCenter not rendering because isOpen is false');
    return null;
  }

  console.log('🔍 HelpCenter is now rendering the modal');

  const renderHelpContent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to our Help Center!</h3>
        <p className="text-gray-600 mb-4">
          You can contact us via email or live chat. Here you'll find answers to the most common questions and tips to get the best experience.
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
          <Mail className="w-6 h-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
          <p className="text-sm text-gray-600 mb-2">Get help via email</p>
          <a href="mailto:support@tripbooking.com" className="text-blue-600 text-sm hover:underline">
            support@tripbooking.com
          </a>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
          <MessageCircle className="w-6 h-6 text-green-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Live Chat</h4>
          <p className="text-sm text-gray-600 mb-2">Chat with our team</p>
          <button className="text-green-600 text-sm hover:underline">Start Chat</button>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
          <Phone className="w-6 h-6 text-purple-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
          <p className="text-sm text-gray-600 mb-2">Call us directly</p>
          <a href="tel:+1234567890" className="text-purple-600 text-sm hover:underline">
            +1 (234) 567-890
          </a>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">How do I book a trip?</h5>
                <p className="text-sm text-gray-600">
                  Browse destinations, select your preferred hotel, choose room type and dates, then click "Reserve" to complete your booking.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Can I cancel my booking?</h5>
                <p className="text-sm text-gray-600">
                  Yes, you can cancel up to 24 hours before check-in for a full refund. See our Refund Policy for details.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-gray-900 mb-1">How do I contact support?</h5>
                <p className="text-sm text-gray-600">
                  You can reach us via email at support@tripbooking.com, live chat, or phone at +1 (234) 567-890.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Useful Tips */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Useful Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">Book in advance for better rates</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">Check cancellation policies before booking</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">Sign up for member discounts</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">Read reviews from other travelers</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTermsContent = () => (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
        <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h3>
        <p className="text-gray-600">Please read our terms carefully before using our services</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">📋 Important Rules</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>You must be 18+ to create an account and make bookings</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>All bookings are subject to availability and confirmation</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>Payment must be completed at the time of booking</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>False bookings or fraudulent activity will result in account termination</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">🎯 Usage Policies</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Use the platform only for legitimate travel bookings</li>
            <li>• Respect other users and property owners</li>
            <li>• Do not share your account credentials with others</li>
            <li>• Provide accurate information when booking</li>
            <li>• Follow property rules and guidelines during your stay</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">👤 User Responsibilities</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Keep your contact information up to date</li>
            <li>• Respond promptly to communications from hosts</li>
            <li>• Leave properties in good condition</li>
            <li>• Report any issues immediately</li>
            <li>• Pay any additional charges as agreed</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> By using our service, you agree to these terms and our Privacy Policy.
          </p>
        </div>

        <div className="text-center">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Read Full Terms
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacyContent = () => (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h3>
        <p className="text-gray-600">How we collect, store, and protect your data</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">📊 Data Collection</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Personal information: name, email, phone number</li>
            <li>• Payment details: billing address, payment method</li>
            <li>• Travel preferences: destinations, dates, room types</li>
            <li>• Usage data: pages visited, booking history</li>
            <li>• Device information: IP address, browser type</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">🔒 Data Storage & Security</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All data is encrypted and stored securely</li>
            <li>• Payment information is PCI compliant</li>
            <li>• We use industry-standard security measures</li>
            <li>• Data is retained only as long as necessary</li>
            <li>• Regular security audits and updates</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">🎯 Data Usage</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Process and confirm your bookings</li>
            <li>• Provide customer support</li>
            <li>• Send booking confirmations and updates</li>
            <li>• Improve our services and user experience</li>
            <li>• Marketing (with your consent)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">👤 Your Data Rights</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Access your data</span>
              <button className="text-blue-600 text-sm hover:underline">Request</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Update preferences</span>
              <button className="text-blue-600 text-sm hover:underline">Manage</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Delete your account</span>
              <button className="text-red-600 text-sm hover:underline">Request</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Contact support for data issues</span>
              <a href="mailto:privacy@tripbooking.com" className="text-blue-600 text-sm hover:underline">Email Us</a>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Your Privacy Matters:</strong> We never sell your personal information to third parties. You can update your preferences or request data deletion at any time.
          </p>
        </div>
      </div>
    </div>
  );

  const renderRefundContent = () => (
    <div className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Refund Policy</h3>
        <p className="text-gray-600">Clear guidelines for refunds and cancellations</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">✅ Refund Eligibility</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Full Refund</p>
                <p className="text-sm text-gray-600">Cancel 24+ hours before check-in</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">50% Refund</p>
                <p className="text-sm text-gray-600">Cancel 12-24 hours before check-in</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">No Refund</p>
                <p className="text-sm text-gray-600">Cancel less than 12 hours before check-in</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">⏰ Refund Timeline</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Request Processing</span>
              <span className="font-medium">1-2 business days</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Refund Approval</span>
              <span className="font-medium">3-5 business days</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Money Back to Account</span>
              <span className="font-medium">5-10 business days</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">🔄 Refund Process</h4>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Go to "My Bookings" in your account</li>
            <li>2. Select the booking you want to cancel</li>
            <li>3. Click "Request Refund" and provide reason</li>
            <li>4. Review refund amount and confirm cancellation</li>
            <li>5. Receive confirmation email with tracking details</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">🚫 Non-Refundable Items</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Processing fees (up to 5% of booking amount)</li>
            <li>• Special promotional rates</li>
            <li>• Non-refundable room types</li>
            <li>• Cancellations due to weather (unless property offers weather protection)</li>
            <li>• No-shows without prior notice</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800 mb-3">
            <strong>Need Help?</strong> If you have questions about our refund policy or need assistance with a cancellation request, our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </button>
            <a href="mailto:refunds@tripbooking.com" className="inline-flex items-center px-3 py-2 bg-white text-purple-600 border border-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors">
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('help')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'help'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Help Center
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'terms'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'refund'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Refund Policy
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'help' && renderHelpContent()}
          {activeTab === 'terms' && renderTermsContent()}
          {activeTab === 'privacy' && renderPrivacyContent()}
          {activeTab === 'refund' && renderRefundContent()}
        </div>
      </div>
    </div>
  );
};

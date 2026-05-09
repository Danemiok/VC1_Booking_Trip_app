import React from 'react';
import { HelpCenterLayout, HelpButton, useHelpCenterContext } from '../../components/layout/HelpCenterLayout';
const DemoContent = () => {
    const { openHelpCenter } = useHelpCenterContext();
    return (<div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Center Demo</h1>
        
        <div className="space-y-8">
          {/* Different Button Variants */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Help Button Variants</h2>
            <div className="flex flex-wrap gap-4">
              <HelpButton onClick={openHelpCenter} variant="floating" size="sm"/>
              <HelpButton onClick={openHelpCenter} variant="floating" size="md"/>
              <HelpButton onClick={openHelpCenter} variant="floating" size="lg"/>
              <HelpButton onClick={openHelpCenter} variant="inline" size="sm"/>
              <HelpButton onClick={openHelpCenter} variant="inline" size="md"/>
              <HelpButton onClick={openHelpCenter} variant="inline" size="lg"/>
            </div>
          </div>

          {/* Integration Examples */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Integration Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">In Navigation</h3>
                <p className="text-gray-600 mb-4">Add help button to header or navigation menu</p>
                <HelpButton onClick={openHelpCenter} variant="inline" size="sm"/>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">In Forms</h3>
                <p className="text-gray-600 mb-4">Add help button near complex forms or registration</p>
                <HelpButton onClick={openHelpCenter} variant="inline" size="md"/>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Floating Button</h3>
                <p className="text-gray-600 mb-4">Global access with floating button (bottom-right)</p>
                <div className="text-emerald-600 text-sm">See bottom-right corner →</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Help Center Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">📚 Comprehensive Content</h3>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Help Center with FAQs</li>
                  <li>• Terms of Service</li>
                  <li>• Privacy Policy</li>
                  <li>• Refund Policy</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🎯 User-Friendly</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Tabbed navigation</li>
                  <li>• Responsive design</li>
                  <li>• Contact options</li>
                  <li>• Clear information</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🔧 Easy Integration</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Simple API</li>
                  <li>• Multiple variants</li>
                  <li>• Context provider</li>
                  <li>• JavaScript and JSX support</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">♿ Accessible</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Keyboard navigation</li>
                  <li>• Screen reader support</li>
                  <li>• ARIA labels</li>
                  <li>• Focus management</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-emerald-600 to-purple-600 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Try the Help Center!</h2>
            <p className="mb-6">Click any help button or the floating button to see the full help center in action.</p>
            <button onClick={openHelpCenter} className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Open Help Center
            </button>
          </div>
        </div>
      </div>
    </div>);
};
const HelpCenterDemo = () => {
    return (<HelpCenterLayout>
      <DemoContent />
    </HelpCenterLayout>);
};
export default HelpCenterDemo;


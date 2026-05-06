import React from 'react';
import { X, Hotel, MapPin, Wifi, Car, Coffee, Dumbbell, Check } from 'lucide-react';
export const HotelFeatureModal = ({ isOpen, onClose, onContinue }) => {
    if (!isOpen)
        return null;
    const features = [
        { icon: Wifi, name: 'Free WiFi', available: true },
        { icon: Car, name: 'Free Parking', available: true },
        { icon: Coffee, name: 'Complimentary Breakfast', available: true },
        { icon: Dumbbell, name: 'Fitness Center', available: true },
    ];
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
            <X className="w-5 h-5"/>
          </button>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Hotel className="w-16 h-16 mx-auto mb-3"/>
              <h2 className="text-2xl font-bold">Hotels & Villas</h2>
              <p className="text-blue-100 mt-1">Your Perfect Stay Awaits</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Discover Amazing Accommodations</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Browse through our curated selection of hotels and villas. From luxury resorts to cozy boutique stays, 
                find the perfect place for your trip.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Popular Amenities</h4>
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (<div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <feature.icon className="w-4 h-4 text-blue-600"/>
                    <span className="text-sm text-gray-700">{feature.name}</span>
                    {feature.available && <Check className="w-4 h-4 text-green-500 ml-auto"/>}
                  </div>))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-xs text-gray-500">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">4.8</div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Maybe Later
            </button>
            <button onClick={onContinue} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
              Explore Hotels
              <MapPin className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>
    </div>);
};

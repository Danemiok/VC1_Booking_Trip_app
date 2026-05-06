const toNumber = (value, fallback = 0) => {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(n) ? n : fallback;
};
const toPositiveInt = (value, fallback = 1) => {
    const n = Math.floor(toNumber(value, fallback));
    return Number.isFinite(n) && n > 0 ? n : fallback;
};
export const calculateTripPricing = ({ tripData, selectedActivities = [] }) => {
    const activitiesTotal = selectedActivities.reduce((sum, a) => {
        const price = toNumber(a?.price, 0);
        const guests = toPositiveInt(a?.guests, 1);
        return sum + price * guests;
    }, 0);
    const hotel = tripData?.hotel || {};
    const rental = tripData?.rental || {};
    const hotelNights = toPositiveInt(hotel?.nights, 1);
    const rentalDays = toPositiveInt(rental?.days ?? hotelNights, hotelNights);
    const hotelHasPromotion = Boolean(hotel?.hasPromotion ?? hotel?.has_promotion);
    const rentalHasPromotion = Boolean(rental?.hasPromotion ?? rental?.has_promotion);
    const hotelNightlyBase = toNumber(hotel?.originalPrice ?? hotel?.original_price ?? hotel?.dailyPrice, 0);
    const hotelNightlyDiscounted = toNumber(hotel?.discountedPrice ?? hotel?.discounted_price ?? hotel?.dailyPrice, 0);
    const hotelTotal = toNumber(hotel?.price, 0);
    const hotelDiscount = hotelHasPromotion && hotelNightlyBase > 0 && hotelNightlyDiscounted > 0
        ? Math.max(0, (hotelNightlyBase - hotelNightlyDiscounted) * hotelNights)
        : 0;
    const hotelOriginalTotal = hotelTotal + hotelDiscount;
    const rentalDailyBase = toNumber(rental?.originalDailyPrice ?? rental?.originalPrice ?? rental?.original_price ?? rental?.dailyPrice, 0);
    const rentalDailyDiscounted = toNumber(rental?.discountedDailyPrice ?? rental?.discountedPrice ?? rental?.discounted_price ?? rental?.dailyPrice, 0);
    const rentalTotal = rental?.isBooked
        ? toNumber(rental?.price, rentalDailyDiscounted * rentalDays)
        : 0;
    const rentalDiscount = rentalHasPromotion && rentalDailyBase > 0 && rentalDailyDiscounted > 0
        ? Math.max(0, (rentalDailyBase - rentalDailyDiscounted) * rentalDays)
        : 0;
    const rentalOriginalTotal = rental?.isBooked ? rentalTotal + rentalDiscount : 0;
    const subtotal = hotelTotal + rentalTotal + activitiesTotal;
    const taxes = subtotal * 0.05;
    const serviceFee = 5.0;
    const total = subtotal + taxes + serviceFee;
    const originalSubtotal = hotelOriginalTotal + rentalOriginalTotal + activitiesTotal;
    const originalTaxes = originalSubtotal * 0.05;
    const originalTotal = originalSubtotal + originalTaxes + serviceFee;
    const discountTotal = Math.max(0, originalTotal - total);
    return {
        activitiesTotal,
        hotelTotal,
        rentalTotal,
        subtotal,
        taxes,
        serviceFee,
        total,
        originalSubtotal,
        originalTaxes,
        originalTotal,
        discountTotal,
    };
};

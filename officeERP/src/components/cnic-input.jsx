import React, { useState } from 'react';

const CNICInput = () => {
    const [purchaseData, setPurchaseData] = useState({ purchaserCnic: '' });

    const handleInputChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

        // Add hyphens at the appropriate positions
        if (value.length > 5 && value.length <= 13) {
            value = value.slice(0, 5) + '-' + value.slice(5);
        }
        if (value.length > 13) {
            value = value.slice(0, 13) + '-' + value.slice(13, 15);
        }

        setPurchaseData({
            ...purchaseData,
            purchaserCnic: value.slice(0, 15),
        });
    };

    return (
        <input
            type="text"
            name="purchaser-cnic"
            id="purchaser-cnic"
            placeholder="00000-0000000-0"
            onChange={handleInputChange}
            value={purchaseData.purchaserCnic}
            inputMode="numeric"
            pattern="[0-9]*"
        />
    );
};

export default CNICInput;


import { useState } from 'react';

interface ProfileImagesProps {
  profileImages: {
    maheshKhot: string;
    atulMadkar: string;
    academyLogo: string;
  };
}

const ProfileSection = ({ profileImages }: ProfileImagesProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-academy-primary mb-4">Welcome to Avishkar Career Academy</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        {/* Profile cards in a row - updated for better mobile layout */}
        <div className="w-full flex flex-row justify-between items-center gap-4">
          {/* Left - Mahesh Khot */}
          <div className="bg-white p-3 rounded-lg shadow-md text-center w-1/2">
            <div className="w-24 h-24 mx-auto overflow-hidden rounded-full mb-2">
              <img
                src={profileImages.maheshKhot}
                alt="Mahesh Khot"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">Mahesh Khot</h3>
            <a href="tel:+919049137731" className="text-xs text-academy-primary hover:text-academy-secondary">
              +91 9049137731
            </a>
          </div>
          
          {/* Right - Atul Madkar */}
          <div className="bg-white p-3 rounded-lg shadow-md text-center w-1/2">
            <div className="w-24 h-24 mx-auto overflow-hidden rounded-full mb-2">
              <img
                src={profileImages.atulMadkar}
                alt="Atul Madkar"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
            <h3 className="text-sm font-semibold text-academy-primary">Atul Madkar</h3>
            <a href="tel:+919890555432" className="text-xs text-academy-primary hover:text-academy-secondary">
              +91 9890555432
            </a>
          </div>
        </div>
      </div>
      
      {/* Text section below the profiles */}
      <div className="text-center max-w-md mx-auto mb-4">
        <h3 className="text-xl font-bold text-academy-primary">Empowering Dreams, Ensuring Success</h3>
        <p className="text-sm text-gray-600 mt-2">Download our app and start your success journey today</p>
      </div>
    </div>
  );
};

export default ProfileSection;

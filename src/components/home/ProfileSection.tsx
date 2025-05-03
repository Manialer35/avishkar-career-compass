
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
        {/* Profile cards in a row */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          {/* Left - Mahesh Khot */}
          <div className="bg-white p-4 rounded-lg shadow-md text-center w-full md:w-1/3">
            <div className="w-32 h-32 mx-auto overflow-hidden rounded-full mb-3">
              <img
                src={profileImages.maheshKhot}
                alt="Mahesh Khot"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-academy-primary">Mahesh Khot</h3>
            <a href="tel:+919049137731" className="text-sm text-academy-primary hover:text-academy-secondary">
              +91 9049137731
            </a>
          </div>
          
          {/* Center - Text only */}
          <div className="text-center max-w-md w-full md:w-1/3">
            <h3 className="text-xl font-bold text-academy-primary">Empowering Dreams, Ensuring Success</h3>
            <p className="text-sm text-gray-600 mt-2">Download our app and start your success journey today</p>
          </div>
          
          {/* Right - Atul Madkar */}
          <div className="bg-white p-4 rounded-lg shadow-md text-center w-full md:w-1/3">
            <div className="w-32 h-32 mx-auto overflow-hidden rounded-full mb-3">
              <img
                src={profileImages.atulMadkar}
                alt="Atul Madkar"
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
            <h3 className="text-lg font-semibold text-academy-primary">Atul Madkar</h3>
            <a href="tel:+919890555432" className="text-sm text-academy-primary hover:text-academy-secondary">
              +91 9890555432
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

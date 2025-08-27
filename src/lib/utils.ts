
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * This function is no longer used as we're switching to Google Pay exclusively
 * Keeping it commented in case we need to revert back in the future
 */
// export const loadRazorpay = (): Promise<any> => {
//   return new Promise((resolve) => {
//     if ((window as any).Razorpay) {
//       // Razorpay is already loaded
//       console.log('Razorpay already loaded');
//       resolve((window as any).Razorpay);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     script.onload = () => {
//       console.log('Razorpay loaded successfully');
//       if ((window as any).Razorpay) {
//         resolve((window as any).Razorpay);
//       } else {
//         console.error('Razorpay failed to load');
//         resolve(null);
//       }
//     };
//     script.onerror = () => {
//       console.error('Error loading Razorpay');
//       resolve(null);
//     };
    
//     document.body.appendChild(script);
//   });
// };

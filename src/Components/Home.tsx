import React from 'react'
import { useEffect, useState } from 'react';
import bgmithumbnail from '../assets/bgmi-thumbnail.jpg'
import { loadStripe } from '@stripe/stripe-js';

interface Room {
  roomName: String;
  occupiedSlots?: Number;
  freeSlots?:Number 
isEmpty?: boolean
occupied?:Number
roomSlots?:Number
}
export const Home = () => {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [allRooms, setAllRooms] = useState([]); 
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [processing, setProcessing] = useState(false);
    
    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const handleSlotSelection = async (slot: string) => {
      setSelectedSlot(slot);
      setProcessing(true);
  
      try {
        // Demo: Since we don't have a backend, show a demo payment form
        // alert(`Selected slot: ${slot}\n\nIn production, this would redirect to Stripe payment for ₹100.\n\nTo implement:\n1. Get Stripe API keys from stripe.com\n2. Create a backend endpoint\n3. Use the code below`);
        
         
        // PRODUCTION CODE - Uncomment when you have backend setup:
        
        const response = await fetch('http://localhost:3000/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slot: slot,
            amount: 10000 // ₹100 in paise
          })
        });
        
        const session  = await response.json();
        if (session.url) {
          // 3. Redirect to the Stripe-hosted Checkout page
          window.location.href = session.url; 
        } else {
          // Handle errors if session creation failed
          console.error(session.error.message);
        }
        
  
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setProcessing(false);
      }
    };
    const getallrooms=async()=>{
      fetch('http://localhost:3000/api/room/all-rooms', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      .then(response => response.json())
      .then(data => {
        console.log('All Bookings:', data);
        setAllRooms(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
    return (
      <div 
        className="h-screen w-full flex items-center justify-end pr-4 sm:pr-8 md:pr-12 lg:pr-16 overflow-auto bg-slate-300"
        style={{
          backgroundImage: `url(${bgmithumbnail})`,
          backgroundSize: windowWidth < 853 ? '100% 90vh' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <button
          onClick={() => {setShowBookingModal(true), getallrooms()}}
          className="relative z-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-base sm:text-lg md:text-xl px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-orange-500/50"
        >
          BOOK SLOTS
        </button>
  
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 text-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-orange-500">Book Your Slot - ₹100</h2>
              <p className="mb-6 text-sm sm:text-base text-gray-300">Select your preferred time slot and proceed to payment.</p>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                {allRooms.map((val:Room)=>{
                  return(
                    <button 
                    onClick={() => handleSlotSelection('Morning (9 AM - 12 PM)')}
                    disabled={processing}
                    className="
                      w-full 
                      bg-gray-800 
                      hover:bg-gray-700 
                      text-white 
                      rounded-lg 
                      transition-colors 
                      text-sm sm:text-base 
                      disabled:opacity-50 
                      cursor-pointer
                    "
                  >
                    <div className="w-full h-full rounded-lg space-y-3 p-4">
                      <p className="text-lg">
                        <span className="font-bold text-orange-400">Room:</span>{" "}
                        {val.roomName}
                      </p>
                  
                      <div className="flex justify-between gap-2">
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold text-orange-400">Booked Slots:</span>{" "}
                          {val.occupiedSlots?.toString()}
                        </p>
                        <p className="text-sm sm:text-base text-right">
                          <span className="font-semibold text-orange-400">Available Slots:</span>{" "}
                          {val.roomSlots?.toString()}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  )
                })}
               
                  {/* <span>Morning (9 AM - 12 PM)</span>
                  <span className="text-orange-500 font-semibold">₹100</span>
                </button> */}
                
              </div>
  
              {processing && (
                <div className="text-center mb-4 text-orange-500">
                  Processing...
                </div>
              )}
  
              <button
                onClick={() => setShowBookingModal(false)}
                disabled={processing}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
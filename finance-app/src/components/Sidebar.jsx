import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const [showBar, setshowBar] = React.useState(false);
  const navigate = useNavigate();

  console.log({showBar});

  return (
      <div
        className={`sticky top-[85px] w-[50px] h-[130px] border p-[8px] bg-[#37306B] rounded duration-300 ${
          showBar ? 'translate-x-[0px]' : '-translate-x-[45px]'
        }`}
      >
        <div className="flex justify-between h-full space-x-1">
          <div className="flex flex-col items-baseline justify-between text-white">
            <p>
              <span onClick={() => navigate('/')} className="material-symbols-outlined cursor-pointer">dashboard</span>
            </p>
            <p>
              <span onClick={() => navigate('/bank')} className="material-symbols-outlined cursor-pointer">account_balance</span>
            </p>
            <p>
              <span onClick={() => navigate('/ai')} className="material-symbols-outlined cursor-pointer">tips_and_updates</span>
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <p
              onClick={() => setshowBar(!showBar)}
              className={`-mr-[25px] w-[30px] h-[30px] rounded-full cursor-pointer bg-[#9E4784] leading-[2.5rem] text-center text-white shadow-lg ${
                showBar ? '' : 'animate-bounce'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[1.9rem] duration-500 ${
                  showBar ? 'rotate-0' : 'rotate-180'
                }`}
              >
                chevron_left
              </span>
            </p>
          </div>
        </div>
      </div>
  )
}
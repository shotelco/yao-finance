import React, { Component } from 'react';
import Logo from '../assets/logo.png';

export default class Navbar extends Component {
  render() {
    return (
      <div className='fixed w-[100vw] z-40 h-[70px] bg-[#37306B] px-[20px] shadow-lg shadow-gray-200'>
        <div className='flex justify-between'>
            <p className='h-[60px] leading-[3.9rem]'>
                <img className='inline-block' src={Logo} alt="" />
            </p>


            <p className='h-[60px] leading-[3.9rem]'>
                <span className="material-symbols-outlined text-[2rem] align-middle cursor-pointer text-[#D27685]">logout</span>
            </p>
        </div>
      </div>
    )
  }
}

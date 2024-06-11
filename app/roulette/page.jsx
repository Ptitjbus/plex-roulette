"use client";
import React, { useState } from 'react'
import { Wheel } from 'react-custom-roulette'

const data = [
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: 'aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
    { option: '0', style: { backgroundColor: '#aed6dc', textColor: '#aed6dc'} },
    { option: '1', style: { backgroundColor: 'white', textColor: 'white'} },
];


export default () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);


  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  }

  return (


    <>
    <div className="relative flex justify-center items-center h-screen">
                        <Wheel
                            mustStartSpinning={mustSpin}
                            spinDuration={0.1}
                            prizeNumber={prizeNumber}
                            data={data}
                            outerBorderWidth={3}
                            outerBorderColor="grey"
                            innerRadius={40}
                            innerBorderColor="grey"
                            radiusLineColor="grey"
                            radiusLineWidth={3}
                            innerBorderWidth={3}
                            perpendicularText = {true}

                        />
                        <button className="absolute" onClick={handleSpinClick}>
                        Click Here to Spin
        </button>
        </div>
    </>
  )
}
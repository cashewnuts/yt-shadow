import React, { PropsWithChildren, useLayoutEffect, useRef } from 'react'

export interface CheckAnimationProps {
  width?: number
  height?: number
  duration?: number
}

const CheckAnimation = (props: PropsWithChildren<CheckAnimationProps>) => {
  const { width = 24, height = 24, duration = 1000 } = props
  const circleRef = useRef<SVGPathElement>(null)
  const checkRef = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    if (!circleRef.current || !checkRef.current) return
    const circle = circleRef.current
    const check = checkRef.current
    const circleLength = circle.getTotalLength()
    const checkLength = check.getTotalLength()
    circle.style.strokeDasharray = circleLength + ''
    circle.style.strokeDashoffset = circleLength + ''
    check.style.strokeDasharray = checkLength + ''
    check.style.strokeDashoffset = checkLength + ''
    const totalLength = circleLength + checkLength
    const startTime = Date.now()
    const WHOLE_TIME = duration
    const updateCircle = () => {
      const passedTime = Date.now() - startTime
      const ratio = passedTime / WHOLE_TIME
      // Stop animation if exceeds whole time
      if (ratio > 1) return

      const currentLength = totalLength * ratio
      const circleOffset = Math.max(0, circleLength - currentLength)
      circle.style.strokeDashoffset = circleOffset + ''
      if (circleOffset === 0) {
        const checkOffset = Math.max(0, totalLength - currentLength)
        check.style.strokeDashoffset = checkOffset + ''
      }
      requestAnimationFrame(updateCircle)
    }
    updateCircle()
  }, [])
  return (
    <svg
      width={width}
      height={height}
      version="1.1"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="circleClipPath">
          <path
            d="m11.936 0.99994c-6.0502 0.035045-10.936 4.9496-10.936 11-2.826e-4 5.5478 4.1307 10.227 9.6356 10.916 0.40314-0.47186 0.92254-1.2382 0.74724-1.9368-4.7199-0.32437-8.3829-4.2477-8.383-8.9788 1.8e-5 -4.9705 4.0294-8.9999 9-9 4.9705 1.8e-5 9 4.0294 9 9-1.61e-4 4.3018-3.0445 8.002-7.2657 8.831-0.70876 0.5937-1.0499 1.0013-1.6831 2.1689 6.0552-0.02796 10.949-4.9446 10.949-11-8.5e-5 -6.0752-4.9251-11-11-11-0.02119-6.122e-5 -0.04237-6.122e-5 -0.06356 0z"
            fill="#0f0"
            strokeWidth=".27223"
          />
        </clipPath>
      </defs>
      <g fill="none" stroke="#0f0" strokeLinecap="round">
        <path
          ref={circleRef}
          id="animateCircle"
          d="m11.258 22.008c-5.5346-1.1994-9.2832-4.0008-9.3251-10.498 1.0219-6.0447 4.2397-9.159 9.6672-9.4609 7.7035 0.41925 10.092 4.9706 10.373 9.6793-0.17458 7.7154-4.9315 9.351-9.3934 10.311"
          clipPath="url(#circleClipPath)"
          strokeWidth="2.3"
        />
        <path
          ref={checkRef}
          id="check"
          d="m6.6735 12.073 3.7585 3.4498 6.9317-6.7833"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </g>
    </svg>
  )
}

export default CheckAnimation

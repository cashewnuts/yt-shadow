import React, { PropsWithChildren } from 'react'

const TitleLabel = (props: PropsWithChildren<unknown>) => {
  return (
    <svg
      version="1.1"
      viewBox="0 0 800 32"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <linearGradient id="text-fill">
          <stop stopColor="#ffd42a" offset="0" />
          <stop stopColor="#cf0" offset="1" />
        </linearGradient>
        <linearGradient
          id="linearGradient872"
          x1="79.375"
          x2="287.26"
          y1="168.96"
          y2="53.673"
          gradientTransform="matrix(2.3997 0 0 .98444 74.376 -70.698)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff2a7f" offset="0" />
          <stop stopColor="#ff8080" offset="1" />
        </linearGradient>
        <linearGradient
          id="linearGradient935"
          x1="99.839"
          x2="298.18"
          y1="16.524"
          y2="16.524"
          gradientTransform="translate(201.28 1.593)"
          gradientUnits="userSpaceOnUse"
          xlinkHref="#text-fill"
        />
        <linearGradient
          id="linearGradient937"
          x1="99.012"
          x2="300.99"
          y1="16"
          y2="16"
          gradientTransform="translate(201.28 1.593)"
          gradientUnits="userSpaceOnUse"
          xlinkHref="#text-fill"
        />
      </defs>
      <g>
        <rect
          width="800"
          height="32"
          rx="4"
          ry="4"
          fill="url(#linearGradient872)"
        />
        <text
          x="399.07947"
          y="23.248487"
          fill="url(#linearGradient935)"
          fontFamily="sans-serif"
          fontSize="22.578px"
          stroke="url(#linearGradient937)"
          strokeWidth=".26458"
          textAnchor="middle"
          xmlSpace="preserve"
        >
          <tspan
            x="399.07947"
            y="23.248487"
            fill="url(#linearGradient935)"
            fontFamily="Palatino"
            fontSize="22.578px"
            fontStyle="italic"
            fontWeight="bold"
            stroke="url(#linearGradient937)"
            strokeWidth=".26458"
            text-align="center"
            textAnchor="middle"
          >
            Youtube Shadowing
          </tspan>
        </text>
      </g>
    </svg>
  )
}

export default TitleLabel

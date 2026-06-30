import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

/**
 * One Horizon Homes mark — two interlocking loops (infinity) with a diagonal
 * crossbar, rebuilt as crisp vector so it scales cleanly and stays monochrome.
 */
export function BrandMark({ size = 40, color = '#0A0A0A' }: { size?: number; color?: string }) {
  const w = size;
  const h = size * 0.62;
  const sw = 7;
  return (
    <Svg width={w} height={h} viewBox="0 0 100 62">
      <Circle cx={34} cy={31} r={23} stroke={color} strokeWidth={sw} fill="none" />
      <Circle cx={66} cy={31} r={23} stroke={color} strokeWidth={sw} fill="none" />
      <Line x1={41} y1={16} x2={59} y2={46} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </Svg>
  );
}

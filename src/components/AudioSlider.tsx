import React from 'react';
import { ViewStyle } from 'react-native';
import Slider, { SliderProps } from '@react-native-community/slider';

const SliderComp = Slider as unknown as React.ComponentType<SliderProps>;

interface Props extends SliderProps {
  style?: ViewStyle | ViewStyle[];
}

export const AudioSlider: React.FC<Props> = (props) => {
  return <SliderComp {...props} />;
};

export default AudioSlider;

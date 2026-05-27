import React, { forwardRef } from 'react';
import PagerView from 'react-native-pager-view';

const CustomPager = forwardRef((props: any, ref) => {
  return <PagerView ref={ref} {...props} />;
});

export default CustomPager;

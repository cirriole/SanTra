import React, { useImperativeHandle, forwardRef, useState } from 'react';
import { View } from 'react-native';

const CustomPager = forwardRef(({ children, style, initialPage = 0, onPageSelected }: any, ref) => {
  const [page, setPage] = useState(initialPage);
  const childrenArray = React.Children.toArray(children);

  useImperativeHandle(ref, () => ({
    setPage: (index: number) => {
      setPage(index);
      // Web fallback triggers onPageSelected manually to keep state in sync
      if (onPageSelected) {
        onPageSelected({ nativeEvent: { position: index } });
      }
    }
  }));

  return (
    <View style={style}>
      {childrenArray[page]}
    </View>
  );
});

export default CustomPager;

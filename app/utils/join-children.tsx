import { Children, cloneElement, ReactElement, ReactNode } from 'react';

export function joinChildren(children: ReactNode, separator: ReactElement) {
  const childArray = Children.toArray(children).filter(Boolean);

  const output = [];

  for (let i = 0; i < childArray.length; i++) {
    output.push(childArray[i]);

    if (i < childArray.length - 1) {
      output.push(cloneElement(separator, { key: `separator-${i}` }));
    }
  }

  return output;
}

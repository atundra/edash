import { ReactNode, HTMLAttributes, ReactHTML, ClassAttributes, createElement } from 'react';

export const wrap = <P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  props?: (ClassAttributes<T> & P) | null
) => (children: ReactNode | ReactNode[]) => createElement(type, props, children);

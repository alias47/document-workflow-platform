import { type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';

export interface TableProps {
  children: ReactNode;
  caption?: string;
}

export function Table({ children, caption }: TableProps) {
  return (
    <table>
      {caption && <caption>{caption}</caption>}
      {children}
    </table>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
}

export function TableHeader({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props}>{children}</td>;
}

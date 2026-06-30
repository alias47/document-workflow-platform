import { type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return (
    <div role="region" {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>;
}

export function CardBody({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>;
}

export function CardFooter({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>;
}

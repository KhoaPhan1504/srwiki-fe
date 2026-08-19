import type { ReactNode } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '~root/components/ui';

type Props = {
  label?: ReactNode;
  description?: string;
  children: ReactNode;
  wrapInControl?: boolean;
};

export const FieldShell = ({ label, description, children, wrapInControl = true }: Props) => (
  <FormItem>
    {label && <FormLabel>{label}</FormLabel>}
    {wrapInControl ? <FormControl>{children}</FormControl> : children}
    {description && <FormDescription>{description}</FormDescription>}
    <FormMessage />
  </FormItem>
);

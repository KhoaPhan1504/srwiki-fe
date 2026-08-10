import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const PhoneInput = ({ value, onChange }: Props) => {
  return (
    <PhoneInputWithCountry
      international
      defaultCountry="VN"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      className="phone-input rounded border border-slate-300 px-3 py-2"
    />
  );
};

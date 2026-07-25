import type { Nullable, OptionSelect } from '@/shared/types/types';
import {
  CloseButton,
  Combobox,
  InputBase,
  useCombobox,
  type SelectProps,
} from '@mantine/core';
import { useField } from 'formik';
import { useState } from 'react';

type SelectCreatableFieldProps = SelectProps & {
  name: string;
  label?: string;
  options: OptionSelect[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  isSearchable?: boolean;
  disabled?: boolean;
  onCallBack?: (value: Nullable<string>) => void;
};

export const SelectCreatableField = (props: SelectCreatableFieldProps) => {
  const {
    name,
    label,
    options,
    icon,
    placeholder,
    className,
    disabled,
    onCallBack,
    required,
  } = props;

  const [field, meta, helpers] = useField<string>(name);
  const currentValue = field.value ?? '';

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [data, setData] = useState<OptionSelect[]>(options);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const selectedOption = data.find((item) => item.value === currentValue);
  const displayValue = focused
    ? search
    : (selectedOption?.label ?? currentValue ?? '');

  const exactOptionMatch = data.some((item) => item.value === search.trim());
  const filteredOptions = data.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const comboboxOptions = filteredOptions.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {item.label}
    </Combobox.Option>
  ));

  const handleOptionSubmit = (val: string) => {
    if (val === '$create') {
      const newOption: OptionSelect = {
        value: search.trim(),
        label: search.trim(),
      };
      setData((current) => [...current, newOption]);
      helpers.setValue(search.trim());
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onCallBack && onCallBack(search.trim());
    } else {
      const selected = data.find((item) => item.value === val);
      helpers.setValue(val);
      setSearch(selected?.label ?? val);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onCallBack && onCallBack(val);
    }
    combobox.closeDropdown();
  };

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={handleOptionSubmit}
    >
      <Combobox.Target>
        <InputBase
          value={displayValue}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            setFocused(true);
            combobox.openDropdown();
            setSearch(selectedOption?.label ?? currentValue ?? '');
          }}
          onBlur={() => {
            setFocused(false);
            combobox.closeDropdown();
            helpers.setTouched(true);
          }}
          placeholder={placeholder}
          leftSection={icon}
          disabled={disabled}
          className={className}
          label={label}
          required={required}
          error={meta.touched && meta.error}
          rightSectionPointerEvents="all"
          rightSection={
            currentValue !== '' ? (
              <CloseButton
                type="button"
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  helpers.setValue('');
                  setSearch('');
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  onCallBack && onCallBack(null);
                }}
                aria-label="Clear value"
              />
            ) : (
              <Combobox.Chevron />
            )
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
          {comboboxOptions}
          {!exactOptionMatch && search.trim().length > 0 && (
            <Combobox.Option value="$create">
              + Create {search}
            </Combobox.Option>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
